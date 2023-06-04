const express = require('express')
const router = express()
const database = require('../databases')


router.get('/',async (req,res)=>{
    try{
        const [subjects] = await database.query(
            `SELECT *
            FROM subjects`
        )
        res.render("subjects/index",{subjects:subjects})
    } catch{
        res.redirect('/')
    }
    
})

router.get('/:id',async (req,res)=>{
    try{
        const module_code = req.params.id
        res.render("subjects/show",{module_code:module_code})
    }catch{
        res.redirect('/subjects')
    }
    
})

router.get('/:id/assignments',async (req,res)=>{
    try{
        const module_code = req.params.id
        let [assignments] = await database.query(
            `SELECT assignment_name, DATE_FORMAT(due_date,'%d/%m/%Y') AS formatted_date 
            FROM assignments
            WHERE module_code = ? AND completed = ?
            ORDER BY due_date`,[module_code,0]
        )
        findDaysLeft(assignments)
        res.render("subjects/assignments",{
            assignments:assignments,
            module_code:module_code,
        })
    }catch(err){
        res.redirect('/subjects')
        console.log(err)
    }
    
})

function findDaysLeft(assignments){
    assignments.forEach(assignment =>{
        let today_date = new Date()
        let year = today_date.getFullYear()
        let month= today_date.getMonth() + 1
        let day = today_date.getDate()
        
        let date_arr = assignment.formatted_date.split("/")
        let days_to_current = numberOfDays(year,month,day)
        let days_to_due = numberOfDays(parseInt(date_arr[2]),parseInt(date_arr[1]),parseInt(date_arr[0]))
        let days_left = (days_to_due - days_to_current)
        assignment['days_left'] = days_left

        if (days_left === 0) assignment['days_left_tag'] = 'Due today!'
        else if(days_left < 0) assignment['days_left_tag'] = 'Past Deadline!'
        else assignment['days_left_tag'] = days_left
        return assignments
    })
}

function numberOfDays(year,month,day){
    
    let month_arr = [31,28,31,30,31,30,31,31,30,31,30,31]
    if (leapyear(year)) month_arr[1] = 29
    let sum = 0
    for(let i = 0; i < month-1; i++){
        sum += month_arr[i]
    }
    sum += day 
    return sum
}

function leapyear(year)
{
return (year % 100 === 0) ? (year % 400 === 0) : (year % 4 === 0);
}

module.exports = router