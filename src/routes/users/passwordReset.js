const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../../database/models/User');
const nodemailer = require('nodemailer');

router.route('/password/:email')
    .post((req, res) => {
        const { email } = req.params;
        User.findByFields({ email })
            .then((user) => {
                if (user) {
                    const token = jwt.sign({ id_user: user.id }, user.email + "-" + user.password, { expiresIn: 3600 });
                    const url = `${process.env.CLIENT_URL}/password/reset/${user.id}/${token}`;

                    // Enviar correo
                    const transporter = nodemailer.createTransport({
                        service: 'Gmail',
                        auth: {
                            user: 'appcastortemporalemail@gmail.com',
                            pass: 'jgvvjhmvgjy163'
                        }
                    });
                    transporter.sendMail({
                        from: 'appcastortemporalemail@gmail.com',
                        to: user.email,
                        subject: 'Cambiar la contraseña',
                        html: `
                            <h4>Hola ${user.name},</h4>
                            <p>Abre este link para cambiar tu contraseña</p>
                            <a href=${url}>${url}</a>
                        `
                    }, (err, info) => {
                        if (err) {
                            res.status(500).json({ error: { message: 'Error sending email' } });
                        }
                        else res.status(204).end();
                    })
                }
                else res.status(404).end();
            })
            .catch(err => {
                res.status(500).json({ error: { message: err.message } });
            });

    });

router.patch('/password/:idUser/:token', (req, res) => {
    const { idUser, token } = req.params;
    const { new_password } = req.body

    User.findById(idUser)
        .then(user => {
            if (user) {
                jwt.verify(token, user.email + '-' + user.password, (err, decoded) => {
                    if (err) {
                        res.status(401).json({
                            error: {
                                message: err.message
                            }
                        });
                    }
                    else {
                        if (decoded.id_user == idUser) {
                            return User.updateByFields({ password: new_password }, { id: idUser })
                                .then(()=>res.status(204).end())
                        }
                        else res.status(404).end();
                    }
                });
            }
            else res.status(404).end();
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: { message: err.message } });
        });

    jwt.decode(token)
});

module.exports = router;