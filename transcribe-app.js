//Importing packages
// const waveformData = require('waveform-data');
const hbs = require("hbs");
const express = require("express");
const async = require("async");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const decode = require("audio-decode");
const diffCheck = require("diff");
var AudioContext = require("web-audio-api").AudioContext,
    context = new AudioContext();
var router = express.Router();
const bodyParser = require("body-parser");
const session = require("express-session");
const flash = require("express-flash");
var morgan = require("morgan");
var dotenv = require("dotenv");
dotenv.config();
// var WaveSurfer=require("wavesurfer.js")

const intializePassport = require("./config/passport-config");
intializePassport(passport);

var newData = "";
//console.log(path.join(__dirname, "./js"));
const app = express(); //Express

//Partial Path Link
const partialPaths = path.join(__dirname, "./templates/partials");
//View Path Link
const viewPath = path.join(__dirname, "./templates/views");
//Path to Public Directory
const pubDir = path.join(__dirname, "./public");
//Using Paths
app.use(express.static(pubDir));
app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, "./node_modules")));
app.use(express.static(path.join(__dirname, "./local_modules")));
app.set("view engine", "hbs");

var { accessLogStream, jsonFormat, generator } = require("./config/logging");
// setup the logger
app.use(morgan(jsonFormat, { stream: accessLogStream }));

app.use(
    session({ secret: "WmXgIlMOFQ", resave: true, saveUninitialized: true })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set("views", viewPath);
app.use(flash());

//Setting passport
app.use(passport.initialize());
app.use(passport.session());

// Global variables
app.use(function(req, res, next) {
    res.locals.path = req.path.split("/")[1];
    res.locals.amplitude_api_key = process.env.AMPLITUDE_API_KEY;
    res.locals.webapp_basepath = process.env.WEBAPP_BASEPATH;
    next();
});
hbs.registerPartials(partialPaths);




//Database Connection
const pool = require("./config/pool");
const audio_bee_pool = require("./config/audiobee-db");
pool.getConnection((err, connect) => {
    if (err) {
        console.error(err);
        //res.status(400).send("error in get /admin-review-table-datas query.");
    }
    console.log("Connected");
    connect.release();
});

audio_bee_pool.getConnection((err, connect) => {
    if (err) {
        console.error(err);
        //res.status(400).send("error in get /admin-review-table-datas query.");
    }
    console.log("Connected");
    connect.release();
});
//Database Connection End

app.get("/", (req, res) => {
    /*//console.log(req.query);

            if (typeof req.session.user_id == "undefined") {
                var sql = `INSERT INTO users (name,email,web_app_id) VALUES ('${req.query.full_name}','${req.query.email}','${req.query.user_id}')`;
                pool.query(sql, (err, result) => {
                    if (err) throw err;
                    req.session.user_id = result.insertId;
                    req.session.user = req.query.full_name;
                    //   res.redirect("/review");
                    res.redirect(`/guided-audio?user_id=${req.session.user_id}`);
                });

            } else {
                res.redirect(`/guided-audio?user_id=${req.session.user_id}`);
            }
            //   res.render("index");*/

    ////console.log(req.query);

    // if (typeof req.session.user_id == "undefined") {
    if (typeof req.query.user_id != "undefined") {
        var check_sql;
        if (
            req.query.type == "segmentation" ||
            typeof req.query.type == "undefined"
        ) {
            check_sql = `SELECT * FROM users_audio WHERE user_id IN (
                    SELECT user_id from users WHERE web_app_id='${req.query.user_id}'                
                )          
                    AND audio_id = '${req.query.audio_id}' AND users_audio.type= 'segmentation' `;
        } else if (req.query.type == "transcription") {
            check_sql = `SELECT * FROM users WHERE web_app_id='${req.query.user_id}' `;

        }

        pool.query(check_sql, (err, result) => {
            if (err) {
                console.error(err);
                res.status(400).send(err);
            }
            ////console.log(result);
            if (result.length == 0) {
                var sql = `INSERT INTO users(name, email, web_app_id) VALUES('${req.query.full_name}', '${req.query.email}', '${req.query.user_id}')`;
                pool.query(sql, (err, result) => {
                    if (err) {
                        console.error(err);
                        res.status(400).send("Please Use Webapp to access this URL.");
                    } else {
                        req.session.user_id = result.insertId;
                        req.session.user = req.query.full_name;
                        if (
                            req.query.type == "segmentation" ||
                            typeof req.query.type == "undefined"
                        ) {
                            ////console.log(1);
                            res.redirect(
                                `/transcribe?user_id=${result.insertId}&audio_id=${req.query.audio_id}`
                            );
                        } else if (req.query.type == "transcription") {
                            var getAudioIdSQL = `SELECT * FROM audio WHERE Language_id=${req.query.language_id}`;
                            pool.query(getAudioIdSQL, (err, result1) => {
                                if (err) {
                                    console.error(err);
                                    res.status(400).send("Error in Language Id.");
                                } else {
                                    if (result1.length > 0) {
                                        res.redirect(
                                            `/transcription?user_id=${result.insertId}&audio_id=${result1[0]["audio_id"]}`
                                        );
                                    } else {
                                        res.send(
                                            "No projects exists for this language currently. We will inform you once projects are available"
                                        );
                                    }
                                }
                            });
                        }

                        //   res.redirect("/review");
                    }
                });
            } else {
                //console.log(2);
                if (result[0].status != "RETRY") {
                    if (
                        req.query.type == "segmentation" ||
                        typeof req.query.type == "undefined"
                    ) {
                        res.redirect(
                            `/transcribe?user_id=${result[0].user_id}&audio_id=${req.query.audio_id}`
                        );
                    } else if (req.query.type == "transcription") {
                        var getAudioIdSQL = `SELECT * FROM audio WHERE Language_id=${req.query.language_id}`;
                        pool.query(getAudioIdSQL, (err, result1) => {
                            if (err) {
                                console.error(err);
                                res.status(400).send("Error in Language Id.");
                            } else {
                                if (result1.length > 0) {
                                    res.redirect(
                                        `/transcription?user_id=${result[0].user_id}&audio_id=${result1[0]["audio_id"]}`
                                    );
                                } else {
                                    res.send(
                                        "No projects exists for this language currently. We will inform you once projects are available"
                                    );
                                }
                            }
                        });
                    }
                } else {
                    if (
                        req.query.type == "segmentation" ||
                        typeof req.query.type == "undefined"
                    ) {
                        res.redirect(`/transcribe?user_id=${result[0].user_id}&audio_id=25`);
                    } else if (req.query.type == "transcription") {
                        var getAudioIdSQL = `SELECT * FROM audio WHERE Language_id=${req.query.language_id}`;
                        pool.query(getAudioIdSQL, (err, result1) => {
                            if (err) {
                                console.error(err);
                                res.status(400).send("Error in Language Id.");
                            } else {
                                if (result1.length > 0) {
                                    res.redirect(
                                        `/transcription?user_id=${result[0].user_id}&audio_id=${result1[0]["audio_id"]}`
                                    );
                                } else {
                                    res.send(
                                        "No projects exists for this language currently. We will inform you once projects are available"
                                    );
                                }
                            }
                        });
                    }
                }
            }
        });
    } else {
        res.send("Error in URL. Please use webapp to access this location.");
        // res.redirect(`/guided-audio?user_id=${req.session.user_id}`);
    }

    // }
    // else {
    //     res.redirect(`/guided-audio?user_id=${req.session.user_id}`);
    // }
});
/*app.get("/transcribe", (req, res) => {
    //console.log(req.query);
    res.render("index", {
        user_id: req.query.user_id,
        audio_url: "cryophile.wav"
    });
    var sql = `INSERT INTO users_audio (user_id,audio_id,start_time) VALUES ('${req.query.user_id}','${audioId}',Now())`;
    pool.query(sql, (err, result) => {
        if (err) throw err;
    });
});*/

//Route for actual test
app.get("/transcribe", (req, res) => {
    var audioId = req.query.audio_id;
    var audio_url = "";

    if (!audioId || !req.query.user_id) {
        res.send("Error in URL. Please redirect again.")
    } else {
        if (audioId) {
            var get_audio_url = `SELECT * FROM audio WHERE audio_id='${req.query.audio_id}'`;
            pool.query(get_audio_url, (err, result) => {
                if (err) {
                    console.error(err);
                    //res.status(400).send("error in get /transcribe query.");
                }

                if (result && result.length > 0) {
                    audio_url = result[0]["audio_url"];
                    ////console.log(audio_url);
                    res.render("index", {
                        user_id: req.query.user_id,
                        audio_url: audio_url,
                        audio_name: result[0]["audio_name"],
                        audio_id: audioId,
                    });


                    var check_sql = `SELECT * FROM users_audio WHERE user_id = '${req.query.user_id}'
                                    AND audio_id = '${audioId}'`;
                    pool.query(check_sql, (err, result) => {
                        if (err) {
                            console.error(err);
                            //res.status(400).send("error in get /transcribe query.");
                        }
                        if (result && result.length == 0) {
                            var sql = `INSERT INTO users_audio(user_id, audio_id, start_time) VALUES('${req.query.user_id}', '${audioId}', Now())`;
                            pool.query(sql, (err, result) => {
                                if (err) {
                                    console.error(err);
                                    res.status(400).send("error in get /transcribe query.");
                                }
                            });
                        }
                    });
                } else {
                    res.send("Audio Not Found. Please redirect again.")
                }


                ////console.log(result);
            });

        }

    }


});
//Route for actual test end

//Route for training
app.get("/training", (req, res) => {
    var audio_url = "";
    var audio_order;
    var audioId = req.query.audio_id;
    var user_name = "";
    if (!audioId || !req.query.user_id) {
        res.send("Error in URL. Please redirect again.")
    } else {
        audioId = req.query.audio_id;
        var get_audio_url = `SELECT * FROM audio WHERE audio_id='${req.query.audio_id}'`;
        pool.query(get_audio_url, (err, result) => {
            if (err) {
                console.error(err);
                //res.status(400).send("error in get /transcribe query.");
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
                        //res.status(400).send("error in get /get_user_name query.");
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
                        //res.status(400).send("error in get /transcribe query.");
                    }
                    if (result && result.length == 0) {
                        var sql = `INSERT INTO users_audio(user_id, audio_id, start_time) VALUES('${req.query.user_id}', '${audioId}', Now())`;
                        pool.query(sql, (err, result) => {
                            if (err) {
                                console.error(err);
                                res.status(400).send("error in get /transcribe query.");
                            }
                        });
                    }
                });

            } else {
                res.send("Audio Not Found. Please redirect again.")
            }

            ////console.log(audio_url);
        });
    }

    ////console.log(req.query);
    // res.render("index", {
    //     user_id: req.query.user_id,
    //     audio_url: audio_url
    // });


});
//Route for training end

//Route for transcription
app.get("/transcription", async(req, res) => {
    var audio_url = "";
    var audioId = req.query.audio_id;
    if (!audioId || !req.query.user_id) {
        res.send("Error in URL. Please redirect again.")
    } else {
        audioId = req.query.audio_id;
        var get_audio_url = `SELECT * FROM audio WHERE audio_id='${req.query.audio_id}'`;
        pool.query(get_audio_url, (err, result) => {
            if (err) {
                console.error(err);
                //res.status(400).send("error in get /transcription query.");
            }
            if (result && result.length > 0) {
                audio_url = result[0]["audio_url"];
                ////console.log(audio_url);
                res.render("transcription", {
                    user_id: req.query.user_id,
                    audio_url: audio_url,
                    audio_name: result[0]["audio_name"],
                    audio_id: req.query.audio_id,
                });

                //Checking if user is already in database

                var check_sql = `SELECT * FROM users_audio WHERE user_id = '${req.query.user_id}'
        AND audio_id = '${audioId}' AND type="transcription"`;
                pool.query(check_sql, (err, result) => {
                    if (err) {
                        console.error(err);
                        //res.status(400).send("error in get /transcription query.");
                    }
                    if (result && result.length == 0) {
                        var sql = `INSERT INTO users_audio(user_id, audio_id, start_time,type) VALUES('${req.query.user_id}', '${audioId}', Now(),"transcription")`;
                        pool.query(sql, (err, result) => {
                            if (err) {
                                console.error(err);
                                res.status(400).send("error in get /transcribe query.");
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
                        //res.status(400).send("error in get /transcription-check-actual query");
                    }
                    if (result && result.length == 0) {
                        //Inserting actual data from actual table to transcription table
                        var insert_sql = `INSERT INTO transcription (audio_id,user_id,div_className,div_title,segment_start,segment_end,actual_text)  
                                  SELECT ac.audio_id,${req.query.user_id},ac.div_className,ac.div_title,ac.segment_start,ac.segment_end,ac.annotation_text FROM actual ac WHERE audio_id='${audioId}'
                                  AND NOT(ac.div_className = "Noise" OR ac.div_className = "DTMF" OR ac.div_className = "Laughter" OR ac.div_className = "Applause" OR ac.div_className = "Music" OR ac.div_className = "Ringtone") 
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
                res.send("Audio Not Found. Please redirect again.")
            }

            ////console.log(result);
        });
    }

    ////console.log(req.query);
    // res.render("index", {
    //     user_id: req.query.user_id,
    //     audio_url: audio_url
    // });


});
//Route for transcription end

//Route for transcription
app.get("/transcription-task", async(req, res) => {
    var audio_url = "";
    var audioId = req.query.audio_name;

    // if (typeof req.query.user_id != "undefined") {
    if (typeof req.query.audio_name == "undefined") {
        res.send("Audio Name Not Found");
    } else {

        var get_audio_url = `SELECT * FROM audio WHERE audio_name='${req.query.audio_name}'`;
        await pool.query(get_audio_url, (err, result) => {
            if (err) {
                console.error(err);
                //res.status(400).send("error in get /transcription query.");
            }
            if (result && result.length > 0) {
                audioId = result[0]["audio_id"];
                audio_url = result[0]["audio_url"];
                ////console.log(audio_url);
                res.render("transcription_tasks", {
                    audio_url: audio_url,
                    //user_id: req.query.user_id,
                    audio_name: result[0]["audio_name"],
                    audio_id: result[0]["audio_id"],
                });

            } else {
                res.send("Audio File Not Found");
            }
        });
    }

    /* } else {
         res.send("Error in URL. Please use webapp to access this location.");
     }*/
});
//Route for transcription end

//Route for transcription review check here
app.get("/transcription-review", async(req, res) => {
    var audio_url = "";
    var user_name = "";
    var audioId = req.query.audio_id;
    var language_name = "";
    var languageId = "";
    if (!audioId || !req.query.user_id) {
        res.send("Error in URL. Please redirect again.")
    } else {
        audioId = req.query.audio_id;
        var get_audio_url = `SELECT * FROM audio WHERE audio_id='${req.query.audio_id}'`;
        await pool.query(get_audio_url, (err, result) => {
            if (err) {
                console.error(err);
                //res.status(400).send("error in get /transcription query.");
            }
            if (result && result.length > 0) {
                audio_url = result[0]["audio_url"];
                languageId = result[0]["Language_id"];

                //SQL to get user name
                var get_user_name = `SELECT * FROM users WHERE user_id='${req.query.user_id}'`;
                pool.query(get_user_name, async(err, userName_result) => {
                    if (err) {
                        console.error(err);
                        res.status(400).send("error in get /get_user_name query.");
                    }

                    if (userName_result.length > 0 && typeof userName_result[0]["name"] != "undefined") {
                        user_name = userName_result[0]["name"];
                    }

                    var get_language_id = `SELECT * FROM languages WHERE Language_id=${languageId}`;

                    await audio_bee_pool.query(get_language_id, (err, data) => {
                        ////console.log(data);
                        if (err) {
                            console.error(err);
                            res.status(400).send("error in get /get_language_id query.");
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
                            res.send("Language Not Found");
                        }

                    });
                });
            } else {
                res.send("Audio Not Found.");
            }

            ////console.log(audio_url);

            ////console.log(result);
        });
    }
});

app.post("/route-for-diff-check", (req, res) => {
    var get_text_sql = `SELECT segment_id,div_className,segment_start,segment_end,annotation_text,actual_text FROM transcription 
                      WHERE user_id=${req.body.user_id} AND audio_id=${req.body.audio_id}`;
    ////console.log(get_text_sql);
    pool.query(get_text_sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(400).send("error in get /route-for-diff-check query");
        }
        ////console.log("BElow");
        async.series(
            [
                function(cb) {
                    for (var i = 0; i < result.length; i++) {
                        if (
                            result[i]["annotation_text"] != null &&
                            result[i]["actual_text"] != null
                        ) {
                            var diff = diffCheck.diffWordsWithSpace(
                                result[i]["annotation_text"],
                                result[i]["actual_text"]
                            );
                            // //console.log(diff);
                            result[i]["difference"] = diff;
                        }
                        var temp = i;
                        if (++temp >= result.length) {
                            cb(null);
                        }
                    }
                },
            ],
            (err, result2) => {
                res.send(result);
            }
        );

        // res.send({ result });
    });
});

//Route for guided audio
app.get("/guided-audio", (req, res) => {
    var audio_url = "";
    var audioId = req.query.audio_id;
    if (!audioId) {
        audioId = 4;
    } else {
        audioId = 4;
    }
    res.render("guidedAudio", {
        user_id: req.query.user_id,
        audio_url: "https://audiobee-production-user-files.s3.eu-north-1.amazonaws.com/transcription/cryophile.wav",
        audio_id: 4,
    });
});

//Router for admin to insert actual data
app.get("/actual-data-admin", (req, res) => {
    var audioId = req.query.audio_id;
    var audio_url = "";
    if (!audioId) {
        res.send("Error in URL. Please redirect again.");
    } else {
        var get_audio_url = `SELECT * FROM audio WHERE audio_id='${req.query.audio_id}'`;
        pool.query(get_audio_url, (err, result) => {
            if (err) {
                console.error(err);
                //res.status(400).send("error in get /transcribe query.");
            }
            if (result && result.length > 0) {
                audio_url = result[0]["audio_url"];
                ////console.log(audio_url);
                res.render("actual_data_insert", {
                    audio_url: audio_url,
                    audio_name: result[0]["audio_name"],
                    audio_id: audioId,
                });
            } else {
                res.send("Audio Not Found.");
            }

            ////console.log(result);
        });
    }
});

//Insert Segments Into POST Table Database
app.post("/database", (req, res) => {
    let sql = `
            INSERT INTO posts(div_className, div_title, segment_start, segment_end, annotation_text, user_id, audio_id) VALUES('${req.body.speakerName}', '${req.body.annotationType}', '${req.body.segmentStart}', '${req.body.segmentEnd}', '${req.body.annotationText.replace(/'/g, "\\'")}', '${req.body.user_id}', '${req.body.audio_id}')
            `;
    // //console.log(sql);
    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(400).send("error in get /database query.");
        }
        ////console.log("Data Inserted");
        res.send(result);
    });
});
//Insert Into Post Table Database End

//Insert Segments Into actual Table Database
app.post("/insert-into-actual-data", (req, res) => {
    let sql = `
            INSERT INTO actual(div_className, div_title, segment_start, segment_end, annotation_text, audio_id) VALUES('${req.body.speakerName}', '${req.body.annotationType}', '${req.body.segmentStart}', '${req.body.segmentEnd}', '${req.body.annotationText.replace(/'/g, "\\'")}', '${req.body.audio_id}')
            `;
    // //console.log(sql);
    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(400).send("error in get /insert-into-actual-data query.");
        }
        // //console.log("Data Inserted Into Actual Table");
        res.send(result);
    });
});
//Insert Into actual Table Database End

//Insert Segments Into transcription_task_segments Table Database
app.post("/insert-into-transcription-tasks-segments", (req, res) => {
    let sql = `
            INSERT INTO transcription_task_segments(div_className, div_title, segment_start, segment_end, annotation_text, audio_id) VALUES('${req.body.speakerName}', '${req.body.annotationType}', '${req.body.segmentStart}', '${req.body.segmentEnd}', '${req.body.annotationText.replace(/'/g, "\\'")}', '${req.body.audio_id}')
            `;
    // //console.log(sql);
    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(400).send("error in get /insert-into- transcription_task_segments query.");
        }
        // //console.log("Data Inserted Into Actual Table");
        res.send(result);
    });
});
//Insert Into actual Table Database End

//Insert Segments Into POST Table Database
app.post("/insert-into-transcription-table", (req, res) => {
    let sql = `
            INSERT INTO transcription(div_className, div_title, segment_start, segment_end, annotation_text, user_id, audio_id) VALUES('${req.body.speakerName}', '${req.body.annotationType}', '${req.body.segmentStart}', '${req.body.segmentEnd}', '${req.body.annotationText.replace(/'/g, "\\'")}', '${req.body.user_id}', '${req.body.audio_id}')
            `;
    ////console.log(sql);
    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res
                .status(400)
                .send("error in get /insert-into-transcription-table query.");
        }
        ////console.log("Data Inserted");
        res.send(result);
    });
});
//Insert Into Post Table Database End

//Update Segments in Posts Table of Database
app.post("/updatedatabase", (req, res) => {
    let sql = `
            Update posts
            SET div_className = '${req.body.speakerName}', div_title = '${req.body.annotationType}', segment_start = '${req.body.segmentStart}', segment_end = '${req.body.segmentEnd}', 
            annotation_text = "${req.body.annotationText != "undefined"
                ? req.body.annotationText.replace(/'/g, "\\'")
                : ""}"
            WHERE segment_id = '${req.body.segmentId}'
            AND user_id = '${req.body.user_id}'
            AND audio_id = '${req.body.audio_id}'
            `;
    ////console.log(sql);
    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(400).send("error in get /updatedatabase query.");
        }
        // //console.log("Updated");
    });
});

//update Segments in posts end

//Update Segments in Actual Table of Database
app.post("/update-actual-database", (req, res) => {
    let sql = `
            Update actual
            SET div_className = '${req.body.speakerName}', div_title = '${req.body.annotationType}',
             segment_start = '${req.body.segmentStart}', segment_end = '${req.body.segmentEnd}', 
            annotation_text = '${req.body.annotationText != "undefined"
                ? req.body.annotationText.replace(/'/g, "\\'")
                : ""}'
            WHERE segment_id = '${req.body.segmentId}'            
            AND audio_id = '${req.body.audio_id}'
            `;
    // //console.log(sql);
    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(400).send("error in get /updatedatabase query.");
        }
        //  //console.log("Updated");
    });
});

//update Segments in Actual Table end

//Update Segments in transcription-task Table of Database
app.post("/update-transcription-task-segment-table", (req, res) => {
    let sql = `
            Update transcription_task_segments
            SET div_className = '${req.body.speakerName}', div_title = '${req.body.annotationType}',
             segment_start = '${req.body.segmentStart}', segment_end = '${req.body.segmentEnd}', 
            annotation_text = '${req.body.annotationText != "undefined"
                ? req.body.annotationText.replace(/'/g, "\\'")
                : ""}'
            WHERE segment_id = '${req.body.segmentId}'            
            AND audio_id = '${req.body.audio_id}'
            `;
    // //console.log(sql);
    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(400).send("error in get /update-transcription-task-segment-table query.");
        }
        //  //console.log("Updated");
    });
});

//update Segments in Actual Table end

//update-transcription-table server start
app.post("/update-transcription-table", (req, res) => {
    let sql = `
            Update transcription
            SET  annotation_text = '${req.body.annotationText.replace(/'/g, "\\'")}',div_className = '${req.body.speakerName}',div_title = '${req.body.annotationType}'
            WHERE segment_id = '${req.body.segmentId}'
            AND user_id = '${req.body.user_id}'
            AND audio_id = '${req.body.audio_id}'
            `;
    ////console.log(sql);
    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(400).send("error in get /updatedatabase query.");
        }
        ////console.log("Updated");
    });
});

//Update Segments in Posts Table of Database On Split
app.post("/update-on-split", (req, res) => {
    let sql = `
            Update posts
            SET div_className = '${req.body.speakerName}', div_title = '${req.body.annotationType}', segment_start = '${req.body.segmentStart}', segment_end = '${req.body.segmentEnd}', annotation_text = '${req.body.annotationText.replace(/'/g, "\\'")}'
            WHERE segment_id = '${req.body.segmentId}'
            AND user_id = '${req.body.user_id}'
            AND audio_id = '${req.body.audio_id}'
            `;
    ////console.log(sql);
    // //console.log(sql);
    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(400).send("error in get /update-on-split query.");
        }
        // //console.log("Updated");
    });
});

//Update Segments in Actual Table of Database On Split
app.post("/update-actual-data-on-split", (req, res) => {
    let sql = `
            Update actual
            SET div_className = '${req.body.speakerName}', div_title = '${req.body.annotationType}', segment_start = '${req.body.segmentStart}', segment_end = '${req.body.segmentEnd}', annotation_text = '${req.body.annotationText.replace(/'/g, "\\'")}'
            WHERE segment_id = '${req.body.segmentId}'            
            AND audio_id = '${req.body.audio_id}'
            `;
    ////console.log(sql);
    ////console.log(sql);
    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(400).send("error in get /update-on-split query.");
        }
        ////console.log("Updated");
    });
});

//Update Segments in transcription-task Table of Database On Split
app.post("/update-transcription-task-segments-on-split", (req, res) => {
    let sql = `
            Update transcription_task_segments
            SET div_className = '${req.body.speakerName}', div_title = '${req.body.annotationType}', segment_start = '${req.body.segmentStart}', segment_end = '${req.body.segmentEnd}', annotation_text = '${req.body.annotationText.replace(/'/g, "\\'")}'
            WHERE segment_id = '${req.body.segmentId}'            
            AND audio_id = '${req.body.audio_id}'
            `;
    ////console.log(sql);
    ////console.log(sql);
    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(400).send("error in get /update-transcription-task-segments-on-split query.");
        }
        ////console.log("Updated");
    });
});

//Route to check if the user has  already submitted or not
app.post("/get-submitted-or-not", (req, res) => {
    var audioId = req.query.audio_id;
    ////console.log("HEre");
    ////console.log(req.query);
    let sql = `
            Select users_audio.is_submitted FROM users_audio
            WHERE
            user_id = '${req.body.user_id}'
            AND audio_id = '${req.body.audio_id}'
            AND type="segmentation"
            `;
    ////console.log(sql);
    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(400).send("error in get /get-submitted-or-not query.");
        }
        // //console.log("Checking Submitted Or not");

        res.send(result);
        ////console.log(result);
    });
});

//Route to check if the user for transcription has  already submitted or not
app.post("/get-submitted-or-not-for-transcription", (req, res) => {
    var audioId = req.query.audio_id;
    ////console.log("HEre");
    ////console.log(req.query);
    let sql = `
            Select users_audio.is_submitted FROM users_audio
            WHERE
            user_id = '${req.body.user_id}'
            AND audio_id = '${req.body.audio_id}'
            AND type="transcription"
            `;
    ////console.log(sql);
    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(400).send("error in get /get-submitted-or-not query.");
        }
        ////console.log("Checking Submitted Or not");

        res.send(result);
        ////console.log(result);
    });
});

//Get Segments From Posts Table in Database
app.post("/get-segments", (req, res) => {
    /*let sql = `
                    Select posts.*, users_audio.is_submitted FROM posts
                    JOIN users_audio
                    ON users_audio.user_id = posts.user_id
                    WHERE
                    posts.user_id = $ { req.body.user_id }
                    AND posts.audio_id = $ { audioId }
                    `;*/
    let sql = `
            Select * FROM posts
            WHERE
            posts.user_id = '${req.body.user_id}'
            AND posts.audio_id = '${req.body.audio_id}'
            ORDER BY segment_start
                `;
    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(400).send("error in get /get-segments query.");
        }
        res.send(result);
        ////console.log(result);
    });
});
//get segments route end

//Get Segments From Actual Table in Database
app.post("/get-segments-from-actual-data-for-admin", (req, res) => {
    /*let sql = `
                    Select posts.*, users_audio.is_submitted FROM posts
                    JOIN users_audio
                    ON users_audio.user_id = posts.user_id
                    WHERE
                    posts.user_id = $ { req.body.user_id }
                    AND posts.audio_id = $ { audioId }
                    `;*/
    let sql = `
            Select * FROM actual
            WHERE            
            actual.audio_id = '${req.body.audio_id}'
            ORDER BY segment_start
                `;
    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res
                .status(400)
                .send("error in get /get-segments-from-actual-data-for-admin query.");
        }
        res.send(result);
        ////console.log(result);
    });
});
//get segments from actual table route end

//Get Segments From Actual Table in Database
app.post("/transcription-actual-segments", (req, res) => {
    /*let sql = `
                    Select posts.*, users_audio.is_submitted FROM posts
                    JOIN users_audio
                    ON users_audio.user_id = posts.user_id
                    WHERE
                    posts.user_id = $ { req.body.user_id }
                    AND posts.audio_id = $ { audioId }
                    `;*/

    let sql = `
            Select * FROM transcription
            WHERE
            transcription.user_id = '${req.body.user_id}'
            AND
            transcription.audio_id = '${req.body.audio_id}'
            ORDER BY segment_start
                `;
    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(400).send("error in get /get-segments query.");
        }
        res.send(result);
        ////console.log(result);
    });
});
//get segments route end

app.post("/transcription-tasks-user-created-segments", (req, res) => {
    let sql = `
            Select * FROM transcription_task_segments
            WHERE           
            transcription_task_segments.audio_id = '${req.body.audio_id}'
            ORDER BY segment_start
            `;
    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(400).send("error in get /get-segments query.");
        }
        res.send(result);

    });
});

//Get actual Values From actual table in Database
app.post("/get-reviews", (req, res) => {
    let sql = `
            Select * FROM actual WHERE
            audio_id = '${req.body.audio_id}'
            `;
    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(400).send("error in get /ger-reviews query.");
        }
        ////console.log("result");
        ////console.log(result);
        res.send(result);
    });
});
//get reviews route end

//remove segments from posts table in database
app.post("/remove-segments", (req, res) => {
    let sql = `
            DELETE FROM posts WHERE
            segment_id = '${req.body.regionId}'
            AND user_id = '${req.body.user_id}'
            AND audio_id = '${req.body.audio_id}'
            `;
    ////console.log(sql);
    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(400).send("error in get /remove-segments query.");
        }
        res.send(result);
    });
});
//remove segments route end

//remove segments from posts table in database
app.post("/remove-segments-from-actual", (req, res) => {
    let sql = `
            DELETE FROM actual WHERE
            segment_id = '${req.body.regionId}'            
            AND audio_id = '${req.body.audio_id}'
            `;
    ////console.log(sql);
    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(400).send("error in get /remove-segments-from-actual query.");
        }
        res.send(result);
    });
});
//remove segments route end

//remove segments from posts table in database
app.post("/remove-segments-from-transcription-task-segment", (req, res) => {
    let sql = `
            DELETE FROM transcription_task_segments WHERE
            segment_id = '${req.body.regionId}'            
            AND audio_id = '${req.body.audio_id}'
            `;
    ////console.log(sql);
    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(400).send("error in get /remove-segments-from-actual query.");
        }
        res.send(result);
    });
});
//remove segments route end

//for same speaker route. Not Used Yet!
app.post("/get-segments-with-same-speaker", (req, res) => {
    let sql = `
            Select * from posts
            WHERE user_id = $ { req.body.user_id }
            AND div_className = "${req.body.speakerName}"
            `;
    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res
                .status(400)
                .send("error in get /get-segments-with-same-speaker query.");
        }
        res.send(result);
    });
});
//get-segments-with-same-speaker route end

//Save Test Score on Submit Click
app.post("/save-test-score-on-users_audio_table", (req, res) => {
    let sql = `
            Update users_audio
            Set speaker_labelling_error = "${req.body.wrongSpeakerScore}",
                annotation_labelling_error = "${req.body.wrongAnnotationScore}",
                unnecessary_segments_error = "${req.body.unnecessarySegmentsErrors}",
                overall_score = "${req.body.overallScore}",
                status=NULL,
                end_time = Now(),
                is_submitted = "${req.body.is_submitted}"
            WHERE user_id = "${req.body.user_id}"
            AND audio_id = ${req.body.audio_id}
            `;

    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res
                .status(400)
                .send("error in get /get-segments-with-same-speaker query.");
        }
        ////console.log(result);
        res.send(result);
    });
});
//save testscore end

//Save Test Score on Submit Click for transcription
app.post(
    "/save-test-score-on-users_audio_table-for-transcription",
    (req, res) => {
        //Setting status null
        let sql = `
            Update users_audio
            Set transcription_score="${req.body.total_score}",
                status=NULL,
                end_time = Now(),
                is_submitted = "${req.body.is_submitted}"
            WHERE user_id = "${req.body.user_id}"
            AND audio_id = "${req.body.audio_id}"
            AND type="transcription"
            `;

        pool.query(sql, (err, result) => {
            if (err) {
                console.error(err);
                res
                    .status(400)
                    .send("error in get /get-segments-with-same-speaker query.");
            }
            ////console.log(result);
            res.send(result);
        });
    }
);
//save testscore end for transcription

//API For Top Speaker Control Save Button
app.post("/top-speaker-control-save-button", (req, res) => {
    let sql = `
            Update posts
            Set div_className = "${req.body.userInputTopSpeakerName}"
            WHERE user_id = "${req.body.user_id}"
            AND audio_id = "${req.body.audio_id}"
            AND div_className = "${req.body.previousTopSpeakerName}"
            `;
    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res
                .status(400)
                .send("error in get /get-segments-with-same-speaker query.");
        }
        res.send(result);
        ////console.log(result);
    });
});

//API For Top Speaker Control Save Button For Actual
app.post("/top-speaker-control-save-button-for-actual", (req, res) => {
    let sql = `
            Update actual
            Set div_className = "${req.body.userInputTopSpeakerName}"
            WHERE audio_id = "${req.body.audio_id}"
            AND div_className = "${req.body.previousTopSpeakerName}"
            `;
    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res
                .status(400)
                .send("error in get /get-segments-with-same-speaker query.");
        }
        res.send(result);
        ////console.log(result);
    });
});

//API For Top Speaker Control Save Button For transcription-task-segments
app.post("/top-speaker-control-save-button-for-transcription-task-segments", (req, res) => {
    let sql = `
            Update transcription_task_segments
            Set div_className = "${req.body.userInputTopSpeakerName}"
            WHERE audio_id = "${req.body.audio_id}"
            AND div_className = "${req.body.previousTopSpeakerName}"
            `;
    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res
                .status(400)
                .send("error in get /get-segments-with-same-speaker query.");
        }
        res.send(result);
        ////console.log(result);
    });
});

//Routes Below Are For HR Team
// app.get("/hr-register-form", (req, res) => {
//     res.render("hr-register");
// });

const user = [];

//Register hr reviewers
app.post("/register-hr", async(req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        let checkSql = `SELECT * FROM reviewers 
                    WHERE reviewer_email='${req.body.email}'`;
        pool.query(checkSql, (err, result) => {
            if (result.length > 0) {
                ////console.log("Already Registered");
                res.redirect("/hr-login-form");
            } else {
                let sql = `
                        INSERT INTO reviewers(reviewer_email,reviewer_password)
                        VALUES ("${req.body.email}","${hashedPassword}")        
                        `;
                ////console.log(sql);
                pool.query(sql, (err, result2) => {
                    if (err) {
                        console.error(err);
                        res.status(400).send("error in post /register-hr.");
                    }

                    res.redirect("/hr-login-form");
                });
            }
        });

        // user.push({
        //     id: Date.now().toString(),
        //     email: req.body.email,
        //     password: hashedPassword
        // })

        //window.location.href = `${new URL(window.location).origin}/hr-review-table`;
    } catch (err) {
        res.redirect("/hr-login-form");
    }
});

app.get("/hr-login-form", (req, res) => {
    // //console.log(req.flash('message'));
    res.render("hrLogin");
});
//New Passport Post Methods
app.post(
    "/hr-login",
    passport.authenticate("local", {
        failureRedirect: "/hr-login-form",
    }),
    (req, res) => {
        if (req.body.loginFor == "training") {
            res.redirect("/training-hr-review-table");
            //console.log("here");
        } else if (req.body.loginFor == "sample-test") {
            res.redirect("/hr-review-table");
        } else if (req.body.loginFor == "transcription") {
            res.redirect("/transcription-hr-review-table");
        } else if (req.body.loginFor == "signature-list") {
            res.redirect("/signature/backend/list");
        }
    }
);

app.get("/hr-logout", function(req, res) {
    req.logout();
    res.redirect("/hr-login-form");
});

app.get("/hr-review-table", checkNotAuthenticated, (req, res) => {
    res.render("hr_reviewing_table", {
        // reviewerId: req.session["passport"]["user"]
        reviewerId: req.user.id,
        reviewerEmail: req.user.reviewer_email,
    });
});

app.get("/training-hr-review-table", checkNotAuthenticated, (req, res) => {
    res.render("training_hr_table", {
        reviewerId: req.user.id,
        reviewerEmail: req.user.reviewer_email,
    });
});

app.get("/transcription-hr-review-table", checkNotAuthenticated, (req, res) => {
    res.render("transcription_hr_table", {
        reviewerId: req.user.id,
        reviewerEmail: req.user.reviewer_email,
    });
});

//get data from users table to hr-review table
app.post("/hr-review-table-datas", (req, res) => {
    let sql = `
            Select audio.audio_id, audio.audio_name, users_audio.users_audio_id, users_audio.user_id, users_audio.audio_id, CONVERT_TZ(users_audio.start_time, '+00:00', '+05:45') start_time,
            CONVERT_TZ(users_audio.end_time, '+00:00', '+05:45') end_time, users_audio.overall_score, users.name,users.email, users_audio.status
            from users_audio
            JOIN users
            ON users_audio.user_id = users.user_id
            JOIN audio
            ON users_audio.audio_id = audio.audio_id
            WHERE (users_audio.status IS NULL OR users_audio.status = 'RETRY')
            AND audio.is_training = "FALSE" 
            AND audio.type="segmentation"
            ORDER BY users_audio.start_time DESC`;

    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(400).send("error in get /hr-review-table-datas query.");
        }
        ////console.log(result[0]);
        res.send(result);
    });
});
//get data from users-table to training hr review table
app.post("/training-hr-review-table-datas", (req, res) => {
    let sql = `
    Select audio.audio_id, audio.audio_name, users_audio.users_audio_id, users_audio.user_id, users_audio.audio_id, CONVERT_TZ(users_audio.start_time, '+00:00', '+05:45') start_time,
    CONVERT_TZ(users_audio.end_time, '+00:00', '+05:45') end_time, users_audio.overall_score, users.name,users.email, users_audio.status,audio.audio_order
    from users_audio, users , audio WHERE
    users_audio.user_id = users.user_id
    AND users_audio.audio_id = audio.audio_id
    AND (users_audio.status IS NULL OR users_audio.status = 'RETRY')
    AND audio.is_training = "TRUE"
    AND audio.audio_order IS NOT NULL
    ORDER BY users.user_id asc,audio.audio_order DESC`;

    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res
                .status(400)
                .send("error in get /training-hr-review-table-datas query.");
        }
        ////console.log(result[0]);
        res.send(result);
    });
});

//get data from users-table to transcription hr review table
app.post("/transcription-hr-review-table-datas", (req, res) => {
    let sql = `
    Select audio.audio_id,
    audio.Language_id,
    audio.audio_name, 
    users_audio.users_audio_id,
    users_audio.user_id,
    users_audio.audio_id,
    CONVERT_TZ(users_audio.start_time, '+00:00', '+05:45') start_time,
    CONVERT_TZ(users_audio.end_time, '+00:00', '+05:45') end_time, users_audio.transcription_score, users.name,users.email, users_audio.status
    from users_audio, users , audio WHERE
    users_audio.user_id = users.user_id
    AND users_audio.audio_id = audio.audio_id
    AND (users_audio.status IS NULL OR users_audio.status = 'RETRY')
    AND users_audio.type="transcription"    
    ORDER BY users_audio.start_time DESC`;

    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res
                .status(400)
                .send("error in get /training-hr-review-table-datas query.");
        }
        ////console.log(result[0]);
        res.send(result);
        // //console.log(sql);
    });
});

app.post("/reset-transcription-data-for-retry", (req, res) => {
    var reset_sql = `Update transcription 
                    SET annotation_text=""
                    WHERE user_id IN (
                        SELECT users_audio.user_id FROM users_audio
                        WHERE users_audio_id = "${req.body.user_id}"
                    ) AND audio_id IN (
                        SELECT users_audio.audio_id FROM users_audio
                        WHERE users_audio_id = "${req.body.user_id}"
                    )
    `;

    pool.query(reset_sql, (err, result) => {
        if (err) {
            console.error(err);
            //res.status(400).send("error in get /reset-transcription-data-for-retry.");
        }
        var setStatusNull = `Update users_audio SET status="RETRY", end_time=NULL WHERE users_audio_id=${req.body.user_id} AND type="transcription"`;
        //console.log(setStatusNull);
        pool.query(setStatusNull, (resetErr, resetResult) => {
            if (resetErr) {
                console.error(resetErr);
                res.status(400).send("error in get /reset-transcription-data-for-retry.");
            }
            //console.log(resetResult)
        })
        res.send(result);
    });
    ////console.log(reset_sql);
});

//Change Pass Fail Data in Database
app.post("/confirm-pass-fail-hr-review", (req, res) => {
    let sql = `
            UPDATE users_audio
            SET status = "${req.body.changedPassFailValue}",
            is_submitted= "TRUE"
            WHERE users_audio_id = "${req.body.userId}"
            `;

    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(400).send("error in get /confirm-pass-fail-hr-review query.");
        }

        let update_sql_on_retry = `
        UPDATE users_audio
        SET is_submitted= "FALSE"
        WHERE status = "RETRY"
        `;
        pool.query(update_sql_on_retry, (err, retryResult) => {
            if (err) {
                console.error(err);
                res.status(400).send("error in get /retry-hr-review query.");
            }
        });

        res.send(result);
    });
});

app.post("/set-endtime-null-on-retry", (req, res) => {
    var setStatusNull = `Update users_audio SET status="RETRY", end_time=NULL WHERE users_audio_id=${req.body.user_id}`;
    pool.query(setStatusNull, (resetErr, resetResult) => {
        if (resetErr) {
            console.error(resetErr);
            res.status(400).send("error in get /reset-transcription-data-for-retry.");
        }
        //console.log(resetResult)
    })
})


app.post("/hr-click-get-user-id", (req, res) => {
    let sql = `
                        Select users_audio.user_id, users_audio.audio_id, users_audio.is_submitted FROM users_audio
                        WHERE users_audio_id = "${req.body.clicked_user_id}"
                        `;
    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(400).send("error in get /hr-click-get-users-id query.");
        }
        res.send(result);
    });
});

app.post("/get-web-app-id-for-hr", (req, res) => {
    let sql = `
                        SELECT users.web_app_id FROM users
                        WHERE user_id IN(
                            SELECT user_id from users_audio WHERE users_audio_id = "${req.body.userId}"
                        )
                        `;
    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(400).send("error in get /get-web-app-id-for-hr.");
        }
        res.send(result);
    });
});

//Hr Team server end

//get web app id of the user
app.post("/get-web-app-id", (req, res) => {
    var sql = `SELECT * FROM users 
    WHERE user_id=${req.body.user_id}`;
    //console.log(sql);
    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(400).send("error in post /get-web-app-id");
        }
        //console.log(result);
        res.send(result);
    });
});

//get Language id of an audio
app.post("/get-language-id", (req, res) => {
    var sql = `SELECT Language_id FROM audio
           WHERE audio_id=${req.body.audio_id}`;
    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(400).send("error in post /get-language-id");
        }
        res.send(result);
    });
});

//admin server side start
app.get("/admin-login-form", (req, res) => {
    res.render("adminLogin");
});

app.get("/admin-review-table", (req, res) => {
    res.render("admin_reviewing_table");
});

app.get("/transcription-admin-review-table", (req, res) => {
    res.render("transcription-admin-table");
});

app.get("/training-admin-review-table", (req, res) => {
    res.render("training_admin_table");
});

//get data from users table to admin-review table
app.post("/admin-review-table-datas", (req, res) => {
    let sql = `Select
                audio.audio_id,
                audio.audio_name,
                users_audio.users_audio_id,
                users_audio.user_id,
                users_audio.audio_id, CONVERT_TZ(users_audio.start_time, '+00:00', '+05:45') start_time,
                CONVERT_TZ(users_audio.end_time, '+00:00', '+05:45') end_time, users_audio.overall_score, users.name,users.email, users_audio.status,reviewer_logs.status_changed_time,reviewer_logs.reviewer_id,reviewers.id,reviewers.reviewer_email from users_audio
                JOIN users
                ON users_audio.user_id = users.user_id
                JOIN audio
                ON users_audio.audio_id = audio.audio_id
                LEFT JOIN reviewer_logs
                ON  users_audio.users_audio_id=reviewer_logs.user_id
                LEFT JOIN reviewers
                ON reviewers.id=reviewer_logs.reviewer_id
                WHERE    
                audio.is_training="FALSE" AND        
                audio.type="segmentation" AND           
                (users_audio.status IS NOT NULL AND users_audio.status NOT LIKE 'RETRY%')
                ORDER BY users_audio.start_time DESC `;

    // let sql = `Select
    //             audio.audio_id,
    //             audio.audio_name,
    //             users_audio.users_audio_id,
    //             users_audio.user_id,
    //             users_audio.audio_id, CONVERT_TZ(users_audio.start_time, '+00:00', '+05:45') start_time,
    //             CONVERT_TZ(users_audio.end_time, '+00:00', '+05:45') end_time, users_audio.overall_score, users.name, users_audio.status from users_audio
    //             JOIN users
    //             ON users_audio.user_id = users.user_id
    //             JOIN audio
    //             ON users_audio.audio_id = audio.audio_id

    //             WHERE
    //             audio.is_training="FALSE" AND
    //             (users_audio.status IS NOT NULL AND users_audio.status NOT LIKE 'RETRY%')
    //             ORDER BY users_audio.start_time DESC `;

    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(400).send("error in get /admin-review-table-datas query.");
        }
        ////console.log(result[0]);
        // //console.log(result);
        res.send(result);
    });
});

//get data from users-table to transcription admin review table
app.post("/transcription-admin-review-table-datas", (req, res) => {
    let sql = `
    Select audio.audio_id, 
    audio.audio_name, 
    audio.Language_id,
    users_audio.users_audio_id, 
    users_audio.user_id, 
    users_audio.audio_id, CONVERT_TZ(users_audio.start_time, '+00:00', '+05:45') start_time,
    CONVERT_TZ(users_audio.end_time, '+00:00', '+05:45') end_time, users_audio.transcription_score, users.name,users.email, users_audio.status, reviewer_logs.status_changed_time,reviewer_logs.reviewer_id,reviewers.id,reviewers.reviewer_email
    from users_audio 
    JOIN users
    ON users_audio.user_id = users.user_id
    LEFT JOIN reviewer_logs
    ON users_audio.users_audio_id=reviewer_logs.user_id
    LEFT JOIN reviewers
    ON reviewer_logs.reviewer_id=reviewers.id                        
    JOIN audio
    ON users_audio.audio_id = audio.audio_id 
    WHERE    
    users_audio.type="transcription"
    AND (users_audio.status IS NOT NULL AND users_audio.status NOT LIKE 'RETRY%')    
    ORDER BY users_audio.start_time DESC`;

    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res
                .status(400)
                .send("error in get /training-hr-review-table-datas query.");
        }
        ////console.log(result[0]);
        res.send(result);
        //console.log(sql);
    });
});

//get data from users-table to training admin review table
app.post("/training-admin-review-table-datas", (req, res) => {
    let sql = `
    Select audio.audio_id, audio.audio_name, users_audio.users_audio_id, users_audio.user_id, users_audio.audio_id, CONVERT_TZ(users_audio.start_time, '+00:00', '+05:45') start_time,
    CONVERT_TZ(users_audio.end_time, '+00:00', '+05:45') end_time, users_audio.overall_score, users.name,users.email, users_audio.status,audio.audio_order, reviewer_logs.status_changed_time,reviewer_logs.reviewer_id,reviewers.id,reviewers.reviewer_email
    from users_audio
    JOIN users
    ON users_audio.user_id = users.user_id
    LEFT JOIN reviewer_logs
    ON users_audio.users_audio_id=reviewer_logs.user_id
    LEFT JOIN reviewers
    ON reviewer_logs.reviewer_id=reviewers.id                        
    JOIN audio
    ON users_audio.audio_id = audio.audio_id
    WHERE   
     (users_audio.status IS NOT NULL AND users_audio.status NOT LIKE 'RETRY%')
    AND audio.is_training = "TRUE"
    AND audio.audio_order IS NOT NULL    
    ORDER BY users.user_id asc,audio.audio_order DESC`;

    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res
                .status(400)
                .send("error in get /training-admin-review-table-datas query.");
        }
        ////console.log(result[0]);
        res.send(result);
    });
});

//Change Pass Fail Data in Database
app.post("/confirm-pass-fail-admin-review", (req, res) => {
    let sql = `
            UPDATE users_audio
            SET status = "${req.body.changedPassFailValue}"
            WHERE users_audio_id = "${req.body.userId}"
            `;
    //console.log(sql);

    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res
                .status(400)
                .send("error in get /confirm-pass-fail-admin-review query.");
        }
        res.send(result);
    });
});

//Route for test logs
app.post("/save-hr-test-logs", (req, res) => {
    let sql = `INSERT INTO reviewer_logs(reviewer_id,users_name,user_id,users_status,status_changed_time,type)
            VALUES ("${req.body.reviewerId}","${req.body.user_name}","${req.body.user_id}","${req.body.user_status}",Now(),"${req.body.type}")
    `;
    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(400).send("error in get /hr-save-test-logs");
        }
        res.send(result);
    });
});

//Route for training logs
app.post("/save-hr-training-logs", (req, res) => {
    let sql = `INSERT INTO reviewer_logs(reviewer_id,users_name,user_id,users_status,status_changed_time,type)
            VALUES ("${req.body.reviewerId}","${req.body.user_name}","${req.body.user_id}","${req.body.user_status}",Now(),"${req.body.type}")
    `;
    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(400).send("error in get /hr-save-training-logs");
        }
        res.send(result);
    });
});

//Route for transcription logs
app.post("/save-hr-transcription-logs", (req, res) => {
    let sql = `INSERT INTO reviewer_logs(reviewer_id,users_name,user_id,users_status,status_changed_time,type)
            VALUES ("${req.body.reviewerId}","${req.body.user_name}","${req.body.user_id}","${req.body.user_status}",Now(),"${req.body.type}")
    `;
    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(400).send("error in get /hr-save-transcription-logs");
        }
        res.send(result);
    });
});

app.post("/get-web-app-id-for-admin", (req, res) => {
    let sql = `
            SELECT web_app_id FROM users
            WHERE user_id IN(
                SELECT user_id from users_audio WHERE users_audio_id = "${req.body.userId}"
            )
            `;
    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(400).send("error in get /get-web-app-id-for-hr.");
        }
        res.send(result);
    });
});

app.post("/admin-click-get-user-id", (req, res) => {
    let sql = `
            Select users_audio.user_id, users_audio.audio_id FROM users_audio
            WHERE users_audio_id = "${req.body.clicked_user_id}"
            `;
    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(400).send("error in get /admin-click-get-user-id query.");
        }
        res.send(result);
    });
});

app.use("/signature", checkNotAuthenticated, require("./routes/signature.js"));

//admin server side end

//checking authentication
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    return res.redirect("/hr-login-form");
}

function run_query(sql) {
    return new Promise((resolve, reject) => {
        audio_bee_pool.query(sql, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

app.listen(3000, () => {
    //logging port;
    console.log("Listening on 3000");
});