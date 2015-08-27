//     This file is part of Game Deals extension for Chrome and Firefox
//     https://github.com/DanielKamkha/GameDeals
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
      getPrice: function() {
        let $priceArea = $("#game_area_purchase");
        let $priceDiv = $priceArea.find("div.discount_final_price");
        if ($priceDiv.length === 0) {
          $priceDiv = $priceArea.find("div.game_purchase_price");
        }
        return $priceDiv.first().text();
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
      getPrice: function() {
        return $("span.price").first().text();
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
      getPrice: function() {
        let $priceDiv = $("span.buy-price__new");
        if ($priceDiv.length === 0) {
          $priceDiv = $("span.buy-price");
        }
        return $priceDiv.first().text();
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
      getPrice: function() {
        return $("p.actual-price").first().text();
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
      getPrice: function() {
        return $("span.price").first().text();
      },
      addDealsBlock: function() { },
      addDealLinksToDealsBlock: function($block, dealLinks, $container) {
        let $break = $("<br class='gs-marker'>");
        let $storeLink = dealLinks[0].prepend($block);
        $container.append($break, $storeLink);
      }
    },
    "gamersgate": {
      containerSelector: "#PP_data_main",
      getGameId: function() {
        return GameDeals.Tools.getGameIdFromPathName().split("/")[0];
      },
      createBlock: function(blockTitle) {
        return $("<h2 class='gs-marker gs-gamersgate-block'></h2>").text(blockTitle + ":");
      },
      createLink: function(dealData, iconClass) {
        let $icon = $("<i class='fa gs-icon'></i>").addClass(iconClass);
        let $link = $("<a></a>").attr("href", dealData.url).append($icon, dealData.storeTitle);
        let $priceDiv = $("<div class='gs-price'></div>").text(dealData.price);
        return $("<div class='gs-marker gs-gamersgate-line'></div>").append($link, $priceDiv);
      },
      getPrice: function($topContainer) {
        return $topContainer.find("div.price_price").text().trim();
      },
      addDealsBlock: function($container, $block) {
        $container.children().last().before($block);
      },
      addDealLinksToDealsBlock: function($block, dealLinks) {
        $block.after(dealLinks);
      }
    },
    "greenmangaming": {
      containerSelector: "#aside",
      getGameId: function() {
        return GameDeals.Tools.getGameIdFromPathName().split("/").slice(-1)[0];
      },
      createBlock: function(blockTitle) {
        let $blockTitle = $("<div></div>").text(blockTitle + ":");
        return $("<div class='gs-marker share_links gs-gmg-block'></div>").append($blockTitle);
      },
      createLink: function(dealData, iconClass) {
        let $icon = $("<i class='fa gs-icon'></i>").addClass(iconClass);
        let $link = $("<a></a>").attr("href", dealData.url).append($icon, dealData.storeTitle);
        let $priceDiv = $("<div class='gs-price'></div>").text(dealData.price);
        return $("<div></div>").append($link, $priceDiv);
      },
      getPrice: function($topContainer) {
        return $topContainer.find("strong.curPrice").text();
      },
      addDealsBlock: function($container, $block) {
        $container.children().first().after($block);
      },
      addDealLinksToDealsBlock: function($block, dealLinks) {
        $block.append(dealLinks);
      }
    }
  };

  const storeWishlistData = {
    "steam": {
      containerSelector: "div.wishlistRow",
      dealsLimit: 1,
      getGameId: function($container) {
        return $container.find("a.btn_small").attr("href").split("/").slice(-2).join("/");
      },
      createBlock: function () { },
      createLink: function (dealData, iconClass) {
        let $icon = $("<i class='fa gs-icon gs-line'></i>").addClass(iconClass);
        let $link = $("<a></a>").attr("href", dealData.url).append($icon, dealData.storeTitle);
        let $priceDiv = $("<div class='gs-price'></div>").text(dealData.price);
        return $("<div class='gs-marker gs-steam-line'></div>").append($link, $priceDiv);
      },
      getPrice: function ($container) {
        let $priceDiv = $container.find("div.discount_final_price");
        if ($priceDiv.length === 0) {
          $priceDiv = $container.find("div.price");
        }
        return $priceDiv.text().trim();
      },
      getDealsContainer($topContainer) {
        return $topContainer.find("div.gameListPriceData");
      },
      addDealsBlock: function () { },
      addDealLinksToDealsBlock: function ($block, dealLinks, $container) { // jshint ignore:line
        $container.append(dealLinks);
      }
    }
  };

  function getStorePageData(storeId, isWishlist) {
    let dict = isWishlist ? storeWishlistData : storePageData;
    return dict[storeId];
  }

  window.GameDeals = window.GameDeals || {};
  window.GameDeals.Stores = {
    getStorePageData: getStorePageData
  };
})();
