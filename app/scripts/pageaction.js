//     This file is part of Game Deals extension for Mozilla Firefox
//     https://github.com/DanielKamkha/GameDeals
//     (c) 2015 Daniel Kamkha
//     Game Deals is free software distributed under the terms of the MIT license.

(function() {
  "use strict";

  const { viewFor } = require("sdk/view/core");
  const { data } = require("sdk/self");


  function createPageActionButton(xulWindow, options) {
    let doc = xulWindow.document;
    let urlBarIcons = doc.getElementById("urlbar-icons");
    let button = doc.createElement("toolbarbutton");
    button.setAttribute("id", options.id);
    button.setAttribute("image", data.url(options.defaultImage));
    button.setAttribute("tooltiptext", options.tooltip);
    button.addEventListener("command", options.onClick, false);

    button.setAttribute("disabled", "true"); // create button as disabled

    urlBarIcons.appendChild(button);
    return button;
  }

  function getPageActionButton(xulWindow, id) {
    return xulWindow.document.getElementById(id);
  }

  function ensurePageActionButton(xulWindow, options) {
    return getPageActionButton(xulWindow, options.id) || createPageActionButton(xulWindow, options);
  }

  function isActiveTab(sdkTab) {
    return sdkTab.window.tabs.activeTab.id === sdkTab.id;
  }

  function showPageActionForTab(options, stateDict, sdkTab) {
    if (stateDict[sdkTab.id]) {
      return; // already visible
    }
    stateDict[sdkTab.id] = true;
    if (!isActiveTab(sdkTab)) {
      return; // inactive tab, flagging the state dict is enough
    }

    let button = ensurePageActionButton(viewFor(sdkTab.window), options);
    button.disabled = false;
  }

  function setPageActionImageForTab(options, imageDict, sdkTab, image) {
    imageDict[sdkTab.id] = image;
    if (!isActiveTab(sdkTab)) {
      return; // inactive tab, setting the image in the dict is enough
    }

    let button = ensurePageActionButton(viewFor(sdkTab.window), options);
    button.image = data.url(image);
  }

  function createPageAction(options) {
    if (!options || !options.id) {
      return null;
    }

    let stateDict = {};
    let imageDict = {};

    return {
      show: showPageActionForTab.bind(null, options, stateDict),
      setImage: setPageActionImageForTab.bind(null, options, imageDict)
    };
  }

  exports.PageAction = createPageAction;
})();
