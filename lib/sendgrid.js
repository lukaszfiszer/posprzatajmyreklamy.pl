var sendgrid  = require('sendgrid')
var config = require('../config');

module.exports = sendgrid(config.sendgrid.apiKey);
