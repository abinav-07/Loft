//Database Connection
const pool = require("../config/pool");

const getQuizQuestion=async (req,res)=>{
    const segmentation_quiz_questions = await new Promise((resolve, reject) => {
        const sql = `SELECT * FROM segmentationQuestions`;

        pool.query(sql, (err, result) => {
            if (err) {
                res.status(400).send(err);
            }
            if (result && result.length > 0) {
                return resolve(result);
            } else {
                return resolve();
            }
        })
    });

    const segmentation_quiz_answers = await new Promise((resolve, reject) => {
        const sql = `SELECT * FROM segmentationAnswers`;

        pool.query(sql, (err, result) => {
            if (err) {
                res.status(400).send(err);
            }
            if (result && result.length > 0) {
                return resolve(result);
            } else {
                return resolve();
            }
        })
    });

    const segmentationQuestions=[];

    if(segmentation_quiz_questions && segmentation_quiz_questions.length>0){
        for(var i=0;i<segmentation_quiz_questions.length;i++){
            var newObject={
                question_id:segmentation_quiz_questions[i]["questionNo"],
                title:segmentation_quiz_questions[i]["question"],
                type:segmentation_quiz_questions[i]["type"],
                options:[]
            }
            segmentationQuestions.push(newObject);
        }
    }

    if(segmentation_quiz_answers && segmentation_quiz_answers.length>0){
        for(var i=0;i<segmentation_quiz_answers.length;i++){
            var newAnswerObject={
                answer_id:segmentation_quiz_answers[i]["id"],
                title:segmentation_quiz_answers[i]["answer"],
                isCorrect:segmentation_quiz_answers[i]["is_correct"]
            }
            segmentationQuestions.filter((question,index)=>{
                if(question.question_id===segmentation_quiz_answers[i]["questionNo"]){
                    segmentationQuestions[index]["options"].push(newAnswerObject);
                }
            });
        }
    }
    res.status(200).send(segmentationQuestions);

}

module.exports={
    getQuizQuestion
}

