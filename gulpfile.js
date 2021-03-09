/**
 * Created by Mordekaiser on 27/09/16.
 */
'use strict';

const gulp = require('gulp'),
    nodemon = require('gulp-nodemon'),
    jshint = require('gulp-jshint'),
    browserSync = require('browser-sync'),
    csso = require('gulp-csso');

gulp.task('default', ['csso'], function () {
    nodemon({
        script: 'app.js',
        ext: 'js',
        env: {
            PORT: 5001
        },
        ignore: ['./node_modules/**']
    })
        .on('restart', function () {
            console.log('restarting node server...');
            /*setTimeout(function () {
                browserSync.notify('reloading now');
                browserSync.reload({stream: false});
            }, 1000);*/
        })
        .on('start', function () {
            console.log('Nodemon started');
            //startBrowserSync();
        })
});

gulp.task('csso', function () {
    return gulp.src('./public/assets/css/aloha.css')
        .pipe(csso({
            restructure: false,
            sourceMap: true,
            debug: true
        }))
        .pipe(gulp.dest('./public/assets/dist'))
});

function startBrowserSync() {
    if(browserSync.active) {
        return;
    }
    console.log('Starting browser-sync on port 5001');
    const options = {
        proxy: 'localhost:5001',
        port: 3000,
        files: ['./public/**/*.*'],
        ghostMode: {
            clicks: true,
            location: false,
            forms: true,
            scroll: true
        },
        injectChanges: true,
        logFileChanges: true,
        logLevel: 'debug',
        logPrefix: 'gulp-patterns',
        notify: true,
        reloadDelay: 1000
    };

    browserSync(options);
}

gulp.task('vet', function () {
    return gulp
        .src([
            './server/**/*.js',
            './public/templates/**/*.js',
            './public/services/*.js',
            './*.js'
        ])
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish', {verbose: true}));
});