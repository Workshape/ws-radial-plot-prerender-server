var Canvas = require('canvas'),
    renderer = require('../core/renderer');

var sizes = {
        small  : [ 250, 250 ],
        medium : [ 500, 500 ],
        large  : [ 1000, 1000 ]
    };

module.exports = function (req, res, next) {
    var sizeName = req.params.size,
        size = sizes[sizeName],
        values = req.query.v,
        compare = req.query.c;

    if (!size) {
        return res.status(400).send('Invalid `size`');
    } else if (!values) {
        return res.status(400).send('Missing `values`');
    }

    values = values.split(',').map(parseNumber);

    if (values.length < 10) {
        return res.status(400).send('Expected 10 `values`, given ' + values.length);
    }

    var canvas = new Canvas(size[0], size[1]),
        ctx = canvas.getContext('2d'),
        sets = [ values ];

    if (compare) {
        sets.push(compare.split(',').map(parseNumber));
    }

    renderer(ctx, sets);

    canvas.toBuffer(function (err, buf) {
        if (err) { return next(err); }
        res.set('Content-Type', 'image/png');
        res.status(200).send(buf);
    });
};

function parseNumber(str) {
    return parseInt(str.trim(), 10);
}