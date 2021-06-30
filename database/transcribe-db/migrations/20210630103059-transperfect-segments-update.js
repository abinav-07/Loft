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
