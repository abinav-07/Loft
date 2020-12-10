'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async t=>{
      await queryInterface.createTable('segmentationQuestions',{
        id:{
          type:Sequelize.DataTypes.INTEGER,
          primaryKey:true,
          autoIncrement:true
        },
        questionNo:{
          type:Sequelize.DataTypes.INTEGER,
          allowNull:false
        },
        question:{
          type:Sequelize.DataTypes.TEXT("long"),
          allowNull:false
        },
        type:{
          type:Sequelize.DataTypes.STRING,          
        },
        quizLanguageId:{
          type:Sequelize.DataTypes.INTEGER,
        },
        createdAt:{
          type: Sequelize.DataTypes.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      });

      await queryInterface.createTable("segmentationAnswers",{
        id:{
          type:Sequelize.DataTypes.INTEGER,
          primaryKey:true,
          autoIncrement:true
        },
        answer:{
          type:Sequelize.DataTypes.TEXT("long"),
          allowNull:false
        },
        questionNo:{
          type:Sequelize.DataTypes.INTEGER,
          allowNull:false
        },
        is_correct:{
          type:Sequelize.DataTypes.BOOLEAN,
          allowNull:false
        },
        createdAt:{
          type: Sequelize.DataTypes.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      });
      
      await queryInterface.createTable("segmentationQuizUserAnswers",{
        id:{
          type:Sequelize.DataTypes.INTEGER,
          primaryKey:true,
          autoIncrement:true
        },
        user_id:{
          type:Sequelize.DataTypes.INTEGER,
          allowNull:false
        },
        questionNo:{
          type:Sequelize.DataTypes.INTEGER,
          allowNull:false
        },
        answerId:{
          type:Sequelize.DataTypes.INTEGER,
        },
        is_correct:{
          type:Sequelize.DataTypes.BOOLEAN,
        },
        quizLanguageId:{
          type:Sequelize.DataTypes.INTEGER,
        },
        createdAt:{
          type: Sequelize.DataTypes.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      });

      await queryInterface.createTable("segmentationQuizStatus",{
        id:{
          type:Sequelize.DataTypes.INTEGER,
          primaryKey:true,
          autoIncrement:true 
        },
        user_id:{
          type:Sequelize.DataTypes.INTEGER,
          allowNull:false
        },
        quizLanguageId:{
          type:Sequelize.DataTypes.INTEGER,
        },
        status:{
          type:Sequelize.DataTypes.STRING,          
        },
        result:{
          type:Sequelize.DataTypes.STRING,
        },
        resultPercentage:{
          type:Sequelize.DataTypes.INTEGER,
        },
        createdAt:{
          type: Sequelize.DataTypes.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
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
