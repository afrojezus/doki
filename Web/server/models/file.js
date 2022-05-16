'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class file extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  file.init({
    id: DataTypes.NUMBER,
    unixTime: DataTypes.NUMBER,
    size: DataTypes.STRING,
    fileURL: DataTypes.STRING,
    thumbnail: DataTypes.STRING,
    folder: DataTypes.STRING,
    nsfw: DataTypes.BOOLEAN,
    views: DataTypes.NUMBER,
    tags: DataTypes.STRING,
    report: DataTypes.STRING,
    title: DataTypes.STRING,
    description: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'file',
  });
  return file;
};