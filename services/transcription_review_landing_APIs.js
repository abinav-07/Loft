//Database Connection
const pool = require("../config/pool");
const audio_bee_pool = require("../config/audiobee-db");
const async = require("async");

//Route For Transcription Review
const getTranscriptionReviewLandingRoute=(req,res)=>{
    var audio_url = "";
    var user_name = "";
    var audioId = req.query.audio_id;
    var language_name = "";
    var languageId = "";
    if (!audioId || !req.query.user_id) {
        res.status(400).send("Error in URL. Please redirect again.")
    }else {
        audioId = req.query.audio_id;
        var get_audio_url = `SELECT * FROM audio WHERE audio_id='${req.query.audio_id}'`;
        pool.query(get_audio_url, (err, result) => {
            if (err) {
                console.error(err);                
            }
            if (result && result.length > 0) {
                audio_url = result[0]["audio_url"];
                languageId = result[0]["Language_id"];

                //SQL to get user name
                var get_user_name = `SELECT * FROM users WHERE user_id='${req.query.user_id}'`;
                pool.query(get_user_name, async(err, userName_result) => {
                    if (err) {
                        console.error(err);
                        // res.status(400).send("error in get /get_user_name query.");
                    }

                    if (userName_result && userName_result.length > 0 && typeof userName_result[0]["name"] != "undefined") {
                        user_name = userName_result[0]["name"];
                    } else {
                        user_name = "Not Found"
                    }

                    var get_language_id = `SELECT * FROM languages WHERE Language_id=${languageId}`;

                    await audio_bee_pool.query(get_language_id, (err, data) => {
                        
                        if (err) {
                            console.error(err);
                            //Modified Code
                            // res.status(400).send("error in get /get_language_id query.");
                        }
                        if (data && data.length > 0) {
                            language_name = data[0]["Language_name"];
                            res.render("transcription-review", {
                                user_id: req.query.user_id,
                                audio_url: audio_url,
                                audio_name: result[0]["audio_name"],
                                audio_id: req.query.audio_id,
                                language_name: language_name,
                                user_name: user_name,
                            });
                        } else {
                            res.status(400).send("Language Not Found");
                        }

                    });
                });
            } else {
                res.status(400).send("Audio Not Found.");
            }
        });
    }
}

const getTranscriptionReviewLandingRouteReactLT=(req,res)=>{
    var audio_url = "";
    var user_name = "";
    var audioId = req.query.audio_id;
    var language_name = "";
    var languageId = "";
    if (!audioId || !req.query.user_id) {
        res.status(400).send("Error in URL. Please redirect again.")
    }else {
        audioId = req.query.audio_id;
        var get_audio_url = `SELECT * FROM audio WHERE audio_id='${req.query.audio_id}'`;
        pool.query(get_audio_url, (err, result) => {
            if (err) {
                console.error(err);                
            }
            if (result && result.length > 0) {
                audio_url = result[0]["audio_url"];
                languageId = result[0]["Language_id"];

                //SQL to get user name
                var get_user_name = `SELECT * FROM users WHERE user_id='${req.query.user_id}'`;
                pool.query(get_user_name, async(err, userName_result) => {
                    if (err) {
                        console.error(err);
                        // res.status(400).send("error in get /get_user_name query.");
                    }

                    if (userName_result && userName_result.length > 0 && typeof userName_result[0]["name"] != "undefined") {
                        user_name = userName_result[0]["name"];
                    } else {
                        user_name = "Not Found"
                    }

                    var get_language_id = `SELECT * FROM languages WHERE Language_id=${languageId}`;

                    await audio_bee_pool.query(get_language_id, (err, data) => {
                        
                        if (err) {
                            console.error(err);
                            //Modified Code
                            // res.status(400).send("error in get /get_language_id query.");
                        }
                        if (data && data.length > 0) {
                            language_name = data[0]["Language_name"];
                            res.status(200).json({
                                user_id: req.query.user_id,
                                type:"transcription-review",
                                audio_url: audio_url,
                                audio_name: result[0]["audio_name"],
                                audio_id: req.query.audio_id,
                                language_name: language_name,
                                user_name: user_name,
                            })
                        } else {
                            res.status(400).send("Language Not Found");
                        }

                    });
                });
            } else {
                res.status(400).send("Audio Not Found.");
            }
        });
    }
}

module.exports={
    getTranscriptionReviewLandingRoute,
    getTranscriptionReviewLandingRouteReactLT
}