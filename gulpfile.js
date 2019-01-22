const { series, parallel, src, dest, watch } = require('gulp');
const del = require('del');
//css
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const csso = require('gulp-csso');
const autoprefixer = require('autoprefixer');
//html
const nunjucks = require('gulp-nunjucks-render');
const htmlmin = require('gulp-htmlmin');
const browserSync = require('browser-sync');
//images
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

function clean() {
    return del(['dist', 'src/css/**/*.css', 'src/**/*.html'])
}

exports.clean = series(clean);
exports.build = series(clean, parallel(
    cssBuild,
    series(htmlTplt, htmlMinify),
    imgMin
));
exports.default = series(serve);
