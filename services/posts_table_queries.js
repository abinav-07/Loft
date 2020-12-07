const express = require("express");
//Database Connection
const pool = require("../config/pool");

//Insert Segments Into POST Table Database
const insertIntoPosts = (req, res) => {
    const sql = `
            INSERT INTO posts(div_className, div_title, segment_start, segment_end, annotation_text, user_id, audio_id) VALUES('${req.body.speakerName}', '${req.body.annotationType}', '${req.body.segmentStart}', '${req.body.segmentEnd}', '${req.body.annotationText.replace(/'/g, "\\'")}', '${req.body.user_id}', '${req.body.audio_id}')
            `;
    // //console.log(sql);
    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(400).send("error in get /database query.");
        }
        //console.log("Data Inserted");
        res.status(200).send(result);
    });
}

//Get Segments From Posts
const getSegmentsFromPosts = (req, res) => {
    const sql = `
    Select * FROM posts
    WHERE
    posts.user_id = '${req.body.user_id}'
    AND posts.audio_id = '${req.body.audio_id}'
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

//Get Submitted Boolean For Segmentation
const getSubmittedBooleanForSegmentation=(req,res)=>{
    const sql = `
            Select users_audio.is_submitted FROM users_audio
            WHERE
            user_id = '${req.body.user_id}'
            AND audio_id = '${req.body.audio_id}'
            AND type="segmentation"
            `;
    
    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(400).send("error in get /get-submitted-or-not query.");
        }
        res.status(200).send(result);
    });
}

//Update Posts Table
const updatePosts = (req, res) => {
    const sql = `
    Update posts
    SET div_className = '${req.body.speakerName}', div_title = '${req.body.annotationType}',
    segment_start = '${req.body.segmentStart}', segment_end = '${req.body.segmentEnd}', 
    annotation_text = "${req.body.annotationText != "undefined"
            ? req.body.annotationText.replace(/'/g, "\\'")
            : ""}"
    WHERE segment_id = '${req.body.segmentId}'
    AND user_id = '${req.body.user_id}'
    AND audio_id = '${req.body.audio_id}'
    `;

    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(400).send("error in get /updatedatabase query.");
        }
        //console.log("Updated");
        res.status(200).send(result);
    });
}

//Update Segments in Posts Table of Database On Split
const updatePostsOnSplit = (req, res) => {
    const sql = `
    Update posts
    SET div_className = '${req.body.speakerName}', div_title = '${req.body.annotationType}', segment_start = '${req.body.segmentStart}', segment_end = '${req.body.segmentEnd}', annotation_text = '${req.body.annotationText.replace(/'/g, "\\'")}'
    WHERE segment_id = '${req.body.segmentId}'
    AND user_id = '${req.body.user_id}'
    AND audio_id = '${req.body.audio_id}'
    `;

    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(400).send("error in get /update-on-split query.");
        }
        res.status(200).send(result);
    });
}

//Delete Segments from posts Table
const deleteSegmentsFromPosts = (req, res) => {
    const sql = `
    DELETE FROM posts WHERE
    segment_id = '${req.body.regionId}'
    AND user_id = '${req.body.user_id}'
    AND audio_id = '${req.body.audio_id}'
    `;

    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(400).send("error in get /remove-segments query.");
        }
        res.status(200).send(result);
    });
}


//Save Segments For Top Speaker Control Save Button
const topSpeakerControlSavePosts = (req, res) => {
    const sql = `
    Update posts
    Set div_className = "${req.body.userInputTopSpeakerName}"
    WHERE user_id = "${req.body.user_id}"
    AND audio_id = "${req.body.audio_id}"
    AND div_className = "${req.body.previousTopSpeakerName}"
    `;
    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res
                .status(400)
                .send("error in get /top-speaker-control-save-button.");
        }
        res.status(200).send(result);        
    });
}

module.exports = {
    insertIntoPosts,
    getSegmentsFromPosts,
    updatePosts,
    updatePostsOnSplit,
    deleteSegmentsFromPosts,
    topSpeakerControlSavePosts,
    getSubmittedBooleanForSegmentation
}
