const connectToMongo = require('./db.js')
const express = require('express')
connectToMongo();
const app = express()
var cors = require('cors')
const port = 5000
require('dotenv').config()

app.use(express.json())
app.use(cors())
//Available routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))

app.listen(port, () => {
  console.log(`iNotebook listening on port ${port}`)
})