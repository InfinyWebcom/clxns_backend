const db = require('../models');
// UTILITIES
const email = require('../utils/email');

const ContactUs = db.contact_us;
const {
  create, findAll, findOne, update, deleteOne,
} = require('./crud.js')(ContactUs);

// Save Contact in the database
const contactUs = (req, res) => {
  ContactUs.create(req.body)
    .then((data) => {
      if (req.body.email) {
        console.log(req.body);
        const mailData = {
          email: 'bix@clxns.com',
          subject: `Enquiries for ${req.body.subject} - ${req.body.first_name} : ${req.body.phone}`,
          body:
            '<p>'
            + 'Dear Sir/Maam'
            + '<p>'
            + `Please find the below details regarding ${req.body.subject} :\n\n`
            + '<p>'
            + `<b>Name :</b> ${req.body.first_name} ${req.body.last_name}\n\n
            <br>`
            + `<b>Organisation :</b> ${req.body.organisation}\n\n
            <br>`
            + `<b>Designation :</b> ${req.body.designation}\n\n
            <br>`
            + `<b>Mobile No :</b> ${req.body.phone}\n\n
            <br>`
            + `<b>Email Id :</b> ${req.body.email}\n\n
            <br>`
            + `<b>Message :</b> ${req.body.message}\n\n
            <br>`
            + '<p>'
            + 'Regards,'
            + '<br>'
            + `${req.body.first_name} ${req.body.last_name}`
            + '<br>'
            + `Mob- ${req.body.phone}`
        };
        // console.log('MAIL :-', mailData);
        email.sendEmail(mailData);
      }
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || 'Some error occurred while creating the Contact.',
      });
    });
};
// Basic crud
module.exports = {
  create,
  contactUs,
  findAll,
  findOne,
  update,
  deleteOne,
};
