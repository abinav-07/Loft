const express = require('express');
//Database Connection
const pool = require('../config/pool');

//Landing APIs For admin data LT
const getActualLandingForAdmin = (req, res) => {
  var audioId = req.query.audio_id;

  var audio_url = '';
  if (!audioId) {
    res.send('Error in URL. Please redirect again.');
  } else {
    var get_audio_url = `SELECT * FROM audio WHERE md5(audio_id)='${req.query.audio_id}'`;
    pool.query(get_audio_url, (err, result) => {
      if (err) {
        console.error(err);
        //res.status(400).send("error in get /transcribe query.");
      }
      if (result && result.length > 0) {
        audio_url = result[0]['audio_url'];
        ////console.log(audio_url);
        res.render('actual_data_insert', {
          audio_url: audio_url,
          audio_name: result[0]['audio_name'],
          audio_id: audioId,
        });
      } else {
        res.send('Audio Not Found.');
      }
    });
  }
};

const getActualLandingForAdminReactLT = (req, res) => {
  var audioId = req.query.audio_id;
  var audio_url = '';
  if (!audioId) {
    res.status(400).send('Error in URL. Please redirect again.');
  } else {
    var get_audio_url = `SELECT * FROM audio WHERE md5(audio_id)='${req.query.audio_id}'`;
    pool.query(get_audio_url, (err, result) => {
      if (err) {
        console.error(err);
        //res.status(400).send("error in get /transcribe query.");
      }
      if (result && result.length > 0) {
        audio_url = result[0]['audio_url'];
        ////console.log(audio_url);
        res.status(200).json({
          type: 'actual-data-admin',
          audio_url: audio_url,
          audio_name: result[0]['audio_name'],
          audio_id: audioId,
        });
      } else {
        res.send('Audio Not Found.');
      }
    });
  }
};

//Insert Segments into Actual Table
const insertDataIntoActual = (req, res) => {
  const sql = `
            INSERT INTO actual(div_className, div_title, segment_start, segment_end, annotation_text, audio_id)
            VALUES('${req.body.speakerName}', '${req.body.annotationType}', '${
    req.body.segmentStart
  }', '${req.body.segmentEnd}',
            '${req.body.annotationText.replace(/'/g, "\\'")}', '${
    req.body.audio_id
  }')
            `;
  //console.log(sql);
  pool.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      res.status(400).send('error in get /insert-into-actual-data query.');
    }
    //console.log("Data Inserted Into Actual Table");
    res.status(200).send(result);
  });
};

//GET Segments from Actual Table
const getSegmentsFromActual = (req, res) => {
  const sql = `
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
        .send('error in get /get-segments-from-actual-data-for-admin query.');
    }
    res.status(200).send(result);
  });
};

//Update Segments in Actual Table
const updateActualTable = (req, res) => {
  const sql = `
            Update actual
            SET div_className = '${req.body.speakerName}', div_title = '${
    req.body.annotationType
  }',
            segment_start = '${req.body.segmentStart}', segment_end = '${
    req.body.segmentEnd
  }', 
            annotation_text = '${
              req.body.annotationText != 'undefined'
                ? req.body.annotationText.replace(/'/g, "\\'")
                : ''
            }'
            WHERE segment_id = '${req.body.segmentId}'            
            AND audio_id = '${req.body.audio_id}'
            `;

  pool.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      res.status(400).send('error in get /updateactualdatabase query.');
    }
    res.status(200).send(result);
  });
};

const updateActualOnSplit = (req, res) => {
  const sql = `
            Update actual
            SET div_className = '${req.body.speakerName}', div_title = '${
    req.body.annotationType
  }',
            segment_start = '${req.body.segmentStart}', segment_end = '${
    req.body.segmentEnd
  }', 
            annotation_text = '${req.body.annotationText.replace(/'/g, "\\'")}'
            WHERE segment_id = '${req.body.segmentId}'            
            AND audio_id = '${req.body.audio_id}'
            `;
  pool.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      res.status(400).send('error in get /update-actual-on-split query.');
    }
    res.status(200).send(result);
  });
};

const deleteSegmentsFromActual = (req, res) => {
  const sql = `
    DELETE FROM actual WHERE
    segment_id = '${req.body.regionId}'            
    AND audio_id = '${req.body.audio_id}'
    `;

  pool.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      res.status(400).send('error in get /remove-segments-from-actual query.');
    }
    res.status(200).send(result);
  });
};

const topSpeakerControlSaveActual = (req, res) => {
  const sql = `
            Update actual
            Set div_className = "${req.body.userInputTopSpeakerName}"
            WHERE audio_id = "${req.body.audio_id}"
            AND div_className = "${req.body.previousTopSpeakerName}"
            `;
  pool.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      res.status(400).send('error in get /topSpeakerControlSaveActual query.');
    }
    res.status(200).send(result);
  });
};

module.exports = {
  getActualLandingForAdmin,
  getActualLandingForAdminReactLT,
  insertDataIntoActual,
  updateActualTable,
  updateActualOnSplit,
  getSegmentsFromActual,
  deleteSegmentsFromActual,
  topSpeakerControlSaveActual,
};
