'use strict';

var gulp = require('gulp');
var jade = require('gulp-jade');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var notify = require('gulp-notify');
var plumber = require('gulp-plumber');
var gutil = require('gulp-util');
var nano = require('gulp-cssnano');
var rename = require('gulp-rename');
var bourbon = require('node-bourbon').includePaths;
var dirSync = require('gulp-directory-sync');
var browserSync = require('browser-sync');
var injector = require('bs-html-injector');
var reload = browserSync.reload;

var f = {
  dev: 'dev',
  build: 'build',
  css: 'build/css',
  scss: 'dev/scss/**/*.{scss,sass}',
  html: 'build/*.html',
  jade: 'dev/*.jade'
};

// error and change functions
var onError = function(err) {
  gutil.beep();
  this.emit('end');
};

var onChange = function(event) {
      console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    };

// Browser definitions for autoprefixer
var autoprefixer_options = [
  'ie >= 8',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

// Jade convert
gulp.task('jade', ['sass'], function() {
  gulp.src(f.jade)
    .pipe(plumber({
      errorHandler: notify.onError("Error: <%= error.message %>")
    }))
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest(f.build));
});

// Sass convert & Autoprefixer
gulp.task('sass', function() {
  gulp.src(f.scss)
    .pipe(sourcemaps.init())
    .pipe(plumber({
      errorHandler: notify.onError("Error: <%= error.message %>")
    }))
    .pipe(sass({
      style: 'expanded',
      includePaths: bourbon
    }))
    .pipe(gulp.dest(f.css)) //export expanded css
    .pipe(postcss([autoprefixer({
      browsers: autoprefixer_options
    })]))
    .pipe(nano())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(f.css)) //export minified css
    .pipe(browserSync.reload({
      stream: true
    }))
});

// Image sync
gulp.task('images:sync', function() {
  return gulp.src('')
    .pipe(dirSync(f.dev + '/images', f.build + '/images'))
    .on('error', gutil.log);;
});

// Javascript sync
gulp.task('js:sync', function() {
  return gulp.src('')
    .pipe(dirSync(f.dev + '/js', f.build + '/js'))
    .pipe(browserSync.stream());
});

// Browsersync server
gulp.task('server', ['sass'], function() {
  browserSync.use(injector, {
    files: 'build/*.html'
  });
  browserSync({
    server: {
      baseDir: 'build'
    },
    notify: false
  });
});

//Watch

gulp.task('watch', function() {
  gulp.watch(f.jade, ['jade']).on('change', onChange);
  gulp.watch(f.scss, ['sass']).on('change', onChange);
  gulp.watch(f.dev + '/images', ['images:sync']).on('change', onChange);
  gulp.watch(f.dev + '/js', ['js:sync']).on('change', onChange);
});

// Default Task

gulp.task('default', ['server', 'watch']);
