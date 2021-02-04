//Database Connection
const pool = require("../config/pool");
const async = require("async");
const bcrypt = require("bcryptjs");

const getAdminLoginPage = (req, res) => {
    res.render("adminLogin");
}

const getAdminReviewPage = (req, res) => {
    res.render("admin_reviewing_table");
}

const getTranscriptionAdminPage = (req, res) => {
    res.render("transcription-admin-table");
}

const getTrainingAdminPage = (req, res) => {
    res.render("training_admin_table");
}

//get data from users table to admin-review table
const adminReviewTableDatas = (req, res) => {
    let sql = `Select
                audio.audio_id,
                audio.audio_name,
                users_audio.users_audio_id,
                users_audio.user_id,
                users_audio.audio_id, CONVERT_TZ(users_audio.start_time, '+00:00', '+05:45') start_time,
                CONVERT_TZ(users_audio.end_time, '+00:00', '+05:45') end_time, 
                users_audio.overall_score, users.name,users.email, users_audio.status,reviewer_logs.status_changed_time,
                reviewer_logs.reviewer_id,reviewers.id,reviewers.reviewer_email from users_audio
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
        res.status(200).send(result);
    });
}

const adminTranscriptionReviewTableDatas = (req, res) => {
    let sql = `
    Select audio.audio_id, 
    audio.audio_name, 
    audio.Language_id,
    users_audio.users_audio_id, 
    users_audio.user_id, 
    users_audio.audio_id, CONVERT_TZ(users_audio.start_time, '+00:00', '+05:45') start_time,
    CONVERT_TZ(users_audio.end_time, '+00:00', '+05:45') end_time, users_audio.transcription_score, 
    users.name,users.email, users_audio.status, reviewer_logs.status_changed_time,reviewer_logs.reviewer_id,
    reviewers.id,reviewers.reviewer_email
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
                .send("error in get /transcription-admin-review-table-datas query.");
        }

        res.status(200).send(result);

    });
}

const adminTrainingReviewTableDatas = (req, res) => {
    let sql = `
    Select audio.audio_id, audio.audio_name, users_audio.users_audio_id, users_audio.user_id, users_audio.audio_id, 
    CONVERT_TZ(users_audio.start_time, '+00:00', '+05:45') start_time,
    CONVERT_TZ(users_audio.end_time, '+00:00', '+05:45') end_time, users_audio.overall_score, users.name,users.email, 
    users_audio.status,audio.audio_order, reviewer_logs.status_changed_time,reviewer_logs.reviewer_id,reviewers.id,
    reviewers.reviewer_email
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
    //AND audio.audio_order IS NOT NULL For Segmentation Course LT

    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res
                .status(400)
                .send("error in get /training-admin-review-table-datas query.");
        }

        res.status(200).send(result);
    });
}

const confirmPassFailAdmin = (req, res) => {
    //This is equal to user_audio_id
    if (req.body.userId) {
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
            res.status(200).send(result);
        });
    } else {
        res.status(400).send("Body Missing userId")
    }
}

const getWebAppIdForAdmin = (req, res) => {
    //This is equal to user_audio_id
    if (req.body.userId) {
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
            res.status(200).send(result);
        });
    } else {
        res.status(400).send("Body Missing userId")
    }
}

const getAdminClickedUserId = (req, res) => {
    if (req.body.clicked_user_id) {
        let sql = `
            Select users_audio.user_id, users_audio.audio_id FROM users_audio
            WHERE users_audio_id = "${req.body.clicked_user_id}"
            `;
        pool.query(sql, (err, result) => {
            if (err) {
                console.error(err);
                res.status(400).send("error in get /admin-click-get-user-id query.");
            }
            res.status(200).send(result);
        });
    } else {
        res.status(400).send("Body Missing clicked_user_id");
    }
}

module.exports = {
    getAdminLoginPage,
    getAdminReviewPage,
    getTranscriptionAdminPage,
    getTrainingAdminPage,
    adminReviewTableDatas,
    adminTranscriptionReviewTableDatas,
    adminTrainingReviewTableDatas,
    confirmPassFailAdmin,
    getWebAppIdForAdmin,
    getAdminClickedUserId
}