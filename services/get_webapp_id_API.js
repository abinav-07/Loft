//Database Connection
const pool = require("../config/pool");

const getWebAppId = (req, res) => {
    var sql = `SELECT * FROM users 
    WHERE user_id=${req.body.user_id}`;

    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(400).send("error in post /get-web-app-id");
        }
        res.status(200).send(result);
    });
}

const getLanguageId = (req, res) => {
    if (req.body.audio_id) {
        var sql = `SELECT Language_id FROM audio
           WHERE audio_id=${req.body.audio_id}`;
        pool.query(sql, (err, result) => {
            if (err) {
                console.error(err);
                res.status(400).send("error in post /get-language-id");
            }
            res.status(200).send(result);
        });
    } else {
        res.status(400).send("Body Missing Audio Id");
    }

}

module.exports = {
    getWebAppId,
    getLanguageId
}