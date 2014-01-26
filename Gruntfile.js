module.exports = function(grunt) {
  var banner = [
    '/**',
    ' * @license',
    ' * <%= pkg.name %> - v<%= pkg.version %>',
    ' * Copyright (c) 2013-2014 burninggramma',
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
        maxlen: 80,
        quotmark: 'single'
      },
      dev: ['Gruntfile.js', 'test/*.js'],
      app:  ['src/quadtree2.js']
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

    simplemocha : {
      all: { src : ['test/*.js'] },
      options : {
        reporter: 'spec',
        slow: 100,
        timeout: 300
      }
    },

    watch : {
      scripts : {
        files : ['test/*.js', 'src/*.js'],
        tasks : ['test']
      }
    }
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-simple-mocha');

  grunt.registerTask('test',    ['jshint', 'simplemocha']);
  grunt.registerTask('default', [
    'jshint',
    'simplemocha',
    'browserify',
    'uglify:browserified',
    'uglify:build'
  ]);
};
