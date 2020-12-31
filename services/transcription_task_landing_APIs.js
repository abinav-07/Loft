//Database Connection
const pool = require("../config/pool");

//Route for transcription-task
const getTranscriptionTaskLandingRoute = (req, res) => {
    var audio_url = "";
    var audioId = req.query.audio_name;

    if (typeof req.query.audio_name == "undefined") {
        res.status(400).send("Audio Name Not Found");
    } else {
        var get_audio_url = `SELECT * FROM audio WHERE audio_name='${req.query.audio_name}'`;
        pool.query(get_audio_url, (err, result) => {
            if (err) {
                console.error(err);                
            }
            if (result && result.length > 0) {
                audioId = result[0]["audio_id"];
                audio_url = result[0]["audio_url"];
                
                res.render("transcription_tasks", {
                    audio_url: audio_url,                    
                    audio_name: result[0]["audio_name"],
                    audio_id: result[0]["audio_id"],
                });

            } else {
                res.status(400).send("Audio File Not Found");
            }
        });
    }
}


const getTranscriptionTaskLandingRouteReactLT = (req, res) => {
    var audio_url = "";
    var audioId = req.query.audio_name;

    if (typeof req.query.audio_name == "undefined") {
        res.status(400).send("Audio Name Not Found");
    } else {
        var get_audio_url = `SELECT * FROM audio
                            WHERE
                            audio_name='${req.query.audio_name}'`;
        pool.query(get_audio_url, (err, result) => {
            if (err) {
                console.error(err);                
            }
            if (result && result.length > 0) {
                audioId = result[0]["audio_id"];
                audio_url = result[0]["audio_url"];

                res.status(400).json({
                    audio_url:audio_url,
                    type:"transcription-task",
                    audio_name: result[0]["audio_name"],
                    audio_id: result[0]["audio_id"],
                });             
                

            } else {
                res.status(400).send("Audio File Not Found");
            }
        });
    }
}

module.exports={
    getTranscriptionTaskLandingRoute,
    getTranscriptionTaskLandingRouteReactLT
}