var router=require('express').Router();
var comment=require('../../controller/comment');

//添加新评论
router.post('/add_comment',comment.add_comment);

//根据文章id获取评论
router.get('/get_comments',comment.get_comments);

//根据id获取评论
router.get('/_get_comment_by_id',comment._get_comment_by_id);

//获取没有回复的评论
router.get('/_get_comment_brief_noreplay',comment._get_comment_brief_noreplay);

//获取已回复的评论
router.get('/_get_comment_brief_replayed',comment._get_comment_brief_replayed);

//删除评论
router.post('/_del_comment',comment._del_comment);

//回复评论
 router.post('/_replay', comment._replay);

module.exports=router;