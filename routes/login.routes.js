const LoginController=require('../controllers/login.controller')
module.exports=(app)=>{
    app.post('/login',LoginController.register)
}