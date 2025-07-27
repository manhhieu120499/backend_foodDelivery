'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Order.belongsTo(models.Customer, {
        foreignKey: 'cusId',
        onDelete: 'CASCADE'
      })
      Order.hasMany(models.OrderDetail, {
        foreignKey: 'orderId',
        onDelete: 'CASCADE'
      })
    }
  }
  Order.init({
    orderId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'orderId' // optional, tốt để rõ ràng
    },
    statusOrder: DataTypes.STRING,
    note: DataTypes.STRING,
    addressDelivery: DataTypes.STRING,
    phone: DataTypes.STRING,
    total: DataTypes.DOUBLE,
    cusId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Order',
    tableName: 'Orders'
  });
  return Order;
};