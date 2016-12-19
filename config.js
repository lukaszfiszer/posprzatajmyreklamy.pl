module.exports = {

  mongo: {
    url: process.env.MONGODB_URI || 'mongodb://localhost/uratujciedrzewa'
  },

  sendgrid: {
    apiKey: process.env.SENDGRID_API
  },

  counterStart: parseInt(process.env.COUNTER_START) || 0

};
