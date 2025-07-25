const db = require('../../models')
const { generateToken } = require('../middlewares/auth.middleware')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const { where } = require('sequelize')
const logger = require('pino')() 

const signUp = async (req, res) => {
    const {email, password, username} = req.body
    if(!email || !password || !username) {
        return res.status(400).json({
            status: 'ERR',
            message: 'Please fill in email, password and username'
        })
    }

    if(!validator.isEmail(email)) {
        return res.status(400).json({
            status: 'ERR',
            message: 'Email invalid -> Example Correct: abc@gmail.com'
        })
    }

    if(!validator.isStrongPassword(password, {
        minLength: 8,
        minUppercase: 1,
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 1 // chua ki tu dac biet
    })) {
        return res.status(400).json({
            status: 'ERR',
            message: 'Password is not strong'
        })
    }

    if(username.length < 5) {
        return res.status(400).json({
            status: 'ERR',
            message: 'Min Length username is 5'
        })
    }
    const transaction = await db.sequelize.transaction()
    try{
        const {accessToken, refreshToken} = generateToken(email, res)
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password, salt)
        const Customer = await db.Customer.create({transaction})
        const Account = await db.Account.create({
            email,
            password: hashPassword,
            username, 
            accessToken, 
            refreshToken,
            cusId: Customer.cusId
        }, {transaction})
        await transaction.commit()
        return res.status(201).json({
            status: 'OK', 
            account: Account,
        })
    }catch(err) {
        logger.error(`Sign up failed: ${err}`)
        transaction.rollback()
        return res.status(400).json({
            status: 'ERR', 
            messageError: err
        })
    }
}

const login = async (req, res) => {
    const {email, password} = req.body
    if(!email || !password) {
        return res.status(400).json({
            status: 'ERR',
            message: 'Please fill in email and password'
        })
    }

    if(!validator.isEmail(email)) {
        return res.status(400).json({
            status: 'ERR',
            message: 'Email invalid -> Example Correct: abc@gmail.com'
        })
    }

    try {
        const Account = await db.Account.findOne({
            where: {email:email}
        },)
    if(!Account) {
        return res.status(404).json({
            status: 'OK',
            message: 'Account not exist'
        })
    }
    
    const correctPassword = await bcrypt.compare(password, Account.password)
    if(!correctPassword) {
        return res.status(400).json({
            status: 'ERR',
            message: 'Email or password not correct'
        })
    }
    // generate token and set cookies
    generateToken(email, res)
    return res.status(200).json({
        status: 'OK',
        message: 'Login successfully'
    })
    }catch(err) {
        logger.error(`Login failed ${err}`)
        return res.status(500).json({
            status: 'ERR',
            message: 'Internal Server Error'
        })
    }
    
}

const logout = async (req, res) => {
    res.cookie('jwt', null)
    return res.status(200).json({
        status: 'OK',
        message: 'Logout successfully'
    })
}

const getUser = async (req, res) => {
    try{
        const {id} = req.params
        if(!id) return res.status(400).json({
            status: 'ERR',
            message: 'Please provider cusId of account'
        })
        const User = await db.Customer.findOne({cusId: id})
        if(!User) return res.status(404).json({
            status: 'ERR',
            message: 'Customer is not register account'
        }) 
        return res.status(200).json({
            status: 'OK',
            message: 'Get customer successfully',
            data: User
        })
    }catch(err) {
        return res.status(500).json({
            status: 'ERR',
            message: 'Get customer failed ' + err
        })
    }
   
    
}


module.exports = {login, signUp, logout, getUser}