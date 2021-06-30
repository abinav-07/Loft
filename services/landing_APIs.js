//Database Connection
const pool = require('../config/pool');

//Function For / landing route
const getLandingRoute = (req, res) => {
  if (typeof req.query.user_id !== 'undefined') {
    let check_sql;
    //If Segmentation Task
    if (
      req.query.type == 'segmentation' ||
      typeof req.query.type == 'undefined'
    ) {
      check_sql = `SELECT * FROM users_audio WHERE user_id IN (
                    SELECT user_id from users WHERE web_app_id='${req.query.user_id}'                
                )          
                     AND users_audio.type= 'segmentation' `;
    } else if (req.query.type == 'transcription') {
      check_sql = `SELECT * FROM users WHERE web_app_id='${req.query.user_id}' `;
    } else if (req.query.type == 'segmentation-course') {
      check_sql = `SELECT * FROM users_audio WHERE user_id IN (
                SELECT user_id from users WHERE web_app_id='${req.query.user_id}'                
            )          
                 AND users_audio.type= 'segmentation' `;
    }

    pool.query(check_sql, (err, result) => {
      if (err) {
        console.error(err);
        res.status(400).send(err);
      }

      if (result && result.length == 0) {
        var sql = `INSERT INTO users(name, email, web_app_id) VALUES('${req.query.full_name.replace(
          /'/g,
          "\\'"
        )}', 
                '${req.query.email}', '${req.query.user_id}')`;
        pool.query(sql, (err, result) => {
          if (err) {
            console.error(err);
            res.status(400).send('Please Use Webapp to access this URL.');
          } else {
            req.session.user_id = result.insertId;
            req.session.user = req.query.full_name;
            if (
              req.query.type == 'segmentation' ||
              typeof req.query.type == 'undefined'
            ) {
              res.redirect(
                `/transcribe?user_id=${result.insertId}&audio_id=${req.query.audio_id}`
              );
            } else if (req.query.type == 'transcription') {
              var getAudioIdSQL = `SELECT * FROM audio WHERE Language_id=${req.query.language_id} and type='transcription'`;
              pool.query(getAudioIdSQL, (err, result1) => {
                if (err) {
                  console.error(err);
                  res.status(400).send('Error in Language Id.');
                } else {
                  if (result1 && result1.length > 0) {
                    res.redirect(
                      `/transcription?user_id=${result.insertId}&audio_id=${result1[0]['audio_id']}`
                    );
                  } else {
                    res.send(
                      'No projects exists for this language currently. We will inform you once projects are available'
                    );
                  }
                }
              });
            } else if (req.query.type == 'segmentation-course') {
              //Add Segmentation Type Here
              var getAudioIdSQL = `SELECT * FROM audio WHERE Language_id=${req.query.language_id} AND is_guided="${req.query.is_guided}" AND type="segmentation" and segmentation_course_type="${req.query.segmentation_course_type}"`;
              pool.query(getAudioIdSQL, (err, result1) => {
                if (err) {
                  console.error(err);
                  res.status(400).send('Error in Language Id.');
                } else {
                  if (result1 && result1.length > 0) {
                    res.redirect(
                      `/segmentation-course?user_id=${result.insertId}&audio_id=${result1[0]['audio_id']}`
                    );
                  } else {
                    res.send(
                      'No projects exists for this language currently. We will inform you once projects are available'
                    );
                  }
                }
              });
            }
          }
        });
      } else {
        if (result[0].status != 'RETRY') {
          if (
            req.query.type == 'segmentation' ||
            typeof req.query.type == 'undefined'
          ) {
            res.redirect(
              `/transcribe?user_id=${result[0].user_id}&audio_id=${req.query.audio_id}`
            );
          } else if (req.query.type == 'transcription') {
            var getAudioIdSQL = `SELECT * FROM audio WHERE Language_id=${req.query.language_id} and type='transcription'`;
            pool.query(getAudioIdSQL, (err, result1) => {
              if (err) {
                console.error(err);
                res.status(400).send('Error in Language Id.');
              } else {
                if (result1 && result1.length > 0) {
                  res.redirect(
                    `/transcription?user_id=${result[0].user_id}&audio_id=${result1[0]['audio_id']}`
                  );
                } else {
                  res.send(
                    'No projects exists for this language currently. We will inform you once projects are available'
                  );
                }
              }
            });
          } else if (req.query.type == 'segmentation-course') {
            //Add Segmentation Type Here
            var getAudioIdSQL = `SELECT * FROM audio WHERE Language_id="${req.query.language_id}" AND is_guided="${req.query.is_guided}" AND type="segmentation" and segmentation_course_type="${req.query.segmentation_course_type}"`;
            pool.query(getAudioIdSQL, (err, result1) => {
              if (err) {
                console.error(err);
                res.status(400).send('Error in Language Id.');
              } else {
                if (result1 && result1.length > 0) {
                  res.redirect(
                    `/segmentation-course?user_id=${result[0].user_id}&audio_id=${result1[0]['audio_id']}`
                  );
                } else {
                  res.send(
                    'No projects exists for this language currently. We will inform you once projects are available'
                  );
                }
              }
            });
          }
        } else {
          if (
            req.query.type == 'segmentation' ||
            typeof req.query.type == 'undefined'
          ) {
            res.redirect(
              `/transcribe?user_id=${result[0].user_id}&audio_id=25`
            );
          } else if (req.query.type == 'transcription') {
            var getAudioIdSQL = `SELECT * FROM audio WHERE Language_id=${req.query.language_id} and type='transcription'`;
            pool.query(getAudioIdSQL, (err, result1) => {
              if (err) {
                console.error(err);
                res.status(400).send('Error in Language Id.');
              } else {
                if (result1 && result1.length > 0) {
                  res.redirect(
                    `/transcription?user_id=${result[0].user_id}&audio_id=${result1[0]['audio_id']}`
                  );
                } else {
                  res.send(
                    'No projects exists for this language currently. We will inform you once projects are available'
                  );
                }
              }
            });
          } else if (req.query.type == 'segmentation-course') {
            //Add Segmentation Type Here
            var getAudioIdSQL = `SELECT * FROM audio WHERE Language_id=${req.query.language_id} AND is_guided="${req.query.is_guided}" and type="segmentation" and segmentation_course_type="${req.query.segmentation_course_type}"`;
            pool.query(getAudioIdSQL, (err, result1) => {
              if (err) {
                console.error(err);
                res.status(400).send('Error in Language Id.');
              } else {
                if (result1 && result1.length > 0) {
                  res.redirect(
                    `/segmentation-course?user_id=${result[0].user_id}&audio_id=${result1[0]['audio_id']}`
                  );
                } else {
                  res.send(
                    'No projects exists for this language currently. We will inform you once projects are available'
                  );
                }
              }
            });
          }
        }
      }
    });
  } else {
    res.send('Error in URL. Please use webapp to access this location.');
  }
};

//Function For / react-api landing route
const getLandingRouteForReactLT = (req, res) => {
  if (typeof req.query.user_id !== 'undefined') {
    let check_sql;
    //If Segmentation Task
    if (
      req.query.type == 'segmentation' ||
      typeof req.query.type == 'undefined'
    ) {
      check_sql = `SELECT * FROM users_audio WHERE user_id IN (
                    SELECT user_id from users WHERE web_app_id='${req.query.user_id}'                
                )          
                    AND audio_id = '${req.query.audio_id}' AND users_audio.type= 'segmentation' `;
    } else if (req.query.type == 'transcription') {
      check_sql = `SELECT * FROM users WHERE web_app_id='${req.query.user_id}' `;
    }

    pool.query(check_sql, (err, result) => {
      if (err) {
        console.error(err);
        res.status(400).send(err);
      }

      if (result && result.length == 0) {
        var sql = `INSERT INTO users(name, email, web_app_id) VALUES('${req.query.full_name.replace(
          /'/g,
          "\\'"
        )}', 
                '${req.query.email}', '${req.query.user_id}')`;
        pool.query(sql, (err, result) => {
          if (err) {
            console.error(err);
            res.status(400).send('Please Use Webapp to access this URL.');
          } else {
            req.session.user_id = result.insertId;
            req.session.user = req.query.full_name;
            if (
              req.query.type == 'segmentation' ||
              typeof req.query.type == 'undefined'
            ) {
              res.status(200).json({
                type: 'transcribe',
                user_id: result.insertId,
                audio_id: req.query.audio_id,
              });
            } else if (req.query.type == 'transcription') {
              var getAudioIdSQL = `SELECT * FROM audio WHERE Language_id=${req.query.language_id} and type='transcription'`;
              pool.query(getAudioIdSQL, (err, result1) => {
                if (err) {
                  console.error(err);
                  res.status(400).send('Error in Language Id.');
                } else {
                  if (result1 && result1.length > 0) {
                    res.status(200).json({
                      type: 'transcription',
                      user_id: result.insertId,
                      audio_id: result1[0]['audio_id'],
                    });
                  } else {
                    res
                      .status(400)
                      .send(
                        'No projects exists for this language currently. We will inform you once projects are available'
                      );
                  }
                }
              });
            } else if (req.query.type == 'segmentation-course') {
              //Add Segmentation Type Here
              var getAudioIdSQL = `SELECT * FROM audio WHERE Language_id=${req.query.language_id} AND is_guided="${req.query.is_guided}" AND type="segmentation" and segmentation_course_type="${req.query.segmentation_course_type}"`;
              pool.query(getAudioIdSQL, (err, result1) => {
                if (err) {
                  console.error(err);
                  res.status(400).send('Error in Language Id.');
                } else {
                  if (result1 && result1.length > 0) {
                    res.status(200).json({
                      type: 'segmentation-course',
                      user_id: result.insertId,
                      audio_id: result1[0]['audio_id'],
                    });
                  } else {
                    res
                      .status(400)
                      .send(
                        'No projects exists for this language currently. We will inform you once projects are available'
                      );
                  }
                }
              });
            }
          }
        });
      } else {
        if (result[0].status != 'RETRY') {
          if (
            req.query.type == 'segmentation' ||
            typeof req.query.type == 'undefined'
          ) {
            res.status(200).json({
              type: 'transcribe',
              user_id: result[0].user_id,
              audio_id: req.query.audio_id,
            });
          } else if (req.query.type == 'transcription') {
            var getAudioIdSQL = `SELECT * FROM audio WHERE Language_id=${req.query.language_id} and type='transcription'`;
            pool.query(getAudioIdSQL, (err, result1) => {
              if (err) {
                console.error(err);
                res.status(400).send('Error in Language Id.');
              } else {
                if (result1 && result1.length > 0) {
                  res.status(200).json({
                    type: 'transcription',
                    user_id: result[0].user_id,
                    audio_id: result1[0]['audio_id'],
                  });
                } else {
                  res
                    .status(400)
                    .send(
                      'No projects exists for this language currently. We will inform you once projects are available'
                    );
                }
              }
            });
          } else if (req.query.type == 'segmentation-course') {
            //Add Segmentation Type Here
            var getAudioIdSQL = `SELECT * FROM audio WHERE Language_id="${req.query.language_id}" AND is_guided="${req.query.is_guided}" AND type="segmentation" and segmentation_course_type="${req.query.segmentation_course_type}"`;
            pool.query(getAudioIdSQL, (err, result1) => {
              if (err) {
                console.error(err);
                res.status(400).send('Error in Language Id.');
              } else {
                if (result1 && result1.length > 0) {
                  res.status(200).json({
                    type: 'segmentation-course',
                    user_id: result[0].user_id,
                    audio_id: result1[0]['audio_id'],
                  });
                } else {
                  res
                    .status(400)
                    .send(
                      'No projects exists for this language currently. We will inform you once projects are available'
                    );
                }
              }
            });
          }
        } else {
          if (
            req.query.type == 'segmentation' ||
            typeof req.query.type == 'undefined'
          ) {
            //Redirecting With 25 Audio Id For Retry
            res.status(200).json({
              type: 'transcribe',
              user_id: result[0].user_id,
              audio_id: 25,
            });
          } else if (req.query.type == 'transcription') {
            var getAudioIdSQL = `SELECT * FROM audio WHERE Language_id=${req.query.language_id} and type='transcription'`;
            pool.query(getAudioIdSQL, (err, result1) => {
              if (err) {
                console.error(err);
                res.status(400).send('Error in Language Id.');
              } else {
                if (result1 && result1.length > 0) {
                  res.status(200).json({
                    type: 'transcription',
                    user_id: result[0].user_id,
                    audio_id: result1[0]['audio_id'],
                  });
                } else {
                  res
                    .status(400)
                    .send(
                      'No projects exists for this language currently. We will inform you once projects are available'
                    );
                }
              }
            });
          } else if (req.query.type == 'segmentation-course') {
            //Add Segmentation Type Here
            var getAudioIdSQL = `SELECT * FROM audio WHERE Language_id=${req.query.language_id} AND is_guided="${req.query.is_guided}" and type="segmentation" and segmentation_course_type="${req.query.segmentation_course_type}"`;
            pool.query(getAudioIdSQL, (err, result1) => {
              if (err) {
                console.error(err);
                res.status(400).send('Error in Language Id.');
              } else {
                if (result1 && result1.length > 0) {
                  res.status(200).json({
                    type: 'segmentation-course',
                    user_id: result[0].user_id,
                    audio_id: result1[0]['audio_id'],
                  });
                } else {
                  res
                    .status(400)
                    .send(
                      'No projects exists for this language currently. We will inform you once projects are available'
                    );
                }
              }
            });
          }
        }
      }
    });
  } else {
    res
      .status(400)
      .send('Error in URL. Please use webapp to access this location.');
  }
};

module.exports = {
  getLandingRoute,
  getLandingRouteForReactLT,
};
