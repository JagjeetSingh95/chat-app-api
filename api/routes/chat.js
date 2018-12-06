const express = require('express'); 
const router = express.Router(); 
const moment = require('moment');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Chat = require('../model/chat');
const Auth = require('../auth/auth');
const User = require('../model/user');

router.get('/user/:id', Auth, (req, res, next) => {

    let senderID = req.params.id;
    Chat.find({
            $or:
            [   {senderID: senderID},
                {receiverID: senderID}
            ]
        })
        .select('senderID receiverID message created_at _id')
        .populate('senderID', 'first_name last_name')
        .populate('receiverID','first_name last_name')
        .sort({created_at: 'desc'})
        .exec().then(response => {
            res.status(200).json({
                count: response.length,
                conversation: response
            });
        }).catch(err => {
            res.status(200).json({response: err});
    });
});

router.get('/userList', Auth, (req, res, next) => {

    const JWT_KEY = "chat-app-api";
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, JWT_KEY);
    let userId = decoded.userId;

    User.find()
        .exec()
        .then(response => {
            const PromiseArr = response.filter(user => user._id != userId).map(user => {
                return new Promise((resolve, reject) => {
                    Chat.findOne({ $or:
                        [   {senderID: user._id},
                            {receiverID: user._id}
                        ]})
                        .select('message created_at')
                        .sort({created_at: 'desc'})
                        .exec()
                        .then(response => {
                            resolve({...response.toObject(), name: `${user.first_name} ${user.last_name}`, userId: user._id});
                        })
                })
            })
            Promise.all(PromiseArr).then(values => {
                res.status(200).json({response: values});
            })
        })
        .catch(err => {
            res.status(500).json({err});
        })

});

router.post('/', Auth, (req, res, next) => {
    const JWT_KEY = "chat-app-api";
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, JWT_KEY);
    let senderID = decoded.userId;

    const chat = new Chat({
        _id: new mongoose.Types.ObjectId(),
        senderID: senderID,
        receiverID: req.body.receiverID,
        message: req.body.message,
        created_at: moment(new Date()).format('h:mm:ss a,Do MMMM, YYYY')
    });
    chat.save().then(response => {
        res.status(201).json({
            msg: "Message Sent!",
            response: response
        });
    }).catch(err => {
        res.status(500).json({
            error: err,
            msg: 'error in massage'
        });  
    });
});

module.exports = router;
