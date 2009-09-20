/*global window */
"use strict";
(function (window) {
	/*
	 * atomix.core.js
	 * Core module of the reference implementation of the Atomix-api
	 * @author: Mathieu Sylvain
	 *
	 */

	var Atomixapi,
		$ = window.jQuery;

	/*
	Class: Atomixapi
	*/
	Atomixapi = function () {
	};

	/*
	Class: Atomixapi.Apps
		Class providing functionalities for Atomix Apps and Widgets
	*/
	Atomixapi.Apps = {};

	Atomixapi.Errors = [
		["atomix.discovery.provider.requestFailed", "Atomix api discovery process failed: Request to provider failed"],
		["atomix.discovery.provider.missingAPIVersionNumber", "Atomix api discovery process failed: Missing api version number"],
		["atomix.discovery.provider.missingBaseAddress", "Atomix api discovery process failed: Missing base address"],
		["atomix.discovery.provider.missingName", "Atomix api discovery process failed: Missing provider name"],
		["atomix.discovery.account.serviceDocument.requestFailed", "Atomix api discovery process failed: Request for account service document failed"],
		["atomix.discovery.account.serviceDocument.unparsable", "Atomix api discovery process failed: Service document was unparsable"],
		["atomix.provider.createAccount.accountNameNotAvailable", "Creating account failed. This account name is not available."]
	];

	Atomixapi.prototype.getView = function (id) {
		var elem = $("#" + id).clone()[0];
		return elem;
	};

	Atomixapi.prototype.apps = {
		//TODO: Is this how the object should be built?
		register: function (newApp) {
			/* CURRENTLY SUPPORT ONLY ONE APP AT A TIME */
			console.info("Registering new app", newApp.meta.title, newApp);
			this.app = newApp;
		},
		run: function (frame, data) {
			$(".appstage-frame").hide();
			var currentFrame = $(".appstage-appframe");
			currentFrame.show();
			console.info("Running app:", this, data, frame, currentFrame[0]);
			this.app.run(this, data, frame, currentFrame[0]);
		},
		app: null
	};

	Atomixapi.ServiceDocument = function (src) {
		this.src = src;
		this.content = "";
		this.dom = "";
		this.load = function () {
		};
	};

	Atomixapi.Provider = function (discovery_url) {
		this.discovery_url = discovery_url;
		this.name = "";
		this.homepage = "";
		this.atomixBaseURL = "";
		this.atomixVersion = "";
		this.atomixAccountPrefix = "";

		this.discovery = function () {
			/*
			atomix-version: 1
			atomix-homepage: http://mixxim.com/
			atomix-baseURL: http://mixxim.com/atomix/
			atomix-name: Mixxim
			*/
			throw new Error(null, "Atomix api discovery of provider failed");
		};
		this.discovery();
	};

	Atomixapi.Session = function () {
		//TODO: What are these vars necessary?
		var password = "";
		this.clear();
		this.serviceDocument = null;
	};

	Atomixapi.Provider = function () {
		this.address = "";
		this.name = "";
		this.version = "";
		this.base = "";
		this.homepage = "";
		this.found = false;
	};

	Atomixapi.Account = function () {
		this.name = "";
		this.authenticated = false;
		this.authString = "";
		this.service = {
			document: "",
			collection: {title: "", href: ""},
			found: false
		};
	};

	// Asynchronous login process
	Atomixapi.Session.prototype.login = function (provider, accountName, password, callback) {
		this.clear();
		this.account.name = accountName;
		this.provider.address = provider;
		try {
			Atomixapi.Session.discoverProvider(this);
			Atomixapi.Session.authenticate(this, password);
		} catch (error) {
			console.log("login failed:", error);
			callback(error);
			return;
		}
		callback(this);
	};

	Atomixapi.Session.prototype.logout = function () {
		/* should containe some cleanup of statuses and credentials */
		throw new Error(null, "Atomix api logout failed");
	};

	Atomixapi.Session.prototype.clear = function () {
		this.account = new Atomixapi.Account();
		this.provider = new Atomixapi.Provider();
	};

	Atomixapi.Session.prototype.createAccount = function (data, callback) {
		var newAccount;
		this.clear();
		this.provider.address = data.provider;
		try {
			Atomixapi.Session.discoverProvider(this);
		} catch (discoveryError) {
			console.log("Atomixapi.Session.discoverProvider(this)", discoveryError);
			callback(new Error(discoveryError.message));
		}
		try {
			newAccount = this.createAccountRequest(data);
		} catch (createError) {
			console.log("this.createAccountRequest(data)", createError);
			callback(new Error(createError.message));
		}
		callback(newAccount);
	};

	Atomixapi.Session.prototype.createAccountRequest = function (data) {
		var accountItem, newAccountItem;
		try {
			accountItem = new Atomixapi.Item({
				data: {
					name: data.accountName,
					password: data.password
				}
			},
			"account.atomixapi.org");
		} catch (itemError) {
			console.trace("instanciating an item", itemError);
		}
		try {
			newAccountItem = accountItem.post(this.provider.base + "_provider/accounts");
		} catch (postError) {
			throw new Error("atomix.provider.createAccount.requestFailed");
		}
		return newAccountItem;
	};

	Atomixapi.Session.prototype.createAccountConfirm = function (data) {
		var request;
		try {
			request = $.ajax({
				type: "POST",
				url: this.provider.base + "createAccount",
				dataType: "xml",
				async: false,
				data: {
					accountName: data.accountName,
					confirmationCode: this.session.account.confirmationCode
				}
			});
		} catch (requestError) {
			throw new Error("atomix.provider.createAccount.requestFailed");
		}
	};

	Atomixapi.Session.discoverProvider = function (Session) {
		var request,
			provider = Session.provider;
		console.log("Starting discovery process at: ", provider.address);
		try {
			request = $.ajax({
				type: "GET",
				url: "http://" + provider.address + "/atomixapi",
				dataType: "html",
				async: false
			});
		} catch (requestError) {
			throw new Error("atomix.discovery.provider.requestFailed");
		}
		if (request.status !== 200) {
			throw new Error("atomix.discovery.provider.requestFailed." + request.status);
		}
		provider.homepage = request.getResponseHeader("atomix-homepage");
		provider.version = request.getResponseHeader("atomix-version");
		if (provider.version === null) {
			throw new Error("atomix.discovery.provider.missingAPIVersionNumber");
		}
		provider.base = request.getResponseHeader("atomix-base");
		if (provider.base === null) {
			throw new Error("atomix.discovery.provider.missingBaseAddress");
		}
		provider.name = request.getResponseHeader("atomix-name");
		if (provider.name === null) {
			throw new Error("atomix.discovery.provider.missingName");
		}
		provider.found = true;
		console.log("provider", provider);
		return Session;
	};

	Atomixapi.xhr_add_authHeaders_wsse = function (xhr, accountname, password) {
		var dt, creationTimestamp, nonce, passwordDigest, authStringWSSE;
		dt = new Date();
		creationTimestamp = Atomixapi.Utils.dateFormat(dt, Atomixapi.Utils.dateFormat.masks.isoUtcDateTime);
		nonce = Atomixapi.Utils.Base64.encode(Math.random() + "");
		passwordDigest = Atomixapi.Utils.Base64.encode(Atomixapi.Utils.SHA1(nonce + creationTimestamp + password));
		authStringWSSE = 'UsernameToken Username="' + accountname + '", PasswordDigest="' + passwordDigest + '", Nonce="' + nonce + '", Created="' + creationTimestamp + '"';
		xhr.setRequestHeader("Authentication", 'WSSE profile="UsernameToken"');
		console.log("authStringWSSE", authStringWSSE);
		xhr.setRequestHeader("X-WSSE", authStringWSSE); //THIS LINE ONLY APPLIES TO WSSE, NOT BASIC AUTH
		return xhr;
	};

	Atomixapi.xhr_add_authHeaders_basic = function (xhr, accountname, password) {
		xhr.setRequestHeader("Authentication", "Basic " + Atomixapi.Utils.Base64.encode(accountname + ":" + password));
		return xhr;
	};

	Atomixapi.Session.authenticate = function (Session, password) {
		console.log("authenticate");
		var request, titleNode, collectionNode, xmlDocument,
			account = Session.account;
		// ALL THIS PART SHOULD IS REPEATED IN THE BASIC AUTH BUT SHOULD BE
		// EXTRACTED IN A SEPARATE METHOD
		try {
			request = $.ajax({
				type: "GET",
				url: Session.provider.base + account.name + "/servicedocument",
				dataType: "xml",
				async: false,
				beforeSend: function (xhr) {
					// BASIC AUTH MIGHT BE SIMPLY REMOVED FROM ATOMIX SPECS
					//xhr = Atomixapi.xhr_add_authHeaders_basic(xhr, Session.account.name, password);
					xhr = Atomixapi.xhr_add_authHeaders_wsse(xhr, Session.account.name, password);
				}
			});
		} catch (requestError) {
			console.log(requestError);
			if (request) {
				if (request.status) {
					throw new Error("atomix.discovery.account.serviceDocument.requestFailed." + request.status);
				}
			}
			throw new Error("atomix.discovery.account.serviceDocument.requestFailed");
		}
		if (request.status === 400) {
			if (request.getResponseHeader("atomix-error")) {
				throw new Error(request.getResponseHeader("atomix-error"));
			} else {
				throw new Error("atomix.discovery.account.serviceDocument.requestFailed." + request.status);
			}
		} else if (request.status !== 200) {
			throw new Error("atomix.discovery.account.serviceDocument.requestFailed." + request.status);
		}

		xmlDocument = account.service.document = request.responseXML;
		if (xmlDocument === null) {
			throw new Error("atomix.discovery.account.serviceDocument.unparsable");
		}
		collectionNode = $(xmlDocument).find("workspace collection");
		console.log("collectionNode", collectionNode);
		account.service.collection.href = $(collectionNode).attr("href");
		titleNode = $(collectionNode).find("atom\\:title")[0];
		console.log("titleNode", titleNode);
		account.service.collection.title = titleNode.textContent;
		account.service.found = true;
		account.authenticated = true;
		console.log("Session, request", Session, request);
		return Session;
	};

	Atomixapi.Item = function (item, type) {
		this.type = "";
		if (type) {
			this.type = type;
		}
		this.title = "";
		this.id = null;
		this.summary = null;
		this.author = null;
		this.content = null;
		this.lang = null;
		this.data = {};
		this.dataLang = null;
		this.dataType = null;
		this.url = null;
		$.extend(true, this, item);
		console.log("item", item);
		console.log("this.data", this.data);
	};

	Atomixapi.Item.prototype.parse = function (xml) {
		var item = {};
		if (!xml) {
			throw new Error("atomix.item.parse.unparsable");
		}
		this.parseTag = function (defaultValue, path, attr) {
			console.trace();
			var titleElem = $(xml).find(path)[0];
			if (titleElem) {
				console.log(titleElem);
				console.log(titleElem.textContent);
				if (attr) {
					return $(titleElem).attr(attr);
				} else {
					return titleElem.textContent;
				}
			} else {
				return defaultValue;
			}
		};
		item.title = this.parseTag(this.title, "title");
		item.id = this.parseTag(this.id, "id");
		item.summary = this.parseTag(this.summary, "summary");
		item.author = this.parseTag(this.author, "author");
		item.content = this.parseTag(this.content, "content");
		item.dataJSON = $(xml).find("atomix\\:data")[0].firstChild.data;
		try {
			item.data = JSON.parse(item.dataJSON);
		} catch (parseError) {
			throw parseError;
		}
		item.dataType = this.parseTag(item.dataType, "atomix\\:data", "type");
		item.dataLang = this.parseTag(item.dataLang, "atomix\\:data", "lang");
		$.extend(true, this, item);
		console.log("extended", this, item);
	};

	Atomixapi.Item.prototype.get = function (url) {
		var request;
		if (url) {
			this.url = url;
		}
		try {
			request = $.ajax({
				type: "GET",
				url: this.url,
				dataType: "xml",
				async: false
			});
		} catch (requestError) {
			throw new Error("atomix.item.requestFailed");
		}
		if (request.status === 400 && request.responseText) {
			throw new Error(request.responseText);
		}
		if (request.status !== 200) {
			throw new Error("atomix.item.requestFailed." + request.status);
		}
		this.parse(request.responseXML);
	};

	Atomixapi.Item.prototype.post = function (url) {
		var request, newItem;
		if (url) {
			this.url = url;
		}
		try {
			console.log("posting item to ", this.url);
			request = $.ajax({
				type: "POST",
				url: this.url,
				dataType: "xml",
				async: false,
				contentType: "application/atom+xml",
				data: this.serializeXML()
			}); 
		} catch (e) {
			console.error(e);
			throw new Error("atomix.item.requestFailed");
		}
		if (request.status === 400 && request.responseText) {
			throw new Error(request.responseText);
		}
		if (request.status !== 200) {
			throw new Error("atomix.item.requestFailed." + request.status);
		}
		newItem = new Atomixapi.Item();
		newItem.parse(request.responseXML);
		console.log("Item creation sucess: post ", this, " response:", newItem);
		return newItem;
	};

	Atomixapi.Item.prototype.serializeXML = function () {
		var itemXML, itemTemplate;
		itemTemplate = '<?xml version="1.0"?>' +
		'<entry xmlns="http://www.w3.org/2005/Atom" xmlns:atomix="http://schemas.atomix-api.com/atomix/2009">' +
		'<title>{title}</title>' +
		'{idTag}' +
		'<summary type="text">{summary}</summary>' +
		'{dataTag}' +
		'<content type="xhtml" xml:lang="en" xml:base="{base}">' +
		'<div xmlns="http://www.w3.org/1999/xhtml">{content}</div>' +
		'</content>' +
		'</entry>';

		itemXML = itemTemplate;
		itemXML = itemXML.replace("{base}", "http://localhost:8080/mix/");
		itemXML = itemXML.replace("{title}", this.title);
		if (this.id) {
			itemXML = itemXML.replace("{idTag}", "<id>" + this.id + "</id>");
		}
		itemXML = itemXML.replace("{summary}", this.summary);
		if (this.data) {
			itemXML = itemXML.replace("{dataTag}", '<atomix:data type="' + this.dataType + '" xml:lang="' + this.dataLang + '" xml:base="{base}"><![CDATA[' + JSON.stringify(this.data) + ']]></atomix:data>');
		}
		itemXML = itemXML.replace("{content}", this.content);
		return itemXML;
	};

	Atomixapi.Collection = function (items) {
		this.items = [];
		$.merge(true, this, items);
	};

	window.Atomixapi = Atomixapi;

}(window));

