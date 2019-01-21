const { series, src, dest, watch } = require('gulp');
const sass = require('gulp-sass');
const browserSync = require('browser-sync');

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

    watch('src/scss/**/*.scss', series(css));
    watch('src/*.html', browserSync.reload);
}

function css() {
    return src('src/scss/**/*.scss')
        .pipe(sass())
        .pipe(dest('src/css'))
        .pipe(browserSync.stream());
}


exports.build = series(css);
exports.default = series(serve);
