// ==UserScript==
// @name        Duellstat
// @author      xyzabcd
// @namespace   xyzabcd
// @description create a duell statistik
// @include https://*.the-west.*/game.php*
// @include https://*.tw.innogames.*/game.php*

// @version     0.0.30
// @grant       none
// ==/UserScript==

// history:
// 0-0.0.23 self use only
// 0.0.24 announcement in the forum
// 0.0.25 fix firefox problem at least in tampermonkey
// 0.0.26 if !automation, then do not Wear.carry things, just open the inventory with them
// 0.0.27 people tab: show duels when clicking on name.
// 0.0.28 people tab: import now pauses like clothcalc (RIP, you are missed) does.
// 0.0.29 equipment import button, fix duel ordering, german translation of duel tab.
// 0.0.30 fix the next firefox problem. That hackish kind of script injection should solve it. Greasemonkey, WTF is that?

(function(fn) {
  var script = document.createElement('script');
  script.setAttribute('type', 'application/javascript');
  script.textContent = '(' + fn + ')();';
  document.body.appendChild(script);
  document.body.removeChild(script);
})(function() {
