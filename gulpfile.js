const { series, parallel, src, dest, watch } = require('gulp');
const del = require('del');
// html
const nunjucks = require('gulp-nunjucks-render');
const htmlmin = require('gulp-htmlmin');
const browserSync = require('browser-sync');
// css
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const csso = require('gulp-csso');
const autoprefixer = require('autoprefixer');
// js
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
// images
const imagemin = require('gulp-imagemin');

function serve() {
    browserSync.init({
        server: {
            baseDir: "./src"
        },
        browser: [
            'firefox',
            'chromium'
        ]
    });

    watch('src/scss/**/*.scss', series(cssDev));
    watch('src/**/*.njk', series(htmlTplt));
    watch('src/js/**/*.js', series(jsOld));
    watch('src/script.js', browserSync.reload);
}

// nunjucks
function htmlTplt() {
    return src('src/pages/**/*.njk')
        .pipe(nunjucks({
            path: ['src/templates']
        }))
        .pipe(dest('src'))
        .pipe(browserSync.stream());
}

// htmlmin
function htmlMinify() {
    return src('src/*.html')
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(dest('dist'));
}

// sass
function cssDev() {
    return src('src/scss/**/*.scss')
        .pipe(sass())
        .pipe(dest('src/css'))
        .pipe(browserSync.stream());
}

// postcss+autoprefixer csso
function cssBuild() {
    return src('src/scss/**/*.scss')
        .pipe(sass())
        .pipe(postcss([ autoprefixer() ]))
        .pipe(csso())
        .pipe(dest('dist/css'));
}

// image minification
function imgMin() {
    return src('src/img/**/*.+(png|jpg|jpeg|gif|svg)')
        .pipe(imagemin())
        .pipe(dest('dist/img'));
}

// js transpiling
function jsOld() {
    return src('src/js/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(concat('script.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(dest('src'));
}

function jsMin() {
    return src('src/js/**/*.js')
        .pipe(babel())
        .pipe(concat('script.js'))
        .pipe(uglify())
        .pipe(dest('dist'));
}

function clean() {
    return del(['dist', 'src/css/**/*.css', 'src/**/*.html', 'src/script.js',
                'src/*.map'])
}

exports.clean = series(clean);
exports.build = series(clean, parallel(
    cssBuild,
    series(htmlTplt, htmlMinify),
    jsMin,
    imgMin
));
exports.default = series(parallel(htmlTplt, cssDev, jsOld), serve);
