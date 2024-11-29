const { DataTypes } = require("sequelize");

const db = require("../utils/db");

const DonationModels = db.define(
  "donation",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    payment: {
      type: DataTypes.ENUM("PENDING", "SUCCESS", "FAILED"),
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = DonationModels;
