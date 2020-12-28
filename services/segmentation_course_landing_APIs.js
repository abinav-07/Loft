//Database Connection
const pool = require("../config/pool");


//Route For get /transcribe
const getSegmentationCourseLandingRoute=(req,res)=>{
    var audioId = req.query.audio_id;
    var audio_url = "";
    
    if (!audioId || !req.query.user_id) {
        res.status(400).send("Error in URL. Please redirect again.");
    }  else {
        if (audioId) {
            var get_audio_url = `SELECT * FROM audio WHERE audio_id='${req.query.audio_id}'`;
            pool.query(get_audio_url, (err, result) => {
                if (err) {
                    console.error(err);                                      
                }
               
                if (result && result.length > 0) {
                    
                    audio_url = result[0]["audio_url"];                    

                    res.render("segmentation-course", {
                        user_id: req.query.user_id,
                        audio_url: audio_url,
                        audio_name: result[0]["audio_name"],
                        audio_id: audioId                        
                    });


                    var check_sql = `SELECT * FROM users_audio WHERE 
                                    user_id = '${req.query.user_id}'
                                    AND audio_id = '${audioId}'`;

                    pool.query(check_sql, (err, result) => {
                        if (err) {
                            console.error(err);
                            //res.status(400).send("error in get /transcribe query.");
                        }
                        if (result && result.length == 0) {
                            var sql = `INSERT INTO users_audio(user_id, audio_id, start_time) VALUES('${req.query.user_id}', 
                            '${audioId}', Now())`;
                            pool.query(sql, (err, result) => {
                                if (err) {
                                    console.error(err);
                                    res.status(400).send("error in get /segmentation-course query.");
                                }

                            });
                        } else if (result && result.length > 0) { //In case of Retry 
                            var check_in_users_audio_logs = `SELECT * FROM users_audio_logs WHERE users_audio_id IN 
                                                            (SELECT users_audio_id FROM users_audio WHERE 
                                                                    user_id='${req.query.user_id}' 
                                                                    AND audio_id='${audioId}' 
                                                                    AND type="segmentation"
                                                            )`
                            ;
                            pool.query(check_in_users_audio_logs, (err, result1) => {
                                if (err) {
                                    console.error(err);
                                    res.status(400).send("error in get /segmentation-course check_users_audio_logs query.");
                                }
                                if (result1 && result1.length > 0) {
                                    var update_start_time_in_users_logs = `UPDATE users_audio_logs 
                                                                            SET start_time=NOW() WHERE start_time IS NULL 
                                                                            AND users_audio_id=${result1[0].users_audio_id}`;
                                    pool.query(update_start_time_in_users_logs, (err2, result2) => {
                                        if (err2) {
                                            console.error(err);
                                            res.status(400).send("error in get /segmentation-course update_users_audio_logs query.");
                                        }
                                    });
                                }                                
                            });
                        }

                    });
                } else {
                    res.status(400).send("Audio Not Found. Please redirect again.")
                }
            });
        }
    }
}

const getSegmentationCourseLandingRouteForReactLT=(req,res)=>{
    var audioId = req.query.audio_id;
    var audio_url = "";
    
    if (!audioId || !req.query.user_id) {
        res.status(400).send("Error in URL. Please redirect again.");
    }  else {
        if (audioId) {
            var get_audio_url = `SELECT * FROM audio WHERE audio_id='${req.query.audio_id}'`;
            pool.query(get_audio_url, (err, result) => {
                if (err) {
                    console.error(err);                    
                }
                if (result && result.length > 0) {
                    
                    audio_url = result[0]["audio_url"];  
                    
                    res.status(200).json({
                        user_id:req.query.user_id,
                        type:"segmentation-course",
                        audio_url:audio_url,
                        audio_name:result[0]["audio_name"],
                        audio_id:audioId
                    });

                    var check_sql = `SELECT * FROM users_audio WHERE 
                                    user_id = '${req.query.user_id}'
                                    AND audio_id = '${audioId}'`;

                    pool.query(check_sql, (err, result) => {
                        if (err) {
                            console.error(err);                            
                        }
                        if (result && result.length == 0) {
                            var sql = `INSERT INTO users_audio(user_id, audio_id, start_time) VALUES('${req.query.user_id}', 
                            '${audioId}', Now())`;
                            pool.query(sql, (err, result) => {
                                if (err) {
                                    console.error(err);
                                    res.status(400).send("error in get /transcribe query.");
                                }

                            });
                        } else if (result && result.length > 0) { //In case of Retry 
                            var check_in_users_audio_logs = `SELECT * FROM users_audio_logs WHERE users_audio_id IN 
                                                            (SELECT users_audio_id FROM users_audio WHERE 
                                                                    user_id='${req.query.user_id}' 
                                                                    AND audio_id='${audioId}' 
                                                                    AND type="segmentation"
                                                            )`
                            ;
                            pool.query(check_in_users_audio_logs, (err, result1) => {
                                if (err) {
                                    console.error(err);
                                    res.status(400).send("error in get /transcribe check_users_audio_logs query.");
                                }
                                if (result1 && result1.length > 0) {
                                    var update_start_time_in_users_logs = `UPDATE users_audio_logs 
                                                                            SET start_time=NOW() WHERE start_time IS NULL 
                                                                            AND users_audio_id=${result1[0].users_audio_id}`;
                                    pool.query(update_start_time_in_users_logs, (err2, result2) => {
                                        if (err2) {
                                            console.error(err);
                                            res.status(400).send("error in get /transcribe update_users_audio_logs query.");
                                        }
                                    });
                                }                                
                            });
                        }

                    });
                } else {
                    res.status(400).send("Audio Not Found. Please redirect again.")
                }
            });
        }
    }
}

module.exports={
    getSegmentationCourseLandingRoute,
    getSegmentationCourseLandingRouteForReactLT
}