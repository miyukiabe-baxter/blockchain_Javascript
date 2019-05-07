const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const Blockchain = require('./blockchain')
//uuid creates a unique random string. We use this as this node's address
const uuid = require('uuid/v1')
const nodeAddress = uuid().split('-').join('')

const bitcoin = new Blockchain()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

//this is the page we can see existing blockchain
app.get('/blockchain', (req, res) => {
  res.send(bitcoin)
})

//this is the endpoints where we can post transaction
app.post('/transaction', (req, res) => {
  let {amount, sender, recipient } = req.body
  const blockIndex = bitcoin.createNewTransaction(amount, sender, recipient)
  res.json({ note: `Transaction will be added in block ${blockIndex}.`})
})

//mine endpoint will mind a new Block for us or create a new block
app.get('/mine', (req, res) => {
  const lastBlock = bitcoin.getLastBlock();
  const previousBlockHash = lastBlock['hash'];
  const currentBlockData = {
    transactions: bitcoin.prendingTransactions,
    index: lastBlock['index'] + 1
  }
  
  const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData)
  const newHash = bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce)
  
//sender = "00" means this is a reward bitcoin result of user mining bitcoin
//recipient = this node. when this node receives request to /mine
//this node creates new block. It means this node created a new block and this node should be rewarded.
bitcoin.createNewTransaction(12.5, '00', nodeAddress)
  
  const newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, newHash)
  
  res.json({
    note: "New block mined successfully",
    block: newBlock
  })
})

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`listening on port ${PORT}...`)
})
