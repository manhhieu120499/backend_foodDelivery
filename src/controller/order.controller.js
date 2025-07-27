const { where } = require('sequelize')
const db = require('../../models')
const {STATUS_ORDER} = require('../constrants')
const logger = require('pino')()
const createOrder = async (req, res) => {
    const transaction = await db.sequelize.transaction()
    try{
        const {statusOrder, note, addressDelivery, phone, total, cusId, listFood} = req.body
        const Order = await db.Order.create({
            statusOrder: STATUS_ORDER[statusOrder],
            note, 
            addressDelivery, 
            phone,
            total,
            cusId
        }, {transaction})
        const promiseListFood = listFood.map(foodItem => db.OrderDetail.create({
            ...foodItem,
            orderId: Order.orderId
        }, {transaction}))

        const resultAddListFood = await Promise.all(promiseListFood)
        
        await transaction.commit()
        return res.status(201).json({
            status: 'OK',
            message: 'Create order successfully'
        })
    }catch(err) {
        logger.error(`Create order failed: ${err}`)
        await transaction.rollback()
        return res.status(500).json({
            status: 'ERR',
            message: 'Create order failed: ' + err
        })
    }
}

const getOrder = async (req, res) => {
    try{
        const {id} = req.params;
        if(!id) return res.status(400).json({
            status: 'ERR',
            message: 'Please provide orderId'
        })
        const Order = await db.Order.findOne({include:[{
            model: db.OrderDetail,
            where: {orderId: id}
        }]})
        if(!Order) {
            return res.status(404).json({
                status: 'ERR',
                message: 'Order not found'
            })
        }
        return res.status(200).json({
            status: 'OK',
            message: 'Get Order successfully',
            data: Order
        })
    }catch(err) {
        logger.error(`Get Order Failed: ${err}`)
        return res.status(500).json({
            status: 'ERR',
            message: 'Get Order Failed: ' + err
        })
    }
}

const getOrderByCusId = async (req, res) => {
    try{
        const {email} = req.body
        const Account = await db.Account.findOne({where: {email}})
        const listOrder = await db.Order.findAll({include: [{
            model: db.OrderDetail,
        }]},{where: {cusId: Account.cusId}})
        
        return res.status(200).json({
            status: 'OK',
            message: 'Get Order of customer successfully',
            data: listOrder
        })
    }catch(err) {
        return res.status(500).json({
            status: 'ERR',
            message: 'Get Order of customer failed: ' + err
        })
    }
}

const getAllOrder = async (req, res) => {
    try{
        const {email} = req.body
        const Account = await db.Account.findOne({where: {email}})
        if(Account.role !== "admin") {
            return res.status(500).json({
                status: 'ERR',
                message: 'Only Admin can get all order'
            })
        }
        const listOrder = await db.Order.findAll({
            include: [
                {
                    model: db.OrderDetail
                }
            ]
        })
        return res.status(200).json({
            status: 'OK',
            message: 'Get all order successfully',
            data: listOrder
        })
    }catch(err) {
        return res.status(500).json({
            status: 'ERR',
            message: 'Get all order failed: ' + err
        })
    }
}

module.exports = {createOrder, getOrder, getOrderByCusId, getAllOrder}