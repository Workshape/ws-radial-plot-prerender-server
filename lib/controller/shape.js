var Canvas = require('canvas'),
    renderer = require('../renderer/shape'),
    stringUtil = require('../util/string');

/**
 * Shape enable sizes names
 */
var SHAPE_SIZES = {
        small   : [ 250, 250 ],
        medium  : [ 500, 500 ],
        large   : [ 1000, 1000 ],
        default : [ 500, 500 ]
    };

/**
 * Draw requested shape
 *
 * @param {Object} req Request
 * @param {Object} res Response
 * @param {Function} next Callback
 */
module.exports = function (req, res, next) {
    var sizeName = req.params.size || 'default',
        size = SHAPE_SIZES[sizeName],
        values = req.query.v,
        compare = req.query.c,
        showLabels = req.query.labels === 'true';

    // Validate options
    if (!size) {
        return res.status(400).send('Invalid `size`');
    } else if (!values) {
        return res.status(400).send('Missing `values`');
    }

    // Parse request datapoints
    values = values.split(',').map(stringUtil.parseNumber);

    // Create canvas
    var canvas = new Canvas(size[0], size[1]),
        center = [ size[0] / 2, size[1] / 2 ],
        ctx = canvas.getContext('2d'),
        sets = [ values ];

    // Parse comparison point if passed
    if (compare) {
        sets.push(compare.split(',').map(stringUtil.parseNumber));
    }

    // Render context
    renderer(ctx, size, center, sets, showLabels);

    // Stream rendered file contents
    canvas.toBuffer(function (err, buf) {

        if (err) {
            return next(err);
        }

        res.set('Content-Type', 'image/png');
        res.status(200).send(buf);
    });
};