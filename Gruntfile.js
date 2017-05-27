module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        sass: {
            dist: {
                options: {
                    style: "expanded"
                },
                files: [{
                    expand: true,
                    cwd: "src/sass",
                    src: ["*.scss"],
                    dest: "src",
                    ext: ".css"
                }]
            }
        },

        cssmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: "src",
                    src: ["*.css", "!*.min.css"],
                    dest: "public/css",
                    ext: ".min.css"
                }]
            }
        },


        uglify: {
            options: {
                sourceMap: false
            },

            all: {
                files: [{
                    expand: true,
                    cwd: "src/javascript",
                    src: ["*.js", "!*.min.js"],
                    dest: "public/js",
                    ext: ".min.js"
                }]
            }
        },

        copy: {
            main: {
                files: [{
                    expand: true,
                    cwd: "src/assets/",
                    src: ["**"],
                    dest: "public/css"
                }]
            }
        },

        watch: {
            scripts: {
                files: "src/**/*.js",
                tasks: "uglify",
            },
            sass: {
                files: "src/**/*.scss",
                tasks: "sass",
            },
            css: {
                files: "src/*.css",
                tasks: "cssmin"
            }
        }
    });

    require("load-grunt-tasks")(grunt);

    grunt.registerTask("default", ["sass", "cssmin",  "uglify", "copy"]);
    grunt.registerTask("check", ["jshint"]);
    grunt.registerTask("debug", ["default", "watch"]);
};
