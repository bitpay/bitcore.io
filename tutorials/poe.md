# Proof of Existence (Side chain)

How to build your own Proof-of-Existence web service

## Concepts

Bitcoin allows data to be placed into each output script within each transaction. Anyone can use this feature to prove that data existed at some point in the blockchain. This tutorial implements a simple web service that can show its clients if any particular data is in its data set, which comes from incoming transactions.

## Tutorial

### Installation

```sh
$ npm install -g bitcore-node@latest
```

### Create a node

```sh
$ bitcore-node create sidechain
$ cd !$
```

### Add a new service to our node

```sh
$ mkdir -p lib/sidechain
```

### Symlink it into our node modules

```sh
$ ln -s ./lib/poe node_modules/sidechain
```

### Add a reference to our config

```sh
$ nano bitcore-node.json #add sidechain as a service below db
```

### The code

Add a new file within the directory, ./lib/sidechain called index.js

```js
var index = require('../../node_modules/bitcore-node');
var log = index.log;
var util = require('util');
var Service = require('../../node_modules/bitcore-node/lib/service');

function SideChain(options) {
  Service.call(this, options);
  this.operations = {};
}
SideChain.dependencies = ['bitcoind', 'db', 'web'];
util.inherits(SideChain, Service);

SideChain.prototype.start = function(callback) {callback();}
SideChain.prototype.stop = function(callback) {callback();}
SideChain.prototype.blockHandler = function(block, addOutput, callback) {
  if (!addOutput) {
    setImmediate(function() {
      callback(null, []); //we send an empty array back to the db service because this will be in-memory only
    });
  }
  var txs = block.transactions;
  var height = block.__height;

  var transactionLength = txs.length;
  for (var i = 0; i < transactionLength; i++) {
    var tx = txs[i];
    var txid = tx.id;
    var outputs = tx.outputs;
    var outputScriptHashes = {};
    var outputLength = outputs.length;

    for (var outputIndex = 0; outputIndex < outputLength; outputIndex++) {
      var output = outputs[outputIndex];
      var script = output.script;

      if(!script || !script.isDataOut()) {
        log.debug('Invalid script');
        continue;
      }

      var scriptData = script.getData().toString('hex');
      log.info( "scriptData added to in-memory index: ", scriptData);
      this.operations[scriptData] = {
        blockHash: block.hash,
        height: height,
        outputIndex: outputIndex,
        tx: txid
      };
    }
  }
  setImmediate(function() {
    callback(null, []); //we send an empty array back to the db service because this will be in-memory only
  });
}

SideChain.prototype.setupRoutes = function(app) {
  app.get('/hash/:hash', this.lookupHash.bind(this));
}

SideChain.prototype.lookupHash = function(req, res, next) {
  var hash = req.params.hash;
  res.send(this.operations[hash] || false);
}
module.exports = SideChain;
```

### Create a package.json for our service in ./lib/sidechain

```json
{
  "dependencies": {
  }
}
```

## Start the node

```sh
bitcore-node start
```

## Query our new node

Our new node may not be synced with the blockchain, but we might be able to see data being indexed by our in-memory data structure. Try opening a browser like Chrome or Firefox and putting this into the address. You might need to wait for some incoming transactions in order to see data.

http://localhost:3001/sidechain/hash/<hash>

Where <hash> is the data you would like query the index about. You can get some data to insert into hash from the output of bitcore-node start. When new data goes into the index, the log will pipe this data out. When using this example for real, a client might hash some text to get the data and then ask your webservice about it.

