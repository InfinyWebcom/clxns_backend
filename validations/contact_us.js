module.exports = (body) => { 
    return [
        body('first_name')
        .isLength({ min: 3 })
        .withMessage('must be at least 3 chars long')
        .trim()
        .escape(),

        body('last_name')
        .optional()
        .trim()
        .escape(),

        body('organisation')
        .optional()
        .trim()
        .escape(),

        body('designation')
        .trim()
        .escape(),

        body('subject')
        .isLength({ min: 1 })
        .withMessage('please select 1 subject')
        .trim()
        .escape(),

        body('email')
        .isEmail()
        .withMessage('must be at least 10 chars long')
        .trim()
        .escape(),

        body('phone')
        .trim()
        .escape(),

        body('message')
        .isLength({ min: 2 })
        .withMessage('must be at least 10 chars long')
        .trim()
        .escape(),

    ]
}