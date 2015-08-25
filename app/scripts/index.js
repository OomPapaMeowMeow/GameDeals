//     This file is part of Game Deals extension for Mozilla Firefox
//     https://github.com/DanielKamkha/GameDealsFirefox
//     (c) 2015 Daniel Kamkha
//     Game Deals is free software distributed under the terms of the MIT license.

(function() {
  "use strict";

  const { PageMod } = require("sdk/page-mod");
  const PageWorker = require("sdk/page-worker").Page;

  let workers = {};

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

  function registerPageWorkerMessage(messageName) {
    pageWorker.port.on(messageName, function(message) {
      let tabId = message.tabId;
      if (tabId) {
        let worker = workers[tabId];
        if (worker) {
          worker.port.emit(messageName, message);
        }
      }
    });
  }

  function registerWorkerMessage(worker, messageName) {
    let tabId = worker.tab.id;
    worker.port.on(messageName, function(message) {
      message.tabId = tabId;
      pageWorker.port.emit(messageName, message);
    });
  }

  function startListening(worker) {
    let tabId = worker.tab.id;
    workers[tabId] = worker;
    registerWorkerMessage(worker, "makeBackgroundRequest");
    registerWorkerMessage(worker, "showPageAction");
    registerWorkerMessage(worker, "getDealsForTab");
    worker.on("detach", function () {
      delete workers[tabId];
    });
  }

  registerPageWorkerMessage("makeBackgroundRequest");
  registerPageWorkerMessage("showPageAction");
  registerPageWorkerMessage("getDealsForTab");

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
    onAttach: startListening
  });

})();
