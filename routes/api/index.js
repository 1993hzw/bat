var router = require('express').Router();

router.use(/\/_.+/, function (req, res, next) {//_开头的为私有接口，必须登录授权
    if (!req.session.hasLogined) return res.json({state: -100});
    next();
});

router.use('/', require('./blog'));
router.use('/', require('./tag'));
router.use('/', require('./comment'));
router.use('/', require('./admin'));


module.exports = router;