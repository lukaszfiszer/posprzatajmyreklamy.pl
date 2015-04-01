var Message = require('../models/message');
var express = require('express');
var messagesRouter = express.Router();

messagesRouter.post('/', function(req, res, next) {
  Message.create(req.body, function(err, body) {
    if (err) {
      return next(err);
    }
    res.send(body);
  });
});

module.exports = messagesRouter;
