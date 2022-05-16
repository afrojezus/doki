'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('files', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id: {
        type: Sequelize.NUMBER
      },
      unixTime: {
        type: Sequelize.NUMBER
      },
      size: {
        type: Sequelize.STRING
      },
      fileURL: {
        type: Sequelize.STRING
      },
      thumbnail: {
        type: Sequelize.STRING
      },
      folder: {
        type: Sequelize.STRING
      },
      nsfw: {
        type: Sequelize.BOOLEAN
      },
      views: {
        type: Sequelize.NUMBER
      },
      tags: {
        type: Sequelize.STRING
      },
      report: {
        type: Sequelize.STRING
      },
      title: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('files');
  }
};