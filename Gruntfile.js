module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    uglify: {
      options: {
        banner: '/*! histogram <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'index.js',
        dest: 'build/histogram.min.js'
      }
    },
  
    jshint: {
        all: ['Gruntfile.js', 'index.js']
	},
	
    jsdoc : {
        dist : {
            src: ['index.js'], 
            options : {
                destination: 'doc'
            }
        }
    }	
  
  
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jsdoc');

  // Default task(s).
  grunt.registerTask('default', ['uglify', 'jshint', 'jsdoc']);

};