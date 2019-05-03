const SHA256 = require("sha256");

class Blockchain {
  constructor(){
    this.chain = [];
    this.pendingTransactions = [];
    this.createNewBlock(100, '0', '0')
  }
  
  createNewBlock(nonce, previousBlockHash, hash) {
    const newBlock = {
      index: this.chain.length + 1,
      timestamp: Date.now(),
      transactions: this.pendingTransactions,
      nonce,
      hash,
      previousBlockHash
    }
    
    this.pendingTransactions = []
    this.chain.push(newBlock)
    return newBlock
  }
  
  getLastBlock(){
    return this.chain[this.chain.length - 1]
  }
  
  createNewTransaction (amount, sender, recipient){
    const newTransaction = {
      amount,
      sender,
      recipient
    }
    this.pendingTransactions.push(newTransaction)
    return this.getLastBlock().index + 1
  }
  
  hashBlock (previousBlockHash, currentBlockData, nonce) {
    //convert each input to string and combine all 3 inputs to make one loooong string
    //previoushash is already string. nonce is originally number. currenbtBlockData is Obj.
    let dataAsString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData)
    const hash = SHA256(dataAsString)
    return hash
  
  }
  
  proofOfWork (previousBlockHash, currentBlockData) {
    let nonce = 0;
    let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce)
    
    while (hash.slice(0,4) !== '0000') {
      nonce++
      hash = this.hashBlock(previousBlockHash, currentBlockData, nonce)
    }
    return nonce
  }

}

module.exports = Blockchain;