window.addEventListener("DOMContentLoaded", function(){
    'use strict';
    var baseUrl = 'https://www.bing.com';
    var bingBackgroundsXMLPath = '/HPImageArchive.aspx?format=xml&idx=0&n=8&mkt=en-US';
    var imageRegex = /<url>(.*?)<\/url>/g; 
    var oneImageRegex = /<url>(.*?)<\/url>/; 
    var cacheLocalStorageKey = '__backgroundCache';
    var ageLocalStorageKey = '__backgroundDateAge';
    var maxBackgroundCacheAge = 1000 * 60 * 60 * 24; // 24 hours

    // attempts to load backgrounds from localStorage or load from bing XML
    function loadBackgrounds(onFinish)
    {
        var ageDateStr = localStorage[ageLocalStorageKey];
        if(ageDateStr){
            var ageDate = new Date(ageDateStr);
            if(new Date() - ageDate > maxBackgroundCacheAge){
                xhrLoadBackground(onFinish);
            } else {
                try{
                    var backgrounds = JSON.parse(localStorage[cacheLocalStorageKey]);
                    onFinish(backgrounds);
                } catch(err) {
                    xhrLoadBackground(onFinish);
                }
            }
        } else {
            xhrLoadBackground(onFinish);
        }
    }

    // wraps onFinish after the background is loaded
    function handleLoadBackgroundXHRGenerator(onFinish) {
        return function(){
            if(this.readyState != this.DONE || this.status != 200)
                return;
            var xml = this.responseText;
            var imageUrls = xml.match(imageRegex);
            localStorage[cacheLocalStorageKey] = JSON.stringify(imageUrls);
            localStorage[ageLocalStorageKey] = new Date().toString();
            onFinish(imageUrls);
        };
    }

    // makes the XHR to Bing and calls onFinish afterwards
    function xhrLoadBackground(onFinish)
    {
        var client = new XMLHttpRequest();
        client.open("GET", baseUrl + bingBackgroundsXMLPath);
        client.onreadystatechange = handleLoadBackgroundXHRGenerator(onFinish);
        client.send();
    }

    // selects a random background (called after backgrounds are fetched from bing)
    function putRandomBackground(imageUrls) {
        var randomIndex = Math.floor(Math.random() * imageUrls.length);
        var imageUrl = oneImageRegex.exec(imageUrls[randomIndex])[1];

        var backgroundRule = "body { background-image: url(" + baseUrl + imageUrl + ") !important; background-size: 100% cover; }";
        var style = document.styleSheets[0];
        style.insertRule(backgroundRule, style.cssRules.length);
    }

    loadBackgrounds(putRandomBackground);
}, true);
