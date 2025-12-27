const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/config");

const Article = sequelize.define("Article", {
  title: { type: DataTypes.STRING, allowNull: false },
  url: { type: DataTypes.STRING, unique: true, allowNull: false },
  summary: { type: DataTypes.TEXT },
  category: { type: DataTypes.STRING },
  publishedAt: { type: DataTypes.DATE },
   image: { type: DataTypes.STRING }, // Add image URL
});

module.exports = Article;