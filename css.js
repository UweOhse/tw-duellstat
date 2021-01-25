TWDS.insertStyles = function () {
  const css = `
    .TWDS_VERSIONINFO {
      color: #333;
      text-align: right;
      padding: 0 2px 5px 0;
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
    #TWDB_job p {
       text-align:right;
    }
    #TWDS_jobs {
      margin-bottom:1em;
      border-collapse: collapse
    }
    #TWDS_jobs tr, #TWDS_jobs td, #TWDS_jobs th { border:1px solid #888;}
    #TWDS_jobs td { text-align:right;}
    #TWDS_jobs td[data-field=name] { text-align:left; padding:1px 2px; }
    #TWDS_jobs th[data-field=danger] { color: red}
    #TWDS_jobs th[data-field=luck] { color: green}

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
      top:-5px
    }
    .job_bestwearbutton .twdb_bestwear {
      position:absolute;
      top:0;
    }
    .job_bestwearbutton .TWDS_getbestwear {
      position:absolute;
      top:0;
      position: absolute;
      top: 40px;
      left: 48px;
      background-color:#444;
      color:white;
      border-color:888;
    }
  `
  const sty = document.createElement('style')
  sty.textContent = css
  document.body.appendChild(sty)
}
TWDS.insertStyles() // no reason to wait with that.
