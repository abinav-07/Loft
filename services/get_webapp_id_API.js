//Database Connection
const pool = require("../config/pool");

const getWebAppId=(req,res)=>{
    var sql = `SELECT * FROM users 
    WHERE user_id=${req.body.user_id}`;
    
    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(400).send("error in post /get-web-app-id");
        }        
        res.status(200).send(result);
    });   
}

module.exports={
    getWebAppId
}