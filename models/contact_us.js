/* eslint-disable linebreak-style */
/* eslint-disable camelcase */
module.exports = (sequelize, Sequelize) => {
  const contact_us = sequelize.define('contact_us', {
    first_name: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
    },
    last_name: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
    },
    organisation: {
      type: Sequelize.STRING,
    },
    designation: {
      type: Sequelize.STRING,
    },
    subject: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
    },
    phone: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
    },
    message: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
    },
  });

  return contact_us;
};
