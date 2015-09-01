//     This file is part of Game Deals extension for Mozilla Firefox
//     https://github.com/DanielKamkha/GameDeals
//     (c) 2015 Daniel Kamkha
//     Game Deals is free software distributed under the terms of the MIT license.

(function() {
  "use strict";

  const { PageMod } = require("sdk/page-mod");
  const PageWorker = require("sdk/page-worker").Page;
  const { PageAction } = require("pageaction");

  let { storage } = require("sdk/simple-storage");
  let { prefs } = require("sdk/simple-prefs");

  const cartGray = "images/cart-gray-19.png";
  const cartGrayImportant = "images/cart-gray-important-19.png";

  let workers = {};

  function pageActionClickHandler() {

  }

  let pageAction = PageAction({
    id: "gs-page-action",
    defaultImage: cartGray,
    tooltip: "Game Deals",
    onClick: pageActionClickHandler
  });

  let pageWorker = PageWorker({
    contentScriptFile: [
      "./jquery.min.js",
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
          worker.port.emit(messageName + message.messageId, message);
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
    registerWorkerMessage(worker, "getDealsForTab");
    worker.port.on("getOption", function (message) {
      message[message.optionName] = prefs[message.optionName];
      worker.port.emit("getOption"  + message.messageId, message );
    });
    worker.port.on("showPageAction", function (message) {
      let imagePath = message.important ? cartGrayImportant : cartGray;
      pageAction.setImage(worker.tab, imagePath);
      pageAction.show(worker.tab);
      // TODO: popup, option, smaller icon
    });
    worker.on("detach", function () {
      delete workers[tabId];
    });
  }

  function registerPageWorkerEvents() {
    registerPageWorkerMessage("makeBackgroundRequest");
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
      /.*www\.gog\.com\/.*\/wishlist/,
      /.*www\.origin\.com\/.*\/store\/buy\/.*/,
      /.*www\.(win|mac)gamestore\.com\/product\/.*/,
      /.*www\.gamersgate\.com\/.*/,
      /.*www\.greenmangaming\.com\/.*/,
      /.*www\.desura\.com\/games\/.*/,
      /.*gamesrepublic\.com\/game\/.*/
    ],
    attachTo: ["existing", "top"],
    contentStyleFile: [
      "./font-awesome.css",
      "./content-style.css"
    ],
    contentScriptFile: [
      "./jquery.min.js",
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

  exports.onUnload = function() {
    if (pageAction) {
      pageAction.destroy();
      pageAction = null;
    }
  };
})();
