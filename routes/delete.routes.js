const express=require('express');
const router=express.Router();
const deleteController=require('../controllers/delete.controller');
const passport=require('passport')
router.post('/nft',passport.authenticate('jwt',{session:false}),deleteController.prototype.removeNft);
router.post('/placeholder',passport.authenticate('jwt',{session:false}),deleteController.prototype.deletePlaceholderImage)
module.exports=router;