const { createFood, getAllFood, deleteFood, updateFood } = require('../controller/food.controller')
const { protectRoute } = require('../middlewares/auth.middleware')
const { conditionalUpload, upload } = require('../middlewares/upload.middleware')
const validate = require('../middlewares/validate.middleware')
const router = require('express').Router()
const FoodRequestInsert = require('../dtos/foodDTO/FoodRequestInsert')
const FoodRequestDelete = require('../dtos/foodDTO/FoodRequestDelete')
const FoodRequestUpdate = require('../dtos/foodDTO/FoodRequestUpdate')

router.get('/', getAllFood)
router.post('/admin/create', upload, protectRoute, validate(FoodRequestInsert), createFood)
router.delete('/admin/delete/:id', protectRoute,validate(FoodRequestDelete), deleteFood)
router.patch('/admin/update/:id', conditionalUpload, protectRoute, validate(FoodRequestUpdate), updateFood)


module.exports = router