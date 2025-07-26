'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Accounts', 'role', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'customer'
      });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Accounts', 'role');
  }
};
