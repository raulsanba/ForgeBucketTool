'use strict';

const app = require('./app');
const path = require('path');
const PORT = process.env.PORT || 3000
const config = require('./config');

if(config.credentials.client_id == null|| config.credentials.client_secret == null){
    console.log("Missing Forge credentials, please set Forge client id and Forge client secret as environment vaiables (TIP: export FORGE_CLIENT_ID= Your client id here)")
    return;
}

app.listen(PORT, () => {console.log('Server running on port ' + PORT);});