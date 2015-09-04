//     This file is part of Game Deals extension for Mozilla Firefox
//     https://github.com/DanielKamkha/GameDeals
//     (c) 2015 Daniel Kamkha
//     Game Deals is free software distributed under the terms of the MIT license.

(function() {
  "use strict";

  const { PageMod } = require("sdk/page-mod");
  const PageWorker = require("sdk/page-worker").Page;
  const { PageAction } = require("pageaction");
  const Popup = require("sdk/panel").Panel;
  const tabs = require("sdk/tabs");

  let { storage } = require("sdk/simple-storage");
  let simplePrefs = require("sdk/simple-prefs");

  const cartGray = "images/cart-gray-19.png";
  const cartGrayImportant = "images/cart-gray-important-19.png";

  let workers = {};

  let popup = Popup({
    width: 160,
    height: 40,
    contentStyleFile: [
      "./font-awesome.css",
      "./content-style.css"
    ],
    contentScriptFile: [
      "./jquery.min.js",
      "./popup.js"
    ],
    contentURL: "./popup.html"
  });

  let pageAction = PageAction({
    id: "gs-page-action",
    defaultImage: cartGray,
    tooltip: "Game Deals",
    popup: popup,
    suppressed: !simplePrefs.prefs.usePageAction
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
    worker.port.on("getOption", function (message) {
      message[message.optionName] = simplePrefs.prefs[message.optionName];
      worker.port.emit("getOption"  + message.messageId, message);
    });
    worker.port.on("showPageAction", function (message) {
      let imagePath = message.important ? cartGrayImportant : cartGray;
      pageAction.setImage(worker.tab, imagePath);
      pageAction.show(worker.tab);
    });
    worker.on("detach", function () {
      delete workers[tabId];
    });
  }

  function registerPageWorkerEvents() {
    pageWorker.port.on("makeBackgroundRequest", function (message) {
      let tabId = message.tabId;
      if (tabId) {
        let worker = workers[tabId];
        if (worker) {
          worker.port.emit("makeBackgroundRequest" + message.messageId, message);
        }
      }
    });
    pageWorker.port.on("getDealsForTab", function(message) {
      popup.port.emit("getDealsForTab", message);
    });

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

  function registerPopupEvents() {
    popup.on("show", function() {
      popup.port.emit("show");
    });
    popup.port.on("resize", function(size) {
      popup.resize(size.width, size.height);
    });
    popup.port.on("openTab", function(url) {
      popup.hide();
      tabs.open(url);
    });
    popup.port.on("getDealsForTab", function() {
      pageWorker.port.emit("getDealsForTab", { tabId: tabs.activeTab.id });
    });

    simplePrefs.on("usePageAction", function() {
      pageAction.suppress(!simplePrefs.prefs.usePageAction);
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
      /.*www\.(win|mac)gamestore\.com\/.*/,
      /.*www\.gamersgate\.com\/.*/,
      /.*www\.greenmangaming\.com\/.*/,
      /.*www\.desura\.com\/games\/.*/,
      /.*gamesrepublic\.com\/game\/.*/,
      /.*gamesplanet\.com\/game\/.*/,
      /.*shop\.ubi\.com\/store\/.*/,
      /.*www\.bundlestars\.com\/store\/.*/,
      /.*www\.getgamesgo\.com\/product\/.*/
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
  registerPopupEvents();

  exports.onUnload = function() {
    if (pageAction) {
      pageAction.destroy();
      pageAction = null;
    }
  };
})();
