/* eslint-disable linebreak-style */
/* eslint-disable eol-last */
/* eslint-disable linebreak-style */
/* eslint-disable quotes */
/* eslint-disable comma-dangle */
/* eslint-disable comma-spacing */
/* eslint-disable linebreak-style */
/* eslint-disable indent */
module.exports = (sequelize, Sequelize) => {
    const users = sequelize.define("users", {
        firstName: {
            type: Sequelize.STRING,
            required: true,
            allowNull: false,
        },
        lastName: {
            type: Sequelize.STRING,
            required: true,
            allowNull: false,
        },
        email: {
            type: Sequelize.STRING,
            required: true,
            allowNull: false,
        },
        password: {
            type: Sequelize.STRING,
            required: true,
            allowNull: false,
        },
        phone: {
            type: Sequelize.STRING,
            required: true,
            allowNull: false,
        },
        emergencyPhone: {
            type: Sequelize.STRING,
            required: true,
            allowNull: false,
        },
        dob: {
            type: Sequelize.DATEONLY,
        },
        address: {
            type: Sequelize.STRING,
        },
        location: {
            type: Sequelize.STRING,
        },
        bloodGroup: {
            type: Sequelize.STRING,
        },
        roleId: {
            type: Sequelize.INTEGER,
        },
        reportingTo: {
            type: Sequelize.INTEGER,
        },
        experience: {
            type: Sequelize.INTEGER,
        },
        pincode: {
            type: Sequelize.INTEGER,
        },
        employeeId: {
            type: Sequelize.STRING,
        },
        profileImg: {
            type: Sequelize.STRING,
        },
        language: {
            type: Sequelize.STRING,
        },
        latitude: {
            type: Sequelize.FLOAT,
        },
        longitude: {
            type: Sequelize.FLOAT,
        },
        experience: {
            type: Sequelize.INTEGER,
        },
        tempCode: {
            type: Sequelize.STRING,
        },
        isDeleted: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        isEmailVerified: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        otp: {
            type: Sequelize.STRING,
        },
        otpExpired: {
            type: Sequelize.DATE,
        },
    });

    return users;
};