module.exports = {
  
  mongo: {
    url: process.env.MONGODB_URI || 'mongodb://localhost/uratujciedrzewa'
  },

  mandrill: {
    apiKey: process.env.MANDRILL_APIKEY || '026t-Soj1CcaN0FPMNd0HA'
  },

  counterStart: parseInt(process.env.COUNTER_START) || 0

};
