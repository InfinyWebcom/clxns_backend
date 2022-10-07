// NODE MODULES
const FCM = require('fcm-push');

// DATABASE
const db = require('../models');
const Op = db.Sequelize.Op;
const Notification = db.notification;
const Users = db.users;

// GLOBAL CONSTANTS
const fcmServerKey = process.env.fcmServerKey;
const fcm = new FCM(fcmServerKey);

/* 
# parameters: token
*/
const sendNotification = async (data) => {
    console.log('sendNotification data ==== ', data);

    data.flag = data.data.flag;
    data.title = 'Clxns';
    data.vibrate = [100, 50, 100];
    data.body = data.msg;
    data.sound = "default";

    var message = {
        registration_ids: data.device_token,
        priority: "high",
        forceshow: true, // required fill with device token or topics
        collapse_key: 'Clxns',
        content_available: true,
        data: data.data,
        notification: {
            title: data.data.flag,
            body: data.msg,
            sound: "default"
        }
    };

    if (data.data.flag != 'Testing') {
        const newNotif = {
            fosId: data.fosId,
            message: data.message,
            flag: data.flag
        };
        
        const createNotif = await Notification.create(newNotif);
        let id = createNotif.dataValues.id;
    }

    fcm.send(message, function (err, response) {
        if (err) {
            console.log('sendNotification err ==== ', data.data.flag, data.msg, err);
        } else {
            console.log('sendNotification response ==== ', response);
        }
    });
}

module.exports = {
    sendNotification
};