'use strict';

var app = angular.module('playApp', [
  'ngRoute',
  'playApp.units',
  'playApp.address',
  'playApp.hdkeys',
  'playApp.transaction',
  'playApp.unspent',
  'playApp.multisig'
]);

// Config
app.config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/units'});
}]);

app.constant('bitcore', require('bitcore'));

// Filters
app.filter('btc', function(bitcore) {
  return function(satoshis) {
    return bitcore.Unit.fromSatoshis(satoshis).toBTC();
  };
})
.filter('permalink', function(bitcore) {
  return function(data, section) {
    var url = './#/' + section + '?data=' + encodeURI(data);
    if (url.length > 2083) throw new Error('URL too long')
    return url;
  };
})
.filter('ellipsify', function() {
  return function(data) {
    return data.substr(0, 4) + '...' + data.substr(data.length - 4, data.length);
  };
});

// Directives
app.directive('exampleCode', function() {
  return {
    link: function(scope, element, attrs) {
      scope.$watch(attrs.exampleCode, function(value) {
        element.text(value);
        hljs.highlightBlock(element[0]);
      });
    }
  };
})
.directive('autoSelect', function() {
  return {
    link: function(scope, element, attrs) {
      $(element).focus(function(){
        $(this).select();
      });
      element.attr('spellcheck', false);
    }
  };
})
.directive('requireTooltip', function() {
  return {
    link: function(scope, element, attrs) {
     $(document).foundation();
     $(document).foundation('tooltip', 'reflow');
    }
  };
})
.directive('requireModal', function() {
  return {
    link: function(scope, element, attrs) {
     $(document).foundation();
     $(document).foundation('reveal', 'reflow');
    }
  };
});

// Filters
function registerValidator(app, name, validator) {
  app.directive(name, function(bitcore) {
    return {
      require: 'ngModel',
      link: function(scope, elem, attr, ngModel) {
        function validate(value) {
          var valid = validator(bitcore, value, scope, attr);
          ngModel.$setValidity(null, valid);
          return value;
        }
        ngModel.$parsers.unshift(validate);
        ngModel.$formatters.unshift(validate);
      }
    };
  });
}

registerValidator(app, 'privateKey', function(bitcore, value) {
  return bitcore.PrivateKey.isValid(value);
});
registerValidator(app, 'publicKey', function(bitcore, value) {
  return bitcore.PublicKey.isValid(value);
});
registerValidator(app, 'xprivateKey', function(bitcore, value) {
  return bitcore.HDPrivateKey.isValidSerialized(value);
});
registerValidator(app, 'xpublicKey', function(bitcore, value) {
  return bitcore.HDPublicKey.isValidSerialized(value);
});
registerValidator(app, 'privateHdpath', function(bitcore, value, scope) {
  return !!(/^[mM][']?(\/[0-9]+[']?)*[/]?$/.exec(value));
});
registerValidator(app, 'publicHdpath', function(bitcore, value, scope) {
  return !!(/^[mM](\/[0-9]+)*[/]?$/.exec(value));
});
registerValidator(app, 'address', function(bitcore, value) {
  return bitcore.Address.isValid(value);
});

// Sidebar
app.controller('SideBar', function($scope, $rootScope, $timeout, $location) {
  $timeout(function(){
    $rootScope.showFooter = true;
    $rootScope.$apply();
  }, 100);

  $scope.getClass = function(path) {
    return $location.path().substr(0, path.length) === path ? "current" : "";
  }

})
.controller('Network', function($scope, $rootScope, $timeout, bitcore) {
  var networks = bitcore.Networks;
  networks.defaultNetwork = networks.testnet;
  $rootScope.$broadcast('networkUpdate');

  $scope.setTestnet = function(value) {
    networks.defaultNetwork = value ? networks.livenet : networks.testnet;
    $rootScope.$broadcast('networkUpdate');
  };
});
