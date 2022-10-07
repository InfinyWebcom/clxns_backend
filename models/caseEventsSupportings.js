module.exports = (sequelize, Sequelize) => {
    const caseEventsSupportings = sequelize.define('caseEventsSupportings', {
        caseEventId: {
            type: Sequelize.INTEGER,
            required: true,
            allowNull: false,
        },
        image: {
            type: Sequelize.STRING,
            required: true,
            allowNull: false,
        },
        leadId: {
            type: Sequelize.STRING,
            required: true,
            allowNull: false,
        },
    });
    return caseEventsSupportings;
  };
//   id, case_event_id, image