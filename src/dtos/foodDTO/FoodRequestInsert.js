const Joi = require('joi')

class FoodRequestInsert {
    constructor(data){
        this.name = data.name;
        this.image = data.image;
        this.des = data.des;
        this.price = data.price;
        this.categoryId = data.categoryId;
    }

    static validate(data) {
        const schema = Joi.object({
            name: Joi.string().required(),
            image: Joi.string().uri(),
            des: Joi.string().required(),
            price: Joi.number().min(0).required(),
            categoryId: Joi.number().min(1).required(),
            email: Joi.string().email().required()
        })
        return schema.validate(data)
    }
}

module.exports = FoodRequestInsert;