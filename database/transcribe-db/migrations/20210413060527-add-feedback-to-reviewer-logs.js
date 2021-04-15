"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      "reviewer_logs",
      "feedback",
      {
        type: Sequelize.DataTypes.TEXT("long"),
        allowNull: true,
      },
      {
        after: "user_id",
      }
    );
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
