const router = require('express').Router()
const {createOrder, getOrder, getOrderByCusId, getAllOrder} = require('../controller/order.controller')
const OrderRequestInsert = require('../dtos/orderDTO/OrderRequestInsert')
const validate = require('../middlewares/validate.middleware')
const {protectRoute} = require('../middlewares/auth.middleware')

router.get('/all', protectRoute, getAllOrder)
router.get('/admin/:id', protectRoute, getOrder)
router.get("/my-order", protectRoute, getOrderByCusId)
router.post("/create", protectRoute, validate(OrderRequestInsert), createOrder)

module.exports = router