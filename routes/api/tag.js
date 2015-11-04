var router=require('express').Router();
var tag=require('../../controller/tag');

//添加新标签
router.post('/_add_tag',tag._add_tag);

//重命名标签
router.post('/_rename_tag',tag._rename_tag);

//删除标签
router.post('/_delete_tag',tag._delete_tag);

module.exports=router;