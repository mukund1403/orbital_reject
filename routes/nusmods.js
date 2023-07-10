const express = require('express')
const router = express()
const database = require('../databases')
const mysql = require('mysql')
const axios = require('axios')

const checkAuthentication = require('./partials/checkAuthentication')
const bcrypt = require('bcrypt')
const passport = require('passport')
const initializePassport = require('../passport-config')

if (typeof document !== 'undefined') {
    let modlisttemplate = document.querySelector("[mod-list-template]")
    let modListContainer = document.querySelector("[mod-list-cards-container]")
    console.log('yes')
}



if (typeof window !== 'undefined') {
    // 👉️ can use document here
    //console.log(document.title)
    //console.log(document.getElementsByClassName('my-class'));
  } else {
    // 👉️ can't use document here
    console.log('You are on the server')
  }


router.get('/', async (req, res) => {
    /*let searchOptions = {}
    if (req.query.moduleCode != null && req.query.moduleCode !== '') {
        searchOptions.moduleCode = new RegExp(req.query.moduleCode, 'i')
    }
    try{
        const [module_code] = 'EE2026'
   
        let [data] = await database.query(
            `SELECT *
            FROM nusmods.modsummary
            WHERE moduleCode = ?`,[module_code]
        )
        
        res.render("nusmods/index", {data:data})
    }catch(err){
        res.redirect('/')
        console.log(err)
    }*/

    let searchOptions = {}
    if (req.query.moduleCode != null && req.query.moduleCode !== '') {
        //searchOptions.moduleCode = new RegExp(req.query.moduleCode, 'i')
    }
    try{
        //let module_code = 'CG1111A'
        //var query = mysql.format("SELECT * FROM nusmods.modsummary WHERE moduleCode = ?", (module_code));
        var query = "SELECT * FROM nusmods.modsummary ORDER BY moduleCode ASC";
        database.query(query,function(error, data){
            if (error) {
                console.error(error)
            } else {
                res.render('nusmods/mod-search', {title:'NUSMods', action:'list', sampleData:data})
            }
        })

    }catch(err){
        res.redirect('/')
        console.log(err)
    }

})

/*
fetch("https://api.nusmods.com/v2/2023-2024/modules/CS1010.json")
    .then(res => res.json())
    .then(data => {
        const x = data.semester.examDate
        console.log(x)
        //mod = data.map(mod => {
            //const card = modlisttemplate.content.cloneNode(true).children[0]
            //const header = card.querySelector("[data-header]")
            //const body = card.querySelector("[data-body]")
            //console.log(mod)
            //header.textContent = mod.moduleCode
            //body.textContent = mod.title
        //})  
    })

*/


router.get('/modlist', async (req, res) => {
    var query = "SELECT * FROM nusmods.modsummary ORDER BY moduleCode ASC";
    database.query(query,function(error, data){
        if (error) {
            console.error(error)
        } else {
            res.render('nusmods/modlist', {title:'NUSMods', action:'list', sampleData:data})
        }
    })
})

router.get('/sample_data', async (req, res) => {
    
    var query = "SELECT * FROM userbase.users ORDER BY moduleCode ASC";
    database.query(query,function(error, data){
        if (error) {
            console.error(error)
        } else {
            res.render('nusmods/sample_data', {title:'NUSMods', action:'list', sampleData:data})
        
            for (let i = 0; i < data.length; i++) {
                const moduleCode = data[i].moduleCode;
                const url = `https://api.nusmods.com/v2/2023-2024/modules/${moduleCode}.json`;
            
                axios.get(url)
                .then(response => {
                    const data = response.data.semesterData;
                    const modTitle = response.data.title;
                    
                    if (Array.isArray(data) && data.length > 0) {
                        console.log(moduleCode);
                        console.log(response.data.title)
                        var examDate1 = 0;
                        var examDate2 = 0;
                        var Finals = 0;
                        var SU = "Nah, sorry bro";

                        if (response.data.attributes.hasOwnProperty("su")) {
                            SU = "Yessir";
                        }
                        console.log(response.data.attributes.su)

                        

                        if (data[0] && data[0].hasOwnProperty("examDate") && data[0].semester == 1) {
                            console.log('Sem 1 set')
                            examDate1 = data[0].examDate;
                        } else if (data[0] && data[0].hasOwnProperty("examDate") && data[0].semester == 2) {
                            console.log('Dont Have Sem 1')
                            console.log('Sem 2 set')
                            examDate2 = data[0].examDate;
                        } else {
                            console.log('Dont Have Sem 1')
                        }

                        if (data[1] && data[1].hasOwnProperty("examDate") && data[1].semester == 2) {
                            console.log('Sem 2 set')
                            examDate2 = data[1].examDate;
                        } else if (data[1] || data[0].semester == 2){
                            console.log('Dont Have Sem 2')
                        }

                        const currentDate = new Date();
                        const targetDate = new Date('2023-11-25')
                        
                        if (currentDate > targetDate && examDate2 != 0) {
                            console.log('Exam2 Date: ', examDate2);
                            Finals = examDate2;
                        } else if (currentDate <= targetDate && examDate1 != 0) {
                            console.log('Exam1 Date: ', examDate1);
                            Finals = examDate1;
                        } else {
                            console.log('Exam Date: No Data Available');
                            Finals = "No Data Available";
                        }
                    } else {
                        console.log('No data available.');
                    }
                    
                    const updateQuery = 'UPDATE userbase.users SET examDate = ?, title = ?, SU = ? WHERE moduleCode = ?';
                    database.query(updateQuery,[Finals, modTitle, SU, moduleCode], function(error, data) {
                    if (error) {
                        console.error('Error updating data in the database:', error);
                        return;
                    }
                    console.log(`Data for module code ${moduleCode} updated successfully`);
                    });

                })
                .catch(error => {
                    console.error('Error:', error);
                });
            }
            res.render('/', {title:'NUSMods', action:'list', sampleData:data})
        }
    })
})

router.get('/mod-search', async(req, res)=>{   
    var query = "SELECT * FROM nusmods.modsummary"
    database.query(query,function(error, data){
        if (error) {
            console.error(error)
        } else {
            res.render('nusmods/mod-search', {sampleData:data})
        }
    })

})

router.get('/search', async(req, res) =>{
    var moduleCode = req.query.moduleCode;
    var title = req.query.title;
    var semesters = req.query.semesters;

    var sql = "SELECT * FROM nusmods.modsummary WHERE moduleCode LIKE '%"+moduleCode+"%' AND title LIKE '%"+title+"%' AND semesters LIKE '%"+semesters+"%'"
    database.query(sql, function(error, data) {
        if (error) console.log(error);
        res.render('nusmods/mod-search',  {sampleData:data})
    })
})


/*
router.get('/',checkAuthentication.checkAuthenticated, async (req,res)=>{
    let searchOptions = {}
    if (req.query.moduleCode != null && req.query.moduleCode !== '') {
        
    }
    try{
        var query = "SELECT * FROM nusmods.modsummary ORDER BY moduleCode ASC";
        database.query(query,function(error, data){
            if (error) {
                console.error(error)
            } else {
                res.render('nusmods/mod-search', {title:'NUSMods', action:'list', sampleData:data})
            }
        })
    }catch(err){
        res.redirect('/')
        console.log(err)
    }
})

router.get('/modlist',checkAuthentication.checkAuthenticated, async (req, res) => {
    var query = "SELECT * FROM nusmods.modsummary ORDER BY moduleCode ASC";
    database.query(query,function(error, data){
        if (error) {
            console.error(error)
        } else {
            res.render('nusmods/modlist', {title:'NUSMods', action:'list', sampleData:data})
        }
    })
})

router.get('/sample_data',checkAuthentication.checkAuthenticated, async (req, res) => {
    var query = "SELECT * FROM nusmods.modsummary ORDER BY moduleCode DESC";
    database.query(query,function(error, data){
        if (error) {
            console.error(error)
        } else {
            res.render('nusmods/sample_data', {title:'NUSMods', action:'list', sampleData:data})
        }
    })
})

router.get('/mod-search',checkAuthentication.checkAuthenticated, async(req, res)=>{   
    var query = "SELECT * FROM nusmods.modsummary"
    database.query(query,function(error, data){
        if (error) {
            console.error(error)
        } else {
            res.render('nusmods/mod-search', {sampleData:data})
        }
    })

})

router.get('/search',checkAuthentication.checkAuthenticated, async(req, res) =>{
    var moduleCode = req.query.moduleCode;
    var title = req.query.title;
    var semesters = req.query.semesters;

    var sql = "SELECT * FROM nusmods.modsummary WHERE moduleCode LIKE '%"+moduleCode+"%' AND title LIKE '%"+title+"%' AND semesters LIKE '%"+semesters+"%'"
    database.query(sql, function(error, data) {
        if (error) console.log(error);
        res.render('nusmods/mod-search',  {sampleData:data})
    })
})
*/

module.exports = router