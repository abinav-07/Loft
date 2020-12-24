//Database Connection
const pool = require("../config/pool");

//Route For Training
const getTrainingLandingRoute=(req,res)=>{
    var audio_url = "";
    var audio_order;
    var audioId = req.query.audio_id;
    var user_name = "";
    if (!audioId || !req.query.user_id) {
        res.status(400).send("Error in URL. Please redirect again.")
    } else {
        audioId = req.query.audio_id;
        var get_audio_url = `SELECT * FROM audio WHERE audio_id='${req.query.audio_id}'`;
        pool.query(get_audio_url, (err, result) => {
            if (err) {
                console.error(err);                
            }
            //Audio Name
            if (result && result.length > 0) {
                audio_url = result[0]["audio_url"];

                //Getting audio order for training                              
                audio_order = result[0]["audio_order"]?result[0]["audio_order"]:"No Order";

                //SQL to get user name
                var get_user_name = `SELECT * FROM users WHERE user_id='${req.query.user_id}'`;
                pool.query(get_user_name, (err, userName_result) => {
                    if (err) {
                        console.error(err);                        
                    }
                    user_name = userName_result[0] ? userName_result[0]["name"] : "Not Found";

                    res.render("training_audio", {
                        user_id: req.query.user_id,
                        audio_url: audio_url,
                        audio_id: req.query.audio_id,
                        audio_name: result[0]["audio_name"],
                        audio_order: audio_order,
                        user_name: user_name,
                    });
                });

                //Checking if user is already in database
                var check_sql = `SELECT * FROM users_audio WHERE user_id = '${req.query.user_id}'
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
                                res.status(400).send("error in get /training query.");
                            }                            
                        });
                    } else if (result && result.length > 0) {
                        var check_in_users_audio_logs = `SELECT * FROM users_audio_logs 
                                WHERE users_audio_id IN 
                                (SELECT users_audio_id FROM users_audio
                                WHERE 
                                user_id='${req.query.user_id}' 
                                AND audio_id='${audioId}' 
                                AND type="segmentation"
                            )`;
                        pool.query(check_in_users_audio_logs, (err, result1) => {
                            if (err) {
                                console.error(err);
                                res.status(400).send("error in get /training check_users_audio_logs query.");
                            }
                            if (result1 && result1.length > 0) {
                                var update_start_time_in_users_logs = `UPDATE users_audio_logs SET start_time=NOW()
                                 WHERE 
                                 start_time IS NULL AND 
                                 users_audio_id=${result1[0].users_audio_id}`;
                                pool.query(update_start_time_in_users_logs, (err2, result2) => {
                                    if (err2) {
                                        console.error(err2);
                                        res.status(400).send("error in get /training update_users_audio_logs query.");
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

const getTrainingLandingRouteReactLT=(req,res)=>{
    var audio_url = "";
    var audio_order;
    var audioId = req.query.audio_id;
    var user_name = "";
    if (!audioId || !req.query.user_id) {
        res.status(400).send("Error in URL. Please redirect again.")
    } else {
        audioId = req.query.audio_id;
        var get_audio_url = `SELECT * FROM audio WHERE audio_id='${req.query.audio_id}'`;
        pool.query(get_audio_url, (err, result) => {
            if (err) {
                console.error(err);                
            }
            //Audio Name
            if (result && result.length > 0 && result[0]["audio_order"] != null) {
                audio_url = result[0]["audio_url"];

                //Getting audio order for training                
                audio_order = result[0]["audio_order"];

                //SQL to get user name
                var get_user_name = `SELECT * FROM users WHERE user_id='${req.query.user_id}'`;
                pool.query(get_user_name, (err, userName_result) => {
                    if (err) {
                        console.error(err);                        
                    }
                    user_name = userName_result[0] ? userName_result[0]["name"] : "Not Found";

                    res.status(200).json({
                        user_id: req.query.user_id,
                        type:"training",
                        audio_url: audio_url,
                        audio_id: req.query.audio_id,
                        audio_name: result[0]["audio_name"],
                        audio_order: audio_order,
                        user_name: user_name,
                    })
                    
                });

                //Checking if user is already in database
                var check_sql = `SELECT * FROM users_audio WHERE user_id = '${req.query.user_id}'
                                         AND audio_id = '${audioId}'`;
                pool.query(check_sql, (err, result) => {
                    if (err) {
                        console.error(err);                        
                    }
                    if (result && result.length == 0) {
                        var sql = `INSERT INTO users_audio(user_id, audio_id, start_time) 
                        VALUES('${req.query.user_id}','${audioId}', Now())`;
                        pool.query(sql, (err, result) => {
                            if (err) {
                                console.error(err);
                                res.status(400).send("error in get /training query.");
                            }                            
                        });
                    } else if (result && result.length > 0) {
                        var check_in_users_audio_logs = `SELECT * FROM users_audio_logs 
                                WHERE users_audio_id IN 
                                (SELECT users_audio_id FROM users_audio
                                WHERE 
                                user_id='${req.query.user_id}' 
                                AND audio_id='${audioId}' 
                                AND type="segmentation"
                            )`;
                        pool.query(check_in_users_audio_logs, (err, result1) => {
                            if (err) {
                                console.error(err);
                                res.status(400).send("error in get /training check_users_audio_logs query.");
                            }
                            if (result1 && result1.length > 0) {
                                var update_start_time_in_users_logs = `UPDATE users_audio_logs SET start_time=NOW()
                                 WHERE 
                                 start_time IS NULL AND 
                                 users_audio_id=${result1[0].users_audio_id}`;
                                pool.query(update_start_time_in_users_logs, (err2, result2) => {
                                    if (err2) {
                                        console.error(err2);
                                        res.status(400).send("error in get /training update_users_audio_logs query.");
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

module.exports={
    getTrainingLandingRoute,
    getTrainingLandingRouteReactLT
}
