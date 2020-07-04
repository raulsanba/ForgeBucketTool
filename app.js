const express = require('express');
var bodyParser = require('body-parser');
const path = require('path');

const app = express();

//server routing

//middleware
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

//FORGE API ROUTING
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json({limit:'50mb'}));
app.use('/api/forge/oauth', require('./routes/oauth'));
app.use('/api/forge/oss', require('./routes/oss'));
app.use('/api/forge/modelderivative', require('./routes/modelderivative'));
app.use((err, req, res, next) => {
    console.log(err);
    res.status(err.statusCode).json(err);
});

module.exports = app; 