ALL_SOURCES=prefix.js css.js translation.js readduels.js bonuscalc.js equipment.js people.js main.js
SOURCES=prefix.js css.js de.json translation.js bonuscalc.js equipment.js readduels.js peopletab.js main.js
GLOBALS=--global Game --global TWDS --global Character --global wman --global Bag \
	--global JobList --global CharacterSkills --global west --global Wear \
	--global $$ --global ItemManager --global Ajax --global MessagesWindow \
	--global Premium --global Inventory --global ReportWindow
all: precheck tw-duellstat.user.js

precheck: $(SOURCES)
	for i in $^ ; do standard --fix $(GLOBALS) $$i || exit 1; done
	
tw-duellstat.user.js: $(SOURCES)
	cat $(SOURCES) >$@.t
	npx standard $(GLOBALS) $@.t
	mv $@.t $@
