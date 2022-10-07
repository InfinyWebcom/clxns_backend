module.exports = (sequelize, Sequelize) => {
    const Payment = sequelize.define('payments', {
        leadId: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        loanNo: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        fosId: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        amtType: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        paymentMode: {
            type: Sequelize.ENUM,
            values: ['Online', 'Cash', 'Cheque'],
        },
        recoveryDate: {
            type: Sequelize.DATE,
            allowNull: false,
        },
        refNo: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        chequeNo: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        remark: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        supporting: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        collectedAmt: {
            type: Sequelize.INTEGER,
            allowNull: false,
        }
    });
    return Payment;
};
//, amt_type, collected_amt, payment_mode,recovery_date, ref_no, remark, supporting     lead_id, loan_no, fos_id, ,  , , , cheque_no, . 