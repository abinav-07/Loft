'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        return queryInterface.renameTable("users-audio-logs", "users_audio_logs");
        /**
         * Add altering commands here.
         *
         * Example:
         * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
         */
    },

    down: async(queryInterface, Sequelize) => {
        /**
         * Add reverting commands here.
         *
         * Example:
         * await queryInterface.dropTable('users');
         */
    }
};