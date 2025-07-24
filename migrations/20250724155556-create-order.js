'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Orders', {
      orderId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      statusOrder: {
        allowNull: false,
        type: Sequelize.STRING
      },
      note: {
        allowNull: true,
        type: Sequelize.STRING
      },
      addressDelivery: {
        allowNull: false,
        type: Sequelize.STRING
      },
      phone: {
        allowNull: false,
        type: Sequelize.STRING
      },
      total: {
        allowNull: false,
        type: Sequelize.DOUBLE
      },
      cusId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Customers',
          key: 'cusId'
        },
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Orders');
  }
};