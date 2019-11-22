const path = require('path');

const config =require('./env.json');
const env = config[process.env.NODE_ENV || 'development'];

if(env!=='development'){
    process.env.PORT=process.env.PORT || env.port;
    process.env.HOST=process.env.HOST || env.host;
}

process.env.DB_HOST=env.db_host;
process.env.DB_PORT=env.db_port;
process.env.DB_NAME=env.db_name;
process.env.DB_USER=env.db_user;
process.env.DB_PASSWORD=env.db_password;

process.env.TOKEN_SEED=env.TOKEN_SEED;
process.env.TOKEN_EXPIRATION=(60*1000)*60*24
process.env.ENCRYPT_KEY='jkbgfhudfkjghdfukjgtertrdf89yh64g85486486577y486fg5dfuhlksdf';
process.env.CLIENT_URL=env.client_url;

//process.env.UPLOAD_PATH=path.resolve('uploads');
process.env.UPLOAD_PATH=path.join(__dirname,'../../uploads');

module.exports=env;