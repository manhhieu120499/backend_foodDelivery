const router = require('express').Router()
const {getAllCategory, createCategory, updateCategory, deleteCategory, getCategory} = require('../controller/category.controller')
const { protectRoute } = require('../middlewares/auth.middleware')
const {upload, conditionalUpload} = require('../middlewares/upload.middleware')

router.get('/', getAllCategory)
router.get('/:id', getCategory)
router.post('/admin/create', upload, protectRoute,createCategory)
router.patch('/admin/update/:id', conditionalUpload, protectRoute, updateCategory)
router.delete('/admin/delete/:id', protectRoute, deleteCategory)

module.exports = router