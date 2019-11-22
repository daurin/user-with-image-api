const express = require('express');
const verifyToken = require('../../middlewares/verifyToken');
var router = express.Router();
var User = require('../../database/models/User');
const fs = require('fs').promises;
const path = require('path');

var multer = require('multer')
//var upload = multer({ destination: process.env.UPLOAD_PATH })
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.put('/porfile', [
    verifyToken,
    upload.single('picture'),
    (req,res,next)=>{
        if(req.file)next();
        else res.status(400).json({
            error:{
                message:'Picture es requierido'
            }
        })
    }
], (req, res) => {
    let extension = req.file.originalname.split('.')[req.file.originalname.split('.').length - 1];
    const fileName = `${req.user.id}-${new Date().getMilliseconds()}.${extension}`;

    User.findById(req.user.id)
        .then((user)=>{
            if(user.picture)return fs.unlink(path.resolve(process.env.UPLOAD_PATH,user.picture));
            return Promise.resolve();
        })
        .then(()=>fs.writeFile(path.resolve(process.env.UPLOAD_PATH,fileName), req.file.buffer))
        .then(()=>User.updateByFields({picture:fileName},{id:req.user.id}))
        .then(()=>res.status(200).end())
        .catch(err=>{
            console.log(err);
            res.status(500).json({error:{
                message:err.message
            }});
        });
})


module.exports = router;