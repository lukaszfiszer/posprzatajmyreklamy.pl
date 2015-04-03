var fs = require('fs');
var express = require('express');

var Message = require('../models/message');
var senatorMsg = fs.readFileSync('./data/senatorMessage.hbs', {encoding: 'utf8'});
var senators = require('../data/senators');
var districts = require('../data/districts');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  Message.where({}).count(function(err, count) {
    if (err) {
      return next(err);
    }
    res.locals.counter = count;
    next();
  });
}, function(req, res, next) {
    res.render('index', { 
      title: 'Express',
      messageTmpl: senatorMsg.replace(/\n/g, '\\n'),
      senatorsData: JSON.stringify(senators),
      districtsData: JSON.stringify(districts)
    });
});

module.exports = router;
