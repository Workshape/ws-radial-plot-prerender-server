var express = require('express');

var router = new express.Router(),
    controllers = {
        shape         : require('./controller/shape'),
        person        : require('./controller/person'),
        position      : require('./controller/position'),
        positionTweet : require('./controller/position-tweet')
    };

// Shape
router.get('/size/:size', controllers.shape);
router.get('/shape/:size?', controllers.shape);

// Position (tweet)
router.get('/position/:positionId/tweet', controllers.positionTweet);

// Position
router.get('/position/:positionId', controllers.position);
router.get('/position/:positionId/:size?', controllers.position);

// Person
router.get('/person/profile', controllers.person);

module.exports = router;