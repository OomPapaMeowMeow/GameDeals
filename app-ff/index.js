//     This file is part of Game Deals extension for Mozilla Firefox
//     https://github.com/DanielKamkha/GameDealsFirefox
//     (c) 2015 Daniel Kamkha
//     Game Deals is free software distributed under the terms of the MIT license.

(function() {
  "use strict";

  const { PageMod } = require("sdk/page-mod");
  let { gamesCache } = require("games-cache");

  const excludedStores = [/http?:\/\/.*\.gamesrocket\..*/];

  function setupGetSetEvents(worker, valueName, getterFunc, setterFunc) {
    worker.port.on("get-" + valueName, function(args) {
      let value = getterFunc(args[0], args[1]);
      worker.port.emit(args[0] + "-get-" + valueName + "-" + args[1], { cached: value !== undefined, value: value } );
    });
    worker.port.on("set-" + valueName, function(data) {
      setterFunc(data.args[0], data.args[1], data.value);
    });
  }

  function startListening(worker) {
    worker.port.once("disable", () => { worker.destroy(); });
    setupGetSetEvents(worker, "plain", gamesCache.getItadPlain, gamesCache.setItadPlain);
    setupGetSetEvents(worker, "store-link", gamesCache.getStoreLink, gamesCache.setStoreLink);
  }

  const scripts = [
    { regex: /.*store\.steampowered\.com\/app\/.*/, storeId: "steam" },
    { regex: /.*www\.humblebundle\.com\/store.*/, storeId: "humblestore" },
    { regex: /.*www\.gog\.com\/game\/.*/, storeId: "gog" },
    { regex: /.*www\.origin\.com\/.*\/store\/buy\/.*/, storeId: "origin" },
    { regex: /.*www\.(win|mac)gamestore\.com\/product\/.*/, storeId: "wingamestore" },
    //{
    //  regex: /.*www\.humblebundle\.com.*/, // Humble Bundle, as opposed to Humble Store
    //  exclude: /.*www\.humblebundle\.com\/store.*/,
    //  script: "./script-humble-bundle.js"
    //}
  ];
  scripts.forEach(function(scriptData) {
    PageMod({
      include: scriptData.regex,
      exclude: scriptData.exclude,
      attachTo: ["existing", "top"],
      contentStyleFile: [
        "./font-awesome.css",
        "./content-style.css"
      ],
      contentScriptFile: [
        "./jquery.min.js",
        "./jquery.ajax-retry.js",
        "./data-tools.js",
        "./data-stores.js",
        "./data-itad.js",
        "./data-cache.js"
      ].concat(scriptData.script || "./script-main.js"),
      contentScriptOptions: { storeId: scriptData.storeId },
      onAttach: startListening
    });
  });

  PageMod({
    include: excludedStores,
    attachTo: ["existing", "top", "frame"],
    contentScriptWhen: "start",
    contentScriptFile: "./script-warning.js"
  });

})();
