//Database Connection
const pool = require('../config/pool');

const getTransperfectPage = (req, res, next) => {
  try {
    if (!req.query.user_id || !req.query.audio_id) {
      throw 'Missing params';
    }
    let check_sql;
    check_sql = `SELECT * FROM audio WHERE audio_id='${req.query.audio_id}'`;
    pool.query(check_sql, (err, result) => {
      if (err) {
        console.error(err);
        res.status(400).send(err);
      }
      if (result && result.length > 0) {
        audio_url = result[0]['audio_url'];

        res.render('transperfect/index', {
          user_id: req.query.user_id,
          audio_url: audio_url,
          audio_name: result[0]['audio_name'],
          audio_id: req.query.audio_id,
        });
      }
    });
  } catch (error) {
    res.status(400).json({ message: error });
  }
};

module.exports = {
  getTransperfectPage,
};
