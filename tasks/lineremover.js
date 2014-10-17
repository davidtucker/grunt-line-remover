module.exports = function (grunt) {

    'use strict';

    var path = require('path')
        , reGlob = /.*\*.*/;

    grunt.registerMultiTask('lineremover', 'Remove Lines from Files', function () {

        var options = this.options();
        grunt.verbose.writeflags(options, 'Options');
        var _ = grunt.util._;
        var pattern;

        options = _.defaults(options, {
            inclusionPattern: /\S/g
        });

        pattern = options.exclusionPattern || options.inclusionPattern;
        if (!pattern instanceof RegExp) {
            grunt.log.debug("Value passed in was not RegExp Type. Creating New RegExp with String Passed In.");
            pattern = new RegExp(pattern);
        }

        var evaluatePattern = function (line, outputLines) {
            if (options.hasOwnProperty('exclusionPattern')) {
                if (!line.match(pattern)) {
                    outputLines.push(line);
                }
            } else {
                if (line.match(pattern)) {
                    outputLines.push(line);
                }
            }
        };

        var isGlob = function (filename) { return reGlob.test(filename); };

        var createFilename = function (destination, filepath) {
            return path.resolve(destination, path.basename(filepath));
        };

        this.files.forEach(function (file) {
            var currentSetOfInputFiles = file.src;
            var destination = file.dest;


            if (currentSetOfInputFiles.length === 0) {
                grunt.log.writeln('XXXX '.red + file.orig.src + ' not found or contained no content.');
                return false;
            }

            // if file is a globbing pattern, then src might be a list of several files
            // otherwise file.src will contain a list of one file
            currentSetOfInputFiles.forEach(function (filepath){

                var lines;
                var outputLines = [];
                var output = "";

                var outputFilename = isGlob(file.orig.src[0]) ?
                    createFilename(destination, filepath)
                    : destination;

                var fileContents = grunt.file.read(filepath);

                lines = fileContents.split(grunt.util.linefeed);
                lines.forEach(function (line) {
                    evaluatePattern(line, outputLines);
                });


                if (outputLines.length < 1) {
                    grunt.log.writeln('X '.red + filepath + '" Destination not written because no lines were remaining.');
                } else {
                    output = outputLines.join(grunt.util.linefeed);
                    grunt.file.write(outputFilename, output);
                    var savedMsg = "removed " + (lines.length - outputLines.length) + " lines";
                    grunt.log.writeln('✔ '.green + path.basename(filepath) + (' (' + savedMsg + ')').grey);
                }
            });

        });

    });

};