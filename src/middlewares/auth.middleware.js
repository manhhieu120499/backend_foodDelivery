const jwt = require('jsonwebtoken')
require('dotenv').config()
const API_SECRET_KEY = process.env.API_SECRET_KEY
const API_REFRESH_KEY = process.env.API_REFRESH_KEY

const generateToken = (email, res) => {
    const accessToken = jwt.sign({email}, API_SECRET_KEY, {expiresIn: '1h'})
    const refreshToken = jwt.sign({email}, API_REFRESH_KEY, {expiresIn: '7d'})

    res.cookie('jwt', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_DEVELOPMENT !== 'development',
        sameSite: 'strict',
        maxAge: 3600 * 1000 * 24 * 7
    })

    return {accessToken, refreshToken}
}

const protectRoute = (req, res, next) => {
    const token = req.cookies.jwt
    if(!req.body.email) return res.status(400).json({
            status: 'ERR',
            message: 'Please provide email!'
        })
    if(!token) {
        return res.status(400).json({
            status: 'ERR',
            message: 'Please provide token!'
        })
    }
    jwt.verify(token, API_SECRET_KEY, (err, decode) => {
        if(err) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Unauthorized: ' + err,
            })
        }
        if(decode.email !== req.body.email) {
            return res.status(404).json({
                status: 'ERR',
                message: 'Account not exist'
            })
        }
        next()
    })
}

module.exports = {generateToken, protectRoute}