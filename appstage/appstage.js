/*
---------------------------------------------------------
Mix-api
---------------------------------------------------------
*/

/* THE FOLLLOWING GLOBAL VAR SHOULD BE RENDERED USELESS BY BETTER MODELING */
var baseURL = "";
var appURL = "";


(function(window){
	
	var AtomixAPI = function() {
		var atomixapi = this;
	};
	
	AtomixAPI.prototype.getView = function(id) {
		var elem = jQuery("#" + id).clone()[0];
		return elem;
	}

	AtomixAPI.prototype.apps = {
		register: function(newApp) {
			/* CURRENTLY SUPPORT ONLY ONE APP AT A TIME */
			console.info("Registering new app", newApp.meta.title, newApp);
			this.app = newApp;
		},
		run: function(frame, data) {
			jQuery(".appstage-frame").hide();
			var currentFrame = jQuery(".appstage-appframe");
			currentFrame.show();
			console.info("Running app:", this, data, frame, currentFrame[0]);
			this.app.run(atomixapi, data, frame, currentFrame[0]);
		},
		app: null
	};
	
	
	// Expose jQuery to the global object
	window.atomixapi = new AtomixAPI();

})(window);


/*
---------------------------------------------------------
Appstage
---------------------------------------------------------
*/


Appstage = function(atomixapi, appItem) {
	this.atomixapi = atomixapi;
	this.appItem = appItem;
};

Appstage.prototype.init = function() {
	console.log("Init appstage");

	var appItem = this.appItem;
	var appData = appItem.data;

	jQuery("#appstage-title").html(appData.title);
	jQuery("#appstage-description").html(appData.summary);

	var mainScript = null;
	var resources = appData.resources;
	for (var i in resources) {
		var resource = resources[i];
		console.log("resource", resource);
		switch (resource.rel) {
			case "script":
				if (resource.type=="application/ecmascript") mainScript = resource.src;
				break;
			case "markup":
				loadMarkup(resource.src, resource.type); break;
			case "stylesheet":
				loadStylesheet(resource.src, resource.type); break;
			case "icon":
				loadIcon(resource.src, resource.type); break;
			case "cache":
				loadCache(resource.src, resource.type); break;
			default: {
				console.log("Resource rel attribute not supported!");
			}
		}		
	}

	var onAppScriptLoaded = this.onAppScriptLoaded;
	var atomixapi = this.atomixapi;
	if (mainScript) {
		console.debug("atomixapi", atomixapi);
		console.info("Loading script:", baseURL + mainScript);
		jQuery.getScript(baseURL + mainScript, function(){onAppScriptLoaded(atomixapi)} );
	} else {
		console.error("No main script found!");
	}

};

function loadMarkup(src, type) {
	console.log(jQuery("#appstage-markup")[0]);
	jQuery("#appstage-markup").load(baseURL + src);
}

function loadStylesheet(src, type) {
	var head = document.getElementsByTagName('head')[0];
	$(document.createElement('link'))
		.attr({type: type, href: baseURL + src, rel: 'stylesheet', media:'screen'})
		.appendTo(head); 

}

function loadIcon(src, type) {
	
}

function loadCache(src, type) {
	
}


Appstage.prototype.onAppScriptLoaded = function(e) {

	console.log("onAppScriptLoaded");
	tryLinks = jQuery("#appstage-try-links");

	var atomixapi = this.atomixapi;

	lnkHome = jQuery("<li><a href='#'>App home</a></li>");
	jQuery("a", lnkHome).click(function(e){ e.preventDefault(); atomixapi.apps.run("home", {}) });

	lnkList = jQuery("<li><a href='#'>List items</a></li>");
	jQuery("a", lnkList).click(function(e){
		e.preventDefault();
		atomixapi.apps.run("list", window.sampledata.list)
	});

	lnkView = jQuery("<li><a href='#'>View an item</a></li>");
	jQuery("a", lnkView).click(function(e){
		e.preventDefault();
		atomixapi.apps.run("view", window.sampledata.view)
	});

	lnkAbout = jQuery("<li><a href='#'>About screen</a></li>");
	jQuery("a", lnkAbout).click(function(e){ e.preventDefault(); atomixapi.apps.run("about", {}) });

	tryLinks.append(lnkHome);
	tryLinks.append(lnkList);
	tryLinks.append(lnkView);
	tryLinks.append(lnkAbout);

	atomixapi.apps.run("home", {});

};

jQuery(document).ready(function(){
	baseURL = getQuerystring("baseurl");
	appURL = getQuerystring("app");
	console.info("Loading atomix application URL: ", baseURL + appURL);
	getAtomixItemXML(baseURL, appURL);
});

function onItemLoad(xml) {
	sampledataURL = baseURL + getQuerystring("sampledata");
	var a = jQuery.getJSON(sampledataURL, function(data) {
		console.log("Sampledata");
		window.sampledata = data;
	});

	console.info("Extracting JSON data: ", xml);
	var item = getAtomixItem(xml);
	if (item) {
		console.info("Atomix Item fully extracted: ", item);
		appstage = new Appstage(window.atomixapi, item);
		appstage.init();
	} else {
		console.error("Loading app failed!");
	}
};

function getAtomixItem(xml) {

	var item = new AtomixItem();

	function parseTag(path, defaultValue) {
		titleElem = $(xml).find(path)[0];
		if (titleElem) return titleElem.textContent
		else return defaultValue;
	}

	item.title = parseTag("title", item.title);
	item.id = parseTag("id", item.id);
	item.summary = parseTag("summary", item.summary);
	item.author = parseTag("author", item.author);
	item.content = parseTag("content", item.content);
	
	var data = {};
	$(xml).find('.atomix-data').each(function(){
		try {
			data = JSON.parse(this.textContent);
		} catch(e) {
			console.error("JSON Parsing failed!");
		}
	});

	if (data) item.data = data;

	return item;
};

function AtomixItem() {
	this.title = "";
	this.id = "";
	this.summary = "";
	this.author = "";
	this.content = "";
	this.lang = "en";
	this.data = {};
}


function getAtomixItemXML(baseURL, appURL) {
	$.ajax({
		type: "GET",
		url: baseURL + appURL,
		dataType: "xml",
		success: onItemLoad
	}); 
};


function getQuerystring(key, default_) {
  if (default_==null) default_="";
  key = key.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regex = new RegExp("[\\?&]"+key+"=([^&#]*)");
  var qs = regex.exec(window.location.href);
  if(qs == null)
    return default_;
  else
    return qs[1];
} 


