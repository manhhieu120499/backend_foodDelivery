'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      OrderDetail.belongsTo(models.Order, {
        foreignKey: 'orderId',
        onDelete: 'CASCADE'
      }),
      OrderDetail.belongsTo(models.Food, {
        foreignKey: 'foodId'
      })
    }
  }
  OrderDetail.init({
    orderDetailId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'orderDetailId' // optional, tốt để rõ ràng
    },
    orderId: DataTypes.INTEGER,
    foodId: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    total: DataTypes.DOUBLE
  }, {
    sequelize,
    modelName: 'OrderDetail',
    tableName: 'OrderDetails'
  });
  return OrderDetail;
};