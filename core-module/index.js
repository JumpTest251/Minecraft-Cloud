module.exports.authentication = require('./middleware/authentication');

module.exports.coreConfig = require('./utils/config');

module.exports.authManager = require('./utils/authenticationManager');

module.exports.tokenGenerator = require('./utils/TokenGenerator');

module.exports.errorMiddleware = require('./middleware/error');

module.exports.loggingMiddleware = require('./middleware/logging');