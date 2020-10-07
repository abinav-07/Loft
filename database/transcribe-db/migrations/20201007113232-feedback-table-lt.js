'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        return queryInterface.createTable('feedbackLT', {
                feedback_id: {
                    type: Sequelize.DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                feedback: {
                    type: Sequelize.DataTypes.STRING,
                    allowNull: true,
                },
                audio_id: {
                    type: Sequelize.DataTypes.INTEGER,
                    allowNull: true,

                },
                feedbackCreatedAt: {
                    type: Sequelize.DataTypes.DATE
                },
                user_id: {
                    type: Sequelize.DataTypes.INTEGER,
                    allowNull: false,
                },
            })
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