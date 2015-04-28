/*
 * Correctly parse a number from a string
 *
 * @param {String} str
 * @return {Number}
 */
exports.parseNumber = function (str) {
    return parseInt(str.trim(), 10);
};