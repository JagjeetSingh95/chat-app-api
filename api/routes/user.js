const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const User = require('../model/user');
const Auth = require('../auth/auth');

router.post('/signup', (req, res, next) => {
    User.find({ email: req.body.email })
        .select('first_name last_name email password created_at _id ')
        .exec()
        .then(user => {
            if (user.length >= 1) {
                return res.status(409).json({
                    msg: 'Mail already exists!'
                });
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        });
                    } else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            first_name: req.body.first_name,
                            last_name: req.body.last_name,
                            email: req.body.email,
                            password: hash,
                            created_at: moment(new Date()).format('Do MMMM, YYYY')
                        });
                        user.save()
                            .then(response => {
                                res.status(201).json({
                                    msg: 'User successfully created!',
                                    response: response
                                })
                            })
                            .catch(err => {
                              res.status(500).json({
                                  error: err
                              });  
                            });
                    }
                });
            }
        });
   
});

router.get('/signup', Auth, (req, res, next) => {
    User.find()
        .exec().then(response => {
            res.status(200).json({
                count: response.length,
                response: response
            });
        }).catch(err => {
            res.status(500).json({error: err});
        });
});

router.post('/login', (req, res, next) => {
    User.find({ email: req.body.email})
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(404).json({
                    msg: 'Auth failed'
                });
            } 
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (err) {
                    return res.status(404).json({
                        msg: 'Password worng!'
                    });
                }
                const JWT_KEY = "chat-app-api"
                if (result) {
                 const token = jwt.sign({
                        email: user[0].email,
                        userId: user[0]._id
                    }, 
                    JWT_KEY, 
                    {
                        expiresIn: "1h"
                    },

                 );
                 const decoded = jwt.verify(token, JWT_KEY);
                  return res.status(200).json({
                    msg: 'Login successfully',
                    token: token,
                    expTime: decoded.exp+'000',
                    email: user[0].email,
                    name: user[0].name
                  });
                }
                return res.status(401).json({
                    msg: 'Auth failed'
                });
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
});


module.exports = router;
