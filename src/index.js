require('dotenv').config()
const express = require('express')
const app = express()
const PORT = process.env.PORT
const cors = require('cors')
const cookieParser = require('cookie-parser')
const db = require('../models')
const AuthRoute = require('./routes/auth.route')
const CategoryRoute = require('./routes/category.route')

// test connect
db.connect()

app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
app.use(cookieParser())

app.get('/', (req, res) => {
    res.send('<h1>Hello World</h1>')
})

app.use('/api/auth', AuthRoute)
app.use('/api/categories', CategoryRoute)

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`))

