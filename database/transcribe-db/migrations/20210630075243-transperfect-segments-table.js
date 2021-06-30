'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    return Promise.all([
      queryInterface.createTable('transperfectUserSegment', {
        segmentId: {
          type: Sequelize.DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        audioId: {
          type: Sequelize.DataTypes.INTEGER,
          allowNull: false,
        },
        userId: {
          type: Sequelize.DataTypes.INTEGER,
          allowNull: false,
        },
        take: {
          type: Sequelize.DataTypes.INTEGER,
          defaultValue: 1,
        },
        micActivationAttempt: {
          type: Sequelize.DataTypes.INTEGER,
          defaultValue: 1,
        },
        iteration: {
          type: Sequelize.DataTypes.INTEGER,
          defaultValue: 1,
        },
        micTap: {
          type: Sequelize.DataTypes.FLOAT,
        },
        micOpen: {
          type: Sequelize.DataTypes.FLOAT,
        },
        micClose: {
          type: Sequelize.DataTypes.FLOAT,
        },
        utteranceStart: {
          type: Sequelize.DataTypes.FLOAT,
        },
        utteranceEnd: {
          type: Sequelize.DataTypes.FLOAT,
        },
        utteranceFirstWordEnd: {
          type: Sequelize.DataTypes.FLOAT,
        },
        utteranceDisplayStart: {
          type: Sequelize.DataTypes.FLOAT,
        },
        utteranceDisplayEnd: {
          type: Sequelize.DataTypes.FLOAT,
        },
        finalTextDisplay: {
          type: Sequelize.DataTypes.FLOAT,
        },
        promptId: {
          type: Sequelize.DataTypes.INTEGER,
        },
        actualText: {
          type: Sequelize.DataTypes.TEXT('long'),
        },
        utteranceText: {
          type: Sequelize.DataTypes.TEXT('long'),
        },
        createdAt: {
          type: Sequelize.DataTypes.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updatedAt: {
          type: Sequelize.DataTypes.DATE,
          defaultValue: Sequelize.literal(
            'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
          ),
        },
      }),
      queryInterface.sequelize.query(
        `ALTER TABLE transperfectUserSegment MODIFY COLUMN actualText longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL`
      ),
      queryInterface.sequelize.query(
        `ALTER TABLE transperfectUserSegment MODIFY COLUMN utteranceText longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL`
      ),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
