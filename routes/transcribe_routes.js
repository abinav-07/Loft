const express = require("express");
const passport = require("passport");

//Landing Queries
const landingAPIs = require("../services/landing_APIs");
const segmentationCourseLandingAPIs = require("../services/segmentation_course_landing_APIs");
const segmentationLandingAPIs = require("../services/segmentation_landing_APIs");
const trainingLandingAPIs = require("../services/training_landing_APIs");
const transcriptionLandingAPIs = require("../services/transcription_landing_APIs");
const transcriptionTaskLandingAPIs = require("../services/transcription_task_landing_APIs");
const transcriptionReviewLandingAPIs = require("../services/transcription_review_landing_APIs");
const transcriptionDifferenceCheckAPIs = require("../services/transcription_difference_check");
const getWebAppIdAPI = require("../services/get_webapp_id_API");

//Table Queries
const postsTable = require('../services/posts_table_queries');
const actualTable = require("../services/actual_table_queries");
const transcriptionTable = require("../services/transcription_table_queries");
const transcriptionTaskSegmentsTable = require("../services/transcription_tasks_table_queries");
const submitLTQueries = require("../services/lt_submit_queries");
const ltFeedBackQueries = require("../services/lt_feedback_queries");

//Segmentation Course Queries
const segmentationCourseAPIs = require("../services/segmentation_course_menu_queries");
const segmentationQuizQuestionsAPIs = require("../services/segmentation_quiz_queries");

//HR, admin Queries
const hrReviewTableQueries = require("../services/hr_table_queries");
const adminReviewTableQueries=require("../services/admin_table_queries");

const router = express.Router();

//Landing Route APIs
router.get("/", landingAPIs.getLandingRoute);
router.get("/react-api/", landingAPIs.getLandingRouteForReactLT);

//Segmentation Course Landing Route
router.get("/segmentation-course", segmentationCourseLandingAPIs.getSegmentationCourseLandingRoute);
router.get("/react-api/segmentation-course-LT", segmentationCourseLandingAPIs.getSegmentationCourseLandingRouteForReactLT);

//Segmentation Landing Route APIs
router.get("/transcribe", segmentationLandingAPIs.getSegmentationLandingRoute);
router.get("/react-api/transcribe", segmentationLandingAPIs.getSegmentationLandingRouteForReactLT);

//Training Landing Route APIs
router.get("/training", trainingLandingAPIs.getTrainingLandingRoute);
router.get("/react-api/training", trainingLandingAPIs.getTrainingLandingRouteReactLT);

//Transcription Landing Route APIs
router.get("/transcription", transcriptionLandingAPIs.getTranscriptionLandingRoute);
router.get("/react-api/transcription", transcriptionLandingAPIs.getTranscriptionLandingRouteReactLT);

//Transcription Tasks Landing Route APIs
router.get("/transcription-task", transcriptionTaskLandingAPIs.getTranscriptionTaskLandingRoute);
router.get("/react-api/transcription-task", transcriptionTaskLandingAPIs.getTranscriptionTaskLandingRouteReactLT);

//Transcription Review Landing Routes APIs
router.get("/transcription-review", transcriptionReviewLandingAPIs.getTranscriptionReviewLandingRoute);
router.get("/react-api/transcription-review", transcriptionReviewLandingAPIs.getTranscriptionReviewLandingRouteReactLT);

//Transcription Text Difference Check Route
//Post Route in Transcription Because of Initially the request was for post but not now
router.post("/route-for-diff-check", transcriptionDifferenceCheckAPIs.transcriptionDifferenceCheck);
router.get("/react-api/transcription-difference-check", transcriptionDifferenceCheckAPIs.transcriptionDifferenceCheck);


//Segmentation Course APIs
router.post("/react-api/segmentation-course", segmentationCourseAPIs.getSegmentationCourseMenu);
router.post("/react-api/segmentation-quiz-questions", segmentationQuizQuestionsAPIs.getQuizQuestion);
router.post("/react-api/update-segmentation-course-detail", segmentationCourseAPIs.updateSegmentationCourseUserDetail);
router.post("/react-api/save-segmentation-quiz-result", segmentationQuizQuestionsAPIs.saveUserStatus);
router.post("/react-api/finish-segmentation-course", segmentationCourseAPIs.finishSegmentationCourse);

//Posts Table APIs
router.post("/database", postsTable.insertIntoPosts);
router.post("/react-api/database", postsTable.insertIntoPosts);
router.post("/get-segments", postsTable.getSegmentsFromPosts);
router.post("/react-api/get-segments", postsTable.getSegmentsFromPosts);
router.post("/updatedatabase", postsTable.updatePosts);
router.post("/react-api/updatedatabase", postsTable.updatePosts);
router.post("/update-on-split", postsTable.updatePostsOnSplit);
router.post("/react-api/update-on-split", postsTable.updatePostsOnSplit);
router.post("/remove-segments", postsTable.deleteSegmentsFromPosts);
router.post("/react-api/remove-segments", postsTable.deleteSegmentsFromPosts);
router.post("/top-speaker-control-save-button", postsTable.topSpeakerControlSavePosts);
router.post("/react-api/top-speaker-control-save-button", postsTable.topSpeakerControlSavePosts);
router.post("/get-submitted-or-not", postsTable.getSubmittedBooleanForSegmentation);
router.post("/react-api/get-submitted-or-not", postsTable.getSubmittedBooleanForSegmentation);

//Actual Table APIs
router.get("/actual-data-admin", actualTable.getActualLandingForAdmin);
router.get("/react-api/actual-data-admin", actualTable.getActualLandingForAdminReactLT);
router.post("/insert-into-actual-data", actualTable.insertDataIntoActual);
router.post("/react-api/insert-into-actual-data", actualTable.insertDataIntoActual);
router.post("/update-actual-database", actualTable.updateActualTable);
router.post("/react-api/update-actual-database", actualTable.updateActualTable);
router.post("/update-actual-data-on-split", actualTable.updateActualOnSplit);
router.post("/react-api/update-actual-data-on-split", actualTable.updateActualOnSplit);
router.post("/get-segments-from-actual-data-for-admin", actualTable.getSegmentsFromActual);
router.post("/react-api/get-segments-from-actual-data-for-admin", actualTable.getSegmentsFromActual);
router.post("/get-reviews", actualTable.getSegmentsFromActual);
router.post("/react-api/get-reviews", actualTable.getSegmentsFromActual);
router.post("/remove-segments-from-actual", actualTable.deleteSegmentsFromActual);
router.post("/react-api/remove-segments-from-actual", actualTable.deleteSegmentsFromActual);
router.post("/top-speaker-control-save-button-for-actual", actualTable.topSpeakerControlSaveActual);
router.post("/react-api/top-speaker-control-save-button-for-actual", actualTable.topSpeakerControlSaveActual);

//Transcription Table APIs
router.post("/insert-into-transcription-table", transcriptionTable.insertIntoTranscription);
router.post("/react-api/insert-into-transcription-table", transcriptionTable.insertIntoTranscription);
router.post("/update-transcription-table", transcriptionTable.updateTranscriptionTable);
router.post("/react-api/update-transcription-table", transcriptionTable.updateTranscriptionTable);
router.post("/get-submitted-or-not-for-transcription", transcriptionTable.getSubmittedBooleanForTranscription);
router.post("/react-api/get-submitted-or-not-for-transcription", transcriptionTable.getSubmittedBooleanForTranscription);
router.post("/transcription-actual-segments", transcriptionTable.getTranscriptionSegments);
router.post("/react-api/transcription-actual-segments", transcriptionTable.getTranscriptionSegments);

//Transcription Task Segment Table APIs
router.post("/insert-into-transcription-tasks-segments", transcriptionTaskSegmentsTable.insertIntoTranscriptionTasksTable);
router.post("/react-api/insert-into-transcription-tasks-segments", transcriptionTaskSegmentsTable.insertIntoTranscriptionTasksTable);
router.post("/update-transcription-task-segment-table", transcriptionTaskSegmentsTable.updateTranscriptionTasksTable);
router.post("/react-api/update-transcription-task-segment-table", transcriptionTaskSegmentsTable.updateTranscriptionTasksTable);
router.post("/update-transcription-task-segments-on-split", transcriptionTaskSegmentsTable.updateTranscriptionTaskSegmentOnSplit);
router.post("/react-api/update-transcription-task-segments-on-split", transcriptionTaskSegmentsTable.updateTranscriptionTaskSegmentOnSplit);
router.post("/transcription-tasks-user-created-segments", transcriptionTaskSegmentsTable.getSegmentsFromTranscriptionTaskSegments);
router.post("/react-api/transcription-tasks-user-created-segments", transcriptionTaskSegmentsTable.getSegmentsFromTranscriptionTaskSegments);
router.post("/remove-segments-from-transcription-task-segment", transcriptionTaskSegmentsTable.deleteSegmentsFromTranscriptionTaskSegments);
router.post("/react-api/remove-segments-from-transcription-task-segment", transcriptionTaskSegmentsTable.deleteSegmentsFromTranscriptionTaskSegments);
router.post("/top-speaker-control-save-button-for-transcription-task-segments", transcriptionTaskSegmentsTable.topSpeakerControlSaveTranscriptionTaskSegments);
router.post("/react-api/top-speaker-control-save-button-for-transcription-task-segments", transcriptionTaskSegmentsTable.topSpeakerControlSaveTranscriptionTaskSegments);

//Lt Submit Buttons Queries
router.post("/save-test-score-on-users_audio_table", submitLTQueries.submitButtonClickSegmentation);
router.post("/react-api/save-test-score-on-users_audio_table", submitLTQueries.submitButtonClickSegmentation);
router.post("/save-test-score-on-users_audio_table-for-transcription", submitLTQueries.submitButtonClickTranscription);
router.post("/react-api/save-test-score-on-users_audio_table-for-transcription", submitLTQueries.submitButtonClickTranscription);

//WebApp Related APIs
router.post("/get-web-app-id", getWebAppIdAPI.getWebAppId);
//Post Method Above for transcription app
router.get("/react-api/get-web-app-id", getWebAppIdAPI.getWebAppId);

//get Language id of an audio
router.post("/get-language-id",getWebAppIdAPI.getLanguageId);

//LT FeedBack
router.post("/insert-feedback-lt", ltFeedBackQueries.insertFeedBackLt);
router.post("/react-api/insert-feedback-lt", ltFeedBackQueries.insertFeedBackLt);

//HR Review Table APIs
router.post("/register-hr", hrReviewTableQueries.registerHR);
router.post("/react-api/register-hr", hrReviewTableQueries.registerHRReact);
router.get("/hr-login-form",hrReviewTableQueries.getHRLoginPage);
router.post("/hr-login",
    passport.authenticate("local", {
        failureRedirect: "/hr-login-form",
    }),
    hrReviewTableQueries.loginHR);
router.post("/react-api/hr-login", passport.authenticate("local", {
    failureRedirect: "/hr-login-form",
    }),
    hrReviewTableQueries.loginHRReact);
router.get("/hr-logout",hrReviewTableQueries.logoutHR);
router.get("/react-api/hr-logout",hrReviewTableQueries.logoutHRReact);
router.get("/hr-review-table",checkNotAuthenticated,hrReviewTableQueries.hrReviewTable);
router.get("/react-api/hr-review-table",checkNotAuthenticatedReact,hrReviewTableQueries.hrReviewTableReact);
router.get("/training-hr-review-table",checkNotAuthenticated,hrReviewTableQueries.hrTrainingTable);
router.get("/react-api/training-hr-review-table",checkNotAuthenticatedReact,hrReviewTableQueries.hrTrainingTableReact);
router.get("/transcription-hr-review-table",checkNotAuthenticated,hrReviewTableQueries.hrTranscriptionTable);
router.get("/react-api/transcription-hr-review-table",checkNotAuthenticatedReact,hrReviewTableQueries.hrTranscriptionTableReact);
router.post("/hr-review-table-datas",checkNotAuthenticated,hrReviewTableQueries.hrTableDatas);
router.post("/react-api/hr-review-table-datas",checkNotAuthenticatedReact,hrReviewTableQueries.hrTableDatas);
router.post("/training-hr-review-table-datas",checkNotAuthenticated,hrReviewTableQueries.hrTrainingTableDatas);
router.post("/react-api/training-hr-review-table-datas",checkNotAuthenticatedReact,hrReviewTableQueries.hrTrainingTableDatas);
router.post("/transcription-hr-review-table-datas",checkNotAuthenticated,hrReviewTableQueries.hrTranscriptionTableDatas);
router.post("/react-api/transcription-hr-review-table-datas",checkNotAuthenticatedReact,hrReviewTableQueries.hrTranscriptionTableDatas);
router.post("/set-endtime-null-on-retry",hrReviewTableQueries.setEndTimeNullOnRetry);
router.post("/react-api/set-endtime-null-on-retry",hrReviewTableQueries.setEndTimeNullOnRetry);
router.post("/set-endtime-null-on-retry-for-segmentation_course",hrReviewTableQueries.setEndTimeNullOnRetrySegmentationCourse);
router.post("/react-api/set-endtime-null-on-retry-for-segmentation_course",hrReviewTableQueries.setEndTimeNullOnRetrySegmentationCourse);
router.post("/reset-transcription-data-for-retry",hrReviewTableQueries.resetTranscriptionDataOnRetry);
router.post("/react-api/reset-transcription-data-for-retry",hrReviewTableQueries.resetTranscriptionDataOnRetry);
router.post("/confirm-pass-fail-hr-review",hrReviewTableQueries.confirmPassFailHR);
router.post("/react-api/confirm-pass-fail-hr-review",hrReviewTableQueries.confirmPassFailHR);
router.post("/hr-click-get-user-id",hrReviewTableQueries.getHRClickedUserId);
router.post("/react-api/hr-click-get-user-id",hrReviewTableQueries.getHRClickedUserId);
router.post("/get-web-app-id-for-hr",hrReviewTableQueries.getWebAppIdForHR);
router.post("/react-api/get-web-app-id-for-hr",hrReviewTableQueries.getWebAppIdForHR);
//Route for test logs
router.post("/save-hr-test-logs",hrReviewTableQueries.saveHRTestLogs);
router.post("/react-api/save-hr-test-logs",hrReviewTableQueries.saveHRTestLogs);
router.post("/save-hr-training-logs",hrReviewTableQueries.saveHRTrainingLogs);
router.post("/react-api/save-hr-training-logs",hrReviewTableQueries.saveHRTrainingLogs);
router.post("/save-hr-transcription-logs",hrReviewTableQueries.saveHRTrainingLogs);
router.post("/react-api/save-hr-transcription-logs",hrReviewTableQueries.saveHRTrainingLogs);

//Admin Review Table APIs
router.get("/admin-login-form",adminReviewTableQueries.getAdminLoginPage);
router.get("/admin-review-table",adminReviewTableQueries.getAdminReviewPage);
router.get("/transcription-admin-review-table",adminReviewTableQueries.getTranscriptionAdminPage);
router.get("/training-admin-review-table",adminReviewTableQueries.getTrainingAdminPage);
router.post("/admin-review-table-datas",adminReviewTableQueries.adminReviewTableDatas);
router.post("/react-api/admin-review-table-datas",adminReviewTableQueries.adminReviewTableDatas);
router.post("/transcription-admin-review-table-datas",adminReviewTableQueries.adminTranscriptionReviewTableDatas);
router.post("/react-api/transcription-admin-review-table-datas",adminReviewTableQueries.adminTranscriptionReviewTableDatas);
router.post("/training-admin-review-table-datas",adminReviewTableQueries.adminTrainingReviewTableDatas);
router.post("/react-api/training-admin-review-table-datas",adminReviewTableQueries.adminTrainingReviewTableDatas);
router.post("/confirm-pass-fail-admin-review",adminReviewTableQueries.confirmPassFailAdmin);
router.post("/react-api/confirm-pass-fail-admin-review",adminReviewTableQueries.confirmPassFailAdmin);
router.post("/get-web-app-id-for-admin",adminReviewTableQueries.getWebAppIdForAdmin);
router.post("/react-api/get-web-app-id-for-admin",adminReviewTableQueries.getWebAppIdForAdmin);
router.post("/admin-click-get-user-id",adminReviewTableQueries.getAdminClickedUserId);
router.post("/react-api/admin-click-get-user-id",adminReviewTableQueries.getAdminClickedUserId);

//checking authentication
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    return res.redirect("/hr-login-form");
}

function checkNotAuthenticatedReact(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    return res.status(400).send("HR Authentication Error");
}


module.exports = router;