//Database Connection
const pool = require('../config/pool');
const Joi = require('joi');

// TRANSCRIPTION_DB;
//Insert into table
const addTransperfectSegments = async (req, res, next) => {
  const {
    segmentStart,
    segmentEnd,
    take,
    micActivationAttempt,
    iteration,
    micTap,
    micOpen,
    micClose,
    utteranceStart,
    utteranceEnd,
    utteranceFirstWordEnd,
    utteranceDisplayStart,
    utteranceDisplayEnd,
    finalTextDisplay,
    promptId,
    actualText,
    utteranceText,
    audioId,
    userId,
  } = req.body;

  try {
    const schema = Joi.object({
      segmentStart: Joi.number().required(),
      segmentEnd: Joi.number().required(),
      take: Joi.number().required().min(1),
      audioId: Joi.number().required(),
      userId: Joi.number().required(),
      micActivationAttempt: Joi.number().required().min(1),
      iteration: Joi.number().required().min(1),
      micTap: Joi.number(),
      micOpen: Joi.number(),
      micClose: Joi.number(),
      utteranceStart: Joi.number(),
      utteranceEnd: Joi.number(),
      utteranceFirstWordEnd: Joi.number(),
      utteranceDisplayStart: Joi.number(),
      utteranceDisplayEnd: Joi.number(),
      finalTextDisplay: Joi.number(),
      promptId: Joi.number().allow(null),
      actualText: Joi.string().allow(null).allow(''),
      utteranceText: Joi.string().allow(null).allow(''),
    });
    const validationResult = schema.validate(req.body, { abortEarly: false });

    if (validationResult && validationResult.error) {
      throw validationResult.error;
    }

    const addSegment = await TRANSCRIPTION_DB.TransperfectUserSegment.create({
      audioId,
      userId,
      segmentStart,
      segmentEnd,
      take,
      micActivationAttempt,
      iteration,
      micTap,
      micOpen,
      micClose,
      utteranceStart,
      utteranceEnd,
      utteranceFirstWordEnd,
      utteranceDisplayStart,
      utteranceDisplayEnd,
      finalTextDisplay,
      promptId,
      actualText,
      utteranceText,
    });
    res.status(200).json(addSegment);
  } catch (error) {
    console.log(error);
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

module.exports = {
  addTransperfectSegments,
  getUserCreatedSegments,
  removeUserCreatedSegments,
};
