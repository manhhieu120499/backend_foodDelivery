const logger = require('pino')()
const { where } = require('sequelize')
const db = require('../../models')
const { uploadImage } = require('../lib/cloudinary')

const getAllFood = async (req, res) => {
    try{    
        const foodList = await db.Food.findAll()
        return res.status(200).json({
            status: 'OK',
            message: 'Get all food successfully',
            data: foodList
        })
    }catch(err) {
        logger.error(`Get all food failed ${err}`)
        return res.status(500).json({
            status: 'ERR',
            message: 'Get all food failed: ' + err
        })
    }
}

const createFood = async (req, res) => {
    const transaction = await db.sequelize.transaction()
    try {
        const {email, name, des, price, categoryId} = req.body
        const [Account, Category] = await Promise.all([db.Account.findOne({where: {email}}), db.Category.findOne({where: {categoryId}})])
        if(Account.role !== 'admin') return res.status(500).json({
            status: 'ERR',
            message: 'Only Admin can create food'
        })

        if(!Category) return res.status(404).json({
            status: 'ERR',
            message: 'Category of food not found'
        })

        // upload image
        const base64 = req.file.buffer.toString('base64')
        const formatUrlImage = `data:${req.file.mimetype};base64,${base64}`
        const urlImage = await uploadImage(formatUrlImage)
        if(!urlImage) return res.status(500).json({
            status: 'ERR',
            message: 'Upload image food failed, please try again'
        })

        const newFood = await db.Food.create({
            name,
            image: urlImage, 
            des,
            price,
            categoryId
        }, {transaction})
        await transaction.commit()
        return res.status(201).json({
            status: 'OK',
            message: 'Create food successfully',
            data: newFood
        })

    }catch(err) {
        logger.error(`Create food failed: ${err}`)
        await transaction.rollback()
        return res.status(500).json({
            status: 'ERR',
            message: 'Create food failed: ' + err
        })
    }
}

const deleteFood = async (req, res) => {
    const transaction = await db.sequelize.transaction()
    try{
        const {id} = req.params
        const {email} = req.body
        const Account = await db.Account.findOne({where: {email}})
        if(Account.role !== 'admin') return res.status(500).json({
            status: 'ERR',
            message: 'Only Admin can create food'
        })

        const existFood = await db.Food.findOne({where: {foodId: id}})
        if(!existFood) {
            return res.status(404).json({
                status: 'ERR',
                message: 'Food is not exist'
            })
        }

        await db.Food.destroy({where: {foodId: id}})
        await transaction.commit()
        return res.status(200).json({
            status: 'OK',
            message: 'Delete food successfully'
        })
    }catch(err) {
        logger.error(`Delete food failed ${err}`)
        await transaction.rollback()
        return res.status(500).json({
            status: 'ERR',
            message: 'Delete food failed: ' + err
        })
    }
}

const updateFood = async (req, res) => {
    const transaction = await db.sequelize.transaction()
    try{
        const {id} = req.params
        const {name, des, price, email} = req.body
        // check account role
        const Account = await db.Account.findOne({where: {email}})
        if(!Account) return res.status(404).json({
            status: 'ERR',
            message: 'Account not found'
        })

        if(Account.role !== 'admin') {
            return res.status(500).json({
                status: 'ERR',
                message: 'Only Admin can update food'
            })
        }

        // check exist food
        const existFood = await db.Food.findOne({where: {foodId: id}})
        if(!existFood) return res.status(404).json({
            status: 'ERR',
            message: 'Food not found'
        })

        let newFood = {}
        if(name) newFood.name = name
        if(des) newFood.des = des
        if(price) newFood.price = price
        if(req.file) {
            const base64 = req.file.buffer.toString('base64')
            const formatUrlImage = `data:${req.file.mimetype};base64,${base64}`
            const urlImage = await uploadImage(formatUrlImage)
            if(!urlImage) return res.status(500).json({
                status: 'ERR',
                message: 'Upload image failed, please try again'
            })
            newFood.image = urlImage
        }

        const newFoodUpdate = await db.Food.update({...newFood}, {where: {foodId: id},transaction})
        await transaction.commit()
        return res.status(200).json({
            status: 'OK',
            message: 'Update food successfully',
            data: newFoodUpdate
        })
    }catch(err) {
        logger.error(`Update food failed: ${err}`)
        await transaction.rollback()
        return res.status(500).json({
            status: 'ERR',
            message: 'Update food failed: ' + err
        })
    }
}

module.exports = {getAllFood, createFood, deleteFood, updateFood}