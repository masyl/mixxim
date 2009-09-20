/*
 * Mixxim
 * An atomix compatible client 
 * @author: Mathieu Sylvain 
 *
 */

(function (window){

function I18n() {
	this.messages = {
		"Login failed for unknown reason": "Sorry, Login failed for an unknown reason.",
		"Login": "Login",
		"Wait": "Please wait...",
		"Create account": "Create account",
		"There was an error while connecting with the server": "There was an error while connecting with the server",
		"You must enter a password": "You must enter a password",
		"Both passwords dont match": "Both passwords dont match",
		"You must enter an account name": "You must enter an account name",
		"You must enter an atomix provide homepage address": "You must enter an atomix provide homepage address",
		"You must enter an atomix provider home address": "You must enter an atomix provider home address. Ex.: mixxim.com",
		"Create account failed for unknown reason": "Create account failed for unknown reason",
		"The password is invalid": "The password is invalid",
		"The account name is invalid": "The account name is invalid"
	};
};

I18n.prototype.gettext = function (key) {
	var msg = this.messages[key];
	if (!msg) {
		msg = key;
		console.warn("Missing key in i18n module: " + key);
	}
	return msg;
}
I18n.prototype._ = function (key) {
	return this.gettext(key);
};

window.i18n = new I18n();

})(window);


(function (window){

var i18n = window.i18n;
var _ = function (key) { return i18n.gettext(key); };

function Mixxim(Atomixapi) {
	var Atomixapi = this.Atomixapi = Atomixapi;
	this.session = null;
	this.init();
}

Mixxim.prototype.init = function () {
	console.log("this", this);
	console.log("Mixxim", Mixxim);

	/* Configure the initial environement */
	var environ = {
		Atomixapi: this.Atomixapi,
		views: {},
		containers: {
			main: jQuery("#layout"),
			fixtures: jQuery("#fixtures")
		}
	};

	var ui = this.ui = new Mixxim.UI(environ);
	ui.cacheViews();

	/* Instantiate the various modules */
	var login = this.login = new Mixxim.Login(environ);
	var createAccount = this.login = new Mixxim.CreateAccount(environ);
	var manager = this.manager = new Mixxim.Manager(environ);

	/*
	Bindings between each modules
	*/
		$(login).bind("afterLoginSuccess", function (e){
			console.log("afterLoginSuccess login, manager", login, manager)
			login.hide();
			manager.show();
		})
		$(login).bind("showCreateAccount", function (e){
			login.hide();
			createAccount.show();
		})
		$(createAccount).bind("afterCreateAccountSuccess", function (e){
			console.log("afterCreateAccountSuccess", createAccount)
			createAccount.hide();
			login.show();
		})
		$(createAccount).bind("showLogin", function (e){
			createAccount.hide();
			login.show();
		})
		$(manager).bind("afterLogout", function (e){
			manager.hide();
			createAccount.hide();
			login.show();
		})

	/* show the Login module */	
	login.show();

};

Mixxim.prototype.logout = function () {
	this.session.clear();
};
	


/* Mixxim.UI
 * The user interface constructs
 */
Mixxim.UI = function (environ) {
	this.environ = environ;
};
Mixxim.UI.prototype.views = {};
Mixxim.UI.prototype.cacheViews = function () {
	var environ = this.environ;
	jQuery("#views").hide();
	jQuery("#views .view").each(function (e) {
		if (this.id) {
			environ.views[this.id] = jQuery(this).hide().clone();
			jQuery(this).remove();
		} else {
			throw new Error(null, "A view is missing an ID");
		}
	});
};
Mixxim.UI.GetView = function (key, environ) {
	return environ.views[key];
}

/* Mixxim.Login
 */

Mixxim.Login = function (environ) {
	var Login = this;
	var environ = this.environ = environ;

	/*
	Objects and their bound events:
		login = <div class="view" id="view-login">
		loginStart = event
		loginSuccess = event
		loginFail = event
	*/
	this.init = function () {
		/* Instantiate the main login object and adds it to the dom */
		var login = this.login = jQuery(Mixxim.UI.GetView("view-login", environ));
		var Errors = this.Errors = jQuery("#login-errors", login);
		environ.containers.main.append(login);

		/* bind necessary methods on events */

		console.debug("this.login", this.login);
		jQuery(this.login).bind("loginStart", this.loginStart);
		jQuery(this.login).bind("loginFail", this.loginFail);
		jQuery(this.login).bind("loginSuccess", this.loginSuccess);
		jQuery("#login-submit", login).bind("click", function (e){
			e.preventDefault();
			jQuery(login).trigger("loginStart", {
				address: jQuery("#login-atomixaddress", login).val(),
				password: jQuery("#login-password", login).val()
			});
		});
		jQuery("#login-createAccount", login).bind("click", function (e){
			e.preventDefault();
			jQuery(Login).trigger("showCreateAccount");
		});

	};
	
	this.show = function () {
		console.log("login.show", Login)
		jQuery(Login.login).fadeIn("fast");
	};

	this.hide = function () {
		jQuery(Login.login).hide();
	};
	
	this.showError = function (msg) {
		this.Errors.empty().hide().fadeIn("fast");
		var newError = this.Errors.append(jQuery(Mixxim.UI.GetView("error-message", environ).clone().show()));
		jQuery(".error-message", this.Errors).show().html(msg);
	};

	this.hideErrors = function (msg) {
		this.elems.Errors.hide().empty();
	};

	this.loginStart = function (e, data) {
		Login.Errors.empty().hide();
		jQuery("#login-submit", this.login).attr('disabled', 'disabled');
		jQuery("#login-submit", this.login).html(_('Wait'));
		this.session = new environ.Atomixapi.Session();

		var accountName = data.address.split("@")[0];
		var provider = data.address.split("@")[1];

		this.session.login(provider, accountName, data.password, function (session){
			Login.loginCallback(session);
		});
	};

	this.loginCallback = function (sessionOrError) {
		console.log("loginCallback sessionOrError", sessionOrError);
		if (sessionOrError.name == "Error") {
			var message = _("Login failed for unknown reason");
			if (sessionOrError.message == "atomix.discovery.account.serviceDocument.requestFailed.401")
				message = _("Invalid account name or password");
			if (sessionOrError.message.substr(0,39) == "atomix.discovery.provider.requestFailed")
				message = _("There was an error while connecting with the server");
			if (sessionOrError.message == "atomix.provider.authFail.invalidPassword")
				message = _("The password is invalid");
			if (sessionOrError.message == "atomix.provider.authFail.invalidAccountname")
				message = _("The account name is invalid");
			jQuery(this.login).trigger("loginFail", {message: message});
		} else if (sessionOrError.name == "TypeError") {
			jQuery(this.login).trigger("loginFail", {message: message});
		} else {
			jQuery(this.login).trigger("loginSuccess");
		};
	};

	this.loginFail = function (e, data) {
		console.log("this.loginFail", e, data);
		jQuery("#login-submit", this.login).html(_('Login'));
		jQuery("#login-submit", this.login).removeAttr('disabled');
		Login.showError(data.message);
	};

	this.loginSuccess = function (e, data) {
		console.log("Login success!");
		jQuery("#login-submit", this.login).html(_('Login'));
		jQuery("#login-submit", this.login).removeAttr('disabled');
		jQuery(Login).trigger("afterLoginSuccess", {});
	};

	this.init();
};


/* Mixxim.CreateAccount
 */

Mixxim.CreateAccount = function (environ) {
	var CreateAccount = this;
	var environ = this.environ = environ;

	/*
	Objects and their bound events:
		login = <div class="view" id="view-login">
		createAccountStart = event
		createAccountSuccess = event
		createAccountFail = event
	*/
	this.init = function () {
		/* Instantiate the main login object and adds it to the dom */
		var createAccount = this.createAccount = jQuery(Mixxim.UI.GetView("view-createAccount", environ));
		var Errors = this.Errors = jQuery("#createAccount-errors", createAccount);
		environ.containers.main.append(createAccount);

		/* bind necessary methods on events */

		var termsOverlay = this.termsOverlay = $("#termsOverlay").overlay({api:true}); 

		console.debug("this.createAccount", this.createAccount);
		jQuery(this.createAccount).bind("createAccountStart", this.createAccountStart);
		jQuery(this.createAccount).bind("createAccountFail", this.createAccountFail);
		jQuery(this.logincreateAccount).bind("createAccountSuccess", this.createAccountSuccess);
		jQuery("#createAccount-submit", createAccount).bind("click", function (e){
			e.preventDefault();
			jQuery(createAccount).trigger("createAccountStart", {
				provider: jQuery("#createAccount-provider", createAccount).val(),
				accountname: jQuery("#createAccount-accountname", createAccount).val(),
				password: jQuery("#createAccount-password", createAccount).val()
			});
		});
		jQuery("#createAccount-login, .logoLink", createAccount).bind("click", function (e) {
			e.preventDefault();
			jQuery(CreateAccount).trigger("showLogin");
		});

	};
	
	this.show = function () {
		console.log("createAccount.show", CreateAccount)
		jQuery(CreateAccount.createAccount).fadeIn("fast");
	};

	this.hide = function () {
		jQuery(CreateAccount.createAccount).hide();
	};
	
	this.showError = function (msg) {
		
		this.Errors.empty().hide().fadeIn("fast");
		var newError = this.Errors.append(jQuery(Mixxim.UI.GetView("error-message", environ).clone().show()));
		jQuery(".error-message", this.Errors).show().html(msg);
	};

	this.hideErrors = function (msg) {
		this.elems.Errors.hide().empty();
	};

	this.createAccountStart = function (e, data) {
		CreateAccount.Errors.empty().hide();
		jQuery("#createAccount-submit", this.createAccount).attr('disabled', 'disabled');
		jQuery("#createAccount-submit", this.createAccount).html(_('Wait'));
		this.session = new environ.Atomixapi.Session();

		jQuery("#createAccount-provider").val(jQuery.trim(jQuery("#createAccount-provider").val()))
		if (jQuery("#createAccount-provider").val() == "") {
			CreateAccount.createAccountFail(null, {message: _("You must enter an atomix provider home address")});
			return;
		}
		jQuery("#createAccount-accountName").val(jQuery.trim(jQuery("#createAccount-accountName").val()))
		if (jQuery("#createAccount-accountName").val() == "") {
			CreateAccount.createAccountFail(null, {message: _("You must enter an account name")});
			return;
		}
		if (jQuery("#createAccount-password").val() == "") {
			CreateAccount.createAccountFail(null, {message: _("You must enter a valid password")});
			return;
		}
		if (jQuery("#createAccount-password").val() != jQuery("#createAccount-passwordConfirm").val()) {
			CreateAccount.createAccountFail(null, {message: _("Both passwords dont match")});
			return;
		}

		this.session.createAccount({
				provider: jQuery("#createAccount-provider").val(),
				accountName: jQuery("#createAccount-accountName").val(),
				password: jQuery("#createAccount-password").val()
			}, function (session){
				CreateAccount.createAccountCallback(session);
			}
		);

	};

	this.createAccountCallback = function (sessionOrError) {
		console.log("createAccountCallback sessionOrError", sessionOrError);
		if (sessionOrError.name == "Error") {
			sessionOrError.message = sessionOrError.message.replace(/^\s+|\s+$/g,"") //Trim whitespaces
			var message = _("Create account failed for unknown reason")
			if (sessionOrError.message.substr(0,39) == "atomix.discovery.provider.requestFailed") message = _("There was an error while connecting with the server");
			if (sessionOrError.message == "atomix.provider.createAccount.accountNameNotAvailable") message = _("This account name is not available");
			jQuery(this.createAccount).trigger("createAccountFail", {message: message});
		} else {
			jQuery(this.createAccount).trigger("createAccountSuccess");
		};
	};

	this.createAccountFail = function (e, data) {
		jQuery("#createAccount-submit", this.createAccount).html(_('Create account'));
		jQuery("#createAccount-submit", this.createAccount).removeAttr('disabled');
		CreateAccount.showError(data.message);
		jQuery(CreateAccount).trigger("afterCreateAccountFail", data);
	};
	
	this.createAccountSuccess = function (e, data) {
		console.log("Create account success! ", e, data);
		jQuery("#createAccount-submit", this.createAccount).html(_('Create account'));
		jQuery("#createAccount-submit", this.createAccount).removeAttr('disabled');
		jQuery(CreateAccount).trigger("afterCreateAccountSuccess", data);
	};

	this.init();
};

Mixxim.Manager = function (environ) {
	var Manager = this;
	var container = environ.container;
	/*
	Objects and their bound events:
		manager = <div class="view" id="view-manager">
		managerOnRunApps = event
	*/
	this.init = function () {
		/* Instantiate the main login object and adds it to the dom */
		var manager = this.manager = jQuery(Mixxim.UI.GetView("view-manager", environ));
		environ.containers.main.append(manager);
		var status= this.status = jQuery("#status");

		/* bind necessary methods on events */

		jQuery("#main-menu-apps").bind("loginStart", function (){
			e.preventDefault();
			this.runApp();
		});
		jQuery("#main-menu-logout").bind("click", function (e){
			e.preventDefault();
			jQuery(Manager).trigger("afterLogout");
		});

		jQuery(this).bind("fetch", this.onFetch);
		jQuery("#main-menu-fetch").bind("click", function (e){
			e.preventDefault();
			jQuery(Manager).trigger("fetch");
		});

	};

	this.onFetch = function (e, data){
		$.fn.colorbox({
			href:"fetch-prompt.html",
			open:true,
			initialWidth: "600px",
			initialHeight: "300",
			transition: "none",
			speed: 0,
			opacity: 0.5
		});
	};

	this.init();
};

Mixxim.Manager.prototype.show = function () {
	jQuery(this.manager).fadeIn("fast");
}

Mixxim.Manager.prototype.hide = function () {
	jQuery(this.manager).hide();
}

Mixxim.Manager.prototype.runApp = function (appURI, method, data) {
}


Mixxim.Widgets = {};
Mixxim.Widgets.ItemList = function () {
	this.render = function (data) {
		var elem = $("<div style='position: absolute; top: 0px; left: 0px; z-index: 3000; padding:10px; border: 3px solid black; background: #fff; color: #000;'></div>");
		$.each(data.items, function (i, val) {
			console.log(this);
			$(elem).append("<p>" + this.title + "</p>");
		});
		return elem;
	}
};


function runTests() {
	testItemList();
}

function testItemList() {
	var itemList, factory, fetchStrings,
		items = [],
		Factory = Atomixapi.Factory;

	factory = new Factory();
	Factory.RegisterBuilders([
		Factory.tests.sampleBuilders.buildNote,
		Factory.tests.sampleBuilders.buildWebSearch
	], factory.builders);

	fetchStrings = [
		"note: Wasaaaaaaap!",
		"note: I love puppies!",
		"? Kanyegate"];
	$.each(fetchStrings, function(i, val) {
		console.log(val);
		$.merge(items, factory.build(val));
	});
	console.log("items: ", items);
	itemList = new Mixxim.Widgets.ItemList();
	itemListUI = itemList.render({
		items: items
	})
	jQuery("#page").append(itemListUI);
}

jQuery(document).ready(function (){
	var mixxim = new Mixxim(window.Atomixapi);

	runTests();
});


// Expose the main Mixxim constructor to the global context
// Under "secure" circumstances the running instances of mixxim and atomix api
// hould not be accessible from the global scope, to prevent snooping by runnning apps
//window.Mixxim = Mixxim;

})(window);



