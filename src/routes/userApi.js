const express = require('express')
const routes = express.Router()

const authController = require('../controllers/User/UserAuthController')
const { getNotifactions, readNotifications } = require('../controllers/User/UserNotificationController')
const passwordController = require('../controllers/User/UserPasswordController')
const profileController = require('../controllers/User/UserProfileController')
const { RegisterValidators, LoginValidators, LoginVerifyValidators } = require('../validators/User/AuthValidators')
const { PasswordEmailValidators, PasswordTokenValidators, PasswordValidators } = require('../validators/User/PasswordValidators')
const { UserMiddleware } = require('../middlewares/authmiddleware')
const voucherController = require('../controllers/User/UserVoucherController')
const { redeemValidator } = require('../validators/User/voucherValidator')
const pointController = require('../controllers/User/UserPointsController')

const gamesController = require('../controllers/User/UserGameController')
const { getDashboard } = require('../controllers/User/UserDashboardController')

const { PointTransferValidators, verifyTokenValidators } = require('../validators/Merchant/PointTransferValidator')

const { SiteSettings } = require('../models/SiteConfig')
const { dataSuccess, notFoundError, validationError } = require('../utilities/responses')
const { User } = require('../models/User')

module.exports = () => {


    routes.get('/dashboard', UserMiddleware, getDashboard)

 routes.get('/sites', async(req, res)=>{
        await SiteSettings.findAll().then((data)=>{
            dataSuccess(res, data)
        }).catch((err)=>{
            notFoundError(res, err)
        })
    })

    // Auth Routes   
    routes.post('/register', RegisterValidators, authController.Register)
    routes.post('/login', LoginValidators, authController.Login)
    routes.post('/login-verify/:user', LoginVerifyValidators, authController.LoginVerification)
    routes.post('/resend-login-code/:user', authController.ResendLoginOtp)



    // Password Routes
    routes.post("/forget-password", PasswordEmailValidators, passwordController.forget_pwd),
    routes.post("/reset-password/:email", passwordController.reset_pwd),
    routes.post("/new-password/:email", PasswordValidators, passwordController.new_pwd)
    routes.post('/change-password',UserMiddleware, passwordController.change_password)


    // Profile Routes
    routes.get('/profile',UserMiddleware, profileController.getProfile)
    routes.put('/profile',UserMiddleware,async(req, res, next)=>{
        await User.findOne({where:{email:req.body.email}}).then(data=>{
            data ? validationError(res, "The Email already exists") : next()
        })
    } ,profileController.updateProfile)



    // routes.get('/email-verify/:email/:vCode', authController.emailVerificationlength)
    // routes.get('/new-email-code/:email', authController.NewEmailVerificationLink)

    routes.get('/points-details', UserMiddleware, pointController.PointDetails)
    routes.get('/points', UserMiddleware, pointController.Point)


    // Voucher Routes
    routes.post('/redeem-voucher', UserMiddleware, redeemValidator, voucherController.redeem)

    // Notification Routes
    routes.get('/notifications/', UserMiddleware, getNotifactions)
    routes.get('/notifications/read', UserMiddleware, readNotifications)

    // routes Games

    routes.get('/games', gamesController.getGames)
    routes.get('/game/:id',UserMiddleware ,gamesController.getGame)


    routes.post('/play-game',UserMiddleware, gamesController.playGame )
    routes.get('/played-game',UserMiddleware ,gamesController.playedGames )

    routes.get('/get-transfer-token', UserMiddleware, pointController.requestToken)
    routes.post('/verify-transfer-token', UserMiddleware, verifyTokenValidators, pointController.verifyToken)
    routes.post('/transfer-points',UserMiddleware, PointTransferValidators, async (req, res, next) => {
        if (req.query.check === "true") {
            const data = await User.findOne({ where: { phone: req.body.phone } })
            dataSuccess(res, data)
        }
        else { next() }
    },   pointController.pointTransfer)



    return routes

}