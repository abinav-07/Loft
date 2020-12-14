'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async t=>{
      await queryInterface.renameColumn("segmentationQuizUserAnswers","user_id","webapp_user_id");
      await queryInterface.renameColumn("segmentationQuizStatus","user_id","webapp_user_id");
      await queryInterface.renameColumn("segmentation_course_menu_detail","user_id","webapp_user_id");
      await queryInterface.renameColumn("segmentation_course_sub_menu_detail","user_id","webapp_user_id");
      await queryInterface.renameColumn("segmentation_course_sub_sub_menu_detail","user_id","webapp_user_id");      
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
