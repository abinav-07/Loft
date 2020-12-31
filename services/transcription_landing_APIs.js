//Database Connection
const pool = require("../config/pool");

//Route for transcription
const getTranscriptionLandingRoute=(req,res)=>{
    var audio_url = "";
    var audioId = req.query.audio_id;

    if (!audioId || !req.query.user_id) {
        res.status(400).send("Error in URL. Please redirect again.")
    } else {
        audioId = req.query.audio_id;
        var get_audio_url = `SELECT * FROM audio WHERE audio_id='${req.query.audio_id}'`;
        pool.query(get_audio_url, (err, result) => {
            if (err) {
                console.error(err);                
            }
            if (result && result.length > 0) {
                audio_url = result[0]["audio_url"];
                
                res.render("transcription", {
                    user_id: req.query.user_id,
                    audio_url: audio_url,
                    audio_name: result[0]["audio_name"],
                    audio_id: req.query.audio_id,
                });

                //Checking if user is already in database
                var check_sql = `SELECT * FROM users_audio 
                WHERE
                user_id = '${req.query.user_id}' AND audio_id = '${audioId}' AND type="transcription"`;
                pool.query(check_sql, (err, result) => {
                    if (err) {
                        console.error(err);                        
                    }
                    if (result && result.length == 0) {
                        var sql =`INSERT INTO users_audio(user_id, audio_id, start_time,type) 
                                  VALUES('${req.query.user_id}', '${audioId}', Now(),"transcription")`;
                        pool.query(sql, (err, result) => {
                            if (err) {
                                console.error(err);
                                res.status(400).send("error in get /transcribe query.");
                            }                            
                        });
                    } else if (result && result.length > 0) {
                        var check_in_users_audio_logs = `SELECT * FROM users_audio_logs 
                        WHERE users_audio_id IN
                        (SELECT users_audio_id FROM users_audio 
                            WHERE 
                            user_id='${req.query.user_id}' 
                            AND audio_id='${audioId}' 
                            AND type="transcription"
                        )`;
                        
                        pool.query(check_in_users_audio_logs, (err1, result1) => {
                            if (err1) {
                                console.error(err1);                                
                            }
                            if (result1 && result1.length > 0) {
                                
                                var update_start_time_in_users_logs = `UPDATE users_audio_logs 
                                SET 
                                start_time=NOW() 
                                WHERE 
                                start_time IS NULL 
                                AND 
                                users_audio_id=${result1[0].users_audio_id}`;
                                
                                pool.query(update_start_time_in_users_logs, (err2, result2) => {
                                    if (err2) {
                                        console.error(err2);                                        
                                    }
                                });
                            }
                        });
                    }
                });

                //Checking if user is already in database
                var check_actual_data_in_transcription = `SELECT * FROM transcription WHERE user_id = '${req.query.user_id}'
                        AND audio_id = '${audioId}'`;
                pool.query(check_actual_data_in_transcription, (err, result) => {
                    if (err) {
                        console.error(err);
                       
                    }
                    if (result && result.length == 0) {

                        //Inserting actual data from actual table to transcription table
                        var insert_sql =`INSERT INTO transcription 
                                        (audio_id,user_id,div_className,div_title,segment_start,segment_end,actual_text)  
                                        SELECT ac.audio_id,${req.query.user_id},ac.div_className,ac.div_title,ac.segment_start,
                                        ac.segment_end, ac.annotation_text FROM actual ac WHERE audio_id='${audioId}'
                                        AND NOT(ac.div_className = "Noise" OR 
                                        ac.div_className = "DTMF" OR 
                                        ac.div_className = "Laughter" OR 
                                        ac.div_className = "Applause" OR 
                                        ac.div_className = "Music" OR 
                                        ac.div_className = "Ringtone") 
                                  `;

                        pool.query(insert_sql, (err, result) => {
                            if (err) {
                                console.error(err);
                                res.status(400).send("error in get /transcription query");
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

const getTranscriptionLandingRouteReactLT=(req,res)=>{
    var audio_url = "";
    var audioId = req.query.audio_id;

    if (!audioId || !req.query.user_id) {
        res.status(400).send("Error in URL. Please redirect again.")
    } else {
        audioId = req.query.audio_id;
        var get_audio_url = `SELECT * FROM audio WHERE audio_id='${req.query.audio_id}'`;
        pool.query(get_audio_url, (err, result) => {
            if (err) {
                console.error(err);                
            }
            if (result && result.length > 0) {
                audio_url = result[0]["audio_url"];
                
                res.status(200).json({
                    user_id: req.query.user_id,
                    type:"transcription",
                    audio_url: audio_url,
                    audio_name: result[0]["audio_name"],
                    audio_id: req.query.audio_id,
                })

                //Checking if user is already in database
                var check_sql = `SELECT * FROM users_audio 
                WHERE
                user_id = '${req.query.user_id}' AND audio_id = '${audioId}' AND type="transcription"`;
                pool.query(check_sql, (err, result) => {
                    if (err) {
                        console.error(err);                        
                    }
                    if (result && result.length == 0) {
                        var sql =`INSERT INTO users_audio(user_id, audio_id, start_time,type) 
                                  VALUES('${req.query.user_id}', '${audioId}', Now(),"transcription")`;
                        pool.query(sql, (err, result) => {
                            if (err) {
                                console.error(err);
                                res.status(400).send("error in get /transcribe query.");
                            }                            
                        });
                    } else if (result && result.length > 0) {
                        var check_in_users_audio_logs = `SELECT * FROM users_audio_logs 
                        WHERE users_audio_id IN
                        (SELECT users_audio_id FROM users_audio 
                            WHERE 
                            user_id='${req.query.user_id}' 
                            AND audio_id='${audioId}' 
                            AND type="transcription"
                        )`;
                        
                        pool.query(check_in_users_audio_logs, (err1, result1) => {
                            if (err1) {
                                console.error(err1);                                
                            }
                            if (result1 && result1.length > 0) {
                                
                                var update_start_time_in_users_logs = `UPDATE users_audio_logs 
                                SET 
                                start_time=NOW() 
                                WHERE 
                                start_time IS NULL 
                                AND 
                                users_audio_id=${result1[0].users_audio_id}`;
                                
                                pool.query(update_start_time_in_users_logs, (err2, result2) => {
                                    if (err2) {
                                        console.error(err2);                                        
                                    }
                                });
                            }
                        });
                    }
                });

                //Checking if user is already in database
                var check_actual_data_in_transcription = `SELECT * FROM transcription WHERE user_id = '${req.query.user_id}'
                        AND audio_id = '${audioId}'`;
                pool.query(check_actual_data_in_transcription, (err, result) => {
                    if (err) {
                        console.error(err);
                       
                    }
                    if (result && result.length == 0) {

                        //Inserting actual data from actual table to transcription table
                        var insert_sql =`INSERT INTO transcription 
                                        (audio_id,user_id,div_className,div_title,segment_start,segment_end,actual_text)  
                                        SELECT ac.audio_id,${req.query.user_id},ac.div_className,ac.div_title,ac.segment_start,
                                        ac.segment_end, ac.annotation_text FROM actual ac WHERE audio_id='${audioId}'
                                        AND NOT(ac.div_className = "Noise" OR 
                                        ac.div_className = "DTMF" OR 
                                        ac.div_className = "Laughter" OR 
                                        ac.div_className = "Applause" OR 
                                        ac.div_className = "Music" OR 
                                        ac.div_className = "Ringtone") 
                                  `;

                        pool.query(insert_sql, (err, result) => {
                            if (err) {
                                console.error(err);
                                res.status(400).send("error in get /transcription query");
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
    getTranscriptionLandingRoute,
    getTranscriptionLandingRouteReactLT
}