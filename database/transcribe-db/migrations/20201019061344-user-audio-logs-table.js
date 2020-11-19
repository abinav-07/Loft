'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        return queryInterface.createTable('users_audio_logs', {
                id: {
                    type: Sequelize.DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                users_audio_id: {
                    type: Sequelize.DataTypes.INTEGER,
                    allowNull: false,
                },
                // audio_id: {
                //     type: Sequelize.DataTypes.INTEGER,
                //     allowNull: true,

                // },
                // user_id: {
                //     type: Sequelize.DataTypes.INTEGER,
                //     allowNull: true,
                // },

                status: {
                    type: Sequelize.DataTypes.STRING,
                    allowNull: true
                },
                start_time: {
                    type: Sequelize.DataTypes.DATE
                },
                end_time: {
                    type: Sequelize.DataTypes.DATE
                },
                comments: {
                    type: Sequelize.DataTypes.STRING
                }

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