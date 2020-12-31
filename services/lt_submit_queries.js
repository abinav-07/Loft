//Database Connection
const pool = require("../config/pool");

const submitButtonClickSegmentation = (req, res) => {
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
                .send("error in get /save-test-score-on-users_audio_table query.");
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
                var update_end_time_in_users_logs = `UPDATE 
                                                    users_audio_logs SET end_time=NOW() 
                                                    WHERE 
                                                    end_time IS NULL users_audio_id 
                                                    IN (SELECT users_audio_id FROM users_audio 
                                                    WHERE
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
        res.status(200).send(result);
    });
}

//Save Test Score on Submit Click for transcription
const submitButtonClickTranscription = (req, res) => {
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
                .send("error in get /save-test-score-on-users_audio_table-for-transcription query.");
        }
        //console.log(result);
        var check_in_users_audio_logs = `SELECT * FROM users_audio_logs
                                        WHERE
                                        users_audio_id
                                        IN 
                                        (SELECT users_audio_id FROM users_audio 
                                        WHERE
                                        user_id = "${req.body.user_id}"
                                        AND audio_id = "${req.body.audio_id}"
                                        AND type="transcription" )`;
        pool.query(check_in_users_audio_logs, (err1, result1) => {
            if (err1) {
                console.log(err1);
            }
            if (result1 && result1.length > 0) {
                var update_end_time_in_users_logs = `UPDATE
                                                    users_audio_logs 
                                                    SET end_time=NOW() 
                                                    WHERE end_time IS NULL AND users_audio_id 
                                                    IN 
                                                    (SELECT users_audio_id FROM users_audio 
                                                    WHERE
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
        res.status(200).send(result);
    });
}

module.exports = {
    submitButtonClickSegmentation,
    submitButtonClickTranscription
}