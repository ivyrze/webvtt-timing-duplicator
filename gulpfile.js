const { src, dest, series, watch } = require('gulp');
const replace = require('gulp-replace');
const concat = require('gulp-concat');
const minify = require('gulp-minify');
const merge = require('merge-stream');

function dependencies() {
    var js = src([
            'node_modules/webvtt-parser/parser.js',
            'node_modules/jquery/dist/jquery.js'
        ])
        .pipe(minify({ ext: { min: '.min.js' }, noSource: true }))
        .pipe(dest('dist/asset/js/'));
    
    var css = src([
            'node_modules/@fortawesome/fontawesome-free/css/solid.min.css',
            'node_modules/@fortawesome/fontawesome-free/css/fontawesome.min.css'
        ])
        .pipe(concat('fontawesome.min.css'))
        .pipe(replace('../webfonts', '../fonts'))
        .pipe(dest('dist/asset/css/'));
    
    var fonts = src('node_modules/@fortawesome/fontawesome-free/webfonts/fa-solid-*')
        .pipe(dest('dist/asset/fonts/'));
    
    return merge(js, css, fonts);
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