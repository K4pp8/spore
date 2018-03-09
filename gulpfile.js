var gulp = require('gulp'),
    yargs = require('yargs'),
    gulpif = require('gulp-if'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    sass = require('gulp-sass'),
    htmlmin = require('gulp-htmlmin'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    connect = require('gulp-connect'),
    sourcemaps = require('gulp-sourcemaps'),
    rimraf = require('gulp-rimraf'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    htmlmin = require('gulp-htmlmin');

var src = './src/',
    distSrc = './build/';
// Check for --production flag
var PRODUCTION = !!(yargs.argv.production);
var sassPaths = [];

// Task that compile the scss to css 
gulp.task('sass', function(){
    gulp.src( [ src + '/scss/*.scss'])
        .pipe(gulpif(!PRODUCTION, sourcemaps.init()))
        .pipe( gulpif(PRODUCTION,
            sass({
                includePaths: sassPaths,
                outputStyle: 'compressed' // if css compressed **file size**
            }).on('error', sass.logError),
            sass({
                includePaths: sassPaths,
            // outputStyle: 'compressed' // if css compressed **file size**
            }).on('error', sass.logError)
        ))
        .pipe(gulpif(!PRODUCTION, sourcemaps.write()))        
        .pipe(gulp.dest(distSrc + '/css'));
});

// Task that move ( or compress if we are in production ) html 
gulp.task('html', function () {
    gulp.src(src + '**/*.html')
        .pipe( gulpif(PRODUCTION, 
            htmlmin({
                //collapseWhitespace: true,
                removeComments: true,
                collapseInlineTagWhitespace: true
            })
        ))
        .pipe(gulp.dest(distSrc));
});

gulp.task('lint', function() {
    
        gulp.src( ['src/js/**/*.js'] )
            .pipe(jshint())
            .pipe(jshint.reporter(stylish));
    
});

// Task that concat ( or compress if we are in production ) vendors
gulp.task('vendors', function () {

    gulp.src( ['src/js/vendors/*.js'])
        .pipe(concat('vendors.js'))
        .pipe(gulpif(PRODUCTION, uglify()))  
        .pipe(gulp.dest(distSrc + '/js/vendors/'));
});

// Task that concat ( or compress if we are in production ) javascript
gulp.task('js', function () {

    // cancello i file mapp
    gulp.src(distSrc + '/**/*.map', { read: false }) // much faster 
        .pipe(rimraf());

   
        gulp.src( ['src/js/app/**/*.js'] )
           // .pipe( gulpif(!PRODUCTION, sourcemaps.init() ))
            //.pipe(concat('main.js')
           // .pipe(gulpif(!PRODUCTION, sourcemaps.write()))     
            .pipe( gulpif(PRODUCTION, uglify()))  
            .pipe(gulp.dest(distSrc + '/js/'));
    

});

gulp.task('lint', function() {
    
    gulp.src( ['src/js/app/**/*.js'] )
            .pipe(jshint())
            .pipe(jshint.reporter(stylish));
    
});

// Task that move ( or compress if we are in production ) img e co. 
gulp.task('img', function () {
    gulp.src( src + 'assets/**/*.*' )
        .pipe( gulpif(PRODUCTION, 
            imagemin({
                progressive: true,
                svgoPlugins: [{removeViewBox: false}],
                use: [pngquant()]
            })
        ))
        .pipe(gulp.dest(distSrc + '/assets'));
});

// Task that create a temporary webserver
gulp.task('webserver', function() {
    connect.server({
        root: 'build',
        port: 8000,
        livereload: true
    });
});

// Task that reload a temporary webserver
gulp.task('reload', function () {
    gulp.src('./bulid/*.html')
        .pipe(connect.reload());
});

gulp.task('watch', function () {
    gulp.watch('./src/**/*.html', ['html', 'reload']);
    gulp.watch('./src/js/**/*.*', ['js', 'lint', 'reload']);
    gulp.watch('./src/scss/**/*.*', ['sass', 'reload']);
    gulp.watch('./src/assets/**/*.*', ['img', 'reload']);
});

gulp.task('build', ['html', 'js', 'lint', 'vendors', 'sass', 'img']);
gulp.task('default', ['build', 'webserver', 'watch']);