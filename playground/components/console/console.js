$(function () {

function REPL() {

  this.element = document.getElementById("console");
  this.console = $('#console').jqconsole(null, '>> ');
  this.console.$input_source.blur();

  setInterval(function(){
    $('.jqconsole-cursor').toggleClass("blink");
  }, 1000);

  $('#terminal-content').on('appear', function() {
    $('#terminaltab-sticky').addClass('hide');
  });

  $('#terminal-content').on('disappear', function() {
    $('#terminaltab-sticky').removeClass('hide');
  });

  $('.goto-repl').click(function() {
    $("html, body").animate({ scrollTop: $(document).height() }, "slow");
    self.console.$input_source.focus();
  });

  window.console._log = function() {
    var result = Array.prototype.slice.call(arguments);
    result = result.map(toConsoleString).join(' ') + '\n';
    self.console.Write(result, 'jqconsole-output');
    self.scrollToBottom();
  };

  var self = this;
  $(this.element).click(function(){
    self.console.$input_source.focus();
  });

  this.console.$input_source.blur(function() {
    self.scrollToBottom();
  });

  this.console.RegisterShortcut('U', function() {
    var col = self.console.GetColumn() - 3;
    var text = self.console.GetPromptText();
    self.console.SetPromptText(text.slice(col));
    self.console.MoveToStart();
  });

  this.console.RegisterShortcut('A', function() {
    self.console.MoveToStart();
  });

  this.console.RegisterShortcut('E', function() {
    self.console.MoveToEnd();
  });

  this.console.RegisterShortcut('L', function() {
    self.console.Clear();
  });

  // Autocomplete hack
  this.console._Indent = function() {
    var tokens = this.GetPromptText().split(' ');
    var token = tokens[tokens.length-1];

    if (!isSafeToken(token)) return;

    // get context
    var context = getContext(token);
    var prefix = token.split(".").slice(-1)[0];

    // get completition alternatives
    var alternatives = filterPrefix(prefix, context);
    alternatives = alternatives.sort(function(a, b) {
      if(a < b) return -1;
      if(a > b) return 1;
      return 0;
    });

    // get extended prefix
    var newPrefix = extendPrefix(prefix, alternatives);
    var contextName = token.split('.').slice(0,-1).join('.');

    // set new token
    var extendedToken = (contextName.length > 0 ? contextName + '.' : '') + newPrefix;
    tokens[tokens.length-1] = extendedToken;

    // print new token
    this.SetPromptText(tokens.join(" "));

    if (alternatives.length > 1) {
      this._PrintAlternatives(alternatives);
      self.scrollToBottom();
    }
  };

  this.console._PrintAlternatives = function(alternatives) {
    this.Write(this.GetPromptText(true) + '\n', 'jqconsole-old-prompt');
    var all = alternatives.join("    ");
    this.Write(all + '\n\n', 'jqconsole-output');
  };

  this.console._Unindent = function() {};
}

function getContext(token) {
  if (token.indexOf('.') === -1) {
    return Object.keys(window);
  }

  var context = token.split('.').slice(0, -1).join('.');

  var element;
  try {
    element = window.eval(context);
  } catch (err) {
    return [];
  }

  var options;
  if (Array.isArray(element)) {
    options = Object.getOwnPropertyNames(Array.prototype);
  } else {
    options = $.map(element, function(value, key) { return key; });
  }

  // filter and sort
  options = options.filter(function(key) {
    return key && key.indexOf('_') !== 0;
  }).sort(function(a, b) {
    if(a < b) return -1;
    if(a > b) return 1;
    return 0;
  });

  return options;
}

function isSafeToken(token) {
  var unsafe = "()[];=".split('');
  return !!token && unsafe.reduce(function(prev, c) {
    return prev && !$.contains(token, c);
  });
}

function filterPrefix(prefix, alternatives) {
  return alternatives.filter(function(opt) {
    return opt.indexOf(prefix) === 0;
  });
}

function extendPrefix(prefix, alternatives) {
  if (!prefix) return '';
  if (alternatives.length === 0) return prefix;
  if (alternatives.length === 1) return alternatives;

  var newPrefix = prefix + alternatives[0][prefix.length];
  var filtered = filterPrefix(newPrefix, alternatives);

  if (filtered.length != alternatives.length) return prefix;
  return extendPrefix(newPrefix, alternatives);
}

REPL.prototype.prompt = function() {
  var self = this;
  this.console.Prompt(true, function(line) {
    try {
      var line = line.replace(/(\n| |^|;)var /g, "$1"); // show assignment on console
      var line = line.replace(/(\n| |^|;)console.log\(/g, "$1console._log("); // show assignment on console

      var result = window.eval(line);
    } catch (err) {
      return self.errorCallback(err);
    }
    self.resultCallback(result);
  });
  this.scrollToBottom();
}

REPL.prototype.outputCallback = function(output) {
  this.console.Write(output, 'jqconsole-output');
}

REPL.prototype.scrollToBottom = function() {
  this.element.scrollTop = this.element.scrollHeight;
}

REPL.prototype.resultCallback = function(result) {
  if (typeof result === 'undefined') {
    this.console.Write('undefined\n', 'jqconsole-undefined');
    return this.prompt();
  }

  window._ = result;

  this.console.Write('' + toConsoleString(result) + '\n', 'jqconsole-output');
  this.prompt();
}

function toConsoleString(obj) {
  if (obj instanceof Array) {
    return obj = '[' + obj.map(toConsoleString).join(', ') + ']';
  }

  if (obj instanceof Object && obj.inspect) {
    return obj.inspect();
  }

  return String(obj);
}

REPL.prototype.errorCallback = function(error) {
  this.console.Write('' + error + '\n', 'jqconsole-error');
  this.prompt();
}

window.REPL = new REPL();
window.REPL.prompt();
window.REPL.console.SetPromptText("var priv = new bitcore.PrivateKey();");
window.bitcore = require('bitcore');

});