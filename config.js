module.exports = {

  mongo: {
    url: process.env.MONGODB_URI || 'mongodb://localhost/uratujciedrzewa'
  },

  sendgrid: {
    apiKey: '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'
  },

  counterStart: parseInt(process.env.COUNTER_START) || 0

};
