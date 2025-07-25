'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Customer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Customer.hasOne(models.Account, {
        foreignKey: 'cusId'
      })
      Customer.hasMany(models.Order, {
        foreignKey: 'cusId'
      })
    }
  }
  Customer.init({
    cusId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'cusId' // optional, tốt để rõ ràng
    },
    name: DataTypes.STRING,
    age: DataTypes.STRING,
    phone: DataTypes.STRING,
    image: DataTypes.STRING,
    dob: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Customer',
    tableName: 'Customers'
  });
  return Customer;
};