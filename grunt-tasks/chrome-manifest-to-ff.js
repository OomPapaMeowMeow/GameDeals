//     This file is part of Game Deals extension for Google Chrome
//     https://github.com/DanielKamkha/GameDealsChrome
//     (c) 2015 Daniel Kamkha
//     Game Deals is free software distributed under the terms of the MIT license.

module.exports = function (grunt) {
  "use strict";

  grunt.registerMultiTask(
    "chromeManifestToFf",
    "Create package.json for Firefox extension based on manifest.json from Chrome extension.",
    function() {
      var src = this.data.src;
      if (!src || !grunt.file.exists(src)) {
        grunt.log.error("Source not found");
        return;
      }
      grunt.log.writeln("Src: " + src);
      var dst = this.data.dst;
      grunt.log.writeln("Dst: " + dst);
      var options = this.data.options;
      if (options && !grunt.file.exists(options)) {
        grunt.log.error("Options not found");
        return;
      }
      grunt.log.writeln("Options: " + options);
      var license = this.data.license;

      var srcData = grunt.file.readJSON(src);

      var name = srcData.name;
      if (!name) {
        grunt.log.error("No 'name' in manifest.");
        return;
      }

      var dstData = {
        name: name.split(" ").join("-").toLowerCase(),
        title: name,
        version: srcData.version,
        description: srcData.description,
        author: srcData.author,
        homepage: srcData.homepage_url
      };
      if (license) {
        dstData.license = license;
      }

      var permissions = srcData.permissions;
      if (permissions) {
        var dstPermissions = permissions.reduce(function(results, elem) {
          if (elem.indexOf("://") === -1) {
            return results;
          }
          if (elem.slice(-1) === "*") {
            elem = elem.slice(0, -1);
          }
          var leadingMask = elem.slice(0, 1) === "*";
          if (leadingMask) {
            elem = elem.slice(1);
          }
          if (elem.indexOf("*") !== -1) {
            return results; // complex masks are not supported by FF permissions
          }
          if (leadingMask) {
            results.push("http" + elem);
            results.push("https" + elem);
          } else {
            results.push(elem);
          }
          return results;
        }, []);
        if (dstPermissions.length > 0) {
          dstData.permissions = { "cross-domain-content": dstPermissions };
        }
      }

      if (options) {
        var optionsData = grunt.file.readJSON(options);
        grunt.log.writeln("Options data: " + optionsData.preferences);
        dstData.preferences = optionsData.preferences;
      }

      grunt.file.write(dst, JSON.stringify(dstData, null, 2));
    }
  );
};
