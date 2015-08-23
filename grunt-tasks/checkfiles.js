//     This file is part of Game Deals extension for Google Chrome
//     https://github.com/DanielKamkha/GameDealsChrome
//     (c) 2015 Daniel Kamkha
//     Game Deals is free software distributed under the terms of the MIT license.

module.exports = function (grunt) {
  "use strict";

  grunt.registerMultiTask("checkfiles", "Check files mentioned in a .json for existence.", function() {
    var pattern = this.data.pattern;
    if (!pattern || !(pattern instanceof RegExp)) {
      grunt.log.error("No pattern");
      return;
    }
    var src = this.data.src;
    if (!src || !grunt.file.exists(src)) {
      grunt.log.error("Source not found");
      return;
    }
    grunt.log.writeln("Src: " + src);
    var srcDir = src.split("/").slice(0, -1).join("/");
    var dst = this.data.dst || src;
    grunt.log.writeln("Dst: " + dst);

    function checkFilesInArray(array) {
      return array.reduce(function(result, val) {
        if (typeof val === "string") {
          if (pattern.test(val) && !grunt.file.exists(srcDir, val)) {
            grunt.log.writeln("Deleting reference to " + val);
            return result;
          }
        } else if (Array.isArray(val)) {
          val = checkFilesInArray(val);
        } else if (typeof val === "object") {
          val = checkFilesInData(val);
        }
        result.push(val);
        return result;
      }, []);
    }

    function checkFilesInData(data) {
      for (var key in data) {
        if (data.hasOwnProperty(key)) {
          var val = data[key];
          if (typeof val === "string") {
            if (pattern.test(val) && !grunt.file.exists(srcDir, val)) {
              grunt.log.writeln("Deleting reference to " + val);
              delete data[key];
            }
          } else if (Array.isArray(val)) {
            data[key] = checkFilesInArray(val);
          } else if (typeof val === "object") {
            data[key] = checkFilesInData(val);
          }
        }
      }
      return data;
    }

    var srcData = checkFilesInData(grunt.file.readJSON(src));
    grunt.file.write(dst, JSON.stringify(srcData, null, 2));
  });
};
