// Generated on 2015-08-19 using generator-chrome-extension 0.3.1
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  grunt.loadTasks('./grunt-tasks');

  // Configurable paths
  var config = {
    app: 'app',
    dist: 'dist',
    distff: 'dist-ff'
  };

  grunt.initConfig({

    // Project settings
    config: config,

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      js: {
        files: ['<%= config.app %>/scripts/{,*/}*.js'],
        tasks: ['jshint'],
        options: {
          livereload: '<%= connect.options.livereload %>'
        }
      },
      compass: {
        files: ['<%= config.app %>/styles/{,*/}*.{scss,sass}'],
        tasks: ['compass:chrome']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      styles: {
        files: ['<%= config.app %>/styles/{,*/}*.css'],
        tasks: [],
        options: {
          livereload: '<%= connect.options.livereload %>'
        }
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= config.app %>/*.html',
          '<%= config.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
          '<%= config.app %>/manifest.json',
          '<%= config.app %>/_locales/{,*/}*.json'
        ]
      }
    },

    // Grunt server and debug server setting
    connect: {
      options: {
        port: 9000,
        livereload: 35729,
        // change this to '0.0.0.0' to access the server from outside
        hostname: 'localhost'
      },
      chrome: {
        options: {
          open: false,
          base: [
            '<%= config.app %>'
          ]
        }
      },
      test: {
        options: {
          open: false,
          base: [
            'test',
            '<%= config.app %>'
          ]
        }
      }
    },

    // Empties folders to start fresh
    clean: {
      chrome: {
      },
      dist: {
        files: [{
          dot: true,
          src: [
            '<%= config.dist %>/*',
            '!<%= config.dist %>/.git*'
          ]
        }]
      },
      distff: {
        files: [{
          dot: true,
          src: [
            '<%= config.distff %>/*',
            '!<%= config.distff %>/.git*'
          ]
        }]
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        '<%= config.app %>/scripts/{,*/}*.js',
        '!<%= config.app %>/scripts/vendor/*',
        'test/spec/{,*/}*.js'
      ]
    },
    mocha: {
      all: {
        options: {
          run: true,
          urls: ['http://localhost:<%= connect.options.port %>/index.html']
        }
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      options: {
        dest: '<%= config.dist %>'
      },
      html: [
        '<%= config.app %>/popup.html',
        '<%= config.app %>/options.html'
      ]
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      options: {
        assetsDirs: ['<%= config.dist %>', '<%= config.dist %>/images']
      },
      html: ['<%= config.dist %>/{,*/}*.html'],
      css: ['<%= config.dist %>/styles/{,*/}*.css']
    },

    // The following *-min tasks produce minifies files in the dist folder
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.app %>/images',
          src: '{,*/}*.{gif,jpeg,jpg,png}',
          dest: '<%= config.dist %>/images'
        }]
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= config.app %>',
          dest: '<%= config.dist %>',
          src: [
            'manifest.json',
            '**/*.js',
            '!scripts/chromereload.js',
            '!scripts/index.js',
            '!scripts/pageaction.js',
            '*.{ico,png,txt}',
            'images/{,*/}*.{webp,gif}',
            '{,*/}*.html',
            '!background.html',
            'styles/{,*/}*.css',
            'styles/fonts/{,*/}*.*',
            '_locales/{,*/}*.json'
          ]
        }]
      },
      distff: {
        files: [{
          expand: true,
          flatten: true,
          cwd: '<%= config.app %>',
          dest: '<%= config.distff %>/data',
          src: [
            'scripts/lib/*.js',
            'scripts/content-scripts/*.js',
            'scripts/data-itad.js',
            'scripts/background.js',
            'styles/*.css',
            'background.html',
            '!scripts/content-scripts/script-humble-bundle.js'
          ]
        },
        {
          expand: true,
          flatten: true,
          cwd: '<%= config.app %>',
          dest: '<%= config.distff %>',
          src: [
            'images/icon.png',
            'scripts/index.js',
            'scripts/pageaction.js'
          ]
        },
        {
          expand: true,
          dot: true,
          cwd: '<%= config.app %>/images',
          dest: '<%= config.distff %>/data/images',
          src: [
            'cart-*-19.png'
          ]
        }]
      }
    },

    // Run some tasks in parallel to speed up build process
    concurrent: {
      chrome: [
        //'compass:chrome',
      ],
      dist: [
        'imagemin'
      ],
      test: [
        //'compass:test',
      ]
    },

    // Compress dist files to package
    compress: {
      dist: {
        options: {
          archive: function() {
            var manifest = grunt.file.readJSON('app/manifest.json');
            return 'package/GameDeals-' + manifest.version + '.zip';
          }
        },
        files: [{
          expand: true,
          cwd: 'dist/',
          src: ['**'],
          dest: ''
        }]
      }
    },

    jpm: {
      options: {
        src: '<%= config.distff %>',
        xpi: 'package/'
      }
    },

    checkfiles: {
      dist: {
        pattern: /.*\.js/,
        src: '<%= config.dist %>/manifest.json'
      }
    },

    chromeManifestToFf: {
      distff: {
        license: 'MIT',
        options: '<%= config.app %>/options.json',
        src: '<%= config.app %>/manifest.json',
        dst: '<%= config.distff %>/package.json'
      }
    }
  });

  grunt.option('firefox-profile', '../../_profile');

  grunt.registerTask('debug', function () {
    grunt.task.run([
      'jshint',
      'concurrent:chrome',
      'connect:chrome',
      'watch'
    ]);
  });

  grunt.registerTask('test', [
    'connect:test',
    'mocha'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'useminPrepare',
    'concurrent:dist',
    'copy:dist',
    'checkfiles:dist',
    'usemin',
    'compress'
  ]);

  grunt.registerTask('default', [
    'jshint',
    'test',
    'build'
  ]);

  grunt.registerTask('debugff', [
    'clean:distff',
    'copy:distff',
    'chromeManifestToFf:distff',
    'jpm:run'
  ]);

  grunt.registerTask('buildff', [
    'clean:distff',
    'copy:distff',
    'chromeManifestToFf:distff',
    'jpm:xpi'
  ]);
};
