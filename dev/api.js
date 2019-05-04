const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const Blockchain = require('./blockchain')
const bitcoin = new Blockchain()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

//this is the page we can see existing blockchain
app.get('/blockchain', (req, res) => {
  res.send(bitcoin)
})

//this is the endpoints where we can post transaction
app.post('/transaction', (req, res) => {
  console.log(req.body)
  res.send(`the amount of the transaction is ${req.body.amount}`)
})

//mine endpoint will mind a new Block for us or create a new block
app.get('/mine', (req, res) => {
  
})

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`listening on port ${PORT}...`)
})
