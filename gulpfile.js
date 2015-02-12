'use strict';

var gulp = require('gulp');
var bower = require('gulp-bower');
var shell = require('gulp-shell');
var through = require('through2');
var gutil = require('gulp-util');
var jsdoc2md = require('jsdoc-to-markdown');
var mfs = require('more-fs');
var fs = require('fs');
var path = require('path');
var runSequence = require('run-sequence');
var redirects = require('./redirects');
var submodules = require('./submodules');

gulp.task('docs:bitcore', function() {
  gulp.src('./node_modules/bitcore/docs/**/*.md', {
    base: './node_modules/bitcore/docs/'
  }).pipe(gulp.dest('./source/guide/'));
});

submodules.forEach(function(m) {
  gulp.task('docs:bitcore-' + m, function() {
    gulp.src('./node_modules/bitcore-' + m + '/docs/**/*.md', {
      base: './node_modules/bitcore-' + m + '/docs/'
    }).pipe(gulp.dest('./source/guide/module/' + m + '/'));
  });
});

gulp.task('docs', function(callback) {
  var seq = submodules.map(function(m) {
    return 'docs:bitcore-' + m;
  });
  seq.push('docs:bitcore');
  seq.push(callback);
  runSequence.apply(null, seq);
});

gulp.task('playground:bower', function() {
  return bower({
    cwd: './node_modules/bitcore-playground'
  });
});

gulp.task('playground:copy', function() {
  gulp.src('./node_modules/bitcore-playground/app/**', {
    base: './node_modules/bitcore-playground/app/'
  }).pipe(gulp.dest('./public/playground/'));
});

gulp.task('playground', function(callback) {
  runSequence(
    ['playground:bower'], ['playground:copy'],
    callback);
});

gulp.task('generate-redirects', function() {
  var template = '<html><head><meta http-equiv="refresh" content="0; url={0}" />' +
    '</head><body></body></html>';
  redirects.forEach(function(data) {
    var source = './source' + data[0];
    var dir = path.dirname(source);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    fs.writeFileSync(source, template.replace('{0}', data[1]));
  });
});

gulp.task('copy-api-index', function() {
  var indexExists = fs.existsSync('./api/index.md');
  if (indexExists) {
    gulp.src('./api/index.md', {
      base: './api/'
    })
      .pipe(gulp.dest('./source/api/'));
  } else {
    fs.writeFileSync('./source/api/index.md', '');
  }
});

gulp.task('copy-contributing', function() {
  var readme = fs.readFileSync('./node_modules/bitcore/CONTRIBUTING.md');
  fs.writeFileSync('source/guide/contributing.md', readme);
});

function jsdocForModule(moduleName, moduleSlug) {

  function jsdoc() {
    return through.obj(function(file, enc, cb) {

      if (file.isNull()) {
        cb(null, file);
        return;
      }
      if (file.isStream()) {
        cb(new gutil.PluginError('gulp-jsdoc2md', 'Streaming not supported'));
        return;
      }

      var destination;
      if (moduleSlug) {
        destination = 'source/api/' + moduleSlug + '/';
      } else {
        destination = 'source/api/';
      }

      destination += file.path.replace(file.base, '').replace(/\.js$/, '.md');

      jsdoc2md.render(file.path, {})
        .on('error', function(err) {
          gutil.log(gutil.colors.red('jsdoc2md failed', err.message));
        })
        .pipe(mfs.writeStream(destination));
      cb(null, file);
    });
  }

  var files = ['./node_modules/' + moduleName + '/lib/**/*.js'];

  return gulp.src(files).pipe(jsdoc());

}

// jsdocs

gulp.task('api:bitcore', function() {
  return jsdocForModule('bitcore');
});
submodules.forEach(function(m) {
  gulp.task('api:bitcore-' + m, function() {
    return jsdocForModule('bitcore-' + m, 'module/' + m);
  });
});


gulp.task('api', function(callback) {
  var seq = submodules.map(function(m) {
    return 'api:bitcore-' + m;
  });
  seq.push('api:bitcore');
  seq.push(callback);
  runSequence.apply(null, seq);
});

// html covertion

gulp.task('generate-public', shell.task([
  'rm -rf public/* && ./node_modules/.bin/hexo generate'
]));

// launch demo server

gulp.task('run-server', shell.task([
  './node_modules/.bin/hexo server'
]));

gulp.task('server', function(callback) {
  runSequence(['generate'], ['run-server'], callback);
});

// generate everything

gulp.task('generate', function(callback) {
  runSequence(['docs'],
              ['api'],
              ['copy-api-index'],
              ['copy-contributing'],
              ['generate-redirects'],
              ['generate-public'],
              ['playground'],
              callback);
});

// update the packages

gulp.task('npm-install', shell.task([
  'npm install'
]));


// deploy the website

gulp.task('hexo-deploy', shell.task([
  './node_modules/.bin/hexo deploy'
]));

gulp.task('release', function(callback) {
  runSequence(['npm-install'], ['generate'], ['hexo-deploy'], callback);
});
