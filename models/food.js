'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Food extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Food.belongsTo(models.Category, {
        foreignKey: 'categoryId',
        onDelete: 'CASCADE'
      })
    }
  }
  Food.init({
    name: DataTypes.STRING,
    image: DataTypes.STRING,
    des: DataTypes.STRING,
    price: DataTypes.INTEGER,
    categoryId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Food',
    underscored: true
  });
  return Food;
};