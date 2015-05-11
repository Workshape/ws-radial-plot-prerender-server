var request = require('request'),
    config = require('../config'),
    urlUtil = require('../util/url'),
    renderer = require('../renderer/position-tweet'),
    Canvas = require('canvas');

/**
 * Position render sizes and default company logo
 */
var DEFAULT_ORG_LOGO = 'https://www.workshape.io/images/assets/anonymous-org.png',
    IMG_SIZE = [ 1024, 512 ];


/**
 * Draw requested position by ID
 *
 * @param {Object} req Request
 * @param {Object} res Response
 * @param {Function} next Callback
 */
module.exports = function (req, res, next) {
    var positionId = req.params.positionId,
        endpoint = config.WS_URL + 'api/1/positions/' + positionId + '/public';

    // Request position data
    request.get(endpoint, function (err, response, body) {

        // Handle request errors
        if (err) {
            return next(err);
        } else if (response.statusCode !== 200) {
            return res.sendStatus(response.statusCode);
        }

        var data = JSON.parse(body),
            logoUrl = urlUtil.assetUrl(data.organisation.logo, DEFAULT_ORG_LOGO);

        // Request comoany logo asset
        request.get({
            url      : logoUrl,
            encoding : null
        }, function (err, response, body) {

            // Handle request errors
            if (err) {
                return next(err);
            } else if (response.statusCode !== 200) {
                return res.sendStatus(response.statusCode);
            }

            // Create canvas
            var canvas = new Canvas(IMG_SIZE[0], IMG_SIZE[1]),
                ctx = canvas.getContext('2d'),
                options = {
                    size         : IMG_SIZE,
                    organisation : {
                        name : data.organisation.name,
                        logo : body
                    },
                    position     : {
                        title  : data.title,
                        values : Object.keys(data.time_load).map(function (key) {
                            return data.time_load[key].value;
                        }),
                        skills : data.skills.map(function (s) {
                            return s.name;
                        }).slice(0, 5),
                        remote   : data.remote_ok,
                        contract : data.contract,
                        level    : data.level.name,
                        visa     : data.visa || false
                    }
                };
            // Render context
            renderer(ctx, IMG_SIZE, options);

            // Stream rendered file contents
            canvas.toBuffer(function (err, buf) {

                if (err) {
                    return next(err);
                }

                res.set('Content-Type', 'image/png');
                res.status(200).send(buf);
            });

        });
    });
};