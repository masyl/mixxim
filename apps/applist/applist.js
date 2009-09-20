(function(){

var applist = {};

applist.meta = {
	"title": "Applist",
	"author": "Masyl",	
	"home": "http://somewebaddress.com/mix-api/applist",	
	"description": "Browse your list of applications",
	"cssprefix": "masyl-applist",
};

applist.init = function(environ) {
}

applist.run = function(atomixapi, data, frameId, frameElem) {
	console.debug("run", arguments);
	var runHome = function(atomixapi, data, frameElem) {
		console.log("Running home frame...");
		jQuery(frameElem).empty().append(atomixapi.getView("applist-frame-home"));
		return true;
	}

	var runList = function(atomixapi, data, frameElem) {
		console.log("Running list frame...");
		jQuery(frameElem).empty().append(atomixapi.getView("applist-frame-list"));
		for (i in data) {
			var item = data[i];
			jQuery(".applist-list", frameElem).append("<li><a href='#'><div class='applist-icon'><img src='" + item.base + item.data.icon + "'/></div><span>" + item.data.title + "</span></a></li>");
		}
		return true;
	}

	var runView = function(atomixapi, data, frameElem) {
		console.log("Running view frame...");
		jQuery(frameElem).empty().append(atomixapi.getView("applist-frame-view"));
		return true;
	}

	var runAbout = function(atomixapi, data, frameElem) {
		console.log("Running about frame...");
		jQuery(frameElem).empty().append(atomixapi.getView("applist-frame-about"));
		return true;
	}

	if (frameId == "home") runHome(atomixapi, data, frameElem)
	else if (frameId == "list") runList(atomixapi, data, frameElem)
	else if (frameId == "view") runView(atomixapi, data, frameElem)
	else if (frameId == "about") runAbout(atomixapi, data, frameElem)
	else {
		console.log("Frame not found...");
	}
	return false;
}

applist.close = function() {
	
}

console.log("registering applist");
atomixapi.apps.register(applist);

})()
