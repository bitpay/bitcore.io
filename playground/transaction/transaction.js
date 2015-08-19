'use strict';

angular.module('playApp.transaction', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/transaction', {
    templateUrl: 'transaction/transaction.html',
    controller: 'TransactionCtrl'
  });
}])

.controller('TransactionCtrl', function($scope, $rootScope, $http, bitcore) {

  $scope.bitcoreURL = 'http://bitcore.io/guide/transaction.html';
  $scope.bitcoinURL = 'https://bitcoin.org/en/developer-guide#transactions';
  var explorers = require('bitcore-explorers');
  var defaultLivenetAddress = '1PPQ2anP7DVWmeScdo8fCSTeWCpfBDFAhy';
  var defaultTestnetAddress = 'mfnUxBP3JjS4pU1kddzUshF8bcU7wF99mx';

  $scope.$on('networkUpdate', function() {
    reset();
  });

  var reset = function() {
    if (bitcore.Networks.defaultNetwork.name === 'testnet') {
      $scope.utxoAddress = defaultTestnetAddress;
    } else {
      $scope.utxoAddress = defaultLivenetAddress;
    }
    $scope.utxos = [];
    $scope.loading = false;
    $scope.currentAddress = '';
    $rootScope.transaction = new bitcore.Transaction();
    $scope.privateKey = '';

    $scope.fromAddresses = [];
    $rootScope.toAddresses = {};
    $rootScope.addData = [];
    $rootScope.privateKeys = [];
    $scope.change = '';
    $scope.loading = false;
    setExampleCode();
  };
  reset();

  $scope.privateKey = '';

  $scope.fromAddresses = [];
  $rootScope.toAddresses = {};
  $rootScope.addData = [];
  $rootScope.privateKeys = [];
  $scope.change = '';
  $scope.nLockTime = undefined;
  $scope.loading = false;

  $scope.$watch('nLockTime', function(newValue) {
    if (!newValue) {
      $scope.currentAddress = undefined;
    } else {
      $rootScope.transaction.nLockTime = newValue;
    }
    setExampleCode();
  });

  $scope.utxos = [];

  $scope.fetchUTXO = function(address) {
    var client = new explorers.Insight();
    if (!bitcore.Address.isValid(address)) return; // mark as invalid
    
    $scope.loading = true;
    client.getUnspentUtxos(address, onUTXOs);
    $scope.fromAddresses.push(address);

    function onUTXOs(err, utxos) {
      $scope.loading = false;
      if (err) throw err;

      if (!utxos.length) {
        $scope.utxos = [];
        $scope.notFound = address;
        $scope.currentAddress = '';
        $scope.$apply();
        return;
      }

      $scope.utxos = utxos;
      $scope.currentAddress = address;
      $scope.$apply();
      console.log(utxos);
    }
  };

  $scope.signWith = function(privKey) {
    try {
      $('#addSignatureModal').foundation('reveal', 'close');
      if (!privKey) {
        return;
      }
      var privateKey = new bitcore.PrivateKey(privKey);
      $rootScope.privateKeys.push(privateKey);
      var signatures = $rootScope.transaction.getSignatures(privateKey);
      if (!signatures.length) {
        $('#noSignatures').foundation('reveal', 'open');
      } else {
        $rootScope.transaction.sign(privateKey);
      }
      setExampleCode();
    } catch (e) {
      console.log('Error', e);
    }
  };

  $scope.addUTXO = function(utxo) {
    utxo.used = true;
    $rootScope.transaction.from(utxo);
    setExampleCode();
  };

  $scope.removeUtxo = function(utxo) {
    var txId = utxo.txId.toString('hex');
    $rootScope.transaction.removeInput(txId, utxo.outputIndex);
    for (var i in $scope.utxos) {
      if ($scope.utxos[i].txId.toString('hex') === txId && $scope.utxos[i].outputIndex === utxo.outputIndex) {
        $scope.utxos[i].used = false;
      }
    }
    setExampleCode();
  };
  $scope.removeInput = function(input) {
    $scope.removeUtxo({txId: input.prevTxId, outputIndex: input.outputIndex});
  };
  $scope.removeOutput = function(index) {
    $rootScope.transaction.removeOutput(index);
    setExampleCode();
    $scope.$apply();
  };

  $scope.addAddressOutput = function(address, amount) {
    console.log(address, amount);
    $('#addAddressModal').foundation('reveal', 'close');
    if (!amount && amount !== 0) {
      return;
    }
    amount = bitcore.Unit.fromBTC(amount).toSatoshis();
    $rootScope.toAddresses[address] = amount;
    $rootScope.transaction.to(address, amount);
    setExampleCode();
  };

  $rootScope.addDataOutput = function(info) {
    $('#addDataModal').foundation('reveal', 'close');
    $rootScope.addData.push(info);
    $rootScope.transaction.addData(info);
    setExampleCode();
  };

  $scope.addPrivateKey = function(privKey) {
    $rootScope.privateKeys.push(privKey);
    setExampleCode();
  };

  $scope.canSerialize = function() {
    try {
      $rootScope.transaction.serialize();
    } catch (err) {
      return false;
    }
    return $rootScope.transaction.inputs.length > 0;
  }

  $scope.broadcast = function() {
    var serialized = $rootScope.transaction.serialize();
    var client = new explorers.Insight();
    $scope.broadcasting = true;
    client.broadcast(serialized, function(err, id) {
      $scope.broadcasting = false;
      if (err) {
        $('#broadcastError').foundation('reveal', 'open');
      } else {
        $rootScope.transactionUrl = client.url + '/tx/' + $rootScope.transaction.id;
        $scope.$apply();
        $('#broadcastSuccess').foundation('reveal', 'open');
      }
    });
  };

  function setExampleCode() {
    var template = "";
    var i;

    template += "var transaction = new bitcore.Transaction()\n";
    for (i in $scope.utxos) {
      if ($scope.utxos[i].used) {
        template += "    .from(" + $scope.utxos[i].toJSON() + ")\n";
      }
    }
    for (i in $rootScope.toAddresses) {
      template += "    .to('" + i + "', " + $rootScope.toAddresses[i] + ")\n";
    }
    for (i in $rootScope.addData) {
      template += "    .addData('" + $rootScope.addData[i] + "')\n";
    }
    for (i in $rootScope.privateKeys) {
      template += "    .sign('" + $rootScope.privateKeys[i] + "')\n";
    }
    if ($scope.change) {
      template += "    .change('" + $scope.change + "')\n";
    }
    if (!_.isUndefined($scope.nLockTime)) {
      template += "transaction.nLockTime = " + $scope.nLockTime + ";\n";
    }

    $scope.exampleCode = template;
  }

  $scope.jumpConsole = function() {
    $('#terminaltab').click();
    window.REPL.console.SetPromptText($scope.exampleCode);
    window.REPL.scrollToBottom();
  };

  $scope.getAddress = function(output) {
    return output.script.isScriptHashOut() || output.script.isPublicKeyHashOut()
    ? output.script.toAddress().toString()
    : '';
  }

  function initialExample() {
    var template = "";

    template += "var transaction = new bitcore.Transaction()\n";
    template += "    .from(utxos)\n";
    template += "    .to('1bitcoinAddress...', 10000)\n";
    template += "    .to('2bitcoinAddress...', 10000)\n";
    template += "    .change('3bitcoinAddress...', 20000);";

    $scope.exampleCode = template;
  }

  initialExample();

  // Monkey patching until next bitcore version is released
  bitcore.Transaction.prototype.removeInput = function(txId, outputIndex) {
    var index;
    if (!outputIndex && _.isNumber(txId)) {
      index = txId;
    } else {
      index = _.findIndex(this.inputs, function(input) {
        return input.prevTxId.toString('hex') === txId && input.outputIndex === outputIndex;
      });
    }
    if (index < 0 || index >= this.inputs.length) {
      throw new errors.Transaction.InvalidIndex(index, this.inputs.length);
    }
    var input = this.inputs[index];
    this._inputAmount -= input.output.satoshis;
    this.inputs = _.without(this.inputs, input);
    this._updateChangeOutput();
  };
});
