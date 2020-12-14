//Database Connection

const pool = require("../config/pool");

const getQuizQuestion = async (req, res) => {
    if (req.body.user_id) {
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

                    //Check Initial User Status
                    const checkSql = `SELECT * FROM segmentationQuizStatus 
                        WHERE user_id=${req.body.user_id}        
                    `;
                    pool.query(checkSql, (err1, result1) => {
                        if (err1) {
                            console.log(err1);
                        }
                        if (result1 && result1.length > 0) {
                            return;
                        } else if (result1 && !result1.length > 0) {
                            //Insert Iniitial User Status
                            const insertSql = `INSERT INTO segmentationQuizStatus
                                                (user_id,status)
                                                VALUE (${req.body.user_id},"in progress")
                                                `;
                            pool.query(insertSql, (err2, result2) => {
                                if (err2) {
                                    res.status(400).send("Error While Inserting Initial User Status");
                                }
                                return;
                            })
                        }
                    });

                    //Inserting Initial Status End

                    //Return Quiz Answers
                    return resolve(result);
                } else {
                    return resolve();
                }
            })
        });

        //New Array to Store Quiz
        const segmentationQuestions = [];
        //Pushing Questions
        if (segmentation_quiz_questions && segmentation_quiz_questions.length > 0) {
            for (var i = 0; i < segmentation_quiz_questions.length; i++) {
                var newObject = {
                    question_id: segmentation_quiz_questions[i]["questionNo"],
                    title: segmentation_quiz_questions[i]["question"],
                    type: segmentation_quiz_questions[i]["type"],
                    options: []
                }
                segmentationQuestions.push(newObject);
            }
        }

        //Pushing Options
        if (segmentation_quiz_answers && segmentation_quiz_answers.length > 0) {
            for (var i = 0; i < segmentation_quiz_answers.length; i++) {
                var newAnswerObject = {
                    answer_id: segmentation_quiz_answers[i]["id"],
                    title: segmentation_quiz_answers[i]["answer"],
                    isCorrect: segmentation_quiz_answers[i]["is_correct"]
                }
                segmentationQuestions.filter((question, index) => {
                    if (question.question_id === segmentation_quiz_answers[i]["questionNo"]) {
                        segmentationQuestions[index]["options"].push(newAnswerObject);
                    }
                });
            }
        }
        res.status(200).send(segmentationQuestions);
    } else {
        res.status(400).send("User Id Not Sent.");
    }


}

const saveUserStatus = async (req, res) => {

    const { quizData } = req.body;
    if (quizData.length > 0) {

        let questions = [];

        //Pushing Questions
        for (var i = 0; i < quizData.length; i++) {            
            var questionObj = {
                question_id: quizData[i].question_id,
                answers: []
            }
            questions.push(questionObj);
        }
        
        //Get All Segmetation Quiz Answers
        const getAnswersSql = `SELECT * FROM segmentationAnswers WHERE
                            questionNo IN (
                                ${quizData.map(eachQuestion => eachQuestion.question_id)}
                            )       
                            AND is_correct=1
        `;
        return await new Promise((resolve, reject) => {
            pool.query(getAnswersSql, async (err, result) => {
                if (err) {
                    console.log(err)
                }

                //Boolean to Check Correct Answers
                var checkCorrectAnswersBool = true;

                if (result && result.length > 0) {
                    //Pushing Correct Answers
                    for (var i = 0; i < result.length; i++) {
                        for (var j = 0; j < questions.length; j++) {
                            if (result[i]["questionNo"] === questions[j]["question_id"]) {
                                questions[j].answers.push(result[i]["id"]);
                            }
                        }
                    }                                 
                    
                    //Checking Correct Answers
                    for(var i=0;i<quizData.length;i++){
                        for(var j=0;j<questions.length;j++){
                            if(questions[j]["question_id"]===quizData[i]["question_id"]){                                
                                if(JSON.stringify(questions[j]["answers"])!==JSON.stringify(quizData[i]["answer_id"])){
                                    checkCorrectAnswersBool = false;
                                    break;
                                }
                            }
                        }
                    }                    

                    if (checkCorrectAnswersBool) {
                        await new Promise((resolve1,reject1)=>{
                            const updateUserStatusSql=`Update segmentationQuizStatus 
                                                        SET status="completed",
                                                        result="passed"
                                                        WHERE 
                                                        user_id=${req.body.user_id}
                            `;
                            pool.query(updateUserStatusSql,(err1,result1)=>{
                                if(err1){
                                    console.log(err1);
                                    res.status(400).send(err1);
                                }
                                res.status(200).send("Success");
                            })
                        }) 
                        
                    } else {
                        res.status(400).send("Fail");
                    }
                } else {
                    res.status(400).send("Question Not Found");
                }
            })
        })

    } else {
        res.status(400).send("Result Not Sent.")
    }
}

module.exports = {
    getQuizQuestion,
    saveUserStatus
}

