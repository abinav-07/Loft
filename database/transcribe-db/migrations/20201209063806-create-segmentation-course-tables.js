'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async t=>{
      await queryInterface.createTable('segmentation_course_menu',{
        menu_id:{
          type:Sequelize.DataTypes.INTEGER,
          primaryKey:true,
          autoIncrement:true
        },
        menu_title:{
          type:Sequelize.DataTypes.STRING,
          allowNull:false
        },
        has_sub_menu:{
          type:Sequelize.DataTypes.BOOLEAN,
          allowNull:false
        },
        totalDuration:{
          type:Sequelize.DataTypes.TIME
        }      
      });

      await queryInterface.createTable("segmentation_course_sub_menu",{
        sub_menu_id:{
          type:Sequelize.DataTypes.INTEGER,
          primaryKey:true,
          autoIncrement:true
        },
        menu_id:{
          type:Sequelize.DataTypes.INTEGER,
          allowNull:false,
        },
        sub_menu_title:{
          type:Sequelize.DataTypes.STRING,
          allowNull:false
        },
        has_sub_sub_menu:{
          type:Sequelize.DataTypes.BOOLEAN,
          allowNull:false
        },
        totalDuration:{
          type:Sequelize.DataTypes.TIME
        }
      });
      
      await queryInterface.createTable("segmentation_course_sub_sub_menu",{
        sub_sub_menu_id:{
          type:Sequelize.DataTypes.INTEGER,
          primaryKey:true,
          autoIncrement:true
        },
        sub_menu_id:{
          type:Sequelize.DataTypes.INTEGER,
          allowNull:false,
        },
        sub_sub_menu_title:{
          type:Sequelize.DataTypes.STRING,
          allowNull:false
        },
        totalDuration:{
          type:Sequelize.DataTypes.TIME
        }
      });

      await queryInterface.createTable("segmentation_course_menu_detail",{
        id:{
          type:Sequelize.DataTypes.INTEGER,
          primaryKey:true,
          autoIncrement:true 
        },
        user_id:{
          type:Sequelize.DataTypes.INTEGER,
          allowNull:false
        },
        menu_id:{
          type:Sequelize.DataTypes.INTEGER
        },
        is_active:{
          type:Sequelize.DataTypes.BOOLEAN,
          defaultValue:false
        },
        createdAt:{
          type: Sequelize.DataTypes.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        endedAt:{
          type: Sequelize.DataTypes.DATE,
        }
      });

      await queryInterface.createTable("segmentation_course_sub_menu_detail",{
        id:{
          type:Sequelize.DataTypes.INTEGER,
          primaryKey:true,
          autoIncrement:true 
        },
        user_id:{
          type:Sequelize.DataTypes.INTEGER,
          allowNull:false
        },
        sub_menu_id:{
          type:Sequelize.DataTypes.INTEGER          
        },
        duration:{
          type:Sequelize.DataTypes.TIME,
          allowNull:false
        },
        status:{
          type:Sequelize.DataTypes.STRING,
          allowNull:false
        },
        is_active:{
          type:Sequelize.DataTypes.BOOLEAN,
          defaultValue:false
        },
        createdAt:{
          type: Sequelize.DataTypes.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        endedAt:{
          type: Sequelize.DataTypes.DATE,
        }
      });

      await queryInterface.createTable("segmentation_course_sub_sub_menu_detail",{
        id:{
          type:Sequelize.DataTypes.INTEGER,
          primaryKey:true,
          autoIncrement:true 
        },
        user_id:{
          type:Sequelize.DataTypes.INTEGER,
          allowNull:false
        },
        sub_sub_menu_id:{
          type:Sequelize.DataTypes.INTEGER          
        },
        duration:{
          type:Sequelize.DataTypes.TIME,
          allowNull:false
        },
        status:{
          type:Sequelize.DataTypes.STRING,
          allowNull:false
        },
        is_active:{
          type:Sequelize.DataTypes.BOOLEAN,
          defaultValue:false
        },
        createdAt:{
          type: Sequelize.DataTypes.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        endedAt:{
          type: Sequelize.DataTypes.DATE,
        }
      });

    }) //Transaction End
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
