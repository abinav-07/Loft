'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('segmentation_course_videos', {
      id: {
          type: Sequelize.DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
      },
      video_url: {
          type: Sequelize.DataTypes.TEXT("long"),
          allowNull: true,
      },
      course_name: {
          type: Sequelize.DataTypes.TEXT("long"),
          allowNull: true,

      },   
  })
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
