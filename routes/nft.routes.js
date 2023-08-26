const NFTController=require('../controllers/nft.controller')
const passport=require("passport")
const multer = require("multer");
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage });
module.exports=(app)=>{
    app.post('/upload_v1',passport.authenticate('jwt',{session:false}),upload.single("file"),NFTController.upload_v1),
    app.post('/title',passport.authenticate('jwt',{session:false}),NFTController.title),
    app.post('/placeholder',passport.authenticate('jwt',{session:false}),NFTController.placeholder_image)
    app.get('/get_nfts',passport.authenticate('jwt',{session:false}),NFTController.get_nfts)
}