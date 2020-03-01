const mysql=require("mysql");

var pool=mysql.createPool({
    host:"localhost",
    user:"root",
    password:"",
    database:"nodemysql"   
})


module.exports=pool;