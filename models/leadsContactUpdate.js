module.exports = (sequelize, Sequelize) => {
    const leadsContactUpdate = sequelize.define('leadsContactUpdate', {
        content: {
            type: Sequelize.STRING,
            required: true,
            allowNull: false,
        },
        type: {
            type: Sequelize.ENUM,
            values: ['mobile', 'address'],
            allowNull: true,
        },
        leadId: {
            type: Sequelize.STRING,
            required: true,
            allowNull: false,
        }
    });
    return leadsContactUpdate;
  };
