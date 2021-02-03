//Database Connection
const pool = require("../config/pool");
const async = require("async");
const bcrypt = require("bcryptjs");
const { Passport } = require("passport");
const passport = require("passport");

const registerHR = async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        let checkSql = `SELECT * FROM reviewers 
                    WHERE reviewer_email='${req.body.email}'`;
        pool.query(checkSql, (err, result) => {
            if (result && result.length > 0) {
                res.redirect("/hr-login-form");
            } else {
                let sql = `
                        INSERT INTO reviewers(reviewer_email,reviewer_password)
                        VALUES ("${req.body.email}","${hashedPassword}")        
                        `;
                ////console.log(sql);
                pool.query(sql, (err, result2) => {
                    if (err) {
                        console.error(err);
                        res.status(400).send("error in post /register-hr.");
                    }
                    res.redirect("/hr-login-form");
                });
            }
        });
    } catch (err) {
        res.redirect("/hr-login-form");
    }
}

const registerHRReact = async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        let checkSql = `SELECT * FROM reviewers 
                    WHERE reviewer_email='${req.body.email}'`;
        pool.query(checkSql, (err, result) => {
            if (result && result.length > 0) {
                res.status(400).send("HR Already Registered");
            } else {
                let sql = `
                        INSERT INTO reviewers(reviewer_email,reviewer_password)
                        VALUES ("${req.body.email}","${hashedPassword}")        
                        `;
                ////console.log(sql);
                pool.query(sql, (err, result2) => {
                    if (err) {
                        console.error(err);
                        res.status(400).send("error in post /register-hr.");
                    }
                    res.status(200).json(result2);
                });
            }
        });
    } catch (err) {
        res.status(400).json(err);
    }
}

const loginHRReact = (req, res) => {
    if (req.body.loginFor == "training") {
        res.status(200).send("/training-hr-review-table");
    } else if (req.body.loginFor == "sample-test") {
        res.status(200).send("/hr-review-table");
    } else if (req.body.loginFor == "transcription") {
        res.status(200).send("/transcription-hr-review-table");
    } else if (req.body.loginFor == "signature-list") {
        res.status(200).send("/signature/backend/list");
    }
}

const loginHR = (req, res) => {
    if (req.body.loginFor == "training") {
        res.redirect("/training-hr-review-table");
    } else if (req.body.loginFor == "sample-test") {
        res.redirect("/hr-review-table");
    } else if (req.body.loginFor == "transcription") {
        res.redirect("/transcription-hr-review-table");
    } else if (req.body.loginFor == "signature-list") {
        res.redirect("/signature/backend/list");
    }
}

const logoutHR = (req, res) => {
    req.logout();
    res.redirect("/hr-login-form");
}

const logoutHRReact = (req, res) => {
    req.logout();
    res.status(200).send("/hr-login-form");
}

const hrReviewTable = (req, res) => {
    res.render("hr_reviewing_table", {
        // reviewerId: req.session["passport"]["user"]
        reviewerId: req.user.id,
        reviewerEmail: req.user.reviewer_email,
    });
}

const hrReviewTableReact = (req, res) => {
    res.status(200).json({
        reviewerId: req.user.id,
        reviewerEmail: req.user.reviewer_email,
    });
}

const hrTrainingTable = (req, res) => {
    res.render("training_hr_table", {
        reviewerId: req.user.id,
        reviewerEmail: req.user.reviewer_email,
    });
}

const hrTrainingTableReact = (req, res) => {
    res.status(200).json({
        reviewerId: req.user.id,
        reviewerEmail: req.user.reviewer_email,
    });
}

const hrTranscriptionTable = (req, res) => {
    res.render("transcription_hr_table", {
        reviewerId: req.user.id,
        reviewerEmail: req.user.reviewer_email,
    });
}

const hrTranscriptionTableReact = (req, res) => {
    res.status(200).json({
        reviewerId: req.user.id,
        reviewerEmail: req.user.reviewer_email,
    });
}

const hrTableDatas = (req, res) => {
    let sql = `
            Select audio.audio_id, audio.audio_name, users_audio.users_audio_id, users_audio.user_id, 
            users_audio.audio_id, CONVERT_TZ(users_audio.start_time, '+00:00', '+05:45') start_time,
            CONVERT_TZ(users_audio.end_time, '+00:00', '+05:45') end_time, users_audio.overall_score, 
            users.name,users.email, users_audio.status
            from users_audio
            JOIN users
            ON users_audio.user_id = users.user_id
            JOIN audio
            ON users_audio.audio_id = audio.audio_id
            WHERE (users_audio.status IS NULL OR users_audio.status = 'RETRY')
            AND audio.is_training = "FALSE" 
            AND audio.type="segmentation"
            ORDER BY users_audio.start_time DESC`;

    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(400).send("error in get /hr-review-table-datas query.");
        }
        //console.log(result);
        res.status(200).send(result);
    });
}

const hrTrainingTableDatas = (req, res) => {
    let sql = `
    Select audio.audio_id, audio.audio_name, users_audio.users_audio_id, users_audio.user_id, users_audio.audio_id, 
    CONVERT_TZ(users_audio.start_time, '+00:00', '+05:45') start_time,
    CONVERT_TZ(users_audio.end_time, '+00:00', '+05:45') end_time, users_audio.overall_score, 
    users.name,users.email, users_audio.status,audio.audio_order
    from users_audio, users , audio WHERE
    users_audio.user_id = users.user_id
    AND users_audio.audio_id = audio.audio_id
    AND (users_audio.status IS NULL OR users_audio.status = 'RETRY')
    AND audio.is_training = "TRUE"   
    ORDER BY users.user_id asc,audio.audio_order DESC`;
    //Commented Out
    //AND audio.audio_order IS NOT NULL
    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res
                .status(400)
                .send("error in get /training-hr-review-table-datas query.");
        }
        ////console.log(result[0]);
        res.status(200).send(result);
    });
}

const hrTranscriptionTableDatas = (req, res) => {
    let sql = `
    Select audio.audio_id,
    audio.Language_id,
    audio.audio_name, 
    users_audio.users_audio_id,
    users_audio.user_id,
    users_audio.audio_id,
    CONVERT_TZ(users_audio.start_time, '+00:00', '+05:45') start_time,
    CONVERT_TZ(users_audio.end_time, '+00:00', '+05:45') end_time, 
    users_audio.transcription_score, users.name,users.email, users_audio.status
    from users_audio, users , audio WHERE
    users_audio.user_id = users.user_id
    AND users_audio.audio_id = audio.audio_id
    AND (users_audio.status IS NULL OR users_audio.status = 'RETRY')
    AND users_audio.type="transcription"    
    ORDER BY users_audio.start_time DESC`;

    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res
                .status(400)
                .send("error in get /training-hr-review-table-datas query.");
        }
        ////console.log(result[0]);
        res.status(200).send(result);
        // //console.log(sql);
    });
}

const setEndTimeNullOnRetry = (req, res) => {
    if (req.body.user_id) {
        var check_in_users_audio_logs = `SELECT * FROM users_audio_logs WHERE users_audio_id=${req.body.user_id}`;
        pool.query(check_in_users_audio_logs, (err, result) => {
            if (err) {
                console.error(err);
            }
            if (result && result.length < 2) {
                var setStatusNull = `Update users_audio SET status="RETRY", end_time=NULL WHERE users_audio_id=${req.body.user_id}`;
                pool.query(setStatusNull, (resetErr, resetResult) => {
                    if (resetErr) {
                        console.error(resetErr);
                        res.status(400).send("error in get /reset-transcription-data-for-retry.");
                    }
                    var insert_into_users_logs_sql = `INSERT INTO users_audio_logs(users_audio_id,status) VALUES (${req.body.user_id},"RETRY")`;
                    pool.query(insert_into_users_logs_sql, (err1, result1) => {
                        if (err1) {
                            console.error(resetErr);
                            res.status(400).send("error in get /insert-users_audio_logs-data-for-retry.");
                        }
                        res.status(200).send(result1);
                    })
                    //console.log(resetResult)
                })
            } else if (result && result.length >= 2) {
                //Set Fail if more than 2 retries
                var setStatusFail = `Update users_audio SET status="FAIL", is_submitted="TRUE" WHERE users_audio_id=${req.body.user_id}`;
                pool.query(setStatusFail, (err, result3) => {
                    if (err) {
                        console.error(err);
                        res.status(400).send("error in get /update-users_audio-data-for-retry.");
                    }
                    res.status(200).send(result3);
                })
            } else {
                var setStatusNull = `Update users_audio SET status="RETRY", end_time=NULL WHERE users_audio_id=${req.body.user_id}`;
                pool.query(setStatusNull, (resetErr, resetResult) => {
                    if (resetErr) {
                        console.error(resetErr);
                        res.status(400).send("error in get /reset-transcription-data-for-retry.");
                    }
                    var insert_into_users_logs_sql = `INSERT INTO users_audio_logs(users_audio_id,status) VALUES (${req.body.user_id},"RETRY")`;
                    pool.query(insert_into_users_logs_sql, (err1, result1) => {
                        if (err1) {
                            console.error(err1);
                            res.status(400).send("error in get /insert-users_audio_logs-data-for-retry.");
                        }
                        res.status(200).send(result1);
                    })
                    //console.log(resetResult)
                })
            }
        })

    } else {
        res.status(400).send("Missing User Id");
    }
}

const setEndTimeNullOnRetrySegmentationCourse = (req, res) => {
    if (req.body.user_id) {
        var check_in_users_audio_logs = `SELECT * FROM users_audio_logs WHERE users_audio_id=${req.body.user_id}`;
        pool.query(check_in_users_audio_logs, (err, result) => {
            if (err) {
                console.error(err);
            }
            if (result && result.length > 0) {
                var setStatusNull = `Update users_audio SET status="RETRY", end_time=NULL WHERE users_audio_id=${req.body.user_id}`;
                pool.query(setStatusNull, (resetErr, resetResult) => {
                    if (resetErr) {
                        console.error(resetErr);
                        res.status(400).send("error in get /reset-transcription-data-for-retry.");
                    }
                    res.status(200).send(resetResult);
                });
            }
        });
    } else {
        res.status(400).send("Missing User Id");
    }
}

const resetTranscriptionDataOnRetry = (req, res) => {
    if (req.body.user_id) {
        var check_in_users_audio_logs = `SELECT * FROM users_audio_logs WHERE users_audio_id=${req.body.user_id}`;
        pool.query(check_in_users_audio_logs, (err1, checkResult) => {
            if (err1) {
                console.error(err1);
                res.status(400).send("error in get /select-users_audio_logs-data-for-retry.");
            }
            //console.log(checkResult);
            if (checkResult && checkResult.length < 2) {
                var reset_sql = `Update transcription 
                    SET annotation_text=""
                    WHERE user_id IN (
                        SELECT users_audio.user_id FROM users_audio
                        WHERE users_audio_id = "${req.body.user_id}"
                    ) AND audio_id IN (
                        SELECT users_audio.audio_id FROM users_audio
                        WHERE users_audio_id = "${req.body.user_id}"
                    )
                `;

                pool.query(reset_sql, (err, result) => {
                    if (err) {
                        console.error(err);
                        //res.status(400).send("error in get /reset-transcription-data-for-retry.");
                    }
                    var setStatusNull = `Update users_audio SET status="RETRY", end_time=NULL WHERE users_audio_id=${req.body.user_id} AND type="transcription"`;
                    //console.log(setStatusNull);
                    pool.query(setStatusNull, (resetErr, resetResult) => {
                        if (resetErr) {
                            console.error(resetErr);
                            res.status(400).send("error in get /reset-transcription-data-for-retry.");
                        }
                        var insert_into_users_logs_sql = `INSERT INTO users_audio_logs(users_audio_id,status) VALUES (${req.body.user_id},"RETRY")`;
                        pool.query(insert_into_users_logs_sql, (err1, result1) => {
                            if (err1) {
                                console.error(resetErr);
                                res.status(400).send("error in get /insert-users_audio_logs-data-for-retry-transcription.");
                            }
                        })
                        //console.log(resetResult)
                    })
                    res.status(200).send(result);
                });
            } else if (checkResult && checkResult.length >= 2) {

                //Set Fail if more than 2 retries
                var setStatusFail = `Update users_audio SET status="FAIL", is_submitted="TRUE" WHERE users_audio_id=${req.body.user_id}`;
                pool.query(setStatusFail, (err, result3) => {
                    if (err) {
                        console.error(err);
                        res.status(400).send("error in get /update-users_audio-data-for-retry.");
                    }
                    res.status(200).send(result3);
                })

            } else {
                var reset_sql = `Update transcription 
                    SET annotation_text=""
                    WHERE user_id IN (
                        SELECT users_audio.user_id FROM users_audio
                        WHERE users_audio_id = "${req.body.user_id}"
                    ) AND audio_id IN (
                        SELECT users_audio.audio_id FROM users_audio
                        WHERE users_audio_id = "${req.body.user_id}"
                    )
    `;

                pool.query(reset_sql, (err, result) => {
                    if (err) {
                        console.error(err);
                        //res.status(400).send("error in get /reset-transcription-data-for-retry.");
                    }
                    var setStatusNull = `Update users_audio SET status="RETRY", end_time=NULL WHERE users_audio_id=${req.body.user_id} AND type="transcription"`;
                    //console.log(setStatusNull);
                    pool.query(setStatusNull, (resetErr, resetResult) => {
                        if (resetErr) {
                            console.error(resetErr);
                            res.status(400).send("error in get /reset-transcription-data-for-retry.");
                        }
                        var insert_into_users_logs_sql = `INSERT INTO users_audio_logs(users_audio_id,status) VALUES (${req.body.user_id},"RETRY")`;
                        pool.query(insert_into_users_logs_sql, (err1, result1) => {
                            if (err1) {
                                console.error(resetErr);
                                res.status(400).send("error in get /insert-users_audio_logs-data-for-retry-transcription.");
                            }
                        })
                        //console.log(resetResult)
                    })
                    res.status(200).send(result);
                });
            }
        })
    } else {
        res.status(400).send("Missing User Id");
    }
}

const confirmPassFailHR = (req, res) => {
    //This is equal to users_audio_id
    if (req.body.userId) {
        let sql = `
            UPDATE users_audio
            SET status = "${req.body.changedPassFailValue}",
            is_submitted= "TRUE"
            WHERE users_audio_id = "${req.body.userId}"
            `;

        pool.query(sql, (err, result) => {
            if (err) {
                console.error(err);
                res.status(400).send("error in get /confirm-pass-fail-hr-review query.");
            }
            var check_in_users_audio_logs = `SELECT * FROM users_audio_logs WHERE users_audio_id=${req.body.userId}`;
            pool.query(check_in_users_audio_logs, (err1, result1) => {
                if (err1) {
                    console.log(err1);
                }
                if (result1 && result1.length > 0) {
                    var setStatusLog = `UPDATE users_audio_logs SET status="${req.body.changedPassFailValue}" WHERE users_audio_id=${req.body.userId} AND id=${result1[result1.length - 1].id}`
                    pool.query(setStatusLog, (err2, result2) => {
                        if (err2) {
                            console.log(err2);
                        }
                    })
                }
            });

            let update_sql_on_retry = `
        UPDATE users_audio
        SET is_submitted= "FALSE"
        WHERE status = "RETRY"
        `;
            pool.query(update_sql_on_retry, (err, retryResult) => {
                if (err) {
                    console.error(err);
                    res.status(400).send("error in get /retry-hr-review query.");
                }
            });

            res.status(200).send(result);
        });
    } else {
        res.status(400).send("Missing User Id");
    }
}

const getHRClickedUserId = (req, res) => {
    //This is equal to users_audio_id
    if (req.body.clicked_user_id) {
        let sql = `
                        Select users_audio.user_id, users_audio.audio_id, 
                        users_audio.is_submitted FROM users_audio
                        WHERE users_audio_id = "${req.body.clicked_user_id}"
                        `;
        pool.query(sql, (err, result) => {
            if (err) {
                console.error(err);
                res.status(400).send("error in get /hr-click-get-users-id query.");
            }
            res.status(200).send(result);
        });
    } else {
        res.status(400).send("Missing Clicked User Id");
    }
}

const getWebAppIdForHR = (req, res) => {
    //This is equal to users_audio_id
    if (req.body.userId) {
        let sql = `
        SELECT users.web_app_id FROM users
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
        res.status(400).send("Missing User Id");
    }

}

module.exports = {
    registerHR,
    registerHRReact,
    loginHR,
    loginHRReact,
    logoutHR,
    logoutHRReact,
    hrReviewTable,
    hrReviewTableReact,
    hrTrainingTable,
    hrTrainingTableReact,
    hrTranscriptionTable,
    hrTranscriptionTableReact,
    hrTableDatas,
    hrTrainingTableDatas,
    hrTranscriptionTableDatas,
    setEndTimeNullOnRetry,
    setEndTimeNullOnRetrySegmentationCourse,
    resetTranscriptionDataOnRetry,
    confirmPassFailHR,
    getHRClickedUserId,
    getWebAppIdForHR,
    
}