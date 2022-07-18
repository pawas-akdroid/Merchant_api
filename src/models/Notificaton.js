const { STRING, BOOLEAN, INTEGER, BIGINT } = require('sequelize')
const Sequelize = require('sequelize')
const db = require('../config/db')
const { generateUId, generateId } = require('../utilities/random')
const { blankSuccess, serverError } = require('../utilities/responses')
const { User } = require('./User')

const Notification = db.define('Notification', {
    id: {
        type: BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    uid: {
        type: BIGINT,
        allowNull: false
    },
    user_id: {
        allowNull: false,
        type: INTEGER,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    web_link: {
        type: STRING,
        allowNull: true,
    },
    app_link: {
        type: STRING,
        allowNull: true
    },
    notification_msg: {
        type: STRING,
        allowNull: false
    },
    seen: {
        defaultValue: false,
        type: BOOLEAN,
    },

}, { tableName: 'notification' })

Notification.sync({ alter: true })




const NotificationID = db.define('NotificationID', {
    id: {
        type: BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    uid: {
        type: BIGINT,
        unique: true,
        allowNull: false
    },


}, { tableName: 'notification_id' })

NotificationID.sync({ alter: false })



// NotificationID.belongsTo(Notification)


const createNotification = async (res, data) => {
    // try {
        const uid = generateUId()
        const user = await User.findAll()
        if (user.length>0){
            for (let i = 0; i < user.length; i++) {
                const element = user[i];
                const notification = await Notification.build({
                    'user_id': element.id,
                    "uid": uid,
                    "web_link": data.web_link,
                    "app_link": data.app_link,
                    "notification_msg": data.notification_msg,
                })
                notification.id = generateId()
                notification.save()
            }
            // await NotificationID.create({ id: generateId(), uid: uid })
            blankSuccess(res)

        }
//     }
//     catch (err) {
//         serverError(res, err)
//     }
}



module.exports = { Notification, createNotification, NotificationID }