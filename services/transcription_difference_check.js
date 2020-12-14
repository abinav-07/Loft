//Database Connection
const pool = require("../config/pool");
const async = require("async");
const diffCheck = require("diff");

//Route to check transcription text differences
const transcriptionDifferenceCheck = (req, res) => {
    var get_text_sql = `SELECT segment_id,div_className,segment_start,segment_end,annotation_text,actual_text 
                        FROM transcription 
                        WHERE
                        user_id=${req.body.user_id} AND audio_id=${req.body.audio_id}`;

    pool.query(get_text_sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(400).send("error in get /route-for-diff-check query");
        }        
        async.series(
            [
                function (cb) {
                    for (var i = 0; i < result.length; i++) {
                        if (
                            result[i]["annotation_text"] != null &&
                            result[i]["actual_text"] != null
                        ) {
                            var diff = diffCheck.diffWordsWithSpace(
                                result[i]["annotation_text"],
                                result[i]["actual_text"]
                            );
                            
                            result[i]["difference"] = diff;
                        }
                        var temp = i;
                        if (++temp >= result.length) {
                            cb(null);
                        }
                    }
                },
            ],
            (err, result2) => {
                res.status(200).send(result);
            }
        );       
    });
}

module.exports={
    transcriptionDifferenceCheck
}