const express = require('express')
const routes = express.Router()
const axios = require('axios')

const authController = require('../controllers/Merchant/MerchantAuthController')
const passwordController = require('../controllers/Merchant/MerchantPasswordController')
const voucherCategory = require('../controllers/Merchant/MerchantVoucherCatgerory')
const voucherList = require('../controllers/Merchant/MerchantVoucherList')
const pointController = require('../controllers/Merchant/MerchantPointController')
const { MerchantMiddleware } = require('../middlewares/authmiddleware')
const subMerchantController = require('../controllers/Merchant/SubMerchantController')
const PointConfigController = require('../controllers/Merchant/MerchantPointConfiguration')
const GameController = require('../controllers/Merchant/MerchantGameController')
const { ApiController } = require('../controllers/Merchant/MerchantApi')
const { getAllInventory, AddInventory, getSingleInventory } = require('../controllers/Merchant/MerchantInventory')


// Validators
const { PointTransferValidators, verifyTokenValidators } = require('../validators/Merchant/PointTransferValidator')
const merchantCategoryValidators = require('../validators/Merchant/MerchantCategoryValidators')
const { RegisterValidators, LoginValidators, LoginVerifyValidators } = require('../validators/Merchant/AuthValidators')
const { PasswordValidators } = require('../validators/User/PasswordValidators')
const { ApiValidators } = require('../validators/Merchant/ApiValidators')
const SubMerchantValidators = require('../validators/Merchant/merchantValidators')
const { ImageValidators, merchantValidator, userValidator } = require('../validators/Merchant/ProfileValidators')
const MerchantValidator = require('../validators/Merchant/MerchantInventory')
const { Merchant } = require('../models/Merchant')
const { VoucherCategory } = require('../models/VoucherCategory')
const { dataSuccess } = require('../utilities/responses')
const { User } = require('../models/User')


module.exports = () => {
    // Auth Routes
    routes.post('/login', LoginValidators, authController.Login)
    routes.post('/login-verify/:user', LoginVerifyValidators, authController.LoginVerification)
    routes.post('/resend-login-code/:user', authController.ResendLoginOtp)
    routes.get('/profile', MerchantMiddleware, authController.profile)
    routes.put('/user-credential', MerchantMiddleware, userValidator, authController.updateUser)
    routes.put('/merchant-credential', MerchantMiddleware, merchantValidator, authController.updateMerchant)
    routes.put('/image', MerchantMiddleware, ImageValidators, authController.updateImage)


    routes.get('/verify', MerchantMiddleware, async (req, res) => {
        res.status(200).send("Verified")
    })


    routes.get('/dashboard', MerchantMiddleware, async (req, res) => {
        const merchant = await Merchant.findAll({ where: { merchant_id: req.merchant.id } })
        const voucher = await VoucherCategory.findAndCountAll({ where: { merchant_id: req.merchant.id } })
        dataSuccess(res, { merchant: merchant, voucher: voucher })
    })

    // password routes
    routes.post('/forget-password', passwordController.forget_pwd)
    routes.post("/reset-password/:email", passwordController.reset_pwd),
        routes.post("/new-password/:email", PasswordValidators, passwordController.new_pwd)
    routes.post('/change-password', MerchantMiddleware, PasswordValidators, passwordController.change_password)

    // Point Config
    routes.put('/pointsConfig', MerchantMiddleware, PointConfigController.update)
    routes.get('/points-history', MerchantMiddleware, pointController.getAllPointHistory)
    routes.get('/point', MerchantMiddleware, pointController.getAllPoint)


    // Voucher Routes
    routes.get('/voucher-categories', MerchantMiddleware, voucherCategory.list)
    routes.post('/voucher-category', MerchantMiddleware, merchantCategoryValidators.create, voucherCategory.store)
    routes.put('/voucher-category', MerchantMiddleware, merchantCategoryValidators.update, voucherCategory.update)
    routes.get('/voucher-category/:id', MerchantMiddleware, voucherCategory.show)


    // voucher List Routes
    routes.get('/voucher-lists/:id', MerchantMiddleware, voucherList.list)
    routes.post('/voucher-lists/:id', MerchantMiddleware, merchantCategoryValidators.voucherList, voucherList.store)
    routes.put('/voucher-list', MerchantMiddleware, voucherList.update)

    // Sub-Merchant Controller
    routes.get('/submerchants', MerchantMiddleware, subMerchantController.subMerchant)
    routes.post('/add-submerchant', MerchantMiddleware, SubMerchantValidators.store, subMerchantController.addSubMerchant)
    routes.delete('/submerchant/:id', MerchantMiddleware, subMerchantController.deleteMerchant)
    routes.post('/send-point/:id', MerchantMiddleware, subMerchantController.sendPoint)


    //Inventory Controller
    routes.get('/get-all-inventory', MerchantMiddleware, getAllInventory)
    routes.get('/get-inventory/:id', MerchantMiddleware, getSingleInventory)
    routes.post('/add-product', MerchantMiddleware, MerchantValidator.store, AddInventory)


    // Game-Controller
    routes.get('/games', MerchantMiddleware, GameController.show)
    routes.get('/game/:id', MerchantMiddleware, GameController.showGame)
    routes.post('/game', MerchantMiddleware, GameController.post)
    routes.get('/played-game', MerchantMiddleware, GameController.getPlayedGame)

    // routes.get('/games',MerchantMiddleware, GameController.show)

    // Point tranfer Routes 
    routes.get('/get-transfer-token', MerchantMiddleware, pointController.requestToken)
    routes.post('/verify-transfer-token', MerchantMiddleware, verifyTokenValidators, pointController.verifyToken)
    routes.post('/transfer-points',MerchantMiddleware, PointTransferValidators, async (req, res, next) => {
        if (req.query.check === "true") {
            const data = await User.findOne({ where: { phone: req.body.phone } })
            dataSuccess(res, data)
        }
        else { next() }
    },   pointController.pointTransfer)

    // Api Controller
    routes.post('/main-api-controller', ApiValidators, ApiController)
    return routes

}
