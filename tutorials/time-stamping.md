# Time Stamping

This tutorial will go over how to build your own time stamping web service. Bitcoin allows data to be placed into each output script within each transaction. Anyone can use this feature to prove that data existed at some point in the blockchain. This tutorial implements a simple web service that can show its clients if any particular data is in its data set, which comes from incoming transactions.

## Create a Service

Please refer to the [service development document](service-development.html).

### The Code

Add a new file within the service directory `dataservice` called `index.js`:

```js
var util = require('util');
var EventEmitter = require('event').EventEmitter;

function DataService(options) {
  EventEmitter.call(this);
  this.node = options.node;
  this.data = {};
}
util.inherits(DataService, EventEmitter);

DataService.dependencies = ['bitcoind', 'db', 'web'];

DataService.prototype.blockHandler = function(block, addOutput, callback) {
  if (!addOutput) {
    setImmediate(function() {
      // we send an empty array back to the db service because this will be in-memory only
      callback(null, []);
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
      this.data[scriptData] = {
        blockHash: block.hash,
        height: height,
        outputIndex: outputIndex,
        tx: txid
      };
    }
  }
  setImmediate(function() {
    //we send an empty array back to the db service because this will be in-memory only
    callback(null, []);
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
  res.send(this.data[hash] || false);
}

DataService.prototype.start = function(callback) {
  setImmediate(callback);
}

DataService.prototype.stop = function(callback) {
  setImmediate(callback);
}

module.exports = DataService;
```

Create a `package.json` for our service, that we can later use to publish to npm:

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

## Query for Timestamped Data

Our new node may not be synced with the blockchain, but we might be able to see data being indexed by our in-memory data structure. Try opening a browser like Chrome or Firefox and putting this into the address. You might need to wait for some incoming transactions in order to see data.

`http://localhost:3001/dataservice/hash/<hash>`

Where <hash> is the data you would like query the index about. You can get some data to insert into hash from the output of bitcore-node start. When new data goes into the index, the log will pipe this data out. When using this example for real, a client might hash some text to get the data and then ask your webservice about it.
