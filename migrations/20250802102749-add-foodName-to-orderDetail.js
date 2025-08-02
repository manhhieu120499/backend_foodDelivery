'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('OrderDetails', 'foodName', {
        type: Sequelize.STRING,
        allowNull: false,
      });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('OrderDetails', 'foodName');
  }
};
