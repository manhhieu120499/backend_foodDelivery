const router = require('express').Router()
const {login, signUp, logout, getUser, updateProfileUser} = require('../controller/auth.controller')
const {protectRoute} = require('../middlewares/auth.middleware')
const {conditionalUpload} = require('../middlewares/upload.middleware')

router.post('/login', login)
router.post('/logout', logout)
router.post('/sign-up', signUp)
router.get('/users/:id', protectRoute, getUser)
router.patch('/users/update/:id',conditionalUpload, protectRoute, updateProfileUser)

module.exports = router