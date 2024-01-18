const connectToMongo = require('./db.js')
const express = require('express')
connectToMongo();
const app = express()
var cors = require('cors')
require('dotenv').config()

app.use(express.json())
app.use(cors())
//Available routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))

const port = process.env.REACT_APP_PORT;
app.listen(port, () => {
  console.log(`SkyNotes listening on port ${port}`)
})