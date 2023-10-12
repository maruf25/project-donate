const { DataTypes } = require("sequelize");

const db = require("../utils/db");

const PreferenceModel = db.define(
  "preference",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
      primaryKey: true,
    },
    background_color: {
      type: DataTypes.STRING,
      defaultValue: "#ff7900FF",
      allowNull: false,
    },
    color_text: {
      type: DataTypes.STRING,
      defaultValue: "#333333",
      allowNull: false,
    },
    highlight_color: {
      type: DataTypes.STRING,
      defaultValue: "#ffffffFF",
      allowNull: false,
    },
    template_text: {
      type: DataTypes.STRING,
      defaultValue: "baru saja memberikan",
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
      defaultValue: 3600,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = PreferenceModel;
