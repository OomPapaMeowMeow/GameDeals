//     This file is part of Game Deals extension for Chrome and Firefox
//     https://github.com/DanielKamkha/GameDealsChrome
//     https://github.com/DanielKamkha/GameDealsFirefox
//     (c) 2015 Daniel Kamkha
//     Game Deals is free software distributed under the terms of the MIT license.

(function() {
  "use strict";

  const storePageData = {
    "steam": {
      containerSelector: "div.game_meta_data",
      getGameId: GameDeals.Tools.getGameIdFromPathName,
      createBlock: function(blockTitle) {
        let $blockTitle = $("<div class='block_title gs-steam-title'></div>").text(blockTitle + ":");
        return $("<div class='block gs-marker'></div>").append($blockTitle);
      },
      createLink: function(dealData, iconClass) {
        let $icon = $("<i class='fa fa-lg gs-steam-icon'></i>").addClass(iconClass);
        let $iconLink = $("<a></a>").attr("href", dealData.url).append($icon);
        let $iconDiv = $("<div class='icon'></div>").append($iconLink);

        let $priceDiv = $("<div class='gs-steam-price'></div>").text(dealData.price);
        let $textLink = $("<a class='name'></a>");
        $textLink.text(dealData.storeTitle).attr("href", dealData.url).append($priceDiv);

        return $("<div class='game_area_details_specs'></div>").append($iconDiv, $textLink);
      },
      addDealsBlock: function($container, $block) {
        $container.prepend($block);
      },
      addDealLinksToDealsBlock: function($block, dealLinks) {
        $block.append(dealLinks);
      }
    },
    "humblestore": {
      containerSelector: "div.product-details",
      needsObserver: true,
      getGameId: function() {
        return GameDeals.Tools.getGameIdFromPathName().split("/").pop();
      },
      createBlock: function(blockTitle) {
        return $("<dt class='gs-marker'></dt>").text(blockTitle + ":");
      },
      createLink: function(dealData, iconClass) {
        let $icon = $("<i class='fa gs-icon'></i>").addClass(iconClass);
        let $storeLink = $("<a></a>").attr("href", dealData.url).append($icon, dealData.storeTitle).addClass("gs-humble-link");
        let $dd = $("<dd class='gs-marker'></dd>").append($storeLink);
        if (dealData.price) {
          let $priceDiv = $("<div class='gs-price'></div>").text(dealData.price);
          $dd.append($priceDiv);
        }
        return $dd;
      },
      getDealsContainer($topContainer) {
        return $topContainer.find("dl.product-links");
      },
      addDealsBlock: function($container, $block) {
        $container.prepend($block);
      },
      addDealLinksToDealsBlock: function($block, dealLinks) {
        $block.after(dealLinks);
      }
    },
    "gog": {
      containerSelector: "div.column--right.group-2.ng-scope",
      dealsLimit: 1,
      getGameId: function($topContainer) {
        return $topContainer.attr("gog-product");
      },
      createBlock: function(blockTitle) {
        return $("<b></b>").text(blockTitle.toUpperCase() + ": ");
      },
      createLink: function(dealData, iconClass, $block) {
        let $icon = $("<i class='fa gs-gog-icon'></i>").addClass(iconClass);
        let $link = $("<a></a>").attr("href", dealData.url).append($icon, $block, dealData.storeTitle);
        let $priceDiv = $("<div class='gs-price'></div>").text(dealData.price);
        return $("<p class='gs-marker'></p>").append($link, $priceDiv).addClass("gs-gog-line");
      },
      getDealsContainer($topContainer) {
        return $topContainer.find("div.buy-footer-info");
      },
      addDealsBlock: function() { },
      addDealLinksToDealsBlock: function($block, dealLinks, $container) { // jshint ignore:line
        $container.prepend(dealLinks);
      }
    },
    "origin": {
      containerSelector: "div.main-mod-right",
      gameIdType: 2,
      getGameId: function() {
        return $("#title").text().trim();
      },
      createBlock: function(blockTitle) {
        let $blockTitle = $("<p class='action gs-origin-title'></p>").text(blockTitle);
        let $gsBlockInner = $("<div class='price-area'></div>").append($blockTitle);
        return $("<div class='price gs-origin-block gs-marker'></div>").append($gsBlockInner);
      },
      createLink: function(dealData, iconClass) {
        let $icon = $("<i class='fa gs-icon'></i>").addClass(iconClass);
        let $link = $("<a class='gs-origin-link'></a>").attr("href", dealData.url).append($icon, dealData.storeTitle);
        let $priceDiv = $("<div class='gs-price'></div>").text(dealData.price);
        return $("<div class='gs-origin-line'></div>").append($link, $priceDiv);
      },
      addDealsBlock: function($container, $block) {
        $container.append($block);
      },
      addDealLinksToDealsBlock: function($block, dealLinks) {
        $block.append(dealLinks);
      }
    },
    "wingamestore": {
      containerSelector: "div.btnlist",
      dealsLimit: 1,
      getGameId: function() {
        return GameDeals.Tools.getGameIdFromPathName().split("/")[1];
      },
      createBlock: function(blockTitle) {
        return $("<label></label>").text(blockTitle);
      },
      createLink: function(dealData, iconClass) {
        let $icon = $("<i class='fa fa-lg gs-wgs-icon'></i>").addClass(iconClass);
        let $priceDiv = $("<div class='gs-price'></div>").text(dealData.price);
        let $linkText = $("<b></b>").append($icon, dealData.storeTitle, $priceDiv);
        return $("<a class='gs-marker'></a>").attr("href", dealData.url).append($linkText);
      },
      addDealsBlock: function() { },
      addDealLinksToDealsBlock: function($block, dealLinks, $container) {
        let $break = $("<br class='gs-marker'>");
        let $storeLink = dealLinks[0].prepend($block);
        $container.append($break, $storeLink);
      }
    }
  };

  function getStorePageData(storeId) {
    return storePageData[storeId];
  }

  window.GameDeals = window.GameDeals || {};
  window.GameDeals.Stores = {
    getStorePageData: getStorePageData
  };
})();
