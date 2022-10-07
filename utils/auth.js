/* eslint-disable linebreak-style */
/* eslint-disable no-lonely-if */
/* eslint-disable no-else-return */
/* eslint-disable linebreak-style */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
const db = require('../models');

const Users = db.users;
const FisLogin = db.fisLogins;
const Permissions = db.permissions;
const Roles = db.roles;
const Modules = db.modules;
const RoleModules = db.rolesModules;

const isLoggedin = async (req, res, next) => {

  if(res.locals.roleName=='FiName'){
    if (req.session.loggedin) {
      const userData = await FisLogin.findOne({
        where: { email: req.session.email },
      });
      return next(null, userData);
    }
    return res.redirect('/fis/login');
  }else{
    if (req.session.loggedin) {
      const userData = await Users.findOne({
        where: { email: req.session.email },
      });
      return next(null, userData);
    }
    return res.redirect('/user/login');
  }
};


const authenticate = (route, action) => async (req, res, next) => {
 

  const userData = await Users.findOne({
    where: { email: req.session.email },
    include: [{ model: Roles, as: 'roles' }],
  });

  // console.log('\n\nPERMISSION - userData :-', userData.dataValues.roles, '\n\n');
  // const routePermission = await Permissions.findAll({
  //   where: { role: userData.role, module: route },
  // });

 
  const routePermission = await Modules.findAll({
    where: { name: route },
    raw: true,
  });

  

  if (userData == null || routePermission == null || userData.dataValues.roles == null) {
    return res.redirect('/bad-request');
  }
  const routeIndex = routePermission.findIndex((e) => e.name === route);
  const actionIndex = routePermission.findIndex((e) => e.actions === action);

  const permissionsListArray = [];
  const permissionsActions = routePermission;
  await Promise.all(permissionsActions.map(async (permissionsactions) => {
    const routePermissionCheck = await RoleModules.findOne({
      where: { roleId: userData.roleId, moduleId: permissionsactions.id },
    });

    // console.log('\n\nroutePermissions - USER :-', routePermissionCheck, '\n\n');

    if (routePermissionCheck) {
      permissionsListArray.push(
        {
          role: userData.roles.name, module: route, action: permissionsactions.actions,
        },
      );
    }
    
  }));

  if (userData == null || routeIndex === -1 || actionIndex === -1) {
    return res.redirect('/bad-request');
  } else {
    const permissions = permissionsListArray;
    
    if (permissions.length > 0) {
      const permissionsList = [];
      permissions.forEach((permission) => {
        permissionsList.push(permission.action);
      });

      req.permissionsList = permissionsList;
      return next(null, permissionsList);
    } else {
      return res.redirect('/bad-request');
    }
  }
};

module.exports = {
  isLoggedin,
  authenticate,
};
