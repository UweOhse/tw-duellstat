// ==UserScript==
// @name        Duellstat
// @name:de     Clothcache (früher Duellstat)
// @name:en     Clothcache (ex-Duellstat)
// @author      xyzabcd
// @namespace   xyzabcd
// @description Enhance the usability of the game
// @include https://*.the-west.*/game.php*
// @include https://*.tw.innogames.*/game.php*
// @grant GM.xmlHttpRequest
// @connect support.innogames.com
// @downloadURL https://ohse.de/uwe/tw-duellstat/release/tw-duellstat.user.js

// @version     @REPLACEMYVERSION@
// ==/UserScript==

try {
	unsafeWindow._TWDS_GM_XHR=GM.xmlHttpRequest
	console.log("unsafeWindow._TWDS_GM_XHR", unsafeWindow._TWDS_GM_XHR);
} catch(e) {
	console.error("could not export GM.xmlHttpRequest to unsafeWindow", e);
}
(function(fn) {
  var script = document.createElement('script');
  script.setAttribute('type', 'application/javascript');
  script.textContent = '(' + fn + ')();';
  document.body.appendChild(script);
  document.body.removeChild(script);
})(function() {
