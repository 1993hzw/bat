var router=require('express').Router();
var blog = require('../../controller/blog');

//发布文章
router.post('/_publish', blog._publishBlog);

//保存文章
router.post('/_save', blog._save);

//删除文章
router.get('/_delete',blog._delete);

router.get('/get_last',blog.getLast);

router.get('/get_blogs',blog.getBlogByTag);

//设置置顶
router.post('/_set_top',blog._setTop);


module.exports=router;