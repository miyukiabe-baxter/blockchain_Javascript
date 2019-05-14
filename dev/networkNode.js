const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const rp = require('request-promise');

//uuid creates a unique random string. We use this as this node's address
const uuid = require('uuid/v1')
const nodeAddress = uuid().split('-').join('')

const PORT = process.argv[2]

const bitcoin = new Blockchain()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

//this is the page we can see existing blockchain
app.get('/blockchain', (req, res) => {
  res.send(bitcoin)
})

//this is the endpoints where we can post transaction
app.post('/transaction', (req, res) => {
const newTransaction  = req.body
  const blockIndex = bitcoin.addTransactionToPendingTransactions(newTransaction)
  res.json({ note: `Transaction will be added in block ${blockIndex}.`})
})


app.post('/transaction/broadcast', (req, res) => {
  const {amount, sender, recipient} = req.body
  const newTransaction = bitcoin.createNewTransaction(amount, sender, recipient)
  bitcoin.addTransactionToPendingTransactions(newTransaction)
  
  const requestPromises = []
  bitcoin.networkNodes.forEach(networkNodeUrl => {
    const requestOptions = {
      uri: networkNodeUrl + '/transaction',
      method: 'POST',
      body: newTransaction,
      json: true
    }
    requestPromises.push(rp(requestOptions))
  })
  
  //temporary, I stored all promises in a requestPromises array and now, I am running all those request at the same time.
  Promise.all(requestPromises)
  .then(data => {
    res.json({ note: 'Transaction created and broadcast successfully'})
  })
  
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

//register a node and broadcast it the network.
app.post('/register-and-broadcast-node', (req, res) => {
  //New Node is posting request to here and passing localhost info.

  const newNodeUrl = req.body.newNodeUrl;
  //....we will broadcast this new Node URL to entire network (which is broadcast to all Nodes inside NodeArr)
  
  //I just added new Node in the Network Array
  if (bitcoin.networkNodes.indexOf(newNodeUrl) === -1) bitcoin.networkNodes.push(newNodeUrl)
  
  const regNodesPromises = []
  //we will send a request to other Node's '/register-node' to add it to their network.
  bitcoin.networkNodes.forEach(networkNodeUrl => {
  
    const requestOptions = {
      uri: networkNodeUrl + '/register-node',
      method: 'POST',
      body: { newNodeUrl: newNodeUrl},
      json: true
    };
    //rq() is sending a request to each Node inside the network. but not sure how long it will take to complete.
    //Therefore, we are putting them all those request in a array and invoke with Promise.all.
    //Once we complete all request, next part of code will run.
    regNodesPromises.push(rp(requestOptions))

  })
  //promise.all takes array of promise. we are waiting for the registration inside entire network.
  Promise.all(regNodesPromises).then(data => {
    const bulkRegisterOptions = {
      uri: newNodeUrl + '/register-nodes-bulk',
      method: 'POST',
      body: { allNetworkNodes: [...bitcoin.networkNodes, bitcoin.currentNodeUrl]},
      json: true
    }
    return rp(bulkRegisterOptions)
  })
  .then(data => {
    res.json({ note: 'New node registration with network successfully.'})
  })

})

//register a node with the network. This is the method accepting nodes created by other network
app.post('/register-node', (req, res) => {
  const newNodeUrl = req.body.newNodeUrl
  //below is checking if this node already exists in the network or not
  const nodeNotAlreadyExist = bitcoin.networkNodes.indexOf(newNodeUrl) === -1
  //checking if this new node is actually current node or not
  const notCurrentNode = bitcoin.currentNodeUrl !== newNodeUrl
  if (nodeNotAlreadyExist && notCurrentNode) {
    bitcoin.networkNodes.push(newNodeUrl);
  }    
  res.json({note: 'New node register successuly.'})

})

// //register multiple nodes at once
app.post('/register-nodes-bulk', (req, res) => {
  const allNetworkNodes = req.body.allNetworkNodes
  allNetworkNodes.forEach(networkNodeUrl => {
    let nodeNotExist = bitcoin.networkNodes.indexOf(networkNodeUrl) === -1
    let notCurrentNode = bitcoin.currentNodeUrl !== networkNodeUrl
    if (nodeNotExist && notCurrentNode) {
      bitcoin.networkNodes.push(networkNodeUrl)
    }  
  })  
  res.json({note: 'Bulk registration successful'})
})  


app.listen(PORT, () => {
  console.log(`listening on port ${PORT}...`)
})
