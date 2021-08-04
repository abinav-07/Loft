'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Audio extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Audio.init(
    {
      audioId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'audio_id',
      },
      audioName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'audio_name',
      },
      audioUrl: {
        type: DataTypes.TEXT('long'),
        field: 'audio_url',
      },
      isTraining: {
        type: DataTypes.STRING,
        field: 'is_training',
      },
      isGuided: {
        type: DataTypes.STRING,
        field: 'is_guided',
      },
      audioOrder: {
        type: DataTypes.INTEGER,
        field: 'audio_order',
      },
      type: {
        type: DataTypes.STRING,
      },
      languageId: {
        type: DataTypes.INTEGER,
        field: 'Language_id',
      },
      guidelines_url: {
        type: DataTypes.TEXT,
      },
      extras: {
        type: DataTypes.TEXT('long'),
      },
    },
    {
      sequelize,
      modelName: 'Audio',
      tableName: 'audio',
      timestamps: false,
    }
  );
  return Audio;
};
