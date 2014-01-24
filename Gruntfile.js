module.exports = function(grunt) {
  var banner =  '/*\n';

  banner += ' * - <%= pkg.name %> <%= pkg.version %>\n';
  banner += ' * - <%= pkg.description %>\n';
  banner += ' * - by <%= pkg.author %>\n';
  banner += ' * - <%= pkg.repository.url %>\n';
  banner += ' * --------------------------------------------\n';
  banner += ' * built on <%= grunt.template.today("yyyy-mm-dd") %>\n*/\n';

  grunt.initConfig({
    pkg : grunt.file.readJSON('package.json'),
    jshint: {
      options: {
        maxlen: 80,
        quotmark: 'single'
      },
      dev: ['Gruntfile.js', 'test/*.js'],
      app:  ['quadtree2.js']
    },
    uglify: {
      options: {
        banner: banner,
      },
      build: {
        files: { 
          '<%= pkg.name %>.min.js': 
          ['<%= pkg.name %>.js'],
        }
      }
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
        files : ['test/*.js', '*.js'],
        tasks : ['test']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-simple-mocha');

  grunt.registerTask('test',    ['jshint', 'simplemocha']);
  grunt.registerTask('default', ['jshint', 'simplemocha', 'uglify']);
};
