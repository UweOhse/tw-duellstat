// vim: tabstop=2 shiftwidth=2 expandtab
TWDS.insertStyles = function () {
  const css = `
    :root {
      --twds-gold: #f8c57c;
      --twds-dark-brown: #5c3f1e;
    }
    .TWDS_clicktarget {
      text-decoration:underline;
      cursor:pointer;
    }

    .TWDS_blinking {
      animation: blinker 0.5s linear 120
    }
    #TWDS_settings {
      display:grid;
      grid-template-columns: 2fr 1fr;
    }
    #TWDS_settings .TWDS_VERSIONINFO {
      grid-row:1;
      grid-column:2;
      border:blue;
      color: #333;
      text-align: right;
      padding: 0 2px 5px 0;
    }
    #TWDS_settings .TWDS_settings_cache {
      grid-row:1/ span 2;
      grid-column:1;
    }
    #TWDS_settings .TWDS_settings_main {
      grid-column:1/ span 2;
    }
    #TWDS_settings h2 {
      font-size:22px;
    }
    #TWDS_settings h2, h3 {
      margin-bottom:0.5em;
      margin-top:1em;
    }
    @keyframes blinker {
      50% {
        opacity: 0;
      }
    }
    .TWDS_chat_highlight {
      background-color: black;
      color:white;
      border-left:2px solid red;
      border-right:2px solid red;
      text-decoration: underline red;
    }

    .TWDS .tw2gui_scrollpane {
      margin:1em 0;
    }
    .TWDS_tabcontent {
      padding-bottom:1em;
    }
    #TWDS_job .hasMousePopup,
    #TWDS_job [title],
    #TWDS_equipment .hasMousePopup,
    #TWDS_equipment [title],
    #TWDS_bonuslist .hasMousePopup,
    #TWDS_bonuslist [title],
    #TWDS_bonus .hasMousePopup,
    #TWDS_bonus [title] {
      text-decoration: dotted underline;
    }
    #TWDS_bonuslist td:first-child {
      text-align:right;
    }
    #TWDS_equipment { border-collapse: collapse;}
    #TWDS_equipment .headrow {
      font-weight:bold;
    }
    #TWDS_equipment .datarow {
      text-align:right;
    }
    #TWDS_equipment .hasMousePopup {
      text-decoration: dotted underline;
    }
    #TWDS_equipment .datarow th:nth-child(1) {
      text-align:left;
      font-weight:normal;
    }
    #TWDS_equipment .best { color: #0c0; font-weight:bold; }
    #TWDS_equipment .verygood { color: #0c0; }
    #TWDS_equipment .good { color: green;}
    #TWDS_equipment .ok { }
    #TWDS_equipment .other { color: #800;}
    #TWDS_equipment tr, #TWDS_equipment td, #TWDS_table th { border:1px solid #888;}
    #TWDS_equipment td, #TWDS_equipment th { padding:1px 2px;}
    .TWDS_button {
      min-width:3.5em;
      border-color:#2B1C19;
      color:white;
      border-width:2px;
      margin:1px;
      border-style:inset;
      padding:1px 1px;
      line-height:18px;
      cursor:pointer;
      background: rgb(46,16,2);
      background: radial-gradient(circle, rgba(46,16,2,1) 0%, rgba(93,63,30,1) 49%, rgba(60,29,6,1) 100%);
    }
    .TWDS_button_small {
      min-width:auto;
    }
    .TWDS_specialequipment_button {
      margin:0.2em 0.5em;
    }
    .TWDS_SPEC_spec {
      display:flex;
      justify-content:space-between;
    }
    .TWDS_SPEC_SKILLS {
      width:100%;
    }
    .TWDS_SPEC_SKILLS td {
      text-align:center;
    }
    .TWDS_SPEC_SKILLS button {
      min-width:100px;
    }
    .TWDS_spec_strength {
      background-color:#8003;
      border-color:red;
    }
    .TWDS_spec_flexibility {
      background-color:#0803;
      border-color:green;
    }
    .TWDS_spec_dexterity {
      background-color:#0083;
      border-color:blue;
    }
    .TWDS_spec_charisma {
      background-color:#8803;
      border-color:yellow;
    }

    #TWDS_people { border-collapse: collapse; width:100%;}
    #TWDS_people tr, #TWDS_people td, #TWDS_people th { border:1px solid #888;}
    #TWDS_people tbody td {
      padding:1px 2px;
      text-align:right;
    }
    #TWDS_people tbody th {
      padding:1px 2px;
      text-align:left;
      text-decoration:underline;
      cursor:pointer;
      font-weight:normal;
    }
    #TWDS_people_subtab table {
      border-collapse: collapse;
    }
    #TWDS_people_subtab .openreport {
      text-decoration:underline;
      cursor:pointer;
    }
    #TWDS_people_subtab .attacker,
    #TWDS_people_subtab .winner {
      text-align:right;
    }
    #TWDS_attr_skill {
      border-collapse: collapse;
    }

    #TWDS_attr_skill .bonus-strength1 {
      border-left:2px solid red;
      border-top:2px solid red;
      border-right:2px solid red;
      background-color:#8003;
    }
    #TWDS_attr_skill .bonus-strength2 {
      border-left:2px solid red;
      border-bottom:2px solid red;
      border-right:2px solid red;
      background-color:#8003;
    }
    #TWDS_attr_skill .bonus-flexibility1 {
      border-left:2px solid green;
      border-top:2px solid green;
      border-right:2px solid green;
      background-color:#0803;
    }
    #TWDS_attr_skill .bonus-flexibility2 {
      border-left:2px solid green;
      border-bottom:2px solid green;
      border-right:2px solid green;
      background-color:#0803;
    }
    #TWDS_attr_skill .bonus-dexterity1 {
      border-left:2px solid blue;
      border-top:2px solid blue;
      border-right:2px solid blue;
      background-color:#0083;
    }
    #TWDS_attr_skill .bonus-dexterity2 {
      border-left:2px solid blue;
      border-bottom:2px solid blue;
      border-right:2px solid blue;
      background-color:#0083;
    }
    #TWDS_attr_skill .bonus-charisma1 {
      border-left:2px solid yellow;
      border-top:2px solid yellow;
      border-right:2px solid yellow;
      background-color:#8802;
    }
    #TWDS_attr_skill .bonus-charisma2 {
      border-left:2px solid yellow;
      border-bottom:2px solid yellow;
      border-right:2px solid yellow;
      background-color:#8803;
    }
    #TWDS_attr_skill td {
      text-align:center;
    }
    #TWDS_job p {
       text-align:right;
       display:grid;
    }
    #TWDS_job_filtergroup {
      grid-column:1;
      grid-row: 1 / span 3
    }
    #TWDS_job_modearea {
      grid-column:2;
      grid-row: 1;
    }
    #TWDS_job_searchgroup {
      grid-column:2;
      grid-row: 2;
    }
    #TWDS_job_search {
      width:140px;
    }
    #TWDS_job_duration {
      grid-column:2;
      grid-row: 3;
      justify-self: end;
      min-width:5em;
    }
    #TWDS_jobtab_filter_container {
      text-align:left;
    }

    #TWDS_jobs {
      margin-bottom:1em;
      border-collapse: collapse;
      width:98%;
      margin-left:1%;
      margin-right:1%;
    }

    table.TWDS_with_border {
      border-collapse: collapse;
    }
    table.TWDS_with_border tr,
    table.TWDS_with_border th,
    table.TWDS_with_border td { border:1px solid #888 }
    table.TWDS_padded th,
    table.TWDS_padded td { padding:1px;}
    th.ra, td.ra { text-align:right }
    th.center, td.center { text-align:enter }

    #TWDS_jobs tr, #TWDS_jobs td, #TWDS_jobs th { border:1px solid #888;}
    #TWDS_jobs td { text-align:right;}
    #TWDS_jobs td[data-field=name] { text-align:left; padding:1px 2px; }
    #TWDS_jobs th[data-field=danger] { color: red}
    #TWDS_jobs th[data-field=luck] { color: green}
    #TWDS_jobs tr.gold td { 
      background-color: #ffd70050;
    }
    #TWDS_jobs tr.silver td { 
      background-color: #c0c0c080;
    }

    #TWDS_jobtab_filter_container fieldset {
      display:inline-block;
      max-width:12em;
    }
    #TWDS_jobtab_filter_container select {
      display:block;
    }
    #TWDS_jobtab_filter_container input {
      display:block;
      width:75px;
    }

    div.item span.TWDS_itemusageinfo {
      top:0;
      right:0;
      display:block;
      background-color:#8888;
      color:white;
      box-shadow: 1px 1px 2px #000000;
    }
    .TWDS_joblist_stars {
      opacity:0.5;
      color:green;
      text-shadow: 0 0 0px black;
    }
    .TWDS_joblist_stars.TWDS_joblist_stage_gold {
      color:gold;
    }
    .TWDS_joblist_stars.TWDS_joblist_stage_silver {
      color:silver;
    }
    .TWDS_joblist_stars.TWDS_joblist_stage_bronze {
      color:#cd7f32;
    }
    .TWDS_job_negative {
      color:red;
    }
    .TWDS_job_less {
      color:orange;
    }
    #TWDS_job p {
      text-align:right
    }
    #TWDS_job tr.hidden {
      display:none
    }
    #TWDS_job_filtergroup {
      margin-right:2em;
      display:inline-block;
    }
    #TWDS_job_filterx {
      border-radius:5px;
    }

    .job_bestwearbutton {
      top:-10px !important;
    }
    .job_bestwearbutton .twdb_bestwear {
      position:absolute;
      top:0;
    }
    .job_bestwearbutton .TWDS_getbestwear {
      position:absolute;
      top:0;
      position: absolute;
      top: 43px;
      left: 48px;
      line-height:16px;
    }
    #TWDS_storage_list {
      border-collapse:collapse;
    }
    #TWDS_storage_list tr, 
    #TWDS_storage_list td, 
    #TWDS_storage_list th {
      border:1px solid #888;
    }
    #TWDS_storage_list .TWDS_storage_image img {
      max-height:43px;
    }
    #TWDS_storage_list .TWDS_storage_name .TWDS_joblist_openbutton {
      margin-right:4px;
    }
    #TWDS_storage_list .TWDS_storage_percent {
      text-align:right;
    }
    #TWDS_storage_list .TWDS_storage_count {
      text-align:right;
    }
    #TWDS_storage_list .TWDS_storage_countinput {
      width:5em;
      text-align:right;
    }

    #TWDS_storage_select {
      border:1px solid #888;
      display:none;
    }
    #TWDS_storage_select.visible {
      display:block;
    }
    .TWDS_lp_hint {
      position: absolute;
      left: 2px;
      width: 18px;
      height: 18px;
      background-color: #432;
      border: 2px ridge #976;
      border-radius: 11px;
      background-blend-mode: soft-light;
    }

    .jobgroupicon .TWDS_storage_needs_item,
    .job .item-job {
      width: 20px;
      height: 20px;
      position: absolute;
      font-size:130%;
      color:white;
      color: var(--twds-gold);
      background-color:#2B1C19;
      border:2px solid #4F210D;
      border-radius:10px;
      top: -20px;
      left: +20px;
    }
    .market-buy img[alt="report"] {
      margin-left:5px;
    }
    #TWDS_wuw {
      height:340px;
      overflow-y: auto !important;
      overflow-x: auto !important;
    }
    #TWDS_wuw_table {
      border-collapse: collapse;
    }
    #TWDS_wuw td,
    #TWDS_wuw th {
      border-bottom:1px dotted #888;
      padding:2px;
    }
    #TWDS_wuw td {
      border-left:1px dotted #888;
    }
    input[type=number][size="2"] {
      width:3em;
    }
    input[type=number][size="7"] {
      width:8em;
    }
    #TWDS_tab_itemsets, #TWDS_tab_wuw, #TWDS_tab_settings {
      height:340px;
      overflow-y: auto !important;
      overflow-x: auto !important;
    }

    #TWDS_tab_itemsets thead{
      position:sticky;
      top:0;
      background-color: wheat;
    }
    #TWDS_itemset_table {
      border-collapse: collapse;
    }
    #TWDS_itemset_table td.perlevel {
      font-style: italic;
    }
    #TWDS_itemset_table td,
    #TWDS_itemset_table tbody th {
      border:1px solid #888;
      padding:2px;
      font-size:inherit;
    }
    #TWDS_itemset_table thead th {
      border:1px solid #888;
      padding:2px;
      font-size:inherit;
    }
    #TWDS_itemset_table thead tr.colspanrow th {
      border-top:none;
    }
    #TWDS_itemset_table tbody th.setname {
      cursor:pointer;
    }
    #TWDS_itemsettable_butplus,
    #TWDS_itemsettable_butminus {
      min-width:2em;
      margin-right:0.5em;
    }
    #TWDS_tab_updates dt {
      margin-left:2px;
      margin-top:1em;
      font-weight:bold;
    }
    #TWDS_tab_updates dd {
      margin-left:1em;
    }
    #TWDS_tab_updates dd::before {
      content: "*";
      margin-right:2px;
    }
    #TWDS_tab_updates dd ul {
      margin-left:2em;
    }
    .TWDS_fbs_basestats_content table {
      margin: 0 auto;
      border-collapse: collapse;
    }
    .TWDS_fbs_basestats_content table thead tr {
      height:24px;
      box-shadow: inset #7a481f 0px -2px 6px 0px;
    }
    .TWDS_fbs_basestats_content table tbody tr {
      height:24px;
      box-shadow: inset #7a481f 0px 2px 6px 0px;
    }
    .TWDS_fbs_basestats_content table tbody td {
      vertical-align:middle;
      text-align:right;
      padding: 0 4px;
      width:230px;
    }
    .TWDS_fbs_basestats_content table tbody th {
      width:176px;
      p
    }
    .TWDS_fbs_basestats_content p {
      margin-bottom:0.5em;
    }
    .TWDS_fbs_basestats_content table thead th {
      padding: 0 8px;
    }
    .TWDS_fbs_basestats_content table td {
      font-family:fixed;
    }
    .TWDS_fbs_basestats_content table th.subhead {
      background-color:wheat;
    }
    .TWDS_fbs_basestats_content .dotnull {
      visibility:hidden;
    }
    .TWDS_fbs_basestats .tw2gui_window_content_pane {
      max-height:320px;
      overflow: auto;
    }
    .TWDS_scrollbar::-webkit-scrollbar-thumb {
      background-color: #584329;
      border-radius: 6px;
      border: 3px solid #584329;
    }
    .TWDS_scrollbar::-webkit-scrollbar-track {
      background: #200;
      border-radius: 6px;
    }
    .TWDS_scrollbar::-webkit-scrollbar {
      width:14px;
    }

    .TWDS_jobwindow_setbuttons {
      height: 50px; /* same as the premium thing it replaces */
      display: flex;
      flex-flow: wrap;
      overflow:hidden;
      justify-content: center;
    }
    .TWDS_jobwindow_setbuttons .TWDS_button {
      margin-top:0;
    }
    .TWDS_settingline {
      padding-left:1.25em;
      text-indent:-1.25em;
    }
    .TWDS_setting_info {
      margin-top:1em;
      border-top:1px dotted #888;
    }
    .TWDS_sleephelper .tw2gui_scrollpane {
      min-width:27em;
    }
    .TWDS_quickusableshelper .tw2gui_scrollpane {
      min-width:16em;
    }
    .TWDS_quickusableshelper .tw2gui_scrollpane li:nth-child(4) {
      border-bottom: 3px solid black;
    }
    .TWDS_sleephelper .tw2gui_scrollpane li span span {
      float:right;
      font-width:bold;
      font-family:fixed;
      line-height:20px;
    }
    .TWDS_sleephelper .tw2gui_scrollpane li span span.stars5, 
    .TWDS_sleephelper .tw2gui_scrollpane li span span.stars6 {
      color:green;
    }
    .TWDS_sleephelper .tw2gui_scrollpane li span span.stars1, 
    .TWDS_sleephelper .tw2gui_scrollpane li span span.stars2 {
      color:orange;
    }
    .TWDS_clickable {
      cursor:pointer;
    }
    #TWDS_trackbar_container {
      width: 515px;
      height: 20px;
      bottom: 64px;
      position: absolute;
      z-index: 13;
      left: 50%;
      margin-left: -258px;
      display: flex;
      justify-content: space-around;
      background: rgb(46,16,2);
      background: url('https://westde.innogamescdn.com/images/tw2gui/window/minimized_bg.png?24');
      background-position: 0 -35px;
    }
    #user-interface.TWDS_trackbar_active  .friendsbar-toggle {
      bottom:84px;
    }
    #user-interface.TWDS_trackbar_active.friendsbar-open  .friendsbar-toggle {
      bottom:158px;
    }
    #TWDS_trackbar_container .TWDS_trackbar_tracker {
      height:12px;
      flex-grow:1;
      margin:2px;
      box-sizing:border-box;
      border:1px solid hsl(0deg 0% 40%);
      background: url('https://westde.innogamescdn.com/images/tw2gui/window/minimized_bg.png?24');
      background-position: 0 -3px;
      position:relative;
      border-radius:8px;
    }
    #TWDS_trackbar_container .TWDS_trackbar_tracker::before {
      width:var(--twds-progress);
      display:block;
      content: "x";
      color:transparent;
      background-color: hsl(32deg 76% 45%);
      position:absolute;
      border-radius:8px;
      height:12px;
      margin-top:-1px;
      mix-blend-mode:difference;
    }
    #TWDS_trackbar_container .TWDS_trackbar_xp::before {
      background-color: hsl(32deg 76% 45%);
    }
    #TWDS_trackbar_container .TWDS_trackbar_achievement::before {
      background-color: hsl(181deg 41% 40%)
    }
    #TWDS_trackbar_container .TWDS_trackbar_storage::before {
      background-color: hsl(121deg 76% 35%);
    }
    #TWDS_trackbar_container .TWDS_trackbar_product::before {
      background-color: hsl(151deg 56% 35%);
    }
    #TWDS_trackbar_container .TWDS_trackbar_tracker::after {
      content: attr(data-text);
      color:black;
      position:absolute;
      left:3px;
      font-size:10px;
      height:100%;
      line-height:100%;
      color:#FFF;
    }
    body.TWDS_quicksilver_exclamation .TWDS_gold::after,
    body.TWDS_quicksilver_exclamation .TWDS_silver::after {
      content: "!";
      display: block;
      font-size: 96px;
      position: relative;
      font-weight: bold;
      width: 100%;
      height: 100%;
      left: 50%;
      top: -50%;
      color:transparent;
      font-style: italic;
      text-shadow:3px 2px black;
    }
    body.TWDS_quicksilver_exclamation .TWDS_gold.opened::after,
    body.TWDS_quicksilver_exclamation .TWDS_silver.opened::after {
      color:transparent;
      text-shadow:none;
    }
    body.TWDS_quicksilver_exclamation .TWDS_gold::after {
      color:gold;
    }
    body.TWDS_quicksilver_exclamation .TWDS_silver::after {
      color:silver;
    }
    body.TWDS_quicksilver_exclamation .TWDS_gold,
    body.TWDS_quicksilver_exclamation .TWDS_silver {
      outline-color: transparent;
      background-color:transparent;
    }
    .TWDS_gold, .TWDS_silver {
      outline-style:solid;
      outline-color: transparent;
      outline-width: 3px;
      outline-offset:3px;
    }
    .TWDS_gold {
      background-color:gold;
      outline-color: gold;
    }
    .TWDS_silver {
      background-color:silver;
      outline-color: silver;
    }
    #ui_questtracker .TWDS-quest-list-to-book {
      display:none;
      color:white;
      line-height:13px;
    }
    #ui_questtracker .quest-list.title:hover .TWDS-quest-list-to-book {
      display: inline-block;
      zoom: 1;
    }
    body.TWDS_itemsettable_hidemany #TWDS_tab_itemsets .maybehidden {
      display:none;
    }
    .TWDS_itemsets_filterline {
      display:flex;
      justify-content:space-between;
    }
    .TWDS_itemsets_options select,
    .TWDS_itemsets_options label {
      margin-left:1em;
    }
    .TWDS_showset .TWDS_itemcontainer {
      border-top:1px dotted #888;
      display:flex;
      flex-flow:wrap;
    }
    .TWDS_showset .TWDS_itemcontainer .TWDS_item {
      width:49%;
      border:1px dotted #888;
    }
    .TWDS_showset .TWDS_itemcontainer .inventory_popup {
    }
    .TWDS_showset .TWDS_itemcontainer .inventory_popup .item_set_names,
    .TWDS_showset .TWDS_itemcontainer .inventory_popup .inventory_popup_item_set_names,
    .TWDS_showset .TWDS_itemcontainer .inventory_popup .item_set_names + span
    {
      display:none !important;
    }
    .TWDS_showset .TWDS_itemcontainer .inventory_popup .inventory_popup_item_set_names +br {
      display:none !important;
    }
    .TWDS_showset .TWDS_itemcontainer .inventory_popup_requirement_text {
      margin-top:-3em;
      display:inline-block;
    }
    .TWDS_showset .TWDS_topcontainer {
      display:flex;
      flex-flow:wrap;
    }
    .TWDS_showset .TWDS_topcontainer > * {
      width:49%;
    }
    .TWDS_showset .TWDS_setcontainer br {
      display:none;
    }
    .TWDS_showset .TWDS_topcontainer li {
      list-style-type:none;
    }
    .TWDS_showset_selectors  {
      display:flex;
      justify-content: space-between;
      border-bottom:1px dotted #888;
      padding-bottom:0.25em;
      margin-bottom:0.25em;
    }
    .TWDS_showset .TWDS_item {
      position:relative;
    }
    .TWDS_showset .TWDS_item input[type=checkbox] {
      position:absolute;
      top:2px;
      right: 2px;
      z-index:2;
    }
    body.TWDS_daily_tasks_open .char_links.daily::after {
      content: "\\21da";
      display: block;
      color: red;
      position: relative;
      left: 25px;
      top:2px;
      letter-spacing: -4px;
      font-size: 350%;
      font-weight: bold;
      line-height: 20px;
      text-shadow: #000 1px 1px;
    }
    body.TWDS_quest_finishable #ui_menubar > .questtracker::after {
      content: "\\2794";
      display: block;
      color: orange;
      position: absolute;
      right: 36px;
      top:13px;
      letter-spacing: -4px;
      font-size: 200%;
      font-weight: bold;
      line-height: 20px;
      text-shadow: #000 1px 1px;
    }
    body.TWDS_quest_finishable #windows > .questtracker {
      box-shadow: orange -1px -1px 10px 3px;
    }
    body.TWDS_show_trader_max_value .item_sell .pricing_container .input_max_value {
      display: block;
      border: 1px solid #8a6322;
      margin-bottom: 5px;
      border-radius: 4px;
      background-color: #d6d2cd;
    }
    body.TWDS_searchmode .TWDS_minimap_navcontainer {
      opacity:1.0;
      border:1px solid #0008;
      border-radius:8px;
      background-color:#2228;
      position:fixed;
      left:calc(50% - 39px);
      top:calc(50% - 39px);
    }
    .TWDS_overlay {
      position:fixed;
      z-index:1;
      cursor:move;
      background-Color:#2228;
      border:1px solid white;
      width: max-content;
      height: max-content;
      color:white;
      padding:4px;
      cursor:move,
    }
    .TWDS_overlay:hover {
      outline:2px dashed green;
    }
    .TWDS_overlay table td {
      text-align:right;
    }
    .TWDS_overlay table th {
      font-weight:normal;
      text-align:left;
    }
    .TWDS_overlay table th:nth-child(3) {
      padding-left:0.75em;
    }
    .TWDS_overlay_battledata {
      border-collapse: collapse;
    }
    .TWDS_overlay_battledata td {
      border:1px solid #888;
      padding:1px 2px;
    }
    .TWDS_overlay_battledata td:first-child {
      text-align:left;
      padding-right:0.5em;
    }
    .TWDS_overlay_battledata td:nth-child(2),
    .TWDS_overlay_battledata td:nth-child(4),
    .TWDS_overlay_battledata td:nth-child(6) {
      text-align:left;
    }
    .TWDS_overlay .note {
      border-top:1px dotted #f00;
    }
    .TWDS_overlay .note:hover {
      border-top:1px dotted #f00;
      cursor:text;
    }
    .TWDS_overlay:hover .note:after {
      border-top:1px dotted #888;
      display:block;
      position: absolute;
      content:'✏';
      right: 0em;
      bottom: -0.25em;
      font-size: 2em;
      color:#FFF;
      transform: rotate(45deg);
      cursor:text;
      z-index:2;
    }
    .TWDS_overlay > div {
      margin-top:1.0em;
    }
    .TWDS_overlay > div:first-child {
      margin-top:0.0em;
    }
    .TWDS_trader_filter_collectibles {
      position:absolute;
      right: 15px;
      top:4px;
      accent-color:var(--twds-dark-brown);
    }
    .TWDS_trader_town_shop_search {
      position:absolute;
      right:80px;
      top:4px;
      width:110px;
      accent-color:var(--twds-dark-brown);
    }
    .TWDS_smartstart {
      position:absolute;
      bottom:120px;
      left:10px !important;
      background-color:var(--twds-dark-brown);
      color:white;
      width:80px;
      padding-block:3px;
      text-align:center;
    }
    div.job_durationbar .TWDS_jw_luck {
      top:135px;
      right:16px;
      left:auto;
      width:65px;
      color: rgb(119, 255, 119);
    }
    div.job_durationbar .TWDS_jw_luck::after {
      content: "\\2618";
      display:inline;
      color: rgb(119, 255, 119);
    }
    .TWDS_itemusewindow table {
      border-collapse:collapse;
      border:1px solid #888;
    }
    .TWDS_itemusewindow .header td,
    .TWDS_itemusewindow .header th {
      border-bottom: 3px solid #888;
    }
    .TWDS_itemusewindow th:first-child {
      border-right: 1px solid #888;
    }
    .TWDS_itemusewindow table th,
    .TWDS_itemusewindow table td {
    border-bottom:1px solid #888;
    }
    .TWDS_collections_list dd > span {
      display:inline-block;
    }
    .TWDS_collections_list dd > span > .item {
      float:none;
      display:inline-block;
    }
    .TWDS_collections_list dd > span > b {
      display: inline-flex;
      flex-direction: column;
    }
    .TWDS_shopitemlink {
      display: inline-block;
      cursor: pointer;
      vertical-align: middle;
      margin-right: 2px;
    }
    .TWDS_marketsearchlink {
      display: inline-block;
      cursor: pointer;
      vertical-align: middle;
      margin-right: 2px;
    }
    .TWDS_questgivers_list dt {
      cursor:pointer;
      font-weight:bold;
      margin-top:1em;
    }
    .TWDS_questgivers_list dd {
      padding-left:2em;
      height:20px;
      font-weight:bold;
      border-top:2px solid #eec;
    }
    .TWDS_questgivers_list .TWDS_questlist_questlink {
      cursor:pointer;
      text-decoration:underline;
      padding-right:2em;
    }
    .TWDS_questgivers_list .TWDS_questlist_questlink.finishable {
      color:rgb(102,102,102);
    }
    .TWDS_questgivers_list .TWDS_questlist_questlink::before {
      content: " ";
      position:static;
      margin-left:-1em;
      display:inline-block;
      background: url(https://westen.innogamescdn.com/images/tw2gui/iconset.png?14) no-repeat;
      width: 16px;
      height: 16px;
      background-position: 16px 1000px;
    }
    .TWDS_questgivers_list .TWDS_questlist_questlink.acceptable::before {
      background-position: -48px -64px;
    }
    .TWDS_questgivers_list .TWDS_questlist_questlink.accepted::before {
      background-position: -112px -96px;
    }
    .TWDS_questgivers_list .TWDS_questlist_questlink.finishable::before {
      background-position: -128px -80px;
    }
    .TWDS_questgivers_list .TWDS_questlist_questgrouplink {
      cursor:pointer;
      text-decoration:underline;
    }
    .TWDS_questlist_please_wait {
      font-size:200%;
      color: red;
    }
    .TWDS_questlist_please_wait::before {
      content: "!";
      font-size:250%;
    }
    .TWDS_questlist_please_wait::after {
      content: "!";
      font-size:250%;
    }

    .TWDS_altinv_container table {
      border-collapse: collapse;
    }
    .TWDS_altinv_container td,
    .TWDS_altinv_container th {
      border: 1px solid #888;
      padding:1px;
      vertical-align:middle;
    }
    .TWDS_altinv_container tbody .itemname { 
    }
    .TWDS_altinv_container tbody .used .itemname { 
    }
    .TWDS_altinv_container tbody .setname { 
      font-weight: bold;
    }
    .TWDS_altinv_container tbody .buy,
    .TWDS_altinv_container tbody .sell { 
      font-weight: bold;
    }
    .TWDS_altinv_container tbody .setitemcount,
    .TWDS_altinv_container tbody .count { 
      text-align: right;
    }
    .TWDS_altinv_container tbody .searchword {
      float: right;
      font-weight: normal;
    }
    .TWDS_altinv_container tbody .setname {
      text-decoration: underline;
    }
    .TWDS_altinv_container tbody .setrow .unused {
      color:red;
    }
    .TWDS_altinv_container tbody .itemrow .unused {
      color:red;
    }
    .TWDS_altinv_container tbody .itemrow .used {
      text-decoration: underline;
    }
    .TWDS_minimap_export_pos:hover {
      text-decoration:underline;
    }
    .market-buy .TWDS_storage_missing::before {
      content: '[' attr(data-have) ' / ' attr(data-want) ']';
      padding-inline:2px;
      color: red;
    }
    .market-buy .TWDS_collection_missing::before {
      content: '\\1F3C6';
      width:24px;
      font-size:larger;
      padding-inline:1px;
      color: palegoldenrod;
    }
    .TWDS_craftcalc_inputarea {
      display:flex;
      justify-content:space-around;
    }
    .TWDS_craftcalc_content h1 {
      margin-top:1em;
    }
    .TWDS_craftcalc_content h1:first-child {
      margin-top:0em;
    }
    .TWDS_craftcalc_resultarea {
      border-top:2px solid #888;
      margin-top:1em;
    }
    .TWDS_collections_shoplink {
      cursor:pointer;
    }
    .TWDS_calc_group.attrgroup, 
    .TWDS_calc_group.boostgroup {
      width:50%;
      display:inline-block;
    }
    .TWDS_calc_selectarea .onebonus {
      display:inline-block;
      width:49px;
      padding:2px;
    }
    .TWDS_calc_selectarea .onebonus input {
      width:4em;
    }
    .TWDS_calc_selectarea .onebonus img {
      width:45px;
    }
.tw2gui_window.minimap .TWDS_bonusjob {
  z-index: 7;
  position: absolute;
  display: block;
  width: 6px;
  height: 6px;
  background-color: white;
  border: 1px solid black;
  box-sizing: border-box; }
  .tw2gui_window.minimap .TWDS_bonusjob.gold {
    background-color: yellow;
    border-color: red; }
  .tw2gui_window.minimap .TWDS_bonusjob.storagemissing {
    border-color: #00cc00;
    border-width: 2.2px; }
  .tw2gui_window.minimap .TWDS_bonusjob.hl_always {
    border-color: #880088;
    border-width: 2.2px; }
  .tw2gui_window.minimap .TWDS_bonusjob.tracked {
    border-color: #4983ff;
    border-width: 2.2px; }
  .tw2gui_window.minimap .TWDS_bonusjob.collection {
    border-color: #ff3197;
    border-width: 2.2px; }
  .tw2gui_window.minimap .TWDS_bonusjob.searched {
    border-color: #FF0000;
    border-width: 2.2px; }

.tw2gui_window.minimap #TWDS_minimap_silvergold {
  display: inline-block;
  float: right;
  margin-right: 8px; }
  .tw2gui_window.minimap #TWDS_minimap_silvergold label span {
    display: inline-block;
    min-width: 12px;
    height: 12px;
    background-color: silver;
    border: 1px solid black;
    color: black;
    line-height: 12px;
    text-align: center;
    margin: 1px 2px;
    cursor: pointer; }

.tw2gui_window.minimap .TWDS_minimap_navcontainer {
  position: absolute;
  right: 20px;
  font-size: 200%;
  top: 218px;
  width: 78px;
  height: 78px; }
  .tw2gui_window.minimap .TWDS_minimap_navcontainer span:hover {
    color: white;
    color: green;
    background-color: black; }
  .tw2gui_window.minimap .TWDS_minimap_navcontainer span {
    width: 26px;
    height: 26px;
    line-height: 22px;
    text-align: center;
    position: absolute;
    cursor: pointer; }
  .tw2gui_window.minimap .TWDS_minimap_navcontainer .up {
    top: 0;
    left: 26px;
    cursor: n-resize; }
  .tw2gui_window.minimap .TWDS_minimap_navcontainer .down {
    bottom: 0;
    left: 26px;
    cursor: s-resize; }
  .tw2gui_window.minimap .TWDS_minimap_navcontainer .left {
    left: 0;
    top: 26px;
    cursor: w-resize; }
  .tw2gui_window.minimap .TWDS_minimap_navcontainer .right {
    right: 0;
    top: 26px;
    cursor: e-resize; }
  .tw2gui_window.minimap .TWDS_minimap_navcontainer .TWDS_minimap_opacity_checkbox {
    right: calc(39px - 0.5em);
    top: calc(39px - 0.5em);
    position: absolute; }
  body.TWDS_searchmode .tw2gui_window.minimap .TWDS_minimap_navcontainer {
    opacity: 1.0;
    border: 1px solid #0008;
    border-radius: 8px;
    background-color: #2228;
    position: fixed;
    left: calc(50% - 39px);
    top: calc(50% - 39px); }

body.TWDS_searchmode #user-interface,
body.TWDS_searchmode #windows > * {
  display: none !important; }

body.TWDS_searchmode #windows > .minimap {
  display: block !important;
  width: 0px;
  height: 0px;
  overflow: hidden; }
  `
  const sty = document.createElement('style')
  sty.textContent = css
  sty.id = 'TWDS_style_hack'
  const x = TWDS.q1('#TWDS_style_hack')
  if (x) x.remove()
  document.body.appendChild(sty)
}
TWDS.insertStyles() // no reason to wait with that.
// vim: tabstop=2 shiftwidth=2 expandtab
