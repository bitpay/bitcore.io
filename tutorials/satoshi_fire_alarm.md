# Satoshi Fire Alarm

How to build a Satoshi Fire Alarn

## Concepts

In the beginning, when Bitcoin was only a few blocks high, Satoshi Nakamoto won some coinbases by solo mining. Those coins have never been spent. Some believe the private keys for those addresses are lost forever. The following tutorial shows how to listen for transactions associated with the aforementioned addresses.

## Tutorial

### Installation

```sh
$ npm install -g bitcore-node@latest
```

### Create a Node

```sh
$ bitcore-node create mynode
```

### Add a New Service to Our Node

```sh
$ mkdir -p satoshifirealarm
```

### Symlink It Into Our Node Modules

```sh
$ cd mynode/node_modules
$ ln -s ../../satoshifirealarm
```

### Add a Reference to Our Config

```sh
$ cd ../
$ nano bitcore-node.json #add satoshifirealarm as a service below db
$ nano package.json #add satoshifirealarm
```

### The Code

Add a new file within the directory, satoshifirealarm called index.js

```js
var util = require('util');
var Transaction = require('../../node_modules/bitcore-node/lib/transaction');
var EventEmitter = require('event').EventEmitter;
var spawn = require('child_process').spawn;

function SatoshiFireAlarm(options) {
  EventEmitter.call(this, options);
  this.alarmActivated = false;
  this.child;
  this.interestingAddresses = [
    '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', //this is the address that the genesis paid its coinbase to. Can't be spent due to a bug in the code.
    '12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX', //Block 1
    '1HLoD9E4SDFFPDiYfNYnkBLQ85Y51J3Zb1' //Block 2
  ];
  this.node.services.bitcoind.on('tx', this.transactionHandler.bind(this));
}

SatoshiFireAlarm.dependencies = ['bitcoind', 'db', 'address'];
util.inherits(SatoshiFireAlarm, EventEmitter);

SatoshiFireAlarm.prototype.start = function(callback) {
  callback();
}

SatoshiFireAlarm.prototype.stop = function(callback) {
  callback();
}

SatoshiFireAlarm.prototype.transactionHandler = function(txinfo) {
  var tx = bitcore.Transaction().fromBuffer(txInfo.buffer);
  var messages = {};
  var inputsLength = tx.inputs.length;
  for (var i = 0; i < inputsLength; i++) {
    this.transactionInputHandler(tx, i);
  }
}

SatoshiFireAlarm.prototype.transactionInputHandler = function(tx, i) {
  var address = tx.inputs[i].script.toAddress();
  if (typeof address !== 'undefined' &&
      this.interestingAddresses.indexOf(address) != -1) {
    this.soundAlarm();
  }
}

/*
 * soundAlarm: will launch a separate alarm program (not provided)
 */
SatoshiFireAlarm.prototype.soundAlarm = function() {
  if (this.alarmActivated) return;

  this.alarmActivated = true;
  var child = spawn('alarm', []);
}

SatoshiFireAlarm.prototype.resetAlarm = function() {
  child.kill();
  this.alarmActivated = false;
}

module.exports = SatoshiFireAlarm;
```

### Create a Package.json for Our Service in Satoshifirealarm

```json
{
  "dependencies": {
  }
}
```

## Start the Node

```sh
bitcore-node start
```

## Wait for Satoshi to Spend

Just kidding, this example can be used to inform you about ANY bitcoin address. Try it by inserting your own address and transfer bitcoin to or from this address.
