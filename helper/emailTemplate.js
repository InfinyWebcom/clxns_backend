// UTILITIES
const emailHelper = require('../utils/email');

const getEmailTemplate = (name, data) => {
    var template = {}
    switch(name) {
        case "forgot_password":
            template = {
                subject: "CLXNS - User Forgot Password!",
                body: '<p>'
                + 'Dear ' 
                + data.name
                + '<p>'
                + data.verifyOtp
                + ' is your One Time Password. Please complete your OTP verification. OTP is Valid for 10 min.'
                + '<p>'
                + 'Regards,'
                + '<br>'
                + 'Team CLXNS',
            }        
            break;
        default:
            template = ""
    }

    let mailData = {
        email: data.email,
        subject: template.subject,
        body: template.body
    };
    emailHelper.sendEmail(mailData);
}

module.exports = {
    getEmailTemplate
}