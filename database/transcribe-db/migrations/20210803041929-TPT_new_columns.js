'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.renameColumn(
          'transperfectUserSegment',
          'actualText',
          'wakeWord',
          { transaction: t }
        ),
        queryInterface.renameColumn(
          'transperfectUserSegment',
          'micActivationAttempt',
          'command',
          { transaction: t }
        ),
        queryInterface.renameColumn(
          'transperfectUserSegment',
          'micTap',
          'wakeWordStart',
          { transaction: t }
        ),
        queryInterface.renameColumn(
          'transperfectUserSegment',
          'micOpen',
          'wakeWordEnd',
          { transaction: t }
        ),
        queryInterface.renameColumn(
          'transperfectUserSegment',
          'micClose',
          'commandStart',
          { transaction: t }
        ),
        queryInterface.renameColumn(
          'transperfectUserSegment',
          'utteranceStart',
          'latency',
          { transaction: t }
        ),
        queryInterface.renameColumn(
          'transperfectUserSegment',
          'utteranceEnd',
          'startOfAssistant',
          { transaction: t }
        ),
        queryInterface.renameColumn(
          'transperfectUserSegment',
          'utteranceFirstWordEnd',
          'duration',
          { transaction: t }
        ),
        queryInterface.removeColumn('transperfectUserSegment', 'iteration', {
          transaction: t,
        }),
        queryInterface.removeColumn(
          'transperfectUserSegment',
          'utteranceFirstWordDisplayEnd',
          { transaction: t }
        ),
        queryInterface.removeColumn(
          'transperfectUserSegment',
          'utteranceDisplayStart',
          { transaction: t }
        ),
        queryInterface.removeColumn(
          'transperfectUserSegment',
          'utteranceDisplayEnd',
          { transaction: t }
        ),
        queryInterface.removeColumn(
          'transperfectUserSegment',
          'finalTextDisplay',
          { transaction: t }
        ),
        queryInterface.removeColumn('transperfectUserSegment', 'promptId', {
          transaction: t,
        }),
        queryInterface.removeColumn('transperfectUserSegment', 'take', {
          transaction: t,
        }),
        queryInterface.removeColumn(
          'transperfectUserSegment',
          'utteranceText',
          { transaction: t }
        ),
      ]);
    });
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
