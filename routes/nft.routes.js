const NFTController=require('../controllers/nft.controller')
const passport=require("passport")
module.exports=(app)=>{
    app.post('/upload_v1',passport.authenticate('jwt',{session:false}),NFTController.upload_v1)
}