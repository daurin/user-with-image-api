const router = require('express').Router();
const User = require('../../database/models/User');
const acceptFields = require('../../middlewares/acceptFields');
const verifyToken = require('../../middlewares/verifyToken');
const nodemailer = require('nodemailer');

router.get('/', [
    verifyToken,
    acceptFields(['text_search', 'offset', 'limit']),
    (req, res, next) => {
        const { text_search, offset, limit } = req.query;
        ValidateField.validateJson({
            text_search: new ValidateField(text_search, false).string().maxLenght(30),
            offset: new ValidateField(offset, false).number({ maxDecimal: 0 }, 'Debe ser un numero entero')
                .number({ minValue: 0 }, 'Debe ser mayor que 0'),
            limit: new ValidateField(limit, false).number({ maxDecimal: 0 }, 'Debe ser un numero entero').number({ minValue: 1 }, 'Debe ser mayor que 0'),
        })
            .then(() => next())
            .catch(err => {
                res.status(400).json({ errors: err.map((v) => ({ key: v.key, message: v.reject })) });
            });
    }
], (req, res) => {
    const { text_search, offset = 0, limit = 30 } = req.query;
    User.search({ textSearch: text_search, offset, limit })
        .then(result => {
            for (const item of result.data) delete item.password;
            if (result.items > 0) {
                res.json(result);
            }
            else res.status(404).end();
        })
        .catch(err => {
            res.status(500).json({
                error: { message: err.message }
            })
        })
});

router.get('/:id', [verifyToken], (req, res) => {
    User.findById(req.params.id)
        .then((user) => {
            if (user) {
                delete user.password;
                res.json(user);
            }
            else res.status(404).end();
        })
        .catch((err) => {
            res.status(500).json({
                error: {
                    message: err.message
                }
            })
        })
})

router.post('/',
    [
        (req, res, next) => {
            req.user = User.fromObject(req.body);
            next();
        }
    ],
    (req, res) => {
        let user = req.user;
        User.create(user)
            .then(() => res.status(201).end())
            .catch(err => {
                res.status(500).json({
                    'error': {
                        message: 'error tratando de crear el usuario',
                        internal_message: err.message
                    }
                });
            });
    }
);

router.use('/uploads', require('./uploads'));
router.use('/tokens',require('./tokens'));
router.use('/',require('./passwordReset'));
module.exports = router;