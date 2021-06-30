'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TransperfectUserSegment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  TransperfectUserSegment.init(
    {
      segmentId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      audioId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      segmentStart: {
        type: DataTypes.FLOAT,
      },
      segmentEnd: {
        type: DataTypes.FLOAT,
      },
      take: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      micActivationAttempt: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      iteration: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      micTap: {
        type: DataTypes.FLOAT,
      },
      micOpen: {
        type: DataTypes.FLOAT,
      },
      micClose: {
        type: DataTypes.FLOAT,
      },
      utteranceStart: {
        type: DataTypes.FLOAT,
      },
      utteranceEnd: {
        type: DataTypes.FLOAT,
      },
      utteranceFirstWordEnd: {
        type: DataTypes.FLOAT,
      },
      utteranceDisplayStart: {
        type: DataTypes.FLOAT,
      },
      utteranceDisplayEnd: {
        type: DataTypes.FLOAT,
      },
      finalTextDisplay: {
        type: DataTypes.FLOAT,
      },
      promptId: {
        type: DataTypes.INTEGER,
      },
      actualText: {
        type: DataTypes.TEXT('long'),
      },
      utteranceText: {
        type: DataTypes.TEXT('long'),
      },
    },
    {
      sequelize,
      modelName: 'TransperfectUserSegment',
      tableName: 'transperfectUserSegment',
    }
  );
  return TransperfectUserSegment;
};
