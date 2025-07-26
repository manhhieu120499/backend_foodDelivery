const { where } = require('sequelize')
const db = require('../../models')
const { uploadImage } = require('../lib/cloudinary')
const logger = require('pino')()
const validator = require('validator')
const getAllCategory = async (req, res) => {
    try {
        const categoryList = await db.Category.findAll({})
        return res.status(200).json({
            status: 'OK',
            message: 'Get list category successfully',
            data: categoryList
        })
    }catch(err) {
        logger.error(`Get list category failed: ` + err)
        return res.status(500).json({
            status: 'ERR',
            message: 'Get list category failed: ' + err
        })
    }
}

const createCategory = async (req, res) => {
    const transaction = await db.sequelize.transaction()
    try{
        if(!req.body.name) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Name is not empty'
            })
        }
        if(!/^[a-zA-z ]/.test(req.body.name)) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Name is string'
            })
        }

        const Account = await db.Account.findOne({
            where: {email: req.body.email}
        })
        
        if(Account.role === 'customer') {
            return res.status(500).json({
                status: 'ERR',
                message: 'Only Admin can create category'
            })
        } 
        
        const base64 = req.file.buffer.toString('base64')
        const filePath = `data:${req.file.mimetype};base64,${base64}`
        const imageUrl = await uploadImage(filePath)
        if(imageUrl == null) {
            return res.status(500).json({
                status: 'ERR',
                message: 'Upload image category failed, try again'
            })
        }
       
        const category = await db.Category.create({
            name:req.body.name,
            image: imageUrl
        }, {transaction})
        await transaction.commit()
        return res.status(201).json({
            status: 'OK',
            message: 'Create category successfully',
            data: category
        })
    }catch(err) {
        logger.error(`Create category failed: ${err}`)
        await transaction.rollback()
        return res.status(500).json({
            status: 'ERR',
            message: 'Create category failed: ' + err,
        })
    }
}

const updateCategory = async (req, res) => {
    const transaction = await db.sequelize.transaction()
    try{
        const {id} = req.params
        if(!id) return res.status(400).json({
            status: 'ERR',
            message: 'Id is require'
        })
        if(!validator.isNumeric(id)) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Id is number'
            })
        }
        let newCategory = {};
        if(req.body.name) {
            if(!/^[a-zA-z ]/.test(req.body.name)) {
                return res.status(400).json({
                    status: 'ERR',
                    message: 'Name is string'
                })
            }
            newCategory.name = req.body.name
        }
        
        const Account = await db.Account.findOne({
            where: {email: req.body.email}
        })
        
        if(Account.role === 'customer') {
            return res.status(500).json({
                status: 'ERR',
                message: 'Only Admin can create category'
            })
        } 
        
        if(req.file) {
            const base64 = req.file.buffer.toString('base64')
            const filePath = `data:${req.file.mimetype};base64,${base64}`
            const imageUrl = await uploadImage(filePath)
            if(imageUrl == null) {
                return res.status(500).json({
                    status: 'ERR',
                    message: 'Upload image category failed, try again'
                })
            }else newCategory.image = imageUrl
        }
       
        const category = await db.Category.update({
            ...newCategory
        }, {where: {categoryId: id}, transaction})
        await transaction.commit()
        return res.status(200).json({
            status: 'OK',
            message: 'Update category successfully',
            data: category
        })
    }catch(err) {
        logger.error(`Update category failed: ${err}`)
        await transaction.rollback()
        return res.status(500).json({
            status: 'ERR',
            message: 'Update category failed: ' + err,
        })
    }
}

const deleteCategory = async (req, res) => {
    const transaction = await db.sequelize.transaction()
    try{
        const {id} = req.params
        if(!id) return res.status(400).json({
            status: 'ERR',
            message: 'Please provide categoryId'
        })
        if(!validator.isNumeric(id)) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Id is number'
            })
        }

        // check category exist
        const existCategory = await db.Category.findOne({categoryId: id})
        if(!existCategory) {
            return res.status(404).json({
                status: 'ERR',
                message: 'Category not exist'
            })
        }

        await db.Category.destroy({where: {categoryId: id}, transaction})
        await transaction.commit()
        return res.status(200).json({
            status: 'OK',
            message: 'Delete category successfully'
        })
    }catch(err) {
        logger.error(`Delete category failed ${err}`)
        await transaction.rollback()
        return res.status(200).json({
            status: 'ERR',
            message: 'Delete category failed ' + err
        })
    } 
}

const getCategory = async (req, res) => {
    try{
        const {id} = req.params
        if(!id) return res.status(400).json(
            {
                status: 'ERR',
                message: "CategoryId is require"
            }
        )
        const category = await db.Category.findOne({where: {categoryId: id}})
        if(!category) {
            return res.status(404).json({
            status: 'OK',
            message: 'Category not found',
        })
        }
        return res.status(200).json({
            status: 'OK',
            message: 'Get category successfully',
            data: category
        })
    }catch(err) {
        logger.error(`Get category failed ${err}`)
        return res.status(500).json({
            status: 'ERR',
            message: 'Get category failed: ' + err
        })
    }
}

module.exports = {getAllCategory, createCategory, updateCategory, deleteCategory, getCategory}