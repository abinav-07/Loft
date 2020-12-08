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
const cors=require("cors");
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

app.use(cors());

app.use((req,res,next)=>{
    res.header("Access-Control-Allow-Origin", "*");
    next();
  })

var { accessLogStream, jsonFormat, generator } = require("./config/logging");
// setup the logger
app.use(morgan(jsonFormat, { stream: accessLogStream }));

app.use(
    session({ secret: "WmXgIlMOFQ", resave: true, saveUninitialized: true })
);
//Modified Here from false to true
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set("views", viewPath);
app.use(flash());

//Setting passport
app.use(passport.initialize());
app.use(passport.session());

// Global variables
app.use(function(req, res, next) {
    if (req.hostname === process.env.VENDOR_WEBSITE) {
        req.isVendorWebsite = res.locals.isVendorWebsite = true;
      }else{
        req.isVendorWebsite = res.locals.isVendorWebsite = false;
      }
    
    res.locals.path = req.path.split("/")[1];
    res.locals.amplitude_api_key = process.env.AMPLITUDE_API_KEY;
    res.locals.webapp_basepath = process.env.WEBAPP_BASEPATH;
    res.locals.VENDOR_WEBSITE_URL=process.env.VENDOR_WEBSITE_URL;
    next();
});
hbs.registerPartials(partialPaths);




//Database Connection
const pool = require("./config/pool");
const audio_bee_pool = require("./config/audiobee-db");

audio_bee_pool.getConnection((err, connect) => {
    if (err) {
        console.error(err);
        //res.status(400).send("error in get /admin-review-table-datas query.");
    }
    console.log("Connected");
    connect.release();
});
//Database Connection End


//Routes for APIS
app.use("/",require("./routes/transcribe_routes"));

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
                            // var insert_into_users_logs_sql = `INSERT INTO users_audio_logs(users_audio_id,audio_id,user_id,start_time) VALUES (${result.insertId},${audioId},${req.query.user_id},NOW())`
                            // pool.query(insert_into_users_logs_sql, (err, result) => {
                            //     if (err) {
                            //         console.error(err);
                            //         res.status(400).send("error in get /transcribe users_audio_logs query.");
                            //     }
                            // })
                        });
                    } else if (result && result.length > 0) {
                        var check_in_users_audio_logs = `SELECT * FROM users_audio_logs WHERE users_audio_id IN (SELECT users_audio_id FROM users_audio WHERE 
                                user_id='${req.query.user_id}' 
                                AND audio_id='${audioId}' 
                                AND type="transcription"
                            )`;
                        //console.log(check_in_users_audio_logs);
                        pool.query(check_in_users_audio_logs, (err1, result1) => {
                            if (err1) {
                                console.error(err1);
                                //res.status(400).send("error in get /training check_users_audio_logs query.");
                            }
                            if (result1 && result1.length > 0) {
                                // console.log(result1[0].users_audio_id);
                                var update_start_time_in_users_logs = `UPDATE users_audio_logs SET start_time=NOW() WHERE start_time IS NULL AND users_audio_id=${result1[0].users_audio_id}`;
                                //console.log(update_start_time_in_users_logs);
                                pool.query(update_start_time_in_users_logs, (err2, result2) => {
                                    if (err2) {
                                        console.error(err2);
                                        //res.status(400).send("error in get /training update_users_audio_logs query.");
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

                    if (userName_result && userName_result.length > 0 && typeof userName_result[0]["name"] != "undefined") {
                        user_name = userName_result[0]["name"];
                    } else {
                        user_name = "Not Found"
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
        var check_in_users_audio_logs = `SELECT * FROM users_audio_logs WHERE users_audio_id IN 
                                                (SELECT users_audio_id FROM users_audio WHERE
                                                 user_id = "${req.body.user_id}"
                                                AND audio_id = ${req.body.audio_id}
                                                AND type="segmentation")
                                                `;
        pool.query(check_in_users_audio_logs, (err1, result1) => {
            if (err1) {
                console.log(err1);
            }
            if (result1 && result1.length > 0) {
                var update_end_time_in_users_logs = `UPDATE users_audio_logs SET end_time=NOW() WHERE end_time IS NULL users_audio_id IN (SELECT users_audio_id FROM users_audio WHERE
                    user_id = "${req.body.user_id}"
                   AND audio_id = ${req.body.audio_id}
                   AND type="segmentation")`;
                pool.query(update_end_time_in_users_logs, (err2, result2) => {
                    if (err2) {
                        console.log(err2);
                    }
                })
            }
        });
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
                    .send("error in get /save-test-on-transcription query.");
            }
            //console.log(result);
            var check_in_users_audio_logs = `SELECT * FROM users_audio_logs WHERE users_audio_id IN (SELECT users_audio_id FROM users_audio WHERE
                    user_id = "${req.body.user_id}"
                    AND audio_id = "${req.body.audio_id}"
                    AND type="transcription" )`;
            pool.query(check_in_users_audio_logs, (err1, result1) => {
                if (err1) {
                    console.log(err1);
                }
                if (result1 && result1.length > 0) {
                    var update_end_time_in_users_logs = `UPDATE users_audio_logs SET end_time=NOW() WHERE end_time IS NULL AND users_audio_id IN (SELECT users_audio_id FROM users_audio WHERE
                                user_id = "${req.body.user_id}"
                               AND audio_id = ${req.body.audio_id}
                               AND type="transcription")`;
                    pool.query(update_end_time_in_users_logs, (err2, result2) => {
                        if (err2) {
                            console.log(err2);
                        }
                    })
                }
            });

            res.send(result);
        });
    }
);
//save testscore end for transcription

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
            if (result && result.length > 0) {
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
        //console.log(result);
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

app.post("/set-endtime-null-on-retry", (req, res) => {
    var check_in_users_audio_logs = `SELECT * FROM users_audio_logs WHERE users_audio_id=${req.body.user_id}`;
    pool.query(check_in_users_audio_logs, (err, result) => {
        if (err) {
            console.error(err);
        }
        if (result && result.length < 2) {
            var setStatusNull = `Update users_audio SET status="RETRY", end_time=NULL WHERE users_audio_id=${req.body.user_id}`;
            pool.query(setStatusNull, (resetErr, resetResult) => {
                if (resetErr) {
                    console.error(resetErr);
                    res.status(400).send("error in get /reset-transcription-data-for-retry.");
                }
                var insert_into_users_logs_sql = `INSERT INTO users_audio_logs(users_audio_id,status) VALUES (${req.body.user_id},"RETRY")`;
                pool.query(insert_into_users_logs_sql, (err1, result1) => {
                        if (err1) {
                            console.error(resetErr);
                            res.status(400).send("error in get /insert-users_audio_logs-data-for-retry.");
                        }
                        res.send(result1)
                    })
                    //console.log(resetResult)
            })
        } else if (result && result.length >= 2) {
            //Set Fail if more than 2 retries
            var setStatusFail = `Update users_audio SET status="FAIL", is_submitted="TRUE" WHERE users_audio_id=${req.body.user_id}`;
            pool.query(setStatusFail, (err, result3) => {
                if (err) {
                    console.error(err);
                    res.status(400).send("error in get /update-users_audio-data-for-retry.");
                }
                res.send(result3);
            })
        } else {
            var setStatusNull = `Update users_audio SET status="RETRY", end_time=NULL WHERE users_audio_id=${req.body.user_id}`;
            pool.query(setStatusNull, (resetErr, resetResult) => {
                if (resetErr) {
                    console.error(resetErr);
                    res.status(400).send("error in get /reset-transcription-data-for-retry.");
                }
                var insert_into_users_logs_sql = `INSERT INTO users_audio_logs(users_audio_id,status) VALUES (${req.body.user_id},"RETRY")`;
                pool.query(insert_into_users_logs_sql, (err1, result1) => {
                        if (err1) {
                            console.error(err1);
                            res.status(400).send("error in get /insert-users_audio_logs-data-for-retry.");
                        }
                        res.send(result1);
                    })
                    //console.log(resetResult)
            })
        }
    })

})


app.post("/reset-transcription-data-for-retry", (req, res) => {
    var check_in_users_audio_logs = `SELECT * FROM users_audio_logs WHERE users_audio_id=${req.body.user_id}`;
    pool.query(check_in_users_audio_logs, (err1, checkResult) => {
        if (err1) {
            console.error(err1);
            res.status(400).send("error in get /select-users_audio_logs-data-for-retry.");
        }
        //console.log(checkResult);
        if (checkResult && checkResult.length < 2) {
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
                    var insert_into_users_logs_sql = `INSERT INTO users_audio_logs(users_audio_id,status) VALUES (${req.body.user_id},"RETRY")`;
                    pool.query(insert_into_users_logs_sql, (err1, result1) => {
                            if (err1) {
                                console.error(resetErr);
                                res.status(400).send("error in get /insert-users_audio_logs-data-for-retry-transcription.");
                            }
                        })
                        //console.log(resetResult)
                })
                res.send(result);
            });
        } else if (checkResult && checkResult.length >= 2) {

            //Set Fail if more than 2 retries
            var setStatusFail = `Update users_audio SET status="FAIL", is_submitted="TRUE" WHERE users_audio_id=${req.body.user_id}`;
            pool.query(setStatusFail, (err, result3) => {
                if (err) {
                    console.error(err);
                    res.status(400).send("error in get /update-users_audio-data-for-retry.");
                }
            })

        } else {
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
                    var insert_into_users_logs_sql = `INSERT INTO users_audio_logs(users_audio_id,status) VALUES (${req.body.user_id},"RETRY")`;
                    pool.query(insert_into_users_logs_sql, (err1, result1) => {
                            if (err1) {
                                console.error(resetErr);
                                res.status(400).send("error in get /insert-users_audio_logs-data-for-retry-transcription.");
                            }
                        })
                        //console.log(resetResult)
                })
                res.send(result);
            });
        }
    })

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
        var check_in_users_audio_logs = `SELECT * FROM users_audio_logs WHERE users_audio_id=${req.body.userId}`;
        pool.query(check_in_users_audio_logs, (err1, result1) => {
            if (err1) {
                console.log(err1);
            }
            if (result1 && result1.length > 0) {
                var setStatusLog = `UPDATE users_audio_logs SET status="${req.body.changedPassFailValue}" WHERE users_audio_id=${req.body.userId} AND id=${result1[result1.length-1].id}`
                pool.query(setStatusLog, (err2, result2) => {
                    if (err2) {
                        console.log(err2);
                    }
                })
            }
        });

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

//Feedback Routes
app.post("/insert-feedback-lt", (req, res) => {

    let sql = `INSERT INTO feedbackLT (feedback,audio_id,feedbackCreatedAt,user_id) VALUES ("${req.body.feedback.replace(/'/g, "\\'")}","${req.body.audio_id}",Now(),"${req.body.user_id}")`
    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(400).send("error in get /insert-feedback-lt.");
        }
        res.send(result);
    })
})

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