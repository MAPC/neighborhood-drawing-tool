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
    browserify: {
      'scripts/bundle.js': ['scripts/main.js']
    },
    watch: {
      files: '<%= jshint.src %>',
      tasks: ['browserify'],  // 'jshint', 'mocha', 
      options: {
        livereload: {
          port: 9000
        }
      }
    }
  });

  // load browserify task
  grunt.loadNpmTasks('grunt-browserify')

  // load mocha task
  grunt.loadNpmTasks('grunt-mocha')

  // load watch task
  grunt.loadNpmTasks('grunt-contrib-watch')

  // load JSHint task
  grunt.loadNpmTasks('grunt-contrib-jshint')

  // Default task
  grunt.registerTask('default', 'watch')

}