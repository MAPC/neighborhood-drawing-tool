var _ = require('lodash')

module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      src: ['Gruntfile.js', 'scripts/*.js', '!scripts/bundle.js', 'config/config.js', 'test/*.js'],
      options: {
        asi: true,
        laxcomma: true,
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        browser: true,
        globals: {
          require: true,
          define: true,
          requirejs: true,
          describe: true,
          expect: true,
          it: true
        }
      }
    },
    mocha: {
      options: {
        // run: true,
        // reporter: 'Nyan'
      },
      test: {
        src: ['test/*.js']
      }
    },
    sass: {
      dist: {
        files: [{
          expand: true,
          cwd: 'styles',
          src: ['*.scss'],
          dest: 'styles',
          ext: '.css'
        }]
      }
    },
    browserify: {
      'scripts/bundle.js': ['scripts/main.js']
    },
    watch: {
      scripts: {
        files: ['<%= jshint.src %>'],
        tasks: ['browserify'],  // 'jshint', 'mocha', 
        options: { livereload: { port: 9000 }, atBegin: true }
      },
      styles: {
        files: ['styles/*.scss'],
        tasks: ['sass'],
        options: { livereload: { port: 9000 }, atBegin: true }
      }
    }
  });


  var tasks = ['grunt-contrib-sass',
               'grunt-browserify',
               'grunt-mocha',
               'grunt-contrib-watch',
               'grunt-contrib-jshint',
               'grunt-contrib-uglify']
  
  _.each(tasks, function(task) { grunt.loadNpmTasks(task) })

  // Default task
  grunt.registerTask('default', 'watch')

}