var _ = require('lodash');
var express = require('express');
var Handlebars = require('handlebars');
var Message = require('../models/message');
var senators = require('../data/senators');

var messagesRouter = express.Router();

messagesRouter.post('/', Message.blockEmailDuplicates(), function(req, res, next) {

  var district = parseInt(req.body.district);
  var senator = senators[district - 1];

  var message = new Message(_.extend(req.body, {
    toName: senator.name,
    toEmail: senator.email
  }));

  if (message.diff < 20) {
    message.send(function(err) {
      saveMessage(message);
    });
  
  } else {
    message.sendToModeration(function(err) {
      saveMessage(message);
    });
  }

  function saveMessage(message) {
    message.save(function(err, message) {
      if (err) {
        next(err);
      } else {
        res.send(message);
      }
    });
  }

});

messagesRouter.get('/:id/moderate', function(req, res, next) {
  
  Message.findOne({
    _id: req.params.id,
    token: req.query.token,
    status: 'modarate-waiting'
  }, function(err, message) {
    
    if (err) {
      return next(err);
    } else

    if (!message) {
      res.status(404).send('Message not found');
    
    } else {
      message.send(function(err) {
        if (err) {
          return next(err);
        }
        message.save(function() {
          if (err) {
            return next(err);
          }
          res.status(200).send('OK. Message send.');
        });
      });
    }

  });

});

module.exports = messagesRouter;
