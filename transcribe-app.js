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
    res.header("Access-Control-Allow-Origin", "*");
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
    Select audio.audio_id, audio.audio_name, users_audio.users_audio_id, users_audio.user_id, users_audio.audio_id, 
    CONVERT_TZ(users_audio.start_time, '+00:00', '+05:45') start_time,
    CONVERT_TZ(users_audio.end_time, '+00:00', '+05:45') end_time, users_audio.overall_score, users.name,users.email, users_audio.status,audio.audio_order
    from users_audio, users , audio WHERE
    users_audio.user_id = users.user_id
    AND users_audio.audio_id = audio.audio_id
    AND (users_audio.status IS NULL OR users_audio.status = 'RETRY')
    AND audio.is_training = "TRUE"   
    ORDER BY users.user_id asc,audio.audio_order DESC`;
    //Commented Out
    //AND audio.audio_order IS NOT NULL
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

});

app.post("/set-endtime-null-on-retry-for-segmentation_course",(req,res)=>{
    var check_in_users_audio_logs = `SELECT * FROM users_audio_logs WHERE users_audio_id=${req.body.user_id}`;
    pool.query(check_in_users_audio_logs, (err, result) => {
        if (err) {
            console.error(err);
        }
        if(result && result.length>0){
            var setStatusNull = `Update users_audio SET status="RETRY", end_time=NULL WHERE users_audio_id=${req.body.user_id}`;
            pool.query(setStatusNull, (resetErr, resetResult) => {
                if (resetErr) {
                    console.error(resetErr);
                    res.status(400).send("error in get /reset-transcription-data-for-retry.");
                }
                res.status(200).send(resetResult);
            });
        }
    });
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
    ORDER BY users.user_id asc,audio.audio_order DESC`;
    //Commented Code
    //AND audio.audio_order IS NOT NULL   

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