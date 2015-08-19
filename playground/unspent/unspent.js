'use strict';

angular.module('playApp.unspent', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/unspent', {
    templateUrl: 'unspent/unspent.html',
    controller: 'UnspentCtrl'
  });
}])

.controller('UnspentCtrl', function($scope, $http, bitcore) {

  var explorers = require('bitcore-explorers');

  var defaultLivenetAddress = '1PPQ2anP7DVWmeScdo8fCSTeWCpfBDFAhy';
  var defaultTestnetAddress = 'mfnUxBP3JjS4pU1kddzUshF8bcU7wF99mx';
  $scope.bitcoreURL = 'http://bitcore.io/guide/module/explorers/index.html';
  $scope.bitcoinURL = 'https://bitcoin.org/en/developer-guide#term-output';

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
    setExampleCode();
  };
  reset();

  $scope.addressUpdated = function(address) {
    setExampleCode();
  };

  $scope.$watch('utxoAddress', function() {
    $scope.notFound = '';
  });

  $scope.fetchUTXO = function(address) {
    var client = new explorers.Insight();

    if (!bitcore.Address.isValid(address)) {
      return; // mark as invalid
    }

    $scope.loading = true;
    $scope.notFound = false;
    client.getUnspentUtxos(address, onUTXOs);

    function onUTXOs(err, utxos) {
      $scope.loading = false;
      if (err) throw err;

      if (!utxos.length) {
        $scope.utxos = [];
        $scope.notFound = true;
        $scope.currentAddress = '';
        $scope.$apply();
        return;
      }

      $scope.currentAddress = address;
      $scope.utxos = utxos;
      for (var utxo in utxos) {
        utxos[utxo].url = client.url + '/tx/' + utxos[utxo].txId;
        utxos[utxo].txUrl = 'transaction/';
      }
      $scope.$apply();
    }
  };

  function setExampleCode() {
    var template = "";
    var address = $scope.utxoAddress || '1BitcoinEaterAddressDontSendf59kuE';

    template += "var explorers = require('bitcore-explorers');\n";
    template += "var client = new explorers.Insight();\n";
    template += "client.getUnspentUtxos('" + address + "', function(err, utxos) {\n";
    template += "    UTXOs = utxos;\n";
    template += "    console.log('UTXOs:', utxos);\n";
    template += "});";

    $scope.exampleCode = template;
  }

  $scope.jumpConsole = function() {
    $('#terminaltab').click();
    window.REPL.console.SetPromptText($scope.exampleCode);
    window.REPL.scrollToBottom();
  };

  setExampleCode();

});
