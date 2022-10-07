// NODE MODULES
var jwt = require('jsonwebtoken');

// DATABASE
const db = require('../models');
const Op = db.Sequelize.Op;
const Users = db.users;
const Roles = db.roles;

const authenticateUser = async (req, res, next) => {
    const token = req.headers.token ? req.headers.token : req.query.token; 
    const decoded = jwt.decode(token, "clxns");
    console.log("decoded authenticateUser",decoded, token)
    try {
        const userData = await Users.findOne({ where: { id: decoded.user_id } })

        console.log("decoded userData",userData)
        if (!userData || userData == undefined) {
            return res.status(200).json({
                title: 'user not found',
                flag: 'user_not_found',
                error: true,
            });
        }
        if (userData.isDeleted == true) {
            return res.status(200).json({
                title: 'user deleted by admin',
                flag: 'user_deleted',
                error: true,
            });
        }
        req.user = userData;
        return next(null, userData);
    }
    catch (error) {
        return res.status(200).json({
            title: 'Authorization required.',
            flag: 'auth_required',
            error: true,
        });
    }  
}

module.exports = {
    authenticateUser
}