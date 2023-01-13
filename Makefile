CHECK_SOURCES=start.js list_jobdata.js utils.js logging.js css.js de.json translation.js bonuscalc.js equipment.js \
      collections.js itemuse.js crafting.js items.js questlist.js \
   readduels.js peopletab.js jobtab.js settingstab.js clothcache.js speedcalc.js market.js itemsettab.js \
   gencalc.js storage.js chat.js injurywarning.js banking.js misc.js minimap.js jobwindow.js quest.js wuw.js \
   updatetab.js fbs.js sleep.js quickusables.js trackbar.js quicksilver.js showset.js overlay.js \
   altinventory.js \
   extras.js main.js
CHECK_STAMPS=$(CHECK_SOURCES:.js=.stamp)
ALL_SOURCES=prefix.js $(CHECK_SOURCES) postfix.js
VGET=`git describe --tags --long --dirty --always --broken`
VERSION:=$(shell git describe --tags --long --dirty --always --broken)
RELEASEFNAME:=$(VGET).user.js
x := foo
y := $(x) bar
x := later

GLOBALS=--global Game --global TWDS --global Character --global wman --global Bag \
	--global JobList --global CharacterSkills --global west --global Wear \
	--global $$ --global ItemManager --global Ajax --global MessagesWindow \
	--global Premium --global Inventory --global ReportWindow --global tw2widget \
	--global JobCalculator --global JobWindow --global UserMessage --global JobsModel \
	--global EventHandler --global ItemPopup --global MinimapWindow \
	--global MarketWindow --global CharacterWindow --global Crafting \
	--global TaskQueue --global GameInject --global jQuery --global Blob --global Quest \
	--global Node --global BankWindow --global CemeteryWindow --global WestUi
all: precheck tw-duellstat.user.js

%.stamp: %.js
	@echo standardizing/fixing $^
	@standard --fix $(GLOBALS) $^
	@touch $@
	
precheck: $(CHECK_STAMPS)
	
tw-duellstat.user.js: $(ALL_SOURCES) Makefile updateinfo.html
	cat $(ALL_SOURCES) \
	| awk '/@REPLACEUPDATEINFO@/{file="updateinfo.html";while ((getline<file) > 0) {print} next} {print}' \
		>$@.t
	sed -i s/@REPLACEMYVERSION@/$(VGET)/ $@.t
	mv $@.t $@

version:
	echo $V

set-version:
	git tag -a v'$(V)' -m 'Version $(V)'
	rm -f tw-duellstat.user.js

show-version:
	@echo git describes it as:
	@echo $(VERSION) 
	@echo updateinfo.html describes it as:
	@grep "<dt>" updateinfo.html |head -1

release: all
	@cp tw-duellstat.user.js ../release
	@cp tw-duellstat.user.js ../release/$(RELEASEFNAME)
	@cp updateinfo.html ../

releasecheck:
	echo $x -- $y
	grep -w $(VERSION) updateinfo.html || echo "Version not in updateinfo (kann vor Release ok sein)!"
push:
	git push origin --tags
	git push
		
help:
	@echo '- commit any open things'
	@echo '- version numbering: V=0.45 make set-version'
	@echo "- pushing: make push"
	@echo "- release: "
	@echo "  * make"
	@echo "  * load it into a browser"
	@echo "  * set version number (see above)"
	@echo "  * make"
	@echo "  * check the file header"
	@echo "  * load it into a browser"
	@echo "  * make release"
