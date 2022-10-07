module.exports = (sequelize, Sequelize) => {
    const Plan = sequelize.define('plan', {
        leadId: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        fosId: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        planDate: {
            type: Sequelize.DATE,
            allowNull: false,
        },
    });
    return Plan;
};