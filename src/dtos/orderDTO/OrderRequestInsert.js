const Joi = require('joi')

class OrderRequestInsert{
    constructor(data) {
        this.statusOrder=data.statusOrder,
        this.note=data.note,
        this.addressDelivery=data.addressDelivery,
        this.phone=data.phone,
        this.total=data.total,
        this.cusId=data.cusId
        this.listFood = data.listFood
    }

    static validate(data) {
        const schema = Joi.object({
            statusOrder: Joi.string().required(),
            note: Joi.string().optional(null),
            addressDelivery: Joi.string().required(),
            phone: Joi.string().max(10).regex(/^(03|05|07|08|09)\d{8}$/).required(),
            total: Joi.number().required(),
            cusId: Joi.number().required(),
            email: Joi.string(),
            listFood: Joi.array().items(Joi.object({
                foodId: Joi.number().required(),
                quantity: Joi.number().required(),
                total: Joi.number().required()
            })).min(1).required()
        })
        return schema.validate(data)
    }
}

module.exports = OrderRequestInsert