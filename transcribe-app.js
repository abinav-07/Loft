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


//Routes Below Are For HR Team
// app.get("/hr-register-form", (req, res) => {
//     res.render("hr-register");
// });

const user = [];

app.get("/hr-login-form", (req, res) => {
    // //console.log(req.flash('message'));
    res.render("hrLogin");
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