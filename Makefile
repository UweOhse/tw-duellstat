CHECK_SOURCES=start.js css.js de.json translation.js bonuscalc.js equipment.js readduels.js peopletab.js main.js
ALL_SOURCES=prefix.js $(CHECK_SOURCES) postfix.js

GLOBALS=--global Game --global TWDS --global Character --global wman --global Bag \
	--global JobList --global CharacterSkills --global west --global Wear \
	--global $$ --global ItemManager --global Ajax --global MessagesWindow \
	--global Premium --global Inventory --global ReportWindow
all: precheck tw-duellstat.user.js

precheck: $(CHECK_SOURCES)
	for i in $^ ; do standard --fix $(GLOBALS) $$i || exit 1; done
	
tw-duellstat.user.js: $(ALL_SOURCES)
	cat $(ALL_SOURCES) >$@.t
	#standard $(GLOBALS) $@.t
	mv $@.t $@
