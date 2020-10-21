'use strict';
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('transcript-snaps', {
			snapId: {
				field: 'snap_id',
				type: Sequelize.INTEGER,
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				unique: true
			},
			segmentId: {
				field: 'segment_id',
				type: Sequelize.INTEGER,
				allowNull: false
			},
			audioId: {
				field: 'audio_id',
				type: Sequelize.STRING
			},
			divClassname: {
				field: 'div_className',
				type: Sequelize.STRING
			},
			divTitle: {
				field: 'div_title',
				type: Sequelize.STRING
			},
			segmentStart: {
				field: 'segment_start',
				type: Sequelize.STRING
			},
			segmentEnd: {
				field: 'segment_end',
				type: Sequelize.INTEGER
			},
			annotationText: {
				field: 'annotation_text',
				type: Sequelize.TEXT
			},
			updatedAt: {
				field: 'updated_At',
				type: Sequelize.DATE
			},
			createdAt: {
				field: 'created_At',
				type: Sequelize.DATE
			}
		});
	},
	down: async (queryInterface, Sequelize) => {
		// await queryInterface.dropTable('transcript-snaps');
	}
};
