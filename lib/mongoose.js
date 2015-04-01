var mongoose = require('mongoose');
var mongoUrl = process.env.MONGOSOUP_URL || 'mongodb://localhost/posprzatajmyreklamy';

mongoose.connect(mongoUrl);

module.exports = mongoose;
