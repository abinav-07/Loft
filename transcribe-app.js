//Importing packages
// const waveformData = require('waveform-data');
const hbs = require('hbs');
const express = require('express');
const async = require('async');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const decode = require('audio-decode');
const diffCheck = require('diff');
var AudioContext = require('web-audio-api').AudioContext,
  context = new AudioContext();
var router = express.Router();
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('express-flash');
var morgan = require('morgan');
const cors = require('cors');
var dotenv = require('dotenv');
dotenv.config();
// var WaveSurfer=require("wavesurfer.js")

const intializePassport = require('./config/passport-config');
intializePassport(passport);

var newData = '';
//console.log(path.join(__dirname, "./js"));
const app = express(); //Express

//Partial Path Link
const partialPaths = path.join(__dirname, './templates/partials');
//View Path Link
const viewPath = path.join(__dirname, './templates/views');
//Path to Public Directory
const pubDir = path.join(__dirname, './public');
//Using Paths
app.use(express.static(pubDir));
app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, './node_modules')));
app.use(express.static(path.join(__dirname, './local_modules')));
app.set('view engine', 'hbs');

app.use(cors());

var { accessLogStream, jsonFormat, generator } = require('./config/logging');
// setup the logger
app.use(morgan(jsonFormat, { stream: accessLogStream }));

app.use(
  session({ secret: 'WmXgIlMOFQ', resave: true, saveUninitialized: true })
);
//Modified Here from false to true
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('views', viewPath);
app.use(flash());

//Setting passport
app.use(passport.initialize());
app.use(passport.session());

// Global variables
app.use(function (req, res, next) {
  if (req.hostname === process.env.VENDOR_WEBSITE) {
    req.isVendorWebsite = res.locals.isVendorWebsite = true;
  } else {
    req.isVendorWebsite = res.locals.isVendorWebsite = false;
  }
  res.header('Access-Control-Allow-Origin', '*');
  res.locals.path = req.path.split('/')[1];
  res.locals.amplitude_api_key = process.env.AMPLITUDE_API_KEY;
  req.webapp_basepath = res.locals.webapp_basepath =
    process.env.WEBAPP_BASEPATH;
  req.VENDOR_WEBSITE_URL = res.locals.VENDOR_WEBSITE_URL =
    process.env.VENDOR_WEBSITE_URL;
  next();
});
hbs.registerPartials(partialPaths);

/**
 * GLOBAL DATABASE SETTINGS
 */
global.TRANSCRIPTION_DB = require('./database/transcribe-db/models');

//Database Connection
const pool = require('./config/pool');
const audio_bee_pool = require('./config/audiobee-db');

audio_bee_pool.getConnection((err, connect) => {
  if (err) {
    console.error(err);
    //res.status(400).send("error in get /admin-review-table-datas query.");
  }
  console.log('Connected');
  connect.release();
});
//Database Connection End

//Routes for APIS
app.use('/', require('./routes/transcribe_routes'));

//Route for guided audio
app.get('/guided-audio', (req, res) => {
  var audio_url = '';
  var audioId = req.query.audio_id;
  if (!audioId) {
    audioId = 4;
  } else {
    audioId = 4;
  }
  res.render('guidedAudio', {
    user_id: req.query.user_id,
    audio_url:
      'https://audiobee-production-user-files.s3.eu-north-1.amazonaws.com/transcription/cryophile.wav',
    audio_id: 4,
  });
});

//for same speaker route. Not Used Yet!
app.post('/get-segments-with-same-speaker', (req, res) => {
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
        .send('error in get /get-segments-with-same-speaker query.');
    }
    res.send(result);
  });
});
//get-segments-with-same-speaker route end

/*Routes Below Are For HR Team
    Enable hr-register-form to add new  HR reviewers
*/

// app.get("/hr-register-form", (req, res) => {
//     res.render("hr-register");
// });

const user = [];

app.use('/signature', checkNotAuthenticated, require('./routes/signature.js'));

//admin server side end

//checking authentication
function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  return res.redirect('/hr-login-form');
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
  console.log('Listening on 3000');
});
