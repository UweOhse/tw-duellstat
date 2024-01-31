// vim: tabstop=2 shiftwidth=2 expandtab
//
TWDS.playerlistwindow={}
TWDS.playerlistwindow.output=function(players) {
  console.log("players",players);
  let ba={}
  let bt={}
  for (let i=0;i<players.length;i++) {
    let p=players[i]
    let t=p.town_id || 0
    let T=p.town_name
    let a=p.alliance_id || 0;
    let l=p.level;
    let c=p.class;
    if (!(a in ba)) {
      ba[a]={
        id:a,
        players: 0,
        levels: 0,
        duelist: 0,
        worker: 0,
        soldier: 0,
        adventurer: 0,
        greenhorn: 0,
      };
    }
    if (!(t in bt)) {
      bt[t]={
        id:t,
        town_name: T,
        alliance_id: a,
        players: 0,
        levels: 0,
        duelist: 0,
        worker: 0,
        soldier: 0,
        adventurer: 0,
        greenhorn: 0,
      };
    }
    ba[a].players++
    ba[a].levels+=l
    ba[a][c]++
    bt[t].players++
    bt[t].levels+=l
    bt[t][c]++
  }
  console.log(ba);
  console.log(bt);

  let tab=TWDS.createEle("table");
  let thead=TWDS.createEle("thead",{last:tab});
  let tr=TWDS.createEle("tr.alliance",{last:thead});
  TWDS.createEle("td",{ last:tr, textContent: TWDS._("C_TOWN","town"), });
  TWDS.createEle("td",{ last:tr, textContent: TWDS._("C_ALLIANCE","alliance"), });
  TWDS.createEle("td",{ last:tr, textContent: TWDS._("C_PLAYERS","players"), });
  TWDS.createEle("td",{ last:tr, textContent: TWDS._("PLAYERLISTWINDOW_AVG_LV","avg. lv"), });
  TWDS.createEle("td",{ last:tr, textContent: Game.InfoHandler.getLocalString4Charclass("adventurer"), });
  TWDS.createEle("td",{ last:tr, textContent: Game.InfoHandler.getLocalString4Charclass("duelist"), });
  TWDS.createEle("td",{ last:tr, textContent: Game.InfoHandler.getLocalString4Charclass("soldier"), });
  TWDS.createEle("td",{ last:tr, textContent: Game.InfoHandler.getLocalString4Charclass("worker"), });
  TWDS.createEle("td",{ last:tr, textContent: Game.InfoHandler.getLocalString4Charclass("greenhorn"), });

  let tbody=TWDS.createEle("tbody",{last:tab});
  let delay=100
  for (let a of Object.values(ba)) {
    let tr=TWDS.createEle("tr.allianceline",{last:tbody});
    TWDS.createEle("td",{
      last:tr, 
      textContent: a.id ? TWDS._("C_ALL","all") : TWDS._("PLAYERLISTWINDOW_ANY","any / no town"),
      style:{color:"red"}});
    TWDS.createEle("td.name.alliance_"+a.id,{
      last:tr,
      textContent: a.id,
      dataset: { alliance_id: a.id},
    });
    TWDS.createEle("td.players",{
      last:tr,
      textContent: a.players,
    });
    TWDS.createEle("td.level",{
      last:tr,
      textContent: (a.levels/a.players).toFixed(1),
    });
    TWDS.createEle("td.adventurer",{ last:tr, textContent: a.adventurer, });
    TWDS.createEle("td.duelist",{ last:tr, textContent: a.duelist, });
    TWDS.createEle("td.soldier",{ last:tr, textContent: a.soldier, });
    TWDS.createEle("td.worker",{ last:tr, textContent: a.worker, });
    TWDS.createEle("td.greenhorn",{ last:tr, textContent: a.greenhorn, });
  }
  let adone={}
  let firsttownline=true
  for (let t of Object.values(bt)) {
    let tr=TWDS.createEle("tr.townline"+(firsttownline ? ".first" : ""),{last:tbody});
    firsttownline=false
    let td=TWDS.createEle("td.name.town_"+t.id,{
      last:tr,
      textContent: t.town_name
    });
    if (t.id===0) {
      td.textContent=TWDS._("PLAYERLISTWINDOW_NOTOWN","no town");
      td.style.color="red";
    }
    TWDS.createEle("td.alliance.alliance_"+t.alliance_id,{
      last:tr,
      textContent: t.alliance_id,
      dataset: { alliance_id: t.alliance_id},
    });
    TWDS.createEle("td.players",{
      last:tr,
      textContent: t.players,
    });
    TWDS.createEle("td.level",{
      last:tr,
      textContent: (t.levels/t.players).toFixed(1),
    });
    TWDS.createEle("td.adventurer",{ last:tr, textContent: t.adventurer, });
    TWDS.createEle("td.duelist",{ last:tr, textContent: t.duelist, });
    TWDS.createEle("td.soldier",{ last:tr, textContent: t.soldier, });
    TWDS.createEle("td.worker",{ last:tr, textContent: t.worker, });
    TWDS.createEle("td.greenhorn",{ last:tr, textContent: t.greenhorn, });
    let a=t.alliance_id
    if (!(a in adone)) {
      adone[a]=1
      if (a) {
        setTimeout(function () {
          Ajax.remoteCallMode('alliance', 'get_data', {
            alliance_id: a
          }, function (r) {
            console.log("AGD",a,r);
            if (r.error === false && r.data && r.data.allianceName) {
              TWDS.q(".alliance_"+a,tab).forEach(function(ele) {
                ele.textContent = r.data.allianceName
              })
            }
          })
        }, delay)
        delay += 350
      }
    }
  }
  TWDS.q(".alliance_0",tab).forEach(function(ele) {
    ele.textContent = TWDS._("PLAYERLISTWINDOW_NOALLIANCE","no alliance");
    ele.style.color="red";
  })

  let wid="TWDS_playerliststat"
  win = wman.open(wid, 'playerliststat')
  win.setTitle(TWDS._('PLAYERLISTWINDOW_STAT_TITLE', 'Summary of players at this location'))
  const sp = new west.gui.Scrollpane()
  sp.appendContent(tab)
  win.appendToContentPane(sp.getMainDiv())

}
TWDS.playerlistwindow.doit=function(page,players) {
  Ajax.remoteCallMode('players', 'get_data', {
    x: PlayerlistWindow.x,
    y: PlayerlistWindow.y,
    sortby: PlayerlistWindow.sort,
    page: page,
  }, function(json) {
    if (json.error) return new UserMessage(json.error, UserMessage.TYPE_ERROR).show();
    console.log("json",json);
    for (let i=0;i<json.players.length;i++) {
      players.push(json.players[i]);
    }
    page++
    if (page<json.pages) {
      TWDS.playerlistwindow.doit(page,players);
      return;
    }
    TWDS.playerlistwindow.output(players);
    // PlayerlistWindow.updateData(json);
    
  }, PlayerlistWindow);

}
TWDS.playerlistwindow.open=function() {
  console.log("test",this,arguments);
  window.PlayerlistWindow.TWDS_backup_open.apply(this,arguments);
  let dom=this.DOM[0]
  let tbar=TWDS.q1(".tw2gui_inner_window_title",dom);
  console.log("tbar",tbar);
  let that=this
  TWDS.createEle("div.TWDS_playerlistwindow_extra.linklike",{
    last:tbar,
    textContent:TWDS._("PLAYERLISTWINDOW_SUMMARY","Summary"),
    style:{
      position:"absolute",
      right:"8px",
      top:"35px",
      padding:"2px",
      border:"1px solid #888",
      borderRadius:"8px",
      backgroundColor: "#400",
      color:"white",
    },
    onclick:function() {
      console.log("that",that);
      TWDS.playerlistwindow.doit(0,[]);
    }
  });
}
TWDS.playerlistwindow.startfunc=function() {
  window.PlayerlistWindow.TWDS_backup_open=window.PlayerlistWindow.TWDS_backup_open || window.PlayerlistWindow.open
  window.PlayerlistWindow.open=TWDS.playerlistwindow.open
}

TWDS.registerStartFunc(TWDS.playerlistwindow.startfunc);

