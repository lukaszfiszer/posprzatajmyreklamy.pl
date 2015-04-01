var Message = require('../models/message');
var express = require('express');
var messageSource = require('../data/message')
var senators = require('../data/senators');
var districts = require('../data/districts');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  Message.where({}).count(function(err, count) {
    if (err) {
      return next(err);
    };
    res.locals.counter = count;
    next();
  });
}, function(req, res, next) {
    res.render('index', { 
      title: 'Express',
      messageTmpl: messageSource,
      senatorsData: JSON.stringify(senators),
      districtsData: JSON.stringify(districts)
    });
});

module.exports = router;
