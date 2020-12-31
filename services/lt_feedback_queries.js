//Database Connection
const pool = require("../config/pool");

//Feedback Routes
const insertFeedBackLt=(req,res)=>{
    const sql = `INSERT INTO feedbackLT 
                (feedback,audio_id,feedbackCreatedAt,user_id) 
                VALUES 
                ("${req.body.feedback.replace(/'/g, "\\'")}","${req.body.audio_id}",Now(),"${req.body.user_id}")`
    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(400).send("error in get /insert-feedback-lt.");
        }
        res.status(200).send(result);
    })
}

module.exports={
    insertFeedBackLt
}