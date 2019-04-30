const Blockchain = require('./blockchain')
//const Blockchain = require('./class_blockchain')

const bitcoin = new Blockchain


bitcoin.createNewBlock(10, 'testtest', 'previoustest')
// bitcoin.createNewBlock(20, 'Yo', 'previoustest')
// bitcoin.createNewBlock(30, 'Haha', 'previoustest')
bitcoin.createNewTransaction(100, 'mi', 'bi')
bitcoin.createNewTransaction(200, 'ho', 'ya')
bitcoin.createNewTransaction(300, 'to', 'ka')
bitcoin.createNewBlock(30, 'tedfdahs', 'dfhosahf')
const previousBlockHash = 'fdhauiofheisua'
const currentBlockData = [
  {
    amount: 10,
    sender: 'ho',
    recipient: 'billy'
  },
  {
    amount: 20,
    sender: 'abe',
    recipient: 'ye'
  },
  {
    amount: 30,
    sender: 'abae',
    recipient: 'naaa'
  }
]
let nonce = 100

let result = bitcoin.hashBlock(previousBlockHash, nonce, currentBlockData)
console.log('hash', result)
