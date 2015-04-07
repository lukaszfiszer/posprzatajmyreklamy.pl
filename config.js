module.exports = {
  
  mongo: {
    url: process.env.MONGOLAB_URI || process.env.MONGOSOUP_URL || 'mongodb://localhost/posprzatajmyreklamy'
  },

  mandrill: {
    apiKey: process.env.MANDRILL_APIKEY || '026t-Soj1CcaN0FPMNd0HA'
  },

  // Temporary solution while we recover messages from MongoSoup hosting
  counterStart: parseInt(process.env.COUNTER_START) || 0

};
