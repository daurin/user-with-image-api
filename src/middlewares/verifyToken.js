const jwt = require('jsonwebtoken');

function badRequest(res) {
    res.status(403).json({
        error: {
            message: 'No autorizado'
        }
    });
}

function verifyToken(req, res, next) {
    const [type,token]=(req.headers.authorization||'').split(" ");
    //if (authorization.split(" ").length === 0) badRequest(res);
    if (type !== 'Bearer' || token === undefined) badRequest(res);
    else {
        jwt.verify(token, process.env.TOKEN_SEED, (err, decoded) => {
            if (err) {
                res.status(401).json({
                    error: {
                        message: err.message
                    }
                });
            }
            else {
                req.user = decoded;
                next();
            }
        });
    }
}

module.exports = verifyToken;