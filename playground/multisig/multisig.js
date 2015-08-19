'use strict';

angular.module('playApp.multisig', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/multisig', {
    templateUrl: 'multisig/multisig.html',
    controller: 'MultisigCtrl'
  });
}])

.controller('MultisigCtrl', function($scope, bitcore) {

  $scope.bitcoreURL = 'http://bitcore.io/guide/transaction.html#Multisig_Transactions';
  $scope.bitcoinURL = 'https://bitcoin.org/en/developer-guide#term-multisig';

  $scope.$on('networkUpdate', function() {
    $scope.keys = $scope.keys.map(getRandomKey);
  });

  $scope.totalKeysRange = function() {
    var size = Math.max($scope.keys.length, 7);
    return Range(size);
  };

  $scope.signaturesRange = function() {
    return Range($scope.keys.length);
  };

  function Range(size) {
    var result = [];
    for (var i = 1; i <= size; i++) {
      result.push(i);
    }
    return result;
  }

  function setupKeys() {
    $scope.keys = [1,2,3].map(getRandomKey);
    $scope.totalKeys = $scope.keys.length;
    $scope.threshold = 2;
  }

  $scope.setKeyAmount = function(amount) {
    var delta =  amount - $scope.keys.length;
    if (delta > 0) {
      for (var i = 0; i < delta; i++) $scope.add();
    } else {
      for (var i = 0; i > delta; i--) $scope.keys = $scope.keys.slice(0, -1);
    }

    if ($scope.threshold > amount) {
      $scope.threshold = amount;
    }
  };

  // Initial Setup
  setupKeys();

  function getRandomKey() {
    var priv = new bitcore.PrivateKey();
    return {
      privKey: priv.toString(),
      pubKey: priv.publicKey.toString()
    };
  }

  $scope.add = function() {
    $scope.keys.push(getRandomKey());
    $scope.totalKeys = $scope.keys.length;
  };

  $scope.remove = function(index) {
    var newKeys = [];
    for (var key in $scope.keys) {
      if (key != index) {
        newKeys.push($scope.keys[key]);
      }
    }
    $scope.keys = newKeys;
    $scope.totalKeys = $scope.keys.length;
    $scope.threshold = Math.min($scope.threshold, $scope.totalKeys);
  };

  $scope.updatePriv = function(index) {
    var privKey = new bitcore.PrivateKey($scope.keys[index].privKey);
    $scope.keys[index].privKey = privKey.toBuffer().toString('hex');
    $scope.keys[index].pubKey = privKey.publicKey.toString();
    setAddress();
  };

  $scope.randPriv = function(index) {
    $scope.keys[index] = getRandomKey();
    $scope.updatePriv(index);
  };

  $scope.updatePub = function(index) {
    $scope.keys[index].privKey = '';
    $scope.keys[index].pubKey = new bitcore.PublicKey($scope.keys[index].pubKey).toString();
    setAddress();
  };

  var setAddress = function() {
    var pubkeys = [];
    for (var key in $scope.keys) {
      pubkeys.push($scope.keys[key].pubKey);
    }
    var address = new bitcore.Address(pubkeys, $scope.threshold);

    $scope.address = address.toString();
    setExampleCode(pubkeys, $scope.threshold);
  };

  function setExampleCode(pubkeys, threshold) {
    var template = "var publicKeys = [\n";

    pubkeys.forEach(function(key, index) {
      template += "  new bitcore.PublicKey('" + key.toString() + "')";
      template += (index < pubkeys.length - 1) ? ',\n' : '\n';
    });

    template += "];\n";
    template += "var requiredSignatures = " + threshold + ";\n";
    template += "var address = new bitcore.Address(publicKeys, requiredSignatures);";

    $scope.exampleCode = template;
  };

  $scope.jumpConsole = function() {
    $('#terminaltab').click();
    window.REPL.console.SetPromptText($scope.exampleCode);
    window.REPL.scrollToBottom();
  };

  setAddress();
  $scope.$watchCollection('keys', setAddress);
  $scope.$watch('threshold', setAddress);
});
