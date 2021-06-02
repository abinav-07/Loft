//Database Connection
const pool = require("../config/pool");

const insertIntoTranscription = (req, res) => {
    const sql = `
    INSERT INTO transcription(div_className, div_title, segment_start, segment_end, annotation_text, user_id, audio_id) 
    VALUES('${req.body.speakerName}', '${req.body.annotationType}', '${req.body.segmentStart}', '${req.body.segmentEnd}', 
    '${req.body.annotationText.replace(/'/g, "\\'")}', '${req.body.user_id}', '${req.body.audio_id}')
    `;
    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res
                .status(400)
                .send("error in get /insert-into-transcription-table query.");
        }
        res.status(200).send(result);
    });
}

const getTranscriptionSegments = (req, res) => {
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
        res.status(200).send(result);        
    });
}

const updateTranscriptionTable = (req, res) => {
    const sql = `
            Update transcription
            SET  annotation_text = '${req.body.annotationText.replace(/'/g, "\\'")}',
            div_className = '${req.body.speakerName}',div_title = '${req.body.annotationType}'
            WHERE segment_id = '${req.body.segmentId}'
            AND user_id = '${req.body.user_id}'
            AND audio_id = '${req.body.audio_id}'
            `;

    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(400).send("error in get /update-transcription-table query.");
        }
        res.status(200).send(result);
    });
}

const getSubmittedBooleanForTranscription = (req, res) => {
    const sql = `
            Select users_audio_id,is_submitted,status,user_id FROM users_audio
            WHERE
            user_id = '${req.body.user_id}'
            AND audio_id = '${req.body.audio_id}'
            AND type="transcription"
            `;

    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(400).send("error in get /get-submitted-or-not-transcription query.");
        }
        res.status(200).send(result);

    });
}

module.exports = {
    insertIntoTranscription,
    updateTranscriptionTable,
    getSubmittedBooleanForTranscription,
    getTranscriptionSegments
}