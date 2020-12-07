//Database Connection
const pool = require("../config/pool");

//Insert Segment into Transcription Tasks
const insertIntoTranscriptionTasksTable = (req, res) => {
    const sql = `
    INSERT INTO transcription_task_segments(div_className, div_title, segment_start, segment_end, annotation_text, audio_id) VALUES
    ('${req.body.speakerName}', '${req.body.annotationType}', '${req.body.segmentStart}', '${req.body.segmentEnd}', 
    '${req.body.annotationText.replace(/'/g, "\\'")}', '${req.body.audio_id}')
    `;

    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(400).send("error in get /insert-into-transcription-task-segments query.");
        }
        res.status(200).send(result);
    });
}

//Get Transcription Tasks Segments Table Segments
const getSegmentsFromTranscriptionTaskSegments = (req, res) => {
    const sql = `
            Select * FROM transcription_task_segments
            WHERE           
            transcription_task_segments.audio_id = '${req.body.audio_id}'
            ORDER BY segment_start
            `;
    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(400).send("error in get /transcription_task_segments query.");
        }
        res.status(200).send(result);

    });
}

//Update Segments in Transcription Tasks
const updateTranscriptionTasksTable = (req, res) => {
    const sql = `
    Update transcription_task_segments
    SET div_className = '${req.body.speakerName}', div_title = '${req.body.annotationType}',
     segment_start = '${req.body.segmentStart}', segment_end = '${req.body.segmentEnd}', 
    annotation_text = '${req.body.annotationText != "undefined"
            ? req.body.annotationText.replace(/'/g, "\\'")
            : ""}'
    WHERE segment_id = '${req.body.segmentId}'            
    AND audio_id = '${req.body.audio_id}'
    `;

    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(400).send("error in get /update-transcription-task-segment-table query.");
        }

        res.status(200).send(result);
    });
}

//Split Transcription Tasks Segments Table Segments
const updateTranscriptionTaskSegmentOnSplit = (req, res) => {
    const sql = `
            Update transcription_task_segments
            SET div_className = '${req.body.speakerName}', div_title = '${req.body.annotationType}', 
            segment_start = '${req.body.segmentStart}', segment_end = '${req.body.segmentEnd}', 
            annotation_text = '${req.body.annotationText.replace(/'/g, "\\'")}'
            WHERE segment_id = '${req.body.segmentId}'            
            AND audio_id = '${req.body.audio_id}'
            `;

    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(400).send("error in get /update-transcription-task-segments-on-split query.");
        }
        res.status(200).send(result);
    });
}

const deleteSegmentsFromTranscriptionTaskSegments = (req, res) => {
    const sql = `
            DELETE FROM transcription_task_segments WHERE
            segment_id = '${req.body.regionId}'            
            AND audio_id = '${req.body.audio_id}'
            `;
    
    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(400).send("error in get /remove-segments-from-transcription-task-segment query.");
        }
        res.status(200).send(result);
    });
}

const topSpeakerControlSaveTranscriptionTaskSegments=(req,res)=>{
    const sql = `
            Update transcription_task_segments
            Set div_className = "${req.body.userInputTopSpeakerName}"
            WHERE audio_id = "${req.body.audio_id}"
            AND div_className = "${req.body.previousTopSpeakerName}"
            `;
            
    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res
                .status(400)
                .send("error in get /top-speaker-control-save-button-for-transcription-task-segments query.");
        }        
        res.status(200).send(result);        
    });
}

module.exports = {
    insertIntoTranscriptionTasksTable,
    updateTranscriptionTasksTable,
    updateTranscriptionTaskSegmentOnSplit,
    getSegmentsFromTranscriptionTaskSegments,
    deleteSegmentsFromTranscriptionTaskSegments,
    topSpeakerControlSaveTranscriptionTaskSegments
}