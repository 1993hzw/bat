var router = require('express').Router();
var admin = require('../../controller/admin');

router.get('/', admin.gotoAdmin);

module.exports = router;