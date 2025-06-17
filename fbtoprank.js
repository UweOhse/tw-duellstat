// vim: tabstop=2 shiftwidth=2 expandtab
TWDS.fbtoprank = {}
TWDS.fbtoprank.cache = {}

TWDS.fbtoprank.tabclick = function(win,id) {
  win.activateTab(id)
  console.log("tab",win,id);
  let tables=TWDS.q("table.fbtoprank",win.divMain);
  for (let i=0;i<tables.length;i++)
    tables[i].style.display="none";
  let t=TWDS.q1("table.fbtoprank."+id,win.divMain);
  t.style.display="block";
}

TWDS.fbtoprank.finish = function (win, battles, players, towns) {

  const container = TWDS.utils.getcontainer(win)

  let playerarray=[]
  for (let [i,p] of Object.entries(players)) {
    let p=players[i]
    let f=1
    if (p.charclass===0) // advent
      f=1.75;
    let v=p.totalcauseddamage/200 + (p.takenhits + p.dodgecount)*f
    if (p.totalcauseddamage/200 >= v/2) {
      p.isdamager=true
    } else {
      p.isdamager=false
    }
    // console.log(p.name,v,p.totalcauseddamage/200,p.isdamager);
    players[i].points=v
    playerarray.push(players[i]);
  }
  playerarray.sort(function(a,b) {
    return b.points-a.points;
  })
  let townarray=[]
  for (let [i,p] of Object.entries(towns)) {
    let p=towns[i]
    let f=1
    let v=p.totalcauseddamage/200 + (p.takenhits + p.dodgecount)*f
    towns[i].points=v
    townarray.push(towns[i]);
  }
  townarray.sort(function(a,b) {
    return b.points-a.points;
  })
  console.log("TA",townarray);
  let classes= ['greenhorn', 'adventurer', 'duelist', 'worker', 'soldier']

  let onetab=function(mode, ar) {
  console.log("tab",mode,ar);
    let table=TWDS.q1("table.fbtoprank."+mode);
    table.innerHTML=""
    let thead=TWDS.createEle("thead",{last: table});
    let tbody=TWDS.createEle("tbody",{last: table});
    let tr=TWDS.createEle("tr",{last: thead});
      TWDS.createEle("th",{last: tr, textContent: "#"});
      TWDS.createEle("th",{last: tr, textContent: "name"});
      if (mode!=="town") {
        TWDS.createEle("th",{last: tr, textContent: "town"});
      }
      TWDS.createEle("th",{last: tr, textContent: "points"});
      TWDS.createEle("th",{last: tr, textContent: "dmg"});
      TWDS.createEle("th",{last: tr, textContent: "hitten"});
      TWDS.createEle("th",{last: tr, textContent: "dodged"});
      TWDS.createEle("th",{last: tr, textContent: "ghosts"});
      TWDS.createEle("th",{last: tr, textContent: "killed"});
      if (mode!=="town") {
        TWDS.createEle("th",{last: tr, textContent: "battles"});
      } else {
        TWDS.createEle("th",{last: tr, textContent: "playerbattles"});
      }
      if (mode!=="town") {
        TWDS.createEle("th",{last: tr, textContent: "class"});
      }
    let num=0
    for (let i=0;i<ar.length;i++) {
      let p=ar[i];
      let doit=mode==="all"
      if (mode==="town") doit=true
      if (mode==="tank" && p.isdamager===false) doit=true
      if (mode==="dmg" && p.isdamager===true) doit=true
      if (mode==="greenhorn" && p.charclass===-1) doit=true
      if (mode==="adventurer" && p.charclass===0) doit=true
      if (mode==="duelist" && p.charclass===1) doit=true
      if (mode==="worker" && p.charclass===2) doit=true
      if (mode==="soldier" && p.charclass===3) doit=true
      if (!doit) continue;

      num++

      let tr=TWDS.createEle("tr",{last: tbody});
      let td;
      TWDS.createEle("td.place",{last: tr, textContent: num});
      TWDS.createEle("td.name",{last: tr, textContent: p.name});
      if (mode!=="town") {
        let t=towns[p.townid];
        if (t) {
          t=t.name
        } else {
          t=p.townid
          // console.log("didn't find",p.townid,"in", towns);
        }
        TWDS.createEle("td.town",{last: tr, textContent: t});
      }
      TWDS.createEle("td.points",{last: tr, textContent: p.points.toFixed(1)});
      TWDS.createEle("td.dmg",{last: tr, textContent: p.totalcauseddamage});
      TWDS.createEle("td.taken",{last: tr, textContent: p.takenhits});
      TWDS.createEle("td.dodged",{last: tr, textContent: p.dodgecount});
      TWDS.createEle("td.ghosts",{last: tr, textContent: p.playdeadcount});
      TWDS.createEle("td.kills",{last: tr, textContent: p.kills});
      TWDS.createEle("td.battles",{last: tr, textContent: p.battles});
      if (mode!=="town") {
        let s=""
        let c=p.charclass+1
        if (c>=0 && c<classes.length)
          s=classes[c]
        TWDS.createEle("td.class",{last: tr, textContent: Game.InfoHandler.getLocalString4Charclass(s)});
      }
    }
  }
  onetab("all",playerarray);
  onetab("tank",playerarray);
  onetab("dmg",playerarray);
  onetab("town",townarray);
  onetab("soldier",playerarray);
  onetab("adventurer",playerarray);
  onetab("greenhorn",playerarray);
  onetab("duelist",playerarray);
  onetab("worker",playerarray);
  console.log("ST");
  win.setTitle("Current fortbattle ranking, "+battles+" battles")
  console.log("TC");
  TWDS.fbtoprank.tabclick(win,"all");
}
TWDS.fbtoprank.get_battle=async function(battleid, n) {
  let to=100;
  if (n%20===0 && n) to+=1500;
  return new Promise(function (resolve, reject) {
    setTimeout(function() {
      Ajax.remoteCallMode('fort_battleresultpage', 'get_battle', {battle_id: battleid}, function (data) {
        if (data.error) reject(new Error("battle #"+battleid+": "+data.error));
        if (!data.stats) reject(new Error("battle #"+battleid+": no data.stats"));
        TWDS.fbtoprank.cache[battleid]=data
        resolve(data);
      });
    }, to);
  });
}
TWDS.fbtoprank.updatebattle=function(stats) {
  let bd={}
  let up1=function(stats) {
    for (let i=0;i<stats.length;i++) {
      let pl=stats[i]
      let s={
        c: pl.charclass,
        d: pl.dodgecount,
        t: pl.takenhits,
        h: pl.hitcount,
        g: pl.playdeadcount,
        n: pl.name,
      };
      bd[pl.name]=s
    }
  }
  console.log("U",stats);
  up1(stats.result.attackerlist);
  up1(stats.result.defenderlist);
  TWDS.fbtoprank.cache[stats.battleresult_id]={
    p: bd,
    t: stats.result_date
  }
}
TWDS.fbtoprank.key_battlecache="TWDS_FBTOPRANK_BATTLECACHE";
TWDS.fbtoprank.loadcache=function() {
  if (TWDS.fbtoprank.key_battlecache in localStorage) {
    return JSON.parse(localStorage[TWDS.fbtoprank.key_battlecache]);
  }
  return {};
}
TWDS.fbtoprank.savecache=function() {
  localStorage[TWDS.fbtoprank.key_battlecache]=JSON.stringify(TWDS.fbtoprank.cache);
}
TWDS.fbtoprank.update=function(offset) {
  offset = offset || 0
  let n=offset
  TWDS.fbtoprank.loadcache();
  
  Ajax.remoteCall('fort_overview', '', {offset: offset}, async function (data) {
    if (!data.page) return;
    let div=TWDS.createEle("div");
    div.innerHTML=data.page
    let rows=TWDS.q("#lastbattle .graveyardtable tbody tr",div);
    if (!rows) return;
    let row=rows[1];
    if (row.children.length!==7) {
      console.log("parse error, not 7 elements, but",rows.children.length);
      return;
    }
    let stop=0;
    for (let i=1;i<rows.length;i++) {
      let row=rows[i];
      if (row.children.length===1) continue; // divider line
      if (row.children.length!==7) {
        console.log("parse error, not 7 elements, but",rows, i, row);
        stop=1
        continue;
      }
      let a=TWDS.q1("a",row.children[1]);
      let b=a.href.replace("javascript:CemeteryWindow.open(","").replace(");","").split(",")
      let id=parseInt(b[1])
      if (TWDS.fbtoprank.cache[id]) {
        console.log("already got",id);
        stop=1
        break;
      }
      console.log("need to get",id);
      await TWDS.fbtoprank.get_battle(id, n++).then(function(data) {
        console.log("data id",data.stats.battleresult_id,data);
        TWDS.fbtoprank.updatebattle(data.stats);
      }).catch(function(err) {
        console.log("err",err);
      });
      stop=1;
      break;
    }
    console.log("n",n,offset);
    if (!stop)
      TWDS.fbtoprank.update(n);
  })
  TWDS.fbtoprank.savecache();
}

TWDS.fbtoprank.reportworker = function (win, cfg, battleid, players, towns) {
  let addtown=function(d) {
    let id=d.townid
    if (!(id in towns)) {
      towns[id]={}
      towns[id].id=d.townid
      towns[id].name=d.townname
      towns[id].dodgecount=0
      towns[id].takenhits=0
      towns[id].takendamage=0
      towns[id].playdeadcount=0
      towns[id].onlinecount=0
      towns[id].hitcount=0
      towns[id].misscount=0
      towns[id].totalcauseddamage=0
      towns[id].battles=0
      towns[id].kills=0
    }
  }
  let addplayer=function(d) {
    addtown(d);
    let id=d.westid
    if (!(id in players)) {
      players[id]={}
      players[id].id=d.westid
      players[id].name=d.name
      players[id].charclass=d.charclass
      players[id].townid=d.townid
      players[id].dodgecount=0
      players[id].takenhits=0
      players[id].takendamage=0
      players[id].playdeadcount=0
      players[id].onlinecount=0
      players[id].hitcount=0
      players[id].misscount=0
      players[id].totalcauseddamage=0
      players[id].battles=0
      players[id].kills=0
    }
  }
  let adddata=function(d) {
    let id=d.westid
    let t=d.townid
    players[id].dodgecount+=d.dodgecount
    players[id].takenhits+=d.takenhits
    players[id].takendamage+=d.takendamage
    players[id].playdeadcount+=d.playdeadcount
    players[id].onlinecount+=d.onlinecount
    players[id].hitcount+=d.hitcount
    players[id].misscount+=d.misscount
    players[id].totalcauseddamage+=d.totalcauseddamage
    players[id].battles++
    if (d.killedby>0) {
      players[d.killedby].kills++
    }
    towns[t].dodgecount+=d.dodgecount
    towns[t].takenhits+=d.takenhits
    towns[t].takendamage+=d.takendamage
    towns[t].playdeadcount+=d.playdeadcount
    towns[t].onlinecount+=d.onlinecount
    towns[t].hitcount+=d.hitcount
    towns[t].misscount+=d.misscount
    towns[t].totalcauseddamage+=d.totalcauseddamage
    towns[t].battles++
    if (d.killedby>0) {
      let t2=players[d.killedby].townid
      towns[t2].kills++
    }
  }
  let doit=function(cfg, data) {
    let ts=data.stats.result_date
    let ignore=true;
    let stop=false;
    if (cfg.mode==="year") {
      let d=new Date(ts*1000);
      if (d.getYear()+1900===cfg.y) {
        ignore=false
      } else if (cfg.donebattles) {
        stop=true;
      }
    }
    if (cfg.mode==="month") {
      let d=new Date(ts*1000);
      if (d.getYear()+1900===cfg.y && d.getMonth()+1===cfg.m)  {
        ignore=false
      } else if (cfg.donebattles) {
        stop=true;
      }
    }
/*
    if (cfg.mode==="days") {
      let ts=data.stats.result_date
      let now=(new Date().getTime())/1000
      let stich=now-cfg.want*86400
      if (ts>=stich)
        ignore=true
      console.log("daymode",cfg.want,ts,now,stich,doimport);
    }
*/
    if (!ignore) {
      cfg.donebattles++
      let res=data.stats.result
      for (let i=0;i<res.attackerlist.length;i++) {
        addplayer(res.attackerlist[i])
      }
      for (let i=0;i<res.defenderlist.length;i++) {
        addplayer(res.defenderlist[i])
      }
      for (let i=0;i<res.attackerlist.length;i++) {
        adddata(res.attackerlist[i]);
      }
      for (let i=0;i<res.defenderlist.length;i++) {
        adddata(res.defenderlist[i])
      }
      /*
      let K={}
      for (let i=0;i<res.logtypes.length;i++) {
        K[res.logtypes[i]]=i
      }
      let currchar=0
      let shotat=0
      let round=0
      for (let i=0;i<res.log.length-1;i+=2) {
        let tag=res.log[i]
        let target=res.log[i+1]
        if (tag===K.ROUNDSTART) {
          console.log("round",target);
          round=target
          continue;
        }
        if (tag===K.CHARTURN) {
          currchar=target
        }
        if (tag===K.SHOOTAT) {
          shotat=target
        }
        if (tag===K.KILLED) {
          console.log(currchar,"killed",shotat,"with",target);
        }
      }
      */
    }

    if (!stop) {
      TWDS.fbtoprank.reportworker(win, cfg, battleid-1, players, towns);
    } else {
      TWDS.fbtoprank.finish(win, cfg.donebattles,players, towns);
    }
  }
  if (TWDS.fbtoprank.cache[battleid]) {
    let cached=TWDS.fbtoprank.cache[battleid]
    doit(cfg, cached)
    return;
  }
  Ajax.remoteCallMode('fort_battleresultpage', 'get_battle', {battle_id: battleid}, function (data) {
    console.log("data",data);
    if (data.error) return;
    if (!data.stats) return;
    TWDS.fbtoprank.cache[battleid]=data
    doit(cfg, data);
  });

}

TWDS.fbtoprank.start = function (win,cfg) {
  // get the current battle id
  Ajax.remoteCall('fort_overview', '', {offset: 0}, function (data) {
    if (!data.page) return;
    let div=TWDS.createEle("div");
    div.innerHTML=data.page
    let rows=TWDS.q("#lastbattle .graveyardtable tbody tr",div);
    if (!rows) return;
    let row=rows[1];
    if (row.children.length!==7) {
      console.log("parse error, not 7 elements, but",rows.children.length);
      return;
    }
    let a=TWDS.q1("a",row.children[1]);
    let b=a.href.replace("javascript:CemeteryWindow.open(","").replace(");","").split(",")
    id=parseInt(b[1])

    TWDS.fbtoprank.reportworker(win,cfg, id, {}, {});
  })
}
TWDS.fbtoprank.openwindow=function() {
  let modes=["all","tank","dmg","town","adventurer","duelist","worker","soldier","greenhorn"];
  let win=TWDS.utils.stdwindow("TWDS_fbtoprank", "Current fort battle ranking", "FB Ranking")
  let x=TWDS.q1("._tab_id_all",win.divMain)
  if (!x) {
    win.addTab('all', 'all', TWDS.fbtoprank.tabclick)
    win.addTab('tanks', 'tank', TWDS.fbtoprank.tabclick)
    win.addTab('damagers', 'dmg', TWDS.fbtoprank.tabclick)
    win.addTab('towns', 'town', TWDS.fbtoprank.tabclick)
    win.addTab('adventurers', 'adventurer', TWDS.fbtoprank.tabclick)
    win.addTab('duelists', 'duelist', TWDS.fbtoprank.tabclick)
    win.addTab('workers', 'worker', TWDS.fbtoprank.tabclick)
    win.addTab('soldiers', 'soldier', TWDS.fbtoprank.tabclick)
    win.addTab('greenhorns', 'greenhorn', TWDS.fbtoprank.tabclick)
  }
  const container = TWDS.utils.getcontainer(win)
  container.innerHTML = ''
  let p=TWDS.createEle("p.config", {
    last:container
  })
  let changehandler=function(ele) {
    console.log("CH",ele);
    let battlesele=TWDS.q1("input",p);
    let modeele=TWDS.q1("select",p);
    let battles=parseInt(battlesele.value);
    let mode=modeele.value;
    for (let i=0;i<modes.length;i++) {
      let ele=TWDS.q1("table.fbtoprank."+modes[i],container);
      if (ele) {
        ele.style.display="none"
      }
    }
    if (battles<1) {
      return;
    }
    let cfg={
      donebattles: 0,
      want: battles,
      mode: mode
    }
    TWDS.fbtoprank.start(win,cfg);
  }
  let mode=TWDS.createEle("select", {
    last:p,
    onchange:function(ev) {
      console.log("modechange",ev);
      let ele=this;
      let cfg={
        donebattles: 0,
        want: 0,
        mode: ele.value,
        y: -1,
        m: -1,
      }
      console.log("ele",ele,ele.value);
      if (ele.value.match(/-/)) {
        cfg.y=parseInt(ele.value);
        cfg.m=parseInt(ele.value.split(/-/)[1]);
        cfg.mode="month";
        console.log("ele.t",ele.textContent);
        TWDS.fbtoprank.start(win,cfg);
      } else if (ele.value.match(/\d+/)) {
        cfg.mode="year";
        cfg.y=parseInt(ele.value);
        TWDS.fbtoprank.start(win,cfg);
      }
      return;
    },
    children:[
      {nodeName:"option",value: "---", textContent: "select mode", selected:true},
    ]
  });
  let y=new Date().getYear()+1900
  let m=new Date().getMonth()+1
  TWDS.createEle({nodeName:"option",value: y, textContent: y, selected: false, last: mode});
  TWDS.createEle({nodeName:"option",value: y-1, textContent: y-1, selected: false, last: mode});
  let n=0;
  while (n<12) {
    let s=y+"-"+m;
    TWDS.createEle({nodeName:"option",value: s, textContent: s, selected: false, last: mode});
    m--;
    if (m==0) { y--; m=12; }
    n++;
  }
  for (let i=0;i<modes.length;i++) {
    TWDS.createEle("table.fbtoprank."+modes[i],{last: container, style: { display: "none"}});
  }

  return win;
}

// vim: tabstop=2 shiftwidth=2 expandtab
