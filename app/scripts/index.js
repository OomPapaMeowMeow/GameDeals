//     This file is part of Game Deals extension for Mozilla Firefox
//     https://github.com/DanielKamkha/GameDealsFirefox
//     (c) 2015 Daniel Kamkha
//     Game Deals is free software distributed under the terms of the MIT license.

(function() {
  "use strict";

  const { PageMod } = require("sdk/page-mod");
  const PageWorker = require("sdk/page-worker").Page;

  //function startListening(worker) {
  //  worker.port.on("makeBackgroundRequest", makeBackgroundRequest.bind(null, "makeBackgroundRequest", worker));
  //  worker.port.on("showPageAction", showPageActionIfOption);
  //  worker.port.on("getDealsForTab", getDealsForTab.bind(null, "getDealsForTab", worker));
  //}

  let pageWorker = PageWorker({
    contentScriptFile: [
      "./jquery.min.js",
      "./jquery.ajax-retry.js",
      "./data-consts.js",
      "./data-itad.js",
      "./background.js"
    ],
    contentURL: "./background.html"
  });

  PageMod({
    include: [
      /.*store\.steampowered\.com\/app\/.*/,
      /.*www\.humblebundle\.com\/store.*/,
      /.*www\.gog\.com\/game\/.*/,
      /.*www\.origin\.com\/.*\/store\/buy\/.*/,
      /.*www\.(win|mac)gamestore\.com\/product\/.*/
    ],
    attachTo: ["existing", "top"],
    contentStyleFile: [
      "./font-awesome.css",
      "./content-style.css"
    ],
    contentScriptFile: [
      "./jquery.min.js",
      "./jquery.ajax-retry.js",
      "./data-consts.js",
      "./data-tools.js",
      "./data-currency.js",
      "./data-stores.js",
      "./data-comm.js",
      "./script-main.js"
    ],
    //onAttach: startListening
  });

})();
