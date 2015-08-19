'use strict';

angular.module('playApp.hdkeys', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/hdkeys', {
    templateUrl: 'hdkeys/hdkeys.html',
    controller: 'HDKeysCtrl'
  });
}])

.controller('HDKeysCtrl', function($scope, bitcore) {

  $scope.bitcoreURL = 'http://bitcore.io/guide/hierarchical.html';
  $scope.bitcoinURL = 'https://bitcoin.org/en/developer-guide#hierarchical-deterministic-key-creation';
  var privateValidPath = function(path) {
    return !!(/^[mM][']?(\/[0-9]+[']?)*[/]?$/.exec(path));
  };
  var publicValidPath = function(path) {
    return !!(/^[mM](\/[0-9]+)*[/]?$/.exec(path));
  };
  $scope.path = "m/44'/0'/0'/0/1337";
  $scope.keys = [];

  $scope.$on('networkUpdate', function() {
    $scope.newKey();
  });

  $scope.newKey = function() {
    $scope.updatePrivate(new bitcore.HDPrivateKey().toString());
  };

  $scope.updatePrivate = function(value) {
    if (!bitcore.HDPrivateKey.isValidSerialized(value)) return; // mark as invalid

    $scope.xpriv = new bitcore.HDPrivateKey(value);
    $scope.xpub = $scope.xpriv.hdPublicKey;
    $scope.keys = $scope.deriveKeys($scope.xpriv, $scope.path);
    setExampleCode($scope.xpriv, $scope.path);
  };

  $scope.updatePublic = function(value) {
    if (!bitcore.HDPublicKey.isValidSerialized(value)) return; // mark as invalid

    $scope.xpriv = '';
    $scope.xpub = new bitcore.HDPublicKey(value);
    $scope.keys = $scope.deriveKeys($scope.xpub, $scope.path);
    setExampleCode($scope.xpub, $scope.path);
  };

  $scope.updatePath = function(value) {
    if ($scope.xpriv) {
      if (!privateValidPath(value)) return;
    } else {
      if (!publicValidPath(value)) return;
    }

    $scope.keys = $scope.deriveKeys($scope.xpriv || $scope.xpub, value);
    setExampleCode($scope.xpriv || $scope.xpub, value);
  };

  $scope.deriveKeys = function(key, path) {
    var xpriv, xpub;
    if (key instanceof bitcore.HDPrivateKey) {
      xpriv = key;
      xpub = key.hdPublicKey;
    } else if (key instanceof bitcore.HDPublicKey) {
      xpriv = null;
      xpub = key;
    } else {
      return;
    }

    if (path[path.length-1] === '/') {
      path = path.substr(0, path.length - 1);
    }

    if (xpriv) {
      if (!privateValidPath(path)) return;
    } else {
      if (!publicValidPath(path)) return;
    }

    var indexes = bitcore.HDPrivateKey._getDerivationIndexes(path);
    var MAX = 2147483647;
    var paths = indexes.map(function(m, i) {
      return 'm/' + indexes.slice(0, i+1).map(function(index) {
        if (index >= MAX) {
          return (index - MAX - 1) + "'";
        }
        return '' + index;
      }).join('/');
    });
    paths = ['m'].concat(paths);

    var nodes = paths.map(function(p) {
      return {
        path: p,
        xpriv: xpriv && key.derive(p),
        xpub: (key instanceof bitcore.HDPublicKey) ? key.derive(p) : key.derive(p).hdPublicKey
      };
    });

    nodes[nodes.length-1].visible = true;
    nodes.reverse();
    return nodes;
  };

  function setExampleCode(hdKey, path, isNew) {
    var template = "";

    if (hdKey instanceof bitcore.HDPublicKey) {
      template += "var hdPublicKey = new bitcore.HDPrivateKey();\n";
      template += "var derivedHdPublicKey = hdPublicKey.derive('" + path + "');\n"

    } else if (hdKey instanceof bitcore.HDPrivateKey) {
      template += "var hdPrivateKey = new bitcore.HDPrivateKey();\n";

      template += "\n// private key derivation\n";
      template += "var derivedHdPrivateKey = hdPrivateKey.derive(\"" + path + "\");\n"
      template += "var derivedPrivateKey = hdPrivateKey.privateKey;\n"

      template += "\n// public key derivation\n";
      template += "var derivedHdPublicKey = derivedHdPrivateKey.hdPublicKey;\n"
    }

    template += "var derivedPublicKey = derivedHdPublicKey.publicKey;\n"
    template += "var address = derivedPublicKey.toAddress();"

    $scope.exampleCode = template;
  };

  $scope.jumpConsole = function() {
    $('#terminaltab').click();
    window.REPL.console.SetPromptText($scope.exampleCode);
    window.REPL.scrollToBottom();
  };

  $scope.newKey();
});
