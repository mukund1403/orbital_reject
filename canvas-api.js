const express = require('express')
const router = express()
const database = require('./databases')
const access_token = "21450~i6hDITA6OTPHJf9aDxRdrMGRgeFhCn4QgUKnubWEnNXP3prGaGD0Nmkkjm0J9tz1"
require('dotenv').config()
console.log(process.env.MYSQL_HOST)
function fetchCourses(){
    const url = `https://canvas.nus.edu.sg/api/v1/courses?access_token=${access_token}`
    fetch(url)
    .then(res=>res.json())
    .then(data=>{
        const subjects = data
        subjects.forEach(subject=>{
            if(subject.course_code && subject.name){
                try{
                    addSubjectToDb(subject.id,subject.name,subject.course_code)
                    console.log("Success")
                }catch{
                    console.log("There was a problem")
                }
                
            }
        
        })
    })
    async function addSubjectToDb(id,name,module_code){
        const response = await database.query(
            `INSERT INTO subjects(id,module_code,name)
            VALUES(?,?,?)`,[id,module_code,name]
        )
    }
}

async function fetchAssignments(){
    const [subjects] = await database.query(
        `SELECT id
        FROM subjects`
    )
    console.log(subjects)
    subjects.forEach(subject=>{
        const url = `https://canvas.nus.edu.sg/api/v1/courses/${subject.id}/assignments?access_token=${access_token}`
        fetch(url)
        .then(res=>res.json())
        .then(data=>{
            const assignments = data
            assignments.forEach(assignment=>{
                if(assignment.name && assignment.due_at){
                    database.query(
                        `SELECT module_code
                        FROM subjects
                        WHERE id = ?`,[assignment.course_id]
                    ).then(res=>res)
                    .then(data=>{
                        const module_code = data[0][0].module_code
                        const due_date = convertDateFormat(assignment.due_at)
                        addAssignmentToDb(assignment.id,module_code,assignment.name,due_date,assignment.has_submitted_submissions)
                    })
                     
                    //console.log(assignment.name,assignment.due_at,assignment.course_id,assignment.has_submitted_submissions)
                }
            })

        })
    })
    async function addAssignmentToDb(id,module_code,assignment_name,due_date,completed){
        const response = await database.query(
            `INSERT INTO assignments
            VALUES(?,?,?,?,?)`,[id,module_code,assignment_name,due_date,completed]
        )
    }

    async function getModuleCode(course_id){
        const module_code = await database.query(
            `SELECT module_code
            FROM subjects
            WHERE id = ?`,[course_id]
        )
        return module_code
    }

    function convertDateFormat(date){
        let date_arr = date.split("T")
        return date_arr[0]
    }
}
fetchCourses()
//fetchAssignments()



