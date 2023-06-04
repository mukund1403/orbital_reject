const express = require('express')
const router = express()
const database = require('../databases')

router.get('/',async (req,res)=>{
    res.render("dashboard")
})



module.exports = router