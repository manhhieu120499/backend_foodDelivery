const Joi = require('joi')

class FoodRequestUpdate {
    constructor(data){
        this.is = data.id
        this.name = data.name;
        this.image = data.image;
        this.des = data.des;
        this.price = data.price;
    }

    static validate(data) {
        const schema = Joi.object({
            id: Joi.number().required(),
            name: Joi.string(),
            image: Joi.string().uri(),
            des: Joi.string(),
            price: Joi.number().min(0),
            email: Joi.string().email()
        })
        return schema.validate(data)
    }
}

module.exports = FoodRequestUpdate;