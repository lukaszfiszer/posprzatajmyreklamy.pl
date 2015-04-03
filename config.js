module.exports = {
  
  mongo: {
    url: process.env.MONGOSOUP_URL || 'mongodb://localhost/posprzatajmyreklamy'
  },

  mandrill: {
    apiKey: process.env.MANDRILL_APIKEY || '026t-Soj1CcaN0FPMNd0HA'
  }

};
