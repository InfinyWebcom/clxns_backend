module.exports = (sequelize, Sequelize) => {
  const ProductType = sequelize.define('productType', {
    name: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
    },
    shortName: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
    },
  });
  return ProductType;
};