const PagesController=require('../controllers/pages.controller')
const passport=require("passport")

module.exports=(app)=>{
    app.post('/pages',passport.authenticate('jwt',{session:false}),PagesController.pages)
    app.post('/get_page',passport.authenticate('jwt',{session:false}),PagesController.get_page)
}