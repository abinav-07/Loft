'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TranscriptionTaskList extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  TranscriptionTaskList.init(
    {
      transcriptionTaskListId: {
        field: 'Transcription_task_list_id',
        type: DataTypes.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      projectId: {
        field: 'Project_id',
        type: DataTypes.INTEGER(11),
      },
      taskName: {
        field: 'Task_name',
        type: DataTypes.STRING(150),
      },
      taskId: {
        field: 'Task_id',
        type: DataTypes.STRING(150),
        unique: true,
      },
      taskLength: {
        field: 'Task_length',
        type: DataTypes.TIME,
      },
      assignedTo: {
        field: 'Assigned_to',
        type: DataTypes.STRING(150),
      },
      reviewedBy: {
        field: 'Reviewed_by',
        type: DataTypes.STRING(150),
      },
      taskStatus: {
        field: 'Task_status',
        type: DataTypes.STRING(150),
      },
      taskAddedTime: {
        field: 'Task_added_time',
        type: DataTypes.DATE,
        defaultValue: new Date(),
      },
      taskAssignedTime: {
        field: 'Task_assigned_time',
        type: DataTypes.DATE,
      },
      taskCompletedTime: {
        field: 'Task_completed_time',
        type: DataTypes.DATE,
      },
      taskComment: {
        field: 'Task_comment',
        type: DataTypes.STRING(1000),
      },
      taskType: {
        field: 'Task_type',
        type: DataTypes.STRING(15),
      },
      taskUrl: {
        field: 'Task_url',
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      timestamps: false,
      modelName: 'TranscriptionTaskList',
      tableName: 'transcription_task_list',
    }
  );
  return TranscriptionTaskList;
};
