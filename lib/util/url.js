var config = require('../config');

/**
 * Make sure that the path entered begins with protocol and host
 *
 * @param {String} path
 * @param {String*} fallbackUrl
 * @return {String}
 */
exports.assetUrl = function (path, fallbackUrl) {
    if (!path) {
        return fallbackUrl || '';
    } else if (path.indexOf('http://') === 0 || path.indexOf('https://') === 0) {
        return path;
    } else {
        return config.WS_URL + '/' + path;
    }
};