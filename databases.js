//get environment variables to work before commiting to github
//import mysql from 'mysql2'
const mysql = require('mysql2/promise')
require('dotenv').config()


const pool = mysql.createPool({
    /*host: '127.0.0.1', //process.env.MYSQL_HOST,
    user: 'root', //process.env.MYSQL_USER,
    password: 'doctoraprao14', //process.env.MYSQL_PASSWORD,
    database: 'orbital', //process.env.MYSQL_DATABASE */

    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE 
})



/*async function getAllAssignments(){
    const [rows] = await pool.query("SELECT * FROM assignments")
    console.log(rows)
}

async function getAssignment(module_code){
    const [rows] = await pool.query(
        `SELECT *
        FROM assignments
        WHERE module_code = ?`,[module_code])
    return rows
    
}

async function newAssignment(module_code,assignment_name,due_date){
  
    const result = await pool.query(
        `INSERT INTO assignments(module_code,assignment_name,due_date) 
        VALUES(?,?,?)`,[module_code,assignment_name,due_date]
    )
    return result
}

async function deleteAssignment(module_code,assignment_name,due_date){
    const result = await pool.query(
        `DELETE FROM assignments(module_code,assignment_name,due_date)
        WHERE module_code = ? AND assignment_name = ?`,[module_code,assignment_name]
    )
    return result
}*/



module.exports = pool


  



