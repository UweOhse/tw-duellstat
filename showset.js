// vim: tabstop=2 shiftwidth=2 expandtab

TWDS.showset = {}
TWDS.showset.getcontent=function(win) {
  let key=win._TWDS_key
  let level=parseInt(win._TWDS_level)
	let set=west.storage.ItemSetManager.get(key);
  let subtype=win._TWDS_sub_type; // shot, hand

	let content=TWDS.createEle({
		nodeName:"div",
    className: "TWDS_showset_content",
	});
	let selectors=TWDS.createEle({
    nodeName:"div",
    className: "TWDS_showset_selectors",
    last:content,
  });
	let levelselector=TWDS.createEle({
    nodeName:"select",
    onchange: function() {
      win._TWDS_level=this.value;
      TWDS.showset.reload(win);
    },
    style: {
      display:"block"
    },
    last:selectors
  });
	TWDS.createEle({
    nodeName:"select",
    onchange: function() {
      win._TWDS_sub_type=this.value;
      TWDS.showset.reload(win);
    },
    style: {
      display:"block"
    },
    last:selectors,
    children:[
      {nodeName: "option",value: "shot", selected: subtype==="shot", textContent: TWDS._("SHOTWEAPON","Firearm")},
      {nodeName: "option",value: "hand", selected: subtype!=="shot", textContent: TWDS._("HANDWEAPON","Melee Weapon")},
    ],
  });

  let selopts=[];
  selopts[0]=TWDS._("SHOWSET_SELECT_LEVEL","Select level")
  selopts[100]="100";
  selopts[125]="125";
  selopts[150]="150";
  selopts[250]="250";
  selopts[Character.level]=Character.level;
  for (let i=0;i<=250;i++) {
    let str=selopts[i];
    if (str) {
      let selected=false
      if (i===level)
        selected=true
      levelselector.appendChild(TWDS.createElement({
        nodeName: "option",
        value: i,
        textContent: str,
        selected: selected,
      }));
    }
  }
  let dummyChar=null
  if (level) {
    dummyChar={
      level:level,
    };
  }

	let topcontainer=TWDS.createEle({
		nodeName:"div",
		className:"TWDS_topcontainer",
    last:content,
	});
	let theresult=TWDS.createEle({
		nodeName:"div",
		className:"TWDS_resultcontainer",
    last:topcontainer,
	});
	let theset=TWDS.createEle({
		nodeName:"div",
		className:"TWDS_setcontainer",
    last:topcontainer,
	});


  function fixDescNumber(r) {
    if (r.type==="character") {
       r.desc=r.desc.replace(/([0-9.]+)/,r.bonus.value.toFixed(2))
    }
  }

  let extractor = new west.item.BonusExtractor(dummyChar);
  let extractor1 = new west.item.BonusExtractor({level:1});
  let numitems=0;
  for (let i=0;i<set.items.length; i++) {
    let checkvalue=Math.pow(2,i)
    let item=ItemManager.getByBaseId(set.items[i])
    if (item.type==="right_arm") {
      if (item.sub_type!==subtype)
        continue
    }
    if (win._TWDS_items & checkvalue)
      numitems++;
  }

  let setbonuses = set.getMergedStages(numitems);
  let leveledresult={}
  // 
  setbonuses.sort(function(a, b) {
    let isSomething = function(b, x) {
      return (b.bonus ? b.bonus.type : b.type) === x ? (b.bonus ? b.bonus.name : b.name) : false;
    };
    let aIsAttr = isSomething(a, 'attribute'),
        bIsAddr = isSomething(b, 'attribute'),
        aIsSkill = isSomething(a, 'skill'),
        bIsSkill = isSomething(b, 'skill');
    if (aIsAttr && bIsAddr) {
      return aIsAttr < bIsAddr ? -1 : 1;
    }
    if (aIsAttr) return -1;
    if (bIsAddr) return 1;
    if (aIsSkill && bIsSkill) return 0;
    if (aIsSkill) return -1;
    if (bIsSkill) return 1;
    return 0;
  });
  if (setbonuses !== null && setbonuses.length > 0) {
    TWDS.createEle({ nodeName:"br", last: theset, });
    TWDS.createEle({ nodeName:"br", last: theset, });
    TWDS.createEle({
      nodeName:"div",
      className:"item_set_bonus",
      children:[
        {nodeName: "span",
           className: "text_bold",
           textContent: "Set Bonus: "+numitems,
        },
        { nodeName:"br" },
      ],
      last:theset,
    });
    let ul=TWDS.createEle(
        { nodeName: "ul", 
          className:"inventory_popup_bonus_skills", 
          last: theset,
        });
    for (let i = 0; i < setbonuses.length; i++) {
      fixDescNumber(setbonuses[i]);
      TWDS.createEle({
        nodeName:"li",
        className:"tw_green",
        textContent: extractor.getDesc(setbonuses[i]),
        last:ul,
      });
      let x=extractor.getExportValue(setbonuses[i])
      if (x.key in leveledresult) {
        leveledresult[x.key]+=x.value;
      } else {
        leveledresult[x.key]=x.value;
      }
    }
  }

  content.appendChild(TWDS.createEle({nodeName: "hr"}));
  let ct=TWDS.createEle({nodeName: "div", className:"TWDS_itemcontainer"});
  content.appendChild(ct);

  var result=JSON.parse(JSON.stringify(setbonuses)); // deep clone

  let merge= function(b) {
    let found=false;
    for (let i=0;i<result.length;i++) {
      let r=result[i];
      if (r.type!==b.type) continue;
      if (b.type==="character") {
        if (r.key!==b.key) continue;
        if (r.bonus.type!==b.bonus.type) continue;
        if (r.bonus.name!==b.bonus.name) continue;
        r.bonus.value+=b.bonus.value;
        found=true;
        break;
      }
      if (b.type!==r.type) continue;
      r.value+=b.value;
      found=true;
    }
    if (!found) {
      result.push(JSON.parse(JSON.stringify(b)));
    }
  };

  for (let i=0;i<set.items.length;i++) {
    let item=ItemManager.getByBaseId(set.items[i])
    if (item.type==="right_arm") {
      if (item.sub_type!==subtype)
        continue;
    }
    let p=new ItemPopup(item,{
        character:dummyChar,
    });
    let tmp=TWDS.createEle({
      nodeName: "div",
      className: "TWDS_item",
      innerHTML: p.popup.text
    });

    let checkvalue=Math.pow(2,i)

    TWDS.createEle({
      nodeName: "input",
      type: "checkbox",
      value:checkvalue,
      checked: win._TWDS_items & checkvalue,
      onchange: function(ev) {
        let v=this.value;
        if (this.checked) {
          win._TWDS_items |= v
        } else {
          win._TWDS_items &= ~v
        }
        TWDS.showset.reload(win);
      },
      first:tmp
    });
    ct.appendChild(tmp);
    if (win._TWDS_items & checkvalue) {
      if (item.bonus.item.length) {
        for (let k = 0; k < item.bonus.item.length; k++) {
          let b=item.bonus.item[k];
          if (b.type==="damage" || (b.type==="character" && b.bonus.type==="damage"))
            continue;
          merge(b)
          let x=extractor.getExportValue(b);
          if (x.key in leveledresult) {
            leveledresult[x.key]+=x.value;
          } else {
            leveledresult[x.key]=x.value;
          }
        }
      }
    }
  }

  TWDS.createEle({
    nodeName:"div",
    className:"item_set_bonus",
    children:[
      {nodeName: "span",
         className: "text_bold",
         textContent: "Total Bonus:",
      },
      { nodeName:"br" },
    ],
    last:theresult,
  });

  result.sort(function(a, b) {
    let isSomething = function(b, x) {
      return (b.bonus ? b.bonus.type : b.type) === x ? (b.bonus ? b.bonus.name : b.name) : false;
    };
    let aIsAttr = isSomething(a, 'attribute'),
        bIsAddr = isSomething(b, 'attribute'),
        aIsSkill = isSomething(a, 'skill'),
        bIsSkill = isSomething(b, 'skill');
    if (aIsAttr && bIsAddr) {
      return aIsAttr < bIsAddr ? -1 : 1;
    }
    if (aIsAttr) return -1;
    if (bIsAddr) return 1;
    if (aIsSkill && bIsSkill) return 0;
    if (aIsSkill) return -1;
    if (bIsSkill) return 1;
    return 0;
  });
  if (result !== null && result.length > 0) {
    let ul=TWDS.createEle(
        { nodeName: "ul", 
          className:"inventory_popup_bonus_skills", 
          last: theresult,
        });
    for (let i = 0; i < result.length; i++) {
      let x=extractor.getExportValue(result[i]);
      let output
      if (level===0) {
        fixDescNumber(result[i]);
        output= extractor.getDesc(result[i])
      } else {
        if ("value" in result[i]) {
          result[i].value=leveledresult[x.key];
        } else {
          result[i].bonus.value=leveledresult[x.key];
        }
        output= extractor1.getDesc(result[i]);
      }
      TWDS.createEle({
        nodeName:"li",
        className:"tw_green",
        textContent: output,
        last:ul,
      });
    }
  }
  return content;
}
TWDS.showset.open=function(key) {
	let set=west.storage.ItemSetManager.get(key);
	let wid="TWDS_showset_"+key
	let win=wman.open(wid, "set", "TWDS_showset");
	win.setTitle(set.name);
  if (!win._TWDS_key) {
    win._TWDS_key=key
    win._TWDS_level=Character.level
    win._TWDS_items=65535;
    win._TWDS_sub_type="shot";
  }

  let sp=new west.gui.Scrollpane()
  let content=TWDS.showset.getcontent(win);
  sp.appendContent(content);

	win.appendToContentPane(sp.getMainDiv());
}
TWDS.showset.reload=function(win) {
  let content=TWDS.showset.getcontent(win);
  let old=TWDS.q1(".TWDS_showset_content",win.getMainDiv());
  let sp=old.parentNode;
  sp.innerHTML="";
  sp.appendChild(content);
}

