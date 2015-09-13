//     This file is part of Game Deals extension for Mozilla Firefox
//     https://github.com/DanielKamkha/GameDeals
//     (c) 2015 Daniel Kamkha
//     Game Deals is free software distributed under the terms of the MIT license.

(function() {
  "use strict";

  const { viewFor } = require("sdk/view/core");
  const { data } = require("sdk/self");
  const tabs = require("sdk/tabs");
  const windows = require("sdk/windows");

  /* XUL level functions */

  function pageActionClickHandler(popup, event) {
    if (popup) {
      popup.show(event.target);
    }
  }

  function createPageActionButton(xulWindow, options) {
    if (!xulWindow) {
      return null;
    }
    let doc = xulWindow.document;
    if (!doc) {
      return null;
    }

    let urlBarIcons = doc.getElementById("urlbar-icons");
    let button = doc.createElement("toolbarbutton");
    button.setAttribute("id", options.id);
    button.setAttribute("image", data.url(options.defaultImage));
    button.setAttribute("tooltiptext", options.tooltip);
    button.addEventListener("command", pageActionClickHandler.bind(null, options.popup), false);

    button.setAttribute("collapsed", "true"); // create button as invisible

    urlBarIcons.appendChild(button);
    return button;
  }

  function removePageActionButton(xulWindow, id) {
    if (!xulWindow) {
      return null;
    }
    let doc = xulWindow.document;
    if (!doc) {
      return null;
    }

    let button = doc.getElementById(id);
    if (button && button.parentNode) {
      button.parentNode.removeChild(button);
    }
  }

  function removeAllPageActionButtons(id) {
    for (let i = 0; i < windows.browserWindows.length; i++) {
      removePageActionButton(viewFor(windows.browserWindows[i]), id);
    }
  }

  function getPageActionButton(xulWindow, id) {
    if (xulWindow && xulWindow.document) {
      return xulWindow.document.getElementById(id);
    } else {
      return null;
    }
  }

  function setPageActionButtonVisibility(xulWindow, options, visible) {
    let button = getPageActionButton(xulWindow, options.id);
    if (!button && visible) {
      button = createPageActionButton(xulWindow, options);
    }
    if (button) {
      button.collapsed = !visible;
    }
  }

  function setPageActionButtonImage(xulWindow, options, image) {
    let button = getPageActionButton(xulWindow, options.id) || createPageActionButton(xulWindow, options);
    if (button) {
      button.image = data.url(image);
    }
  }

  /* SDK level functions */

  function isActiveTab(sdkTab) {
    return sdkTab.window.tabs.activeTab.id === sdkTab.id;
  }

  function isPageActionVisibleForTab(options, stateDict, sdkTab) {
    return !options.suppressed && stateDict[sdkTab.id];
  }

  function showPageActionForTab(options, stateDict, sdkTab) {
    if (stateDict[sdkTab.id]) {
      return; // already visible
    }
    stateDict[sdkTab.id] = true;
    if (isActiveTab(sdkTab) && isPageActionVisibleForTab(options, stateDict, sdkTab)) {
      setPageActionButtonVisibility(viewFor(sdkTab.window), options, true);
    }
  }

  function hidePageActionForTab(options, stateDict, sdkTab) {
    if (!stateDict[sdkTab.id]) {
      return; // already hidden
    }
    stateDict[sdkTab.id] = false;
    if (isActiveTab(sdkTab)) {
      setPageActionButtonVisibility(viewFor(sdkTab.window), options, false);
    }
  }

  function setPageActionImageForTab(options, imageDict, sdkTab, image) {
    imageDict[sdkTab.id] = image;
    if (isActiveTab(sdkTab)) {
      setPageActionButtonImage(viewFor(sdkTab.window), options, image);
    }
  }

  function redisplayPageActionForTab(options, stateDict, imageDict, sdkTab) {
    let visible = isPageActionVisibleForTab(options, stateDict, sdkTab);
    if (visible) {
      setPageActionButtonImage(viewFor(sdkTab.window), options, imageDict[sdkTab.id] || options.defaultImage);
    }
    setPageActionButtonVisibility(viewFor(sdkTab.window), options, visible);
  }

  function setPageActionSuppressedState(options, stateDict, imageDict, value) {
    options.suppressed = value;
    for (let i = 0; i < windows.browserWindows.length; i++) {
      redisplayPageActionForTab(options, stateDict, imageDict, windows.browserWindows[i].tabs.activeTab);
    }
  }

  function createPageAction(options) {
    if (!options || !options.id) {
      return null;
    }

    let stateDict = {};
    let imageDict = {};

    tabs.on("ready",  function(sdkTab) {
      hidePageActionForTab(options, stateDict, sdkTab);
    });
    tabs.on("activate", redisplayPageActionForTab.bind(null, options, stateDict, imageDict));
    tabs.on("close", function(sdkTab) {
      setPageActionButtonVisibility(viewFor(sdkTab.window), options, false);
      stateDict[sdkTab.id] = false;
    });

    return {
      show: showPageActionForTab.bind(null, options, stateDict),
      hide: hidePageActionForTab.bind(null, options, stateDict),
      setImage: setPageActionImageForTab.bind(null, options, imageDict),
      suppress: setPageActionSuppressedState.bind(null, options, stateDict, imageDict),
      destroy: removeAllPageActionButtons.bind(null, options.id)
    };
  }

  exports.PageAction = createPageAction;
})();
