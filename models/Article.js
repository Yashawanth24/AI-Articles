const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/config");

const Article = sequelize.define("Article", {
  title: { type: DataTypes.STRING, allowNull: false },
  url: { type: DataTypes.STRING, unique: true, allowNull: false },
  summary: { type: DataTypes.TEXT },
  content: { type: DataTypes.TEXT }, // [REQUIRED] This is the missing column
  category: { type: DataTypes.STRING },
  publishedAt: { type: DataTypes.DATE },
  image: { type: DataTypes.STRING }, 
});

module.exports = Article;