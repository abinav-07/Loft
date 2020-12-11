const express=require("express");

const landingAPIs=require("../services/landing_APIs");
const segmentationLandingAPIs=require("../services/segmentation_landing_APIs");
const trainingLandingAPIs=require("../services/training_landing_APIs");
const transcriptionLandingAPIs=require("../services/transcription_landing_APIs");
const transcriptionTaskLandingAPIs=require("../services/transcription_task_landing_APIs");

const postsTable =require('../services/posts_table_queries');
const actualTable=require("../services/actual_table_queries");
const transcriptionTable=require("../services/transcription_table_queries");
const transcriptionTaskSegmentsTable=require("../services/transcription_tasks_table_queries");

const segmentationCourseAPIs=require("../services/segmentation_course_menu_queries");
const segmentationQuizQuestionsAPIs=require("../services/segmentation_quiz_queries");
const segmentation_course_menu_queries = require("../services/segmentation_course_menu_queries");

const router=express.Router();

//Landing Route APIs
router.get("/",landingAPIs.getLandingRoute);
router.get("/react-api/",landingAPIs.getLandingRouteForReactLT);

//Segmentation Landing Route APIs
router.get("/transcribe",segmentationLandingAPIs.getSegmentationLandingRoute);
router.get("/react-api/transcribe",segmentationLandingAPIs.getSegmentationLandingRouteForReactLT);

//Training Landing Route APIs
router.get("/training",trainingLandingAPIs.getTrainingLandingRoute);
router.get("/react-api/training",trainingLandingAPIs.getTrainingLandingRouteReactLT);

//Transcription Landing Route APIs
router.get("/transcription",transcriptionLandingAPIs.getTranscriptionLandingRoute);
router.get("/react-api/transcription",transcriptionLandingAPIs.getTranscriptionLandingRouteReactLT);

//Transcription Tasks Landing Route APIs
router.get("/transcription-task",transcriptionTaskLandingAPIs.getTranscriptionTaskLandingRoute);
router.get("/react-api/transcription-task",transcriptionTaskLandingAPIs.getTranscriptionTaskLandingRouteReactLT);

//Segmentation Course APIs
router.post("/react-api/segmentation-course",segmentationCourseAPIs.getSegmentationCourseMenu);
router.post("/react-api/segmentation-quiz-questions",segmentationQuizQuestionsAPIs.getQuizQuestion);
router.post("/react-api/update-segmentation-course-detail",segmentation_course_menu_queries.updateSegmentationCourseUserDetail);
router.post("/react-api/save-segmentation-quiz-result",segmentationQuizQuestionsAPIs.saveUserStatus);

//Posts Table APIs
router.post("/database",postsTable.insertIntoPosts);
router.post("/react-api/database",postsTable.insertIntoPosts);
router.post("/get-segments",postsTable.getSegmentsFromPosts);
router.post("/react-api/get-segments",postsTable.getSegmentsFromPosts);
router.post("/updatedatabase",postsTable.updatePosts);
router.post("/react-api/updatedatabase",postsTable.updatePosts);
router.post("/update-on-split",postsTable.updatePostsOnSplit);
router.post("/react-api/update-on-split",postsTable.updatePostsOnSplit);
router.post("/remove-segments",postsTable.deleteSegmentsFromPosts);
router.post("/react-api/remove-segments",postsTable.deleteSegmentsFromPosts);
router.post("/top-speaker-control-save-button",postsTable.topSpeakerControlSavePosts);
router.post("/react-api/top-speaker-control-save-button",postsTable.topSpeakerControlSavePosts);
router.post("/get-submitted-or-not",postsTable.getSubmittedBooleanForSegmentation);
router.post("/react-api/get-submitted-or-not",postsTable.getSubmittedBooleanForSegmentation);

//Actual Table APIs
router.post("/insert-into-actual-data",actualTable.insertDataIntoActual);
router.post("/react-api/insert-into-actual-data",actualTable.insertDataIntoActual);
router.post("/update-actual-database",actualTable.updateActualTable);
router.post("/react-api/update-actual-database",actualTable.updateActualTable);
router.post("/update-actual-data-on-split",actualTable.updateActualOnSplit);
router.post("/react-api/update-actual-data-on-split",actualTable.updateActualOnSplit);
router.post("/get-segments-from-actual-data-for-admin",actualTable.getSegmentsFromActual);
router.post("/react-api/get-segments-from-actual-data-for-admin",actualTable.getSegmentsFromActual);
router.post("/get-reviews",actualTable.getSegmentsFromActual);
router.post("/react-api/get-reviews",actualTable.getSegmentsFromActual);
router.post("/remove-segments-from-actual",actualTable.deleteSegmentsFromActual);
router.post("/react-api/remove-segments-from-actual",actualTable.deleteSegmentsFromActual);
router.post("/top-speaker-control-save-button-for-actual",actualTable.topSpeakerControlSaveActual);
router.post("/react-api/top-speaker-control-save-button-for-actual",actualTable.topSpeakerControlSaveActual);

//Transcription Table APIs
router.post("/insert-into-transcription-table",transcriptionTable.insertIntoTranscription);
router.post("/react-api/insert-into-transcription-table",transcriptionTable.insertIntoTranscription);
router.post("/update-transcription-table",transcriptionTable.updateTranscriptionTable);
router.post("/react-api/update-transcription-table",transcriptionTable.updateTranscriptionTable);
router.post("/get-submitted-or-not-for-transcription",transcriptionTable.getSubmittedBooleanForTranscription);
router.post("/react-api/get-submitted-or-not-for-transcription",transcriptionTable.getSubmittedBooleanForTranscription);
router.post("/transcription-actual-segments",transcriptionTable.getTranscriptionSegments);
router.post("/react-api/transcription-actual-segments",transcriptionTable.getTranscriptionSegments);

//Transcription Task Segment Table APIs
router.post("/insert-into-transcription-tasks-segments",transcriptionTaskSegmentsTable.insertIntoTranscriptionTasksTable);
router.post("/react-api/insert-into-transcription-tasks-segments",transcriptionTaskSegmentsTable.insertIntoTranscriptionTasksTable);
router.post("/update-transcription-task-segment-table",transcriptionTaskSegmentsTable.updateTranscriptionTasksTable);
router.post("/react-api/update-transcription-task-segment-table",transcriptionTaskSegmentsTable.updateTranscriptionTasksTable);
router.post("/update-transcription-task-segments-on-split",transcriptionTaskSegmentsTable.updateTranscriptionTaskSegmentOnSplit);
router.post("/react-api/update-transcription-task-segments-on-split",transcriptionTaskSegmentsTable.updateTranscriptionTaskSegmentOnSplit);
router.post("/transcription-tasks-user-created-segments",transcriptionTaskSegmentsTable.getSegmentsFromTranscriptionTaskSegments);
router.post("/react-api/transcription-tasks-user-created-segments",transcriptionTaskSegmentsTable.getSegmentsFromTranscriptionTaskSegments);
router.post("/remove-segments-from-transcription-task-segment",transcriptionTaskSegmentsTable.deleteSegmentsFromTranscriptionTaskSegments);
router.post("/react-api/remove-segments-from-transcription-task-segment",transcriptionTaskSegmentsTable.deleteSegmentsFromTranscriptionTaskSegments);
router.post("/top-speaker-control-save-button-for-transcription-task-segments",transcriptionTaskSegmentsTable.topSpeakerControlSaveTranscriptionTaskSegments);
router.post("/react-api/top-speaker-control-save-button-for-transcription-task-segments",transcriptionTaskSegmentsTable.topSpeakerControlSaveTranscriptionTaskSegments);
module.exports=router;