const DataController=require('../controllers/data_existence.controller');
const express=require('express');
const router=express.Router();
router.get('/isContractName/:name',DataController.prototype.isContractExistByName);
module.exports=router;