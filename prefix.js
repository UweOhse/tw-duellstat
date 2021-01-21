// ==UserScript==
// @name        Duellstat
// @author      xyzabcd
// @namespace   xyzabcd
// @description create a duell statistik
// @include https://*.the-west.*/game.php*
// @include https://*.tw.innogames.*/game.php*

// @version     @REPLACEMYVERSION@
// @grant       none
// ==/UserScript==

(function(fn) {
  var script = document.createElement('script');
  script.setAttribute('type', 'application/javascript');
  script.textContent = '(' + fn + ')();';
  document.body.appendChild(script);
  document.body.removeChild(script);
})(function() {
