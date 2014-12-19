'use strict';

var gulp = require('gulp');
var shell = require('gulp-shell');
var through = require('through2');
var gutil = require('gulp-util');
var jsdoc2md = require('jsdoc-to-markdown');
var mfs = require('more-fs');
var fs = require('fs');
var runSequence = require('run-sequence');

var files = ['./node_modules/bitcore/lib/**/*.js'];

gulp.task('copy-docs', function() {
  gulp.src('./node_modules/bitcore/docs/guide/**/*.md', {base: './node_modules/bitcore/docs/guide/'})
    .pipe(gulp.dest('./source/guide/'));
});

gulp.task('copy-api-index', function() {
  var indexExists = fs.existsSync('./node_modules/bitcore/docs/api/index.md');
  if (indexExists) {
    gulp.src('./node_modules/bitcore/docs/api/index.md', {base: './node_modules/bitcore/docs/api/'})
      .pipe(gulp.dest('./source/api/'));
  } else {
    fs.writeFileSync('./source/api/index.md', '');
  }
});

gulp.task('generate-api-docs', function() {

  function jsdoc() {
    return through.obj(function(file, enc, cb) {
      
      if (file.isNull()){
        cb(null, file);
        return;
      }
      if (file.isStream()) {
        cb(new gutil.PluginError('gulp-jsdoc2md', 'Streaming not supported'));
        return;
      }
      var destination = 'source/api/'+file.path.replace(file.base, '').replace(/\.js$/, '.md');
      jsdoc2md.render(file.path, {})
        .on('error', function(err) {
          gutil.log(gutil.colors.red('jsdoc2md failed', err.message));
        })
        .pipe(mfs.writeStream(destination));
      cb(null, file);
    });
  }
  
  return gulp.src(files).pipe(jsdoc());

});

gulp.task('generate-public', shell.task([
  './node_modules/.bin/hexo generate'
]));

gulp.task('server', shell.task([
  './node_modules/.bin/hexo server'
]));

gulp.task('update', function(callback){
  runSequence(['copy-docs'], ['generate-api-docs'], ['copy-api-index'], ['generate-public'], callback);
});
