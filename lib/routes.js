var express = require('express');

var router = new express.Router(),
    controllers = {
        shape  : require('./controller/shape'),
        person : require('./controller/person')
    };

router.get('/shape', controllers.shape);
router.get('/size/:size', controllers.shape);
router.get('/shape/size/:size', controllers.shape);
router.get('/person/profile', controllers.person);

module.exports = router;