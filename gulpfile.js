const gulp = require('gulp')
const sass = require('gulp-sass')
const watch = require('gulp-watch')
const browserSync = require('browser-sync').create()
const notify = require('gulp-notify')
const neat = require('node-neat').includePaths
const uglify = require('gulp-uglify')
const concat = require('gulp-concat')
const cssmin = require('gulp-cssmin')
const nodemon = require('gulp-nodemon')

const paths = {
  scripts: {
    all: './src/js/**/*.js',
    output: './dist/js'
  } ,
  scss: {
    all: './src/scss/**/*.scss',
    main: './src/scss/*.scss'
  },
  css: './dist/css/style.css',
  views: './views/**/*.hbs'
}

gulp.task('serve', ['nodemon'], () => {
  browserSync.init({
    proxy: 'http://localhost:8081',
    port: 7000
  })
  gulp.watch(paths.scss.all, ['sass'])
  gulp.watch(paths.scripts.all, ['js']).on('change', browserSync.reload)
  gulp.watch(paths.views).on('change', browserSync.reload)
})

gulp.task('nodemon', () => {
  nodemon({
    script: 'index.js',
    env: { 'NODE_ENV': 'development' }
  })
  .on('restart', () => {
    return notify('Node app restarted')
  })
})

gulp.task('sass', () => {
  gulp.src(paths.scss.main)
    .pipe(sass({
      includePaths: ['sass'].concat(neat)
    }))
    .on('error', () => {
      console.log(err.message)
      return notify().write(err)
    })
    .pipe(gulp.dest('./dist/css'))
    .pipe(browserSync.stream())
    .pipe(notify('Sass files compiled.'))
})

gulp.task('js', () => {
  gulp.src(paths.scripts.all)
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(paths.scripts.output))
})

gulp.task('default', ['sass', 'js', 'serve'])
