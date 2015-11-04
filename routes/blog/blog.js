var router = require('express').Router();
var blog = require('../../controller/blog');

router.get('/', blog.gotoBlogList);
router.get(/^\/[0-9]+$/, blog.gotoBlog);
router.get('/publish', blog.gotoPublish);
router.get('/edit', blog.gotoEdit);


module.exports = router;
