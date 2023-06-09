const express = require('express')
const router = express()
const database = require('./databases')
require('dotenv').config()
//const access_token = process.env.CANVAS_API_TOKEN
//const user_id = 41


async function fetchCourses(user_id, access_token) {
    let url = `https://canvas.nus.edu.sg/api/v1/courses?access_token=${access_token}`
    fetch(url)
        .then(res => res.json())
        .then(data => {
            let subjects = data
            try {
                subjects.forEach(subject => {
                    if (subject.course_code && subject.name) {
                        //try {
                            addSubjectToDb(subject.id, subject.name, subject.course_code, user_id)
                            url = `https://canvas.nus.edu.sg/api/v1/courses/${subject.id}/assignments?access_token=${access_token}`
                            fetch(url)
                                .then(res => res.json())
                                .then(data => {
                                    const assignments = data
                                    assignments.forEach(assignment => {
                                        if (assignment.name && assignment.due_at) {
                                            database.query(
                                                `SELECT module_code
                                                FROM subjects
                                                WHERE id = ?`, [assignment.course_id]
                                            ).then(res => res)
                                                .then(data => {
                                                    const module_code = data[0][0].module_code
                                                    const due_date = convertDateFormat(assignment.due_at)
                                                    addAssignmentToDb(assignment.id, module_code, assignment.name, due_date, assignment.has_submitted_submissions, user_id)
                                                    console.log('assignment added')
                                                })

                                        }
                                    })

                                })

                        //} catch {
                        //    console.log("There was a problem")
                        //}

                    }

                })


            } catch (err) {
                const response = deleteFromDb()
                console.log('Incorrect token')
                let message = 'Incorrect token'
                return message
            }
        })
    
    
    async function addSubjectToDb(id,name,module_code,user_id){
            const response = await database.query(
                `INSERT INTO subjects(id,module_code,name,user_id)
                VALUES(?,?,?,?)`,[id,module_code,name,user_id]
            )
        
    }
    async function addAssignmentToDb(id,module_code,assignment_name,due_date,completed,user_id){
        const response = await database.query(
            `INSERT INTO assignments
            VALUES(?,?,?,?,?,?)`,[id,module_code,assignment_name,due_date,completed,user_id]
        )
    }

    function convertDateFormat(date){
        let date_arr = date.split("T")
        return date_arr[0]
    }
    async function deleteFromDb(){
        const response = await database.query(
            `DELETE FROM users
            WHERE user_id = ?`,[user_id]
        )
    }
}

/*async function fetchCourses(user_id,access_token){
    const url = `https://canvas.nus.edu.sg/api/v1/courses?access_token=${access_token}`
        fetch(url)
    .then(res=>res.json())
    .then(data=>{
        const subjects = data
        try{
            subjects.forEach(subject=>{
                if(subject.course_code && subject.name){
                    try{
                        addSubjectToDb(subject.id,subject.name,subject.course_code,user_id)
                        
                    }catch{
                        console.log("There was a problem")
                    }
                    
                }
            
            })
        }catch(err){
            console.log('Incorrect token')
        }
        
    })
    
    
    async function addSubjectToDb(id,name,module_code,user_id){
            const response = await database.query(
                `INSERT INTO subjects(id,module_code,name,user_id)
                VALUES(?,?,?,?)`,[id,module_code,name,user_id]
            )
        
    }
}

async function fetchAssignments(user_id,access_token){
    const [subjects] = await database.query(
        `SELECT id
        FROM subjects
        WHERE user_id = ?`,[user_id]
    )
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
                        addAssignmentToDb(assignment.id,module_code,assignment.name,due_date,assignment.has_submitted_submissions,user_id)
                        console.log('assignment added')
                    })
                     
                }
            })

        })
    })
    async function addAssignmentToDb(id,module_code,assignment_name,due_date,completed,user_id){
        const response = await database.query(
            `INSERT INTO assignments
            VALUES(?,?,?,?,?,?)`,[id,module_code,assignment_name,due_date,completed,user_id]
        )
    }

    function convertDateFormat(date){
        let date_arr = date.split("T")
        return date_arr[0]
    }
}*/

//fetchCourses(user_id,access_token)
//fetchAssignments(user_id,access_token)

module.exports = {fetchCourses/*,fetchAssignments*/}


