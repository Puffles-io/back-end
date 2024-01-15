const DataController=require('../controllers/data_existence.controller');
const express=require('express');
const router=express.Router();
router.get('/isCollectionURI/:URI',DataController.prototype.isCollectionExistByURI);
router.get('/isCollectionURL/:urlString',DataController.prototype.isCollectionEXistByURL);
router.post('/IPFSjson',DataController.prototype.getJsonFiles);
module.exports=router;
