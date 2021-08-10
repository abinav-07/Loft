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
      queryInterface.addColumn('transperfectUserSegment', 'segmentStart', {
        type: Sequelize.DataTypes.FLOAT,
        after: 'userId',
      }),
      queryInterface.addColumn('transperfectUserSegment', 'segmentEnd', {
        type: Sequelize.DataTypes.FLOAT,
        after: 'segmentStart',
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
