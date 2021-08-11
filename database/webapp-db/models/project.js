'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Project extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Project.init(
    {
      projectId: {
        field: 'Project_id',
        type: DataTypes.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      projectTypeId: {
        field: 'Project_type_id',
        type: DataTypes.INTEGER(11),
      },
      languageId: {
        field: 'Language_id',
        type: DataTypes.INTEGER(10),
      },
      country: {
        field: 'Country',
        type: DataTypes.STRING(45),
      },
      client: {
        field: 'Client',
        type: DataTypes.STRING(45),
      },
      projectName: {
        field: 'Project_name',
        type: DataTypes.STRING(225),
      },
      projectUrl: {
        field: 'Project_URL',
        type: DataTypes.STRING(500),
      },
      login: {
        field: 'Login',
        type: DataTypes.STRING(45),
      },
      projectInstruction: {
        field: 'Project_instruction',
        type: DataTypes.TEXT,
      },
      shortDescription: {
        field: 'Short_description',
        type: DataTypes.TEXT,
      },
      age: {
        field: 'Age',
        type: DataTypes.STRING(45),
      },
      recordingSet: {
        field: 'Recording_set',
        type: DataTypes.INTEGER(10),
      },
      idsGenerated: {
        field: 'IDs_generated',
        type: DataTypes.INTEGER(5),
      },
      money: {
        field: 'Money',
        type: DataTypes.STRING(45),
      },
      referralBonus: {
        field: 'Referral_bonus',
        type: DataTypes.STRING(45),
      },
      createdAt: {
        field: 'Created_at',
        type: DataTypes.DATE,
      },
      active: {
        field: 'Active',
        type: DataTypes.STRING(45),
      },
      available: {
        field: 'Available',
        type: DataTypes.STRING(45),
      },
      isFallback: {
        field: 'Is_fallback',
        type: DataTypes.STRING(1),
      },
      hasLinguistReviewer: {
        field: 'Has_linguist_reviewer',
        type: DataTypes.STRING(1),
      },
      projectData: {
        field: 'Project_data',
        type: DataTypes.STRING,
      },
      distributionType: {
        field: 'Distribution_type',
        type: DataTypes.STRING,
      },
      frequency: {
        field: 'frequency',
        type: DataTypes.NUMBER,
      },
    },
    {
      sequelize,
      timestamps: false,
      modelName: 'Project',
      tableName: 'project',
    }
  );
  return Project;
};
