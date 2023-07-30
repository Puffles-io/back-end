const LoginController=require('../controllers/login.controller')
module.exports=(app)=>{
    app.get('/login',LoginController.register)
    app.get('/nonce',LoginController.nonce)
}