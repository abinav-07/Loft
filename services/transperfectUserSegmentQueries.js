//Database Connection
const pool = require('../config/pool');
const Joi = require('joi');
var formidable = require('formidable');
var XLSX = require('node-xlsx');
var fs = require('fs/promises');

//AWS S3 Config
var AWS = require('aws-sdk');
const dotenv = require('dotenv');
dotenv.config();
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'eu-north-1',
  version: process.env.AWS_VERSION,
});
var s3 = new AWS.S3();

// TRANSCRIPTION_DB;

//Uplaods to S3 and Returns Error boolean
const readAndUploadFile = async (
  filePath,
  fileName,
  bulkInsertSql,
  hasError
) => {
  await fs
    .readFile(filePath)
    .then(async (data) => {
      //Upload to S3
      const uploadS3 = s3
        .upload({
          Bucket: process.env.FILES_BUCKET,
          Key: 'transcription/' + fileName,
          ACL: 'public-read',
          Body: data,
        })
        .promise();
      await uploadS3.catch((s3Err) => {
        console.log(s3Err);
        if (!hasError) {
          hasError = true;
        }
      });
    })
    .catch(() => {
      if (!hasError) {
        hasError = true;
      }
    });
  return hasError;
};

//Insert into table
const addTransperfectSegments = async (req, res, next) => {
  const {
    segmentStart,
    segmentEnd,
    latency,
    wakeUpWordStart,
    wakeUpWordEnd,
    commandStart,
    startOfAssistant,
    wakeUpWord,
    command,
    audioId,
    userId,
  } = req.body;

  try {
    const schema = Joi.object({
      segmentStart: Joi.number().required(),
      segmentEnd: Joi.number().required(),
      latency: Joi.number(),
      wakeUpWordStart: Joi.number().required(),
      wakeUpWordEnd: Joi.number().required(),
      commandStart: Joi.number(),
      startOfAssistant: Joi.number(),
      wakeUpWord: Joi.string().required(),
      command: Joi.string(),
      audioId: Joi.number().required(),
      userId: Joi.number().required(),
    });
    const validationResult = schema.validate(req.body, { abortEarly: false });

    if (validationResult && validationResult.error) {
      throw validationResult.error;
    }

    //Calculating duration of a segment
    const segmentDuration = segmentEnd - segmentStart;

    const addSegment = await TRANSCRIPTION_DB.TransperfectUserSegment.create({
      audioId,
      userId,
      segmentStart,
      segmentEnd,
      latency,
      wakeWordStart: wakeUpWordStart,
      wakeWordEnd: wakeUpWordEnd,
      commandStart,
      startOfAssistant,
      wakeWord: wakeUpWord,
      command,
      duration: segmentDuration,
    });
    res.status(200).json(addSegment);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error });
  }
};

const updateTransperfectSegments = async (req, res, next) => {
  const {
    segmentStart,
    segmentEnd,
    latency,
    wakeUpWordStart,
    wakeUpWordEnd,
    commandStart,
    startOfAssistant,
    wakeUpWord,
    command,
    segmentId,
  } = req.body;

  try {
    const schema = Joi.object({
      segmentStart: Joi.number().required(),
      segmentEnd: Joi.number().required(),
      latency: Joi.number(),
      wakeUpWordStart: Joi.number().required(),
      wakeUpWordEnd: Joi.number().required(),
      commandStart: Joi.number(),
      startOfAssistant: Joi.number(),
      wakeUpWord: Joi.string().required(),
      command: Joi.string(),
      segmentId: Joi.number().required(),
    });
    const validationResult = schema.validate(req.body, { abortEarly: false });

    if (validationResult && validationResult.error) {
      throw validationResult.error;
    }

    //Calculating duration of a segment
    const segmentDuration = segmentEnd - segmentStart;

    await TRANSCRIPTION_DB.TransperfectUserSegment.update(
      {
        segmentStart,
        segmentEnd,
        latency,
        wakeWordStart: wakeUpWordStart,
        wakeWordEnd: wakeUpWordEnd,
        commandStart,
        startOfAssistant,
        wakeWord: wakeUpWord,
        command,
        duration: segmentDuration,
      },
      {
        where: {
          segmentId,
        },
      }
    );
    res.status(200).json({ message: 'Segment Updated!' });
  } catch (error) {
    res.status(400).json({ message: error });
  }
};

const getUserCreatedSegments = async (req, res, next) => {
  const { audioId, userId } = req.body;
  try {
    if (!audioId || !userId) {
      throw 'Missing body params!';
    }

    const getSegments = await TRANSCRIPTION_DB.TransperfectUserSegment.findAll({
      where: {
        userId,
        audioId,
      },
    });
    res.status(200).json(getSegments);
  } catch (error) {
    res.status(400).json({ message: error });
  }
};

const removeUserCreatedSegments = async (req, res, next) => {
  const { audioId, userId, segmentId } = req.body;

  try {
    if (!audioId || !userId || !segmentId) {
      throw 'Missing body params!';
    }

    await TRANSCRIPTION_DB.TransperfectUserSegment.destroy({
      where: {
        audioId,
        userId,
        segmentId,
      },
    });

    res.status(200).json({ message: 'Segment Deleted!' });
  } catch (error) {
    res.status(400).json({ message: error });
  }
};

const uploadAudio = async (req, res, next) => {
  const formidableForm = new formidable.IncomingForm();
  //Bool to check excel error
  let hasError = false;
  formidableForm.multiples = true;
  formidableForm.parse(req, async (err, fields, files) => {
    if (err) {
      console.error(err);
      res.status(400).send(err);
    }

    //Parsae worksheet
    let excelBook = XLSX.parse(files['excel-uploaded-file'].path);

    //Insert into Audio table query
    let bulkInsertSql = [];

    excelBook[0].data.forEach((arr, index) => {
      if (index === 0) {
        //ignore headings
        return;
      }
      //Destructure
      const [FileName, SubjectID, Region, Language, Group, Gender] = arr;
      //Check if upload Files is in array i.e multiple files
      if (Array.isArray(files['uploaded-audio-file'])) {
        if (!files['uploaded-audio-file'].includes(FileName)) {
          //Only render error if it is first error to avoid multiple headers send
          if (!hasError) {
            hasError = true;
            res.render('transperfect/upload-audios', {
              error: `Add ${FileName} to upload`,
            });
            return;
          }
        }
      } else {
        if (files['uploaded-audio-file'].name !== FileName) {
          //Only render error if it is first error to avoid multiple headers send
          if (!hasError) {
            hasError = true;
            res.render('transperfect/upload-audios', {
              error: `Add ${FileName} to upload`,
            });
            return;
          }
        }
      }

      //Sql Insert
      bulkInsertSql.push({
        audioName: `${FileName.split('.')[0]}`,
        audioUrl: `https://${process.env.FILES_BUCKET}.s3.eu-north-1.amazonaws.com/transcription/${FileName}`,
        type: 'transcription',
        languageId: 83, //English
        extras: `{SubjectID:${SubjectID},Region:${Region},Language:${Language},Group:${Group},Gender:${Gender}}`,
      });
    });

    if (!hasError) {
      //Check if upload Files is in array i.e multiple files to upload to s3
      if (Array.isArray(files['uploaded-audio-file'])) {
        for (let i = 0; i < files['uploaded-audio-file'].length; i++) {
          hasError = await readAndUploadFile(
            files['uploaded-audio-file'][i].path,
            files['uploaded-audio-file'][i].name,
            bulkInsertSql,
            hasError
          );
          //Break loop if error to avoid any further file uploads
          if (hasError) {
            res.render('transperfect/upload-audios', {
              error: 'Error while uploading files to s3 and inserting to rows',
            });
            break;
          }
        }
      } else {
        if (!hasError) {
          hasError = await readAndUploadFile(
            files['uploaded-audio-file'].path,
            files['uploaded-audio-file'].name,
            bulkInsertSql,
            hasError
          );

          //Break loop if error to avoid any further file uploads
          if (hasError) {
            res.render('transperfect/upload-audios', {
              error: 'Error while uploading files to s3 and inserting to rows',
            });
          }
        }
      }
    }

    if (!hasError) {
      //Bulk insert rows to audio table
      await TRANSCRIPTION_DB.Audio.bulkCreate(bulkInsertSql).catch((err) => {
        if (!hasError) {
          hasError = true;
          res.render('transperfect/upload-audios', {
            error: 'Error while inserting rows',
          });
        }
      });
      if (!hasError) {
        res.render('transperfect/upload-audios', { message: 'Success' });
      }
    }
  });
};

module.exports = {
  addTransperfectSegments,
  getUserCreatedSegments,
  removeUserCreatedSegments,
  updateTransperfectSegments,
  uploadAudio,
};
