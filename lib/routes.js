var express = require('express');

var router = new express.Router(),
    controllers = {
        render : require('./controller/render')
    };

router.get('/size/:size', controllers.render);

module.exports = router;