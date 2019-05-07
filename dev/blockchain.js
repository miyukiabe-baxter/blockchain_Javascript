const SHA256 = require("sha256");
//Constructor Function Version
const Blockchain = function () {
  //this.chain array holds each ledger as an element
  this.chain = [];
  //This is a pending transitions that will go into a block when we invoke newBlock().
  this.pendingTransactions = [];
  //Creating first new Block. It does not matter what we pass as nonce, previousHash and hash.
  this.createNewBlock(100, '0', '0')
  
}

//create new block and it will be an element of this.chain
//nonce : proof of concept?
//hash : all transaction will be compressed into a single string. The string is hash
//PreviousBlockHash: previous block's hash
Blockchain.prototype.createNewBlock = function(nonce, previousBlockHash, hash){
  const newBlock = {
    index: this.chain.length + 1,
    timestamp: Date.now(),
    transactions: this.pendingTransactions,
    nonce,
    hash,
    previousBlockHash
  }
  //When we create a newBlock, we stored active pendingTransactions into newBlock.transactions.
  //Therefore, we should clear up this.pendingTransactions
  this.pendingTransactions = []
  this.chain.push(newBlock)
  
  return newBlock
}

Blockchain.prototype.getLastBlock = function (){
  return this.chain[this.chain.length - 1]
}


Blockchain.prototype.createNewTransaction = function (amount, sender, recipient){
  const newTransaction = {
    amount,
    sender,
    recipient
  }
  this.pendingTransactions.push(newTransaction);
  //I am returning an index number of blocks where this newTransaction will be stored. at this moment, this is stored in Pending transaction array
  //Once newBlock is created, it will be accessible by this index number in this.chain array. 
  return this.getLastBlock().index + 1
}


Blockchain.prototype.hashBlock = function(previousBlockHash, currentBlockData, nonce) {
  //convert each input to string and combine all 3 inputs to make one loooong string
  //previoushash is already string. nonce is originally number. currenbtBlockData is Obj.
  let dataAsString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData)
  const hash = SHA256(dataAsString)
  return hash

}

Blockchain.prototype.proofOfWork = function(previousBlockHash, currentBlockData) {
  let nonce = 0;
  let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce)
  
  while (hash.slice(0,4) !== '0000') {
    nonce++
    hash = this.hashBlock(previousBlockHash, currentBlockData, nonce)
  }
  //
  return nonce
}

module.exports = Blockchain;