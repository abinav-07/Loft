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
      wakeWordStart: {
        type: DataTypes.FLOAT,
      },
      wakeWordEnd: {
        type: DataTypes.FLOAT,
      },
      commandStart: {
        type: DataTypes.FLOAT,
      },
      latency: {
        type: DataTypes.FLOAT,
      },
      startOfAssistant: {
        type: DataTypes.FLOAT,
      },
      duration: {
        type: DataTypes.FLOAT,
      },
      wakeWord: {
        type: DataTypes.TEXT('long'),
      },
      command: {
        type: DataTypes.STRING,
      },
      dateOfDelivery: {
        type: DataTypes.DATEONLY,
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
