# Time Stamping

How to build your own Time stamping web service

## Concepts

Bitcoin allows data to be placed into each output script within each transaction. Anyone can use this feature to prove that data existed at some point in the blockchain. This tutorial implements a simple web service that can show its clients if any particular data is in its data set, which comes from incoming transactions.

## Tutorial

### Installation

```sh
$ npm install -g bitcore-node@latest
```

### Create a node

```sh
$ bitcore-node create mynode
```

### Add a new service to our node

```sh
$ mkdir -p dataservice
```

### Symlink it into our node modules

```sh
$ cd mynode/node_modules
$ ln -s ../../dataservice
```

### Add a reference to our config

```sh
$ cd ../
$ nano bitcore-node.json #add dataservice as a service below db
$ nano package.json #add dataservice as dependency
```

### The code

Add a new file within the directory, dataservice called index.js

```js
var util = require('util');
var EventEmitter = require('event').EventEmitter;

function DataService(options) {
  EventEmitter.call(this);
  this.node = options.node;
  this.operations = {};
}
DataService.dependencies = ['bitcoind', 'db', 'web'];
util.inherits(DataService, EventEmitter);

DataService.prototype.start = function(callback) {callback();}
DataService.prototype.stop = function(callback) {callback();}
DataService.prototype.blockHandler = function(block, addOutput, callback) {
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
        this.node.log.debug('Invalid script');
        continue;
      }

      var scriptData = script.getData().toString('hex');
      this.node.log.info('scriptData added to in-memory index:', scriptData);
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

DataService.prototype.getRoutePrefix = function() {
  return 'dataservice';
}

DataService.prototype.setupRoutes = function(app) {
  app.get('/hash/:hash', this.lookupHash.bind(this));
}

DataService.prototype.lookupHash = function(req, res, next) {
  var hash = req.params.hash;
  res.send(this.operations[hash] || false);
}
module.exports = DataService;
```

### Create a package.json for our service in dataservice

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

http://localhost:3001/dataservice/hash/<hash>

Where <hash> is the data you would like query the index about. You can get some data to insert into hash from the output of bitcore-node start. When new data goes into the index, the log will pipe this data out. When using this example for real, a client might hash some text to get the data and then ask your webservice about it.

