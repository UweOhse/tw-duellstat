CHECK_SOURCES=start.js utils.js css.js de.json translation.js bonuscalc.js equipment.js \
   readduels.js peopletab.js jobtab.js settingstab.js clothcache.js speedcalc.js \
   gencalc.js storage.js misc.js \
   list_jobdata.js main.js
CHECK_STAMPS=$(CHECK_SOURCES:.js=.stamp)
ALL_SOURCES=prefix.js $(CHECK_SOURCES) postfix.js
VGET=`git describe --tags --long --dirty --always --broken`

GLOBALS=--global Game --global TWDS --global Character --global wman --global Bag \
	--global JobList --global CharacterSkills --global west --global Wear \
	--global $$ --global ItemManager --global Ajax --global MessagesWindow \
	--global Premium --global Inventory --global ReportWindow --global tw2widget \
	--global JobCalculator --global JobWindow --global UserMessage --global JobsModel \
	--global EventHandler --global ItemPopup --global MinimapWindow \
	--global MarketWindow --global CharacterWindow --global Crafting
all: precheck tw-duellstat.user.js

%.stamp: %.js
	@echo standardizing/fixing $^
	@standard --fix $(GLOBALS) $^
	@touch $@
	
precheck: $(CHECK_STAMPS)
	
tw-duellstat.user.js: $(ALL_SOURCES) Makefile
	cat $(ALL_SOURCES) >$@.t
	sed -i s/@REPLACEMYVERSION@/$(VGET)/ $@.t
	mv $@.t $@

version:
	echo $V

set-version:
	git tag -a v'$(V)' -m 'Version $(V)'

help:
	@echo '- version numbering: V=0.0.32 make set-version'
	@echo "- pushing the tags: git push origin --tags"
