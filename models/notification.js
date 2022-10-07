module.exports = (sequelize, Sequelize) => {
    const Notification = sequelize.define('notification', {
        fosId: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        message: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        flag: {
            type: Sequelize.STRING,
            allowNull: false,
        },
    });
    return Notification;
};