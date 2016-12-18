module.exports = {
  
  mongo: {
    url: process.env.MONGOLAB_URI || process.env.MONGOSOUP_URL || 'mongodb://localhost/uratujciedrzewa'
  },

  mandrill: {
    apiKey: process.env.MANDRILL_APIKEY || '026t-Soj1CcaN0FPMNd0HA'
  },

  counterStart: parseInt(process.env.COUNTER_START) || 0

};
