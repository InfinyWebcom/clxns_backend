module.exports = (sequelize, Sequelize) => {
    const tempLeads = sequelize.define('tempLeads', {
      srNo:{
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        required: true,
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING,
        required: true,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        required: true,
        allowNull: false,
      },
      address: {
        type: Sequelize.STRING,
        required: true,
        allowNull: false,
      },
      amountDue: {
        type: Sequelize.INTEGER,
        required: false,
        allowNull: true,
      },
      // primaryAgent: {
      //   type: Sequelize.STRING,
      //   required: true,
      //   allowNull: false,
      // },
      pos: {
        type: Sequelize.INTEGER,
        required: true,
        allowNull: false,
      },
      // schemeCode: {
      //   type: Sequelize.STRING,
      //   required: true,
      //   allowNull: false,
      // },
      amountOutstanding: {
        type: Sequelize.INTEGER,
        required: true,
        allowNull: false,
      },
      daysDue: {
        type: Sequelize.INTEGER,
        required: true,
        allowNull: false,
      },
      loanAccountNo: {
        type: Sequelize.INTEGER,
        required: true,
        primaryKey: true,
        allowNull: false,
      },
      disbursementDate: {
        type: Sequelize.DATE,
        required: true,
        allowNull: false,
      },
      emiStartDate: {
        type: Sequelize.DATE,
        required: true,
        allowNull: false,
      },
      // numberOfPendingEMIs: {
      //   type: Sequelize.INTEGER,
      //   required: true,
      //   allowNull: false,
      // },
      penaltyAmount: {
        type: Sequelize.INTEGER,
        required: true,
        allowNull: false,
      },
      ODValue: {
        type: Sequelize.INTEGER,
        required: true,
        allowNull: false,
      },
      ODInt: {
        type: Sequelize.INTEGER,
        required: true,
        allowNull: false,
      },
      // callStatus: {
      //   type: Sequelize.ENUM,
      //   values: ['Pending', 'Ready To Pay', 'Promise To Pay', 'Refuse To Pay', 'Dispute',
      //     'Unraechable', 'Reminder', 'Surrender', 'Other'],
      //   allowNull: true,
      // },
      reminderDate: {
        type: Sequelize.DATE,
        required: false,
        allowNull: true,
      },
      closeStatus: {
        type: Sequelize.ENUM,
        values: ['Paid', 'Refuse To Pay', 'Legal', 'Expired', 'Unreachable'],
        allowNull:true
      },
      fieldVisitStatus: {
        type: Sequelize.ENUM,
        values: ['Assigned', 'Unassigned'],
        allowNull:true
      },
      collectionStatus: {
        type: Sequelize.ENUM,
        values: ['Paid', 'Pending'],
      },
      DPDBucket: {
        type: Sequelize.STRING,
        required:false,
        allowNull: true,
      },
      location: {
        type: Sequelize.STRING,
        required:false,
        allowNull: true,
      },
      transactionType: {
        type: Sequelize.ENUM,
        values: ['Cheque', 'Online'],
        allowNull:true
      },
      chequeNo: {
        type: Sequelize.STRING,
        allowNull:true
      },
      chequeDate: {
        type: Sequelize.DATE,
        required:false,
        allowNull: true,
      },
      chequeBank: {
        type: Sequelize.STRING,
        allowNull:true
      },
      transactionNo: {
        type: Sequelize.STRING,
        allowNull:true
      },
      imageVerified: {
        type: Sequelize.ENUM,
        values: ['Yes', 'No'],
        allowNull:true
      },
      locationVerified: {
        type: Sequelize.ENUM,
        values: ['Yes', 'No'],
        allowNull:true
      },
      intendToPay: {
        type: Sequelize.ENUM,
        values: ['Yes', 'No'],
        allowNull:true
      },
      abilityToPay: {
        type: Sequelize.ENUM,
        values: ['Yes', 'No'],
        allowNull:true
      },
      paymentStatus: {
        type: Sequelize.STRING,
        required:false,
        allowNull: false,
        defaultValue:'pending'
      },
      isDeleted: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      telecallerAssignedDate: {
        type: Sequelize.DATE,
      },
      fosAssignedDate: {
        type: Sequelize.DATE,
        allowNull:true
      },
      teamId: {
        type: Sequelize.INTEGER,
        required:false,
        allowNull: true,
      },
      telecallerId: {
        type: Sequelize.INTEGER,
        required:false,
        allowNull: true,
      },
      fosId: {
        type: Sequelize.INTEGER,
        required:false,
        allowNull: true,
      },
      fosTeamId: {
        type: Sequelize.INTEGER,
        required:false,
        allowNull: true,
      },
      expiryDate: {
        type: Sequelize.DATE,
        required:false,
        allowNull:true,
      },
      amountCollected:{
        type:Sequelize.INTEGER,
        required:false,
        allowNull:true    },
      allocationDate: {
        type: Sequelize.DATE,
        required:false,
        allowNull:true,
      },
      applicantPanNumber: {
        type: Sequelize.INTEGER,
        required:false,
        allowNull:true,
      },
      applicantDob: {
        type: Sequelize.DATE,
        required:false,
        allowNull:true,
      },
      emiDueAmount: {
        type: Sequelize.INTEGER,
        required:false,
        allowNull:true,
      },
      dateOfDefault: {
        type: Sequelize.DATE,
        required:false,
        allowNull:true,
      },
      allocationDpd: {
        type: Sequelize.INTEGER,
        required:false,
        allowNull:true,
      },
      disbursementType: {
        type: Sequelize.STRING,
        required:false,
        allowNull:true,
      },
      applicantPincode:{
        type: Sequelize.INTEGER,
        required:false,
        allowNull:true,
      },
      loanType: {
        type: Sequelize.STRING,
        required:false,
        allowNull:true
      },
      tenureFinished: {
        type: Sequelize.BOOLEAN,
        required:false,
        allowNull:true
      },
      applicantCibilScore: {
        type: Sequelize.INTEGER,
        required:false,
        allowNull:true
      },
      applicantAddressType: {
        type: Sequelize.STRING,
        required:false,
        allowNull:true
      },
      applicantAltAddressType: {
        type: Sequelize.STRING,
        required:false,
        allowNull:true
      },
      applicantAltCity: {
        type: Sequelize.STRING,
        required:false,
        allowNull:true
      },
      applicantAltState: {
        type: Sequelize.STRING,
        required:false,
        allowNull:true
      },
      applicantAltPincode: {
        type: Sequelize.STRING,
        required:false,
        allowNull:true
      },
      refRelationWithApplicant_1: {
        type: Sequelize.STRING,
        required:false,
        allowNull:true
      },
      refContactNumber_1: {
        type: Sequelize.STRING,
        required:false,
        allowNull:true
      },
      refRelationWithApplicant_2: {
        type: Sequelize.STRING,
        required:false,
        allowNull:true
      },
      refContactNumber_2: {
        type: Sequelize.STRING,
        required:false,
        allowNull:true
      },
      refRelationWithApplicant_3: {
        type: Sequelize.STRING,
        required:false,
        allowNull:true
      },
      refContactNumber_3: {
        type: Sequelize.STRING,
        required:false,
        allowNull:true
      },
      engineNumber: {
        type: Sequelize.STRING,
        required:false,
        allowNull:true
      },
      vehicleRegistrationNumber: {
        type: Sequelize.STRING,
        required:false,
        allowNull:true
      },
      coApplicantName: {
        type: Sequelize.STRING,
        required:false,
        allowNull:true
      },
      coApplicantEmail: {
        type: Sequelize.STRING,
        required:false,
        allowNull:true
      },
      coApplicantContactNumber: {
        type: Sequelize.STRING,
        required:false,
        allowNull:true
      },
      coApplicantDob: {
        type: Sequelize.STRING,
        required:false,
        allowNull:true
      },
      coApplicantAddressType: {
        type: Sequelize.STRING,
        required:false,
        allowNull:true
      },
      coApplicantAddress: {
        type: Sequelize.STRING,
        required:false,
        allowNull:true
      },
      coApplicantCity: {
        type: Sequelize.STRING,
        required:false,
        allowNull:true
      },
      coApplicantState: {
        type: Sequelize.STRING,
        required:false,
        allowNull:true
      },
      coApplicantPincode: {
        type: Sequelize.STRING,
        required:false,
        allowNull:true
      },
      band: {
        type: Sequelize.STRING,
        required:false,
        allowNull:true
      },
      agentId: {
        type: Sequelize.STRING,
        required:false,
        allowNull:true
      },
      totalLoanAmount: {
        type: Sequelize.INTEGER,
        required:false,
        allowNull:true
      },
      totalDueAmount: {
        type: Sequelize.INTEGER,
        required:false,
        allowNull:true
      },
      principalOutstandingAmount: {
        type: Sequelize.INTEGER,
        required:false,
        allowNull:true
      },
      interestDueAmount: {
        type: Sequelize.INTEGER,
        required:false,
        allowNull:true
      },
      penalAmount: {
        type: Sequelize.INTEGER,
        required:false,
        allowNull:true
      },
      emiAmount: {
        type: Sequelize.INTEGER,
        required:false,
        allowNull:true
      },
      allocationDpdBucket: {
        type: Sequelize.STRING,
        required:false,
        allowNull:true
      },
      loanDisbursementDate: {
        type: Sequelize.DATE,
        required:false,
        allowNull:true
      },
      loanMaturityDate: {
        type: Sequelize.DATE,
        required:false,
        allowNull:true
      },
      businessName: {
        type: Sequelize.STRING,
        required:false,
        allowNull:true
      },
      applicantAddress: {
        type: Sequelize.STRING,
        required:false,
        allowNull:true
      },
      applicantCity: {
        type: Sequelize.STRING,
        required:false,
        allowNull:true
      },
      applicantState: {
        type: Sequelize.STRING,
        required:false,
        allowNull:true
      },
      applicantAltAddress: {
        type: Sequelize.STRING,
        required:false,
        allowNull:true
      },
      refName_1: {
        type: Sequelize.STRING,
        required:false,
        allowNull:true
      },
      refName_2: {
        type: Sequelize.STRING,
        required:false,
        allowNull:true
      },
      refName_3: {
        type: Sequelize.STRING,
        required:false,
        allowNull:true
      },
      applicantAlternateMobile_1: {
        type: Sequelize.STRING,
        required:false,
        allowNull:true
      },
      applicantAlternateMobile_2: {
        type: Sequelize.STRING,
        required:false,
        allowNull:true
      },
      applicantAlternateMobile_3: {
        type: Sequelize.STRING,
        required:false,
        allowNull:true
      },
      makeAndModel: {
        type: Sequelize.STRING,
        required:false,
        allowNull:true
      },
      chassisNumber: {
        type: Sequelize.STRING,
        required:false,
        allowNull:true
      },
      key: {
        type: Sequelize.STRING,
        required:false,
        allowNull:true
      },
      requestReassign: {
        type: Sequelize.STRING,
        defaultValue: false,
      },
    });
    return tempLeads;
  };