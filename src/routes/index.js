const express=require('express');
const verifyToken=require('../middlewares/verifyToken');
let router = express.Router();

router.use('/users',require('./users'));
router.use('/users/tokens',require('./users/tokens'));

router.use('/files',/*[verifyToken],*/ express.static(process.env.UPLOAD_PATH));

module.exports=router;