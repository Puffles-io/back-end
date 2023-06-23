const DataController=require('../controllers/data_existence.controller');
const express=require('express');
const router=express.Router();
router.get('/isCollectionName/:name',DataController.prototype.isCollectionExistByName);
router.get('/isCollectionURL/:urlString',DataController.prototype.isCollectionEXistByURL);
module.exports=router;
