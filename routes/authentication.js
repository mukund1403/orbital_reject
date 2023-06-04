const express = require('express')
const router = express()
const database = require('../databases')
const client_id = '1027635081966-b3qrqh069jb1ehj0ks6rkuslr2l39a5v.apps.googleusercontent.com'

router.get('/',(req,res)=>{
    res.render('authentication')
})

router.get('/authentication/oauth',(req,res)=>{
    res.redirect(`https://canvas.nus.edu.sg/login/oauth2/auth?client_id=1027635081966-b3qrqh069jb1ehj0ks6rkuslr2l39a5v.apps.googleusercontent.com&response_type=code&redirect_uri=http://localhost:3000/index`)
})

module.exports = router