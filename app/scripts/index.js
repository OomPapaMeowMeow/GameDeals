//     This file is part of Game Deals extension for Mozilla Firefox
//     https://github.com/DanielKamkha/GameDeals
//     (c) 2015 Daniel Kamkha
//     Game Deals is free software distributed under the terms of the MIT license.

(function() {
  "use strict";

  const { PageMod } = require("sdk/page-mod");
  const PageWorker = require("sdk/page-worker").Page;
  let { storage } = require("sdk/simple-storage");

  let workers = {};

  let pageWorker = PageWorker({
    contentScriptFile: [
      "./jquery.min.js",
      "./jquery.ajax-retry.js",
      "./queue.js",
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

  function registerPageWorkerEvents() {
    registerPageWorkerMessage("makeBackgroundRequest");
    registerPageWorkerMessage("showPageAction");
    registerPageWorkerMessage("getDealsForTab");

    pageWorker.port.on("get", function(tableName) {
      let table = storage[tableName] || {};
      let data = {};
      data[tableName] = table;
      pageWorker.port.emit("get", data);
    });

    pageWorker.port.on("set", function(data) {
      for (let key in data) {
        if (data.hasOwnProperty(key)) {
          storage[key] = data[key];
        }
      }
    });
  }

  PageMod({
    include: [
      /.*store\.steampowered\.com\/app\/.*/,
      /.*steamcommunity\.com\/profiles\/.*\/wishlist/,
      /.*www\.humblebundle\.com\/store.*/,
      /.*www\.gog\.com\/game\/.*/,
      /.*www\.origin\.com\/.*\/store\/buy\/.*/,
      /.*www\.(win|mac)gamestore\.com\/product\/.*/,
      /.*www\.gamersgate\.com\/.*/,
      /.*www\.greenmangaming\.com\/.*/
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

  registerPageWorkerEvents();
})();
