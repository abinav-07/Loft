'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        return Promise.all([queryInterface.sequelize.query(`
    ALTER TABLE audio ADD guidelines_url varchar(250) NULL;   
    `), queryInterface.sequelize.query(`    
      ALTER TABLE audio CHANGE guidelines_url guidelines_url varchar(250) NULL AFTER Language_id;
    `)])
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