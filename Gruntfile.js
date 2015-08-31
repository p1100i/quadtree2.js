module.exports = function(grunt) {
  var banner = [
    '/**',
    ' * @license',
    ' * <%= pkg.name %> - v<%= pkg.version %>',
    ' * Copyright (c) 2013-2014 p1100i',
    ' * <%= pkg.repository.url %>',
    ' *',
    ' * Compiled: <%= grunt.template.today("yyyy-mm-dd") %>',
    ' *',
    ' * <%= pkg.name %> is licensed under the <%= pkg.license %> License.',
    ' * <%= pkg.licenseUrl %>',
    ' */',
    ''
  ].join('\n');

  grunt.initConfig({
    pkg : grunt.file.readJSON('package.json'),

    jshint: {
      options: {
        maxlen: 150,
        quotmark: 'single'
      },
      dev: ['Gruntfile.js', 'test/*.js'],
      app:  ['src/*.js', 'index/index.js', 'test/*.js']
    },

    browserify: {
      '<%= pkg.name %>.js': ['browserify.js']
    },

    uglify: {
      browserified : {
        options: {
          banner: banner,
          beautify: {
            width: 100,
            beautify: true
          }
        },
        files: {
          '<%= pkg.name %>.js':
          ['<%= pkg.name %>.js'],
        }
      },
      build: {
        options: {
          banner: banner
        },
        files: {
          '<%= pkg.name %>.min.js':
          ['<%= pkg.name %>.js'],
        }
      },
    },

    mochaTest: {
      test: {
        src : ['test/spec/**/*.spec.js'],

        options : {
          reporter  : 'spec',
          slow      : 200,
          require   : 'test/blanket',
          timeout   : 100
        }
      },

      coverage: {
        src : ['test/spec/**/*.spec.js'],

        options : {
          reporter    : 'html-cov',
          quiet       : true,
          captureFile : 'test/report/coverage.html'
        }
      }
    },

    watch : {
      scripts : {
        files : ['test/**/*.js', 'src/*.js', 'index/index.js'],
        tasks : ['test', 'build']
      }
    }
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.registerTask('test', [
    'jshint',
    'mochaTest'
  ]);
  grunt.registerTask('build', [
    'browserify',
    'uglify:browserified',
    'uglify:build'
  ]);

  grunt.registerTask('default', [
    'jshint',
    'mochaTest',
    'browserify',
    'uglify:browserified',
    'uglify:build'
  ]);
};
