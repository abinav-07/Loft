const express = require("express");
const router = express.Router();

const axios = require("axios");
const async = require("async");
const _ = require("lodash");
const path = require("path");

// AWS S3 configurations
var AWS = require("aws-sdk");
AWS.config.loadFromPath(path.join(__dirname, "/..", "/config/config.json"));
var s3 = new AWS.S3();
// Create a bucket and upload something into it
var signature_bucket = "audiobee-ndasignature";

// Express body parser
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

const audio_bee_pool = require("../config/audiobee-db");
router.get("/backend/list", (req, res) => {
  res.render("signature_list");
});
router.post("/backend/pending-list", (req, res) => {
  var sql = `SELECT
              u.User_id,
              u.Full_name,
              u.Email,
              u.City_grew_up ,
              u.City_of_residence ,
              u.Country_of_residence,
              us.User_signature_id,
              us.Signature_url,
              us.Approved,
              l.Language_name,
              l.Language_code,
              (SELECT count(*) 
                FROM user_signature_logs usl, user_signature us2 
              WHERE us2.User_id = u.User_id
              AND usl.User_signature_id = us2.User_signature_id
              AND usl.Signature_status = 'N') Retry_count 
            FROM
              user u,
              user_signature us,
              user_lang ul,
              languages l
            WHERE
              u.User_id = us.User_id
              AND u.User_id = ul.User_id
              AND ul.Language_id = l.Language_id
              AND us.Approved IS NULL
            ORDER BY u.User_id`;
  run_query(sql)
    .then((data) => {
      res.send(groupArrayObjects(data));
    })
    .catch((err) => {
      console.error(err);
      res.status(400).send(err);
    });
});
router.post("/backend/approved-list", (req, res) => {
  var sql = `SELECT
              u.User_id,
              u.Full_name,
              u.Email,
              u.City_grew_up ,
              u.City_of_residence ,
              u.Country_of_residence,
              us.User_signature_id,
              us.Signature_url,
              us.Approved,
              l.Language_name,
              l.Language_code,
              us.Signature_comment
            FROM
              user u,
              user_signature us,
              user_lang ul,
              languages l
            WHERE
              u.User_id = us.User_id
              AND u.User_id = ul.User_id
              AND ul.Language_id = l.Language_id
              AND us.Approved = 'Y'
            ORDER BY u.User_id`;
  run_query(sql)
    .then((data) => {
      res.send(groupArrayObjects(data));
    })
    .catch((err) => {
      console.error(err);
      res.status(400).send(err);
    });
});
router.post("/backend/rejected-list", (req, res) => {
  var sql = `SELECT
              u.User_id,
              u.Full_name,
              u.Email,
              u.City_grew_up ,
              u.City_of_residence ,
              u.Country_of_residence,
              us.User_signature_id,
              us.Signature_url,
              us.Approved,
              l.Language_name,
              l.Language_code ,
              us.Signature_comment
            FROM
              user u,
              user_signature us,
              user_lang ul,
              languages l
            WHERE
              u.User_id = us.User_id
              AND u.User_id = ul.User_id
              AND ul.Language_id = l.Language_id
              AND us.Approved = 'N'
            ORDER BY u.User_id`;
  run_query(sql)
    .then((data) => {
      res.send(groupArrayObjects(data));
    })
    .catch((err) => {
      console.error(err);
      res.status(400).send(err);
    });
});

router.post("/backend/update-user-signature-status", (req, res) => {
  var { approved = [], rejected = [] } = JSON.parse(req.body.save_payload);
  var sql = `INSERT INTO user_signature(User_signature_id, Approved) VALUES `;
  approved.forEach((approved_signature) => {
    sql += ` (${approved_signature.user_signature_id}, 'Y'), `;
  });
  sql = sql.substr(0, sql.length - 2);
  sql += ` ON DUPLICATE KEY UPDATE 
            Approved = VALUES(Approved)`;

  var sql2 = `INSERT INTO user_signature(User_signature_id, Approved,Signature_comment) VALUES `;
  rejected.forEach((rejected_signature) => {
    sql2 += ` (${rejected_signature.user_signature_id}, 'N', '${rejected_signature.comment}'), `;
  });
  sql2 = sql2.substr(0, sql2.length - 2);
  sql2 += ` ON DUPLICATE KEY UPDATE 
            Approved = VALUES(Approved),
            Signature_comment = VALUES (Signature_comment)`;
  async.parallel(
    [
      (cb) => {
        if (approved.length > 0) {
          run_query(sql).then(() => {
            cb();
          });
        } else {
          cb();
        }
      },
      (cb) => {
        if (rejected.length > 0) {
          run_query(sql2).then(() => {
            cb();
          });
        } else {
          cb();
        }
      },
    ],
    (err, result) => {
      res.send("OK");
    }
  );
});

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
function groupArrayObjects(data) {
  var grouped = _.groupBy(data, (row) => row.User_id);
  var req_payload = [];
  // Converting list of user id with languages to obj
  for (var key in grouped) {
    // check also if property is not inherited from prototype
    if (grouped.hasOwnProperty(key)) {
      var obj = {};
      var langauges_list = grouped[key];
      obj = langauges_list[0];
      var user_languages = [];
      var language_names = "";
      langauges_list.forEach((language) => {
        user_languages.push({
          Language_name: language.Language_name,
          Language_code: language.Language_code,
        });
        language_names += language.Language_name + ", ";
      });
      delete obj.Language_name;
      delete obj.Language_code;
      obj.User_languages = user_languages;
      obj.Languages = language_names.substring(0, language_names.length - 2);
      req_payload.push(obj);
    }
  }
  return req_payload;
}
module.exports = router;
