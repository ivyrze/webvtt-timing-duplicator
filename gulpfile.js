const { src, dest, series, watch } = require('gulp');
const minify = require('gulp-minify');

function dependencies() {
    return src([
            'node_modules/webvtt-parser/parser.js',
            'node_modules/jquery/dist/jquery.js'
        ])
        .pipe(minify({ ext: { min: '.min.js' }, noSource: true }))
        .pipe(dest('dist/asset/js/'));
}

function assets() {
    return src('asset/**')
        .pipe(dest('dist/asset/'));
}

function pages() {
    return src('src/**.html')
        .pipe(dest('dist/'));
}

exports.build = series(dependencies, assets, pages);

function develop() {
    watch('asset/**', assets);
    watch('src/**.html', pages);
}

exports.develop = develop;