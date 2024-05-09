let express=require('express')
let router=express()

router.get('/',(req,res)=>{
    res.render('../views/frontend/tourly/index')
})
module.exports=router