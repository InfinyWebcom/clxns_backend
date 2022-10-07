const db = require('../models');

const Users = db.users;
module.exports = (body) => [
  body('firstName')
    .isLength({ min: 3 })
    .withMessage('must be at least 3 chars long')
    .trim()
    .escape(),

  body('lastName')
    .optional()
    .trim()
    .escape(),

  body('email')
    .isEmail()
    .withMessage('please eneter valid email')
    .trim()
    .escape()
    .custom((value) => Users.findOne({
      where: {
        email: value,
      },
    }).then((user) => {
      if (user) {
        return Promise.reject(new Error('E-mail already in use'));
      }
      return false;
    })),

  body('phone')
    .isLength({ min: 10 })
    .withMessage('must be at least 10 chars long')
    .trim()
    .escape(),

  body('emergencyPhone')
    .isLength({ min: 10 })
    .withMessage('must be at least 10 chars long')
    .trim()
    .escape(),


  body('roleId')
    .isLength({ min: 1 })
    .withMessage('must be at least 1 chars long')
    .trim()
    .escape(),

    body('employeeId')
    .isLength({ min: 6 })
    .withMessage('must be at least 6 chars long')
    .trim()
    .escape(),
];
