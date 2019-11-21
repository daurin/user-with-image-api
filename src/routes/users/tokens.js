const express = require('express');
const jwt = require('jsonwebtoken');
const verifyToken = require('../../middlewares/verifyToken');
var router = express.Router();
var User = require('../../database/models/User');

function incorrectUserPass(res) {
    res.status(401).json({
        errors: { message: 'Verifique los datos ingresados e inténtelo de nuevo.' }
    });
}

router.post('/',
    (req, res, next) => {
        const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
        const [username, password] = new Buffer(b64auth, 'base64').toString().split(':');
        req.auth={email: username,password};
        next();
    }
    , (req, res) => {
        const {email,password}=req.auth;

        User.findByFields({ email })
            .then(async (user) => {
                if (user === undefined) incorrectUserPass(res);
                else if (password===user.password) {
                    jwt.sign(
                        {
                            id: user.id,
                            id_custom: user.id_custom,
                            email: user.email
                        }, process.env.TOKEN_SEED, { expiresIn: process.env.TOKEN_EXPIRATION },
                        (err, token) => {

                            if (err) res.status(500).json(err);
                            else res.json({ token });
                        }
                    );
                }
                else incorrectUserPass(res);
            })
            .catch(err => {
                res.status(500).json({
                    error: {
                        message: err.message
                    }
                });
            });
    });



router.get('/verify', [verifyToken], (req, res) => {
    res.status(200).end();
});


module.exports = router;