const mongoose = require('mongoose');
const config = require('../utils/config');

module.exports = function() {
    mongoose.connect(config.mongoUrl, { useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true})
        .then(() => console.log("Connected to MongoDB"))
        .catch(err => console.error("Error whilst connecting to MongoDB: " + err.message));
};