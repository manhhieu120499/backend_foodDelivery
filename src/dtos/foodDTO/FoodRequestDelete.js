const Joi = require('joi')

class FoodRequestDelete {
    constructor(data) {
        this.id = data.id;
        this.email = data.email
    }

    static validate(data) {
        const schema = Joi.object({
            id: Joi.number().min(1).required(),
            email: Joi.string().email().required()
        })
        return schema.validate(data)
    }
}

module.exports = FoodRequestDelete