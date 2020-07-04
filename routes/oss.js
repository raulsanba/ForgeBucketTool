'use strict'

const express = require('express');
const fs = require('fs');
const multer = require('multer');
const {BucketsApi, ObjectsApi, PostBucketsPayload} = require('forge-apis');

const {getClient, getInternalToken} = require('./common/oauth');
const config = require('../config');

let router = express.Router();

//Middleware for obtaining a Token on every request.
router.use(async(req, res, next)=>{
    const token = await getInternalToken();
    req.oauth_token = token;
    req.oauth_client = getClient();
    next();
});

// GET /api/forge/oss/buckets - expects a query param 'id'; if the param is '#' or empty,
// returns a JSON with list of buckets, otherwise returns a JSON with list of objects in bucket with given name.

router.get('/buckets', async(req, res, next)=>{
    const bucket_name = req.query.id;
    if(!bucket_name || bucket_name === '#'){
        try{
            const buckets = await new BucketsApi().getBuckets({limit:64},req.oauth_client,req.oauth_token);
            res.json(buckets.body.items.map((bucket)=>{
                return{
                    id:bucket.bucketKey,
                    text:bucket.bucketKey.replace(config.credentials.client_id.toLowerCase()+'-',""),
                    type:'bucket',
                    children:true
                };
            }));
        }catch(e){
            next(e);
        }
    }else{
        try{
            const objects = await new ObjectsApi().getObjects(bucket_name,{},req.oauth_client, req.oauth_token);
            res.json(objects.body.items.map((object)=>{
                return{
                    id:Buffer.from(object.objectId).toString('base64'),
                    text:object.objectKey,
                    type:"object",
                    children:false
                };
            }));
        }catch(e){
            next(e);
        }
    }
});

router.post('/buckets', async(req, res, next)=>{
    let payload = new PostBucketsPayload();
    payload.bucketKey = config.credentials.client_id.toLowerCase() + '-' + req.body.bucketKey;
    payload.policyKey =  'temporary';
    try{
        await new BucketsApi().createBucket(payload, {}, req.oauth_client, req.oauth_token);
        res.status(200).end();
    }catch(e){
        next(e);
    };
})


router.post('/objects', multer({dest:'uploads/'}).single('fileToUpload'),async(req, res, next)=>{
    fs.readFile(req.file.path, async(err, data)=>{
        if(err){
            next(err);
        }
        try{
            await new ObjectsApi().uploadObject(req.body.bucketKey, req.file.originalname,data.length,data,{},req.oauth_client,req.oauth_token);
            res.status(200).end();
        }catch(e){
            next(e)
        }
    });
});

module.exports = router;