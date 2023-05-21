const SmartContractController=require('../controllers/smartcontract.controller')
const passport=require("passport")
module.exports=(app)=>{
    app.post('/smartcontract',passport.authenticate('jwt',{session:false}),SmartContractController.smartcontract)
}