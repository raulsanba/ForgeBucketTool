'use strict'

const express = require('express');
const {getPublicToken} = require('./common/oauth');

var router = express.Router();

router.get('/token', async(req, res, next)=>{
    try{
        const token = await getPublicToken();
        res.json({
            access_token: token.access_token,
            expires_in : token.expires_in
        });
    }catch(e){
        next(e)
    }
})

module.exports = router;