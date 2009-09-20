/*global window */
"use strict";

/*
	Documentation formated for Natural Docs (Ref.: http://www.naturaldocs.org/)

	About: License
	This file is licensed under the CPAL 1.0.

	About: Copyright
	Some rights reserved, Mathieu Sylvain, 2009
*/
(function (window) {
	var Api, Execution, Notification, Data, HTTP, I18N, Credentials,
		$ = window.jQuery,
		Atomixapi = window.Atomixapi,
		_version = "0.1",
		_vendor = "mixxim";

	/*
	Class: Atomixapi.Apps.Api
		The object which is supplied to a widget at runtime. It provides access to the sandbox functionnalities not already supplied by the html dom or browser runtime.
	*/

	/*
	Constructor: Api()
		Constructor for the Api class

	Properties:
		about - An object containing a "version" and "vendor" attributes
		execution - An instance of the <Atomixapi.Apps.Api.Execution> class
		notification - An instance of the <Atomixapi.Apps.Api.Notification> class
		data - An instance of the <Atomixapi.Apps.Api.Data> class
		http - An instance of the <Atomixapi.Apps.Api.HTTP> class
		i18n - An instance of the <Atomixapi.Apps.Api.I18N> class
		credentials - An instance of the <Atomixapi.Apps.Api.Credentials> class
	*/
	Api = Atomixapi.Apps.Api =  function () {
		this.about = {
			version: _version,
			vendor: _vendor
		};
		this.execution = new Api.Execution();
		this.notification = new Api.Notification();
		this.data = new Api.Data();
		this.http = new Api.HTTP();
		this.i18n = new Api.I18N();
		this.credentials = new Api.Credentials();
	};

	/*
	Class: Atomixapi.Apps.Api.Execution
		To be documented...

	Note:
		This is a placeholder class, it has not been implemented yet
	*/

	/*
	Constructor: Execution()
	*/
	Execution = Api.Execution = function () {};

	/*
	Function: log(text)
	Adds a line in the execution log (for power users and administrators)

	Parameters:
		text - String - The text to be added to the execution log

	Returns:
		Null

	Note:
		This is a placeholder method, it has not been implemented yet
	*/
	Execution.prototype.log = function (text) {
	};

	/*
	Function: run(data, app)
		Asks the client to run another app by name or by content.

	Parameters:
		data - Object - The data to be runned
		app - String (Optional) - The uri of the app that should be preferably used

	Returns:
		Boolean - Wether the request has been accepted or not

	Note:
		This is a placeholder method, it has not been implemented yet
	*/
	Execution.prototype.run = function (data, app) {
	};

	/*
	Function: throw(error)
		Throws an application exception back to the client

	Parameters:
		error - The error object containing the details

	Returns:
		Null

	Note:
		This is a placeholder method, it has not been implemented yet
	*/
	Execution.prototype.throw = function (error) {
	};

	/*
	Function: suicide()
		Ask the api to itself

	Returns:
		Null

	Note:
		This is a placeholder method, it has not been implemented yet
	*/
	Execution.prototype.suicide = function () {
	};

	/*
	Function: browse(url [, useSameWindow])
		Ask the client to open a new window/frame at the requested web address

	Parameters:
		url - String - The web address where the user should be sent
		useSameWindow - Boolean (Optional, Default to False) - Wether the user should expect to view this content in the same window or not (as in Ctrl-Click on a link) 

	Returns:
		Boolean - Wether the request has been accepted

	Note:
	This is a placeholder method, it has not been implemented yet
	*/
	Execution.prototype.browse = function (url, useSameWindow) {
	};


	/*
	Class: Atomixapi.Apps.Api.Notification
		To be documented...

	Note:
		This is a placeholder class, it has not been implemented yet
	*/

	/*
	Constructor: Notification()
		Constructor function for the Data class

	Usage:
	: var notification = new Atomixapi.Apps.Api.Notification()
	*/
	Notification = Api.Notification = function () {};

	/*
	Function: message(text, type, isModal)
		Shows a message to the user, which the client is expected to associate to the widget

	Parameters:
		text - String - A short text to be shown to the user, without formating.
		type - String - The type of messages to show: "error", "warning" or "info".
		isModal - Wether the widget wishes the message to be modal or not. This is at the clients discretion.

	Returns:
		Null

	Note:
		This is a placeholder method, it has not been implemented yet
	*/
	Notification.prototype.message = function () {
	};

	/*
	Function: attention()
		Request that the users attention be given to the app

	Returns:
		Null

	Note:
		This is a placeholder method, it has not been implemented yet
	*/
	Notification.prototype.attention = function () {
	};

	/*
	Function: status(text [, percentComplete])
		Updates the status bar associated with the window, never modal

	Parameters:
		text - xxxxxxxxxxxx
		percentComplete - xxxxxxxxxxxx

	Returns:
		Null

	Note:
		This is a placeholder method, it has not been implemented yet
	*/
	Notification.prototype.status = function (text, percentComplete) {
	};

	/*
	Class: Atomixapi.Apps.Api.Data
		To be documented...

	Note:
		This is a placeholder class, it has not been implemented yet
	*/

	/*
	Constructor: Data()
	*/
	Data = Api.Data = function () {};

	/*
	Function: resourceURL(filename)
		Get the full url of a resource that is bundled with the application (necessary? Could it be done with an html base tag)

	Parameters:
		filename - the filename of the resource requested

	Returns:
		String - A url where to get the file using an http get

	Note:
		This is a placeholder method, it has not been implemented yet
	*/
	Data.prototype.resourceURL = function (filename) {
	};

	/*
	Function: get(url)
		Request items from an Atomix formated URL, or local ID

	Parameters:
		url - url corresponding to the requested items or collection of items

	Returns:
		Array - An array of Atomixapi Items

	Note:
		This feature might not be needed if the Item objects already permit this by themselves.
		This is a placeholder method, it has not been implemented yet
	*/
	Data.prototype.get = function () {
	};

	/*
	Function: post(item)
		Post an new or existing item

	Parameters:
		item - An atomix item

	Returns:
		Object - The new or update atomix item

	Note:
		This feature might not be needed if the Item objects already permit this by themselves.
		This is a placeholder method, it has not been implemented yet
	*/
	Data.prototype.post = function (item) {
	};

	/*
	Function: permission(itemType)
		Explicitly request permission to access items of a particular type
		The atomix client is at liberty to show a modal window when prompting the user.

	Parameters:
		itemType - String - An atomix item type id/uri

	Returns:
		Boolean - Wether the request has been accepted or not

	Possible improvement:
		Maybe this should return something like a permissions object

	Note:
		This is a placeholder method, it has not been implemented yet
	*/
	Data.prototype.permission = function () {
	};

	/*
	Class: Atomixapi.Apps.Api.HTTP
		To be documented...

	Note:
		This is a placeholder class, it has not been implemented yet
	*/

	/*
	Constructor: HTTP()
	*/
	HTTP = Api.HTTP = function () {};

	/*
	Function: get(url)
		...

	Parameters:
		url - xxxxxxxxxxxx

	Returns:
		xxxxx

	Note:
		The Post and Get method should be retought for more controle over the request sent
		This is a placeholder method, it has not been implemented yet
	*/
	HTTP.prototype.get = function () {
	};

	/*
	Function: post(url, data)
		...

	Parameters:
		url - xxxxxxxxxxxx
		data - xxxxxxxxxxxx

	Returns:
		xxxxx

	Note:
		The Post and Get method should be retought for more controle over the request sent
		This is a placeholder method, it has not been implemented yet
	*/
	HTTP.prototype.post = function () {
	};

	/*
	Function: permission(domain)
		...

	Parameters:
		domain - xxxxxxxxxxxx

	Returns:
		xxxxx

	Note:
		This is a placeholder method, it has not been implemented yet
	*/
	HTTP.prototype.permission = function (url) {
	};

	/*
	Class: Atomixapi.Apps.Api.I18N
		To be documented...

	Note:
		This is a placeholder class, it has not been implemented yet
	*/

	/*
	Constructor: I18N()
	*/
	I18N = Api.I18N = function () {};

	/*
	Function: text(text)
		Get translated text according the the context preferences

	Parameters:
		text - xxxxxxxxxxxx

	Returns:
		String - xxxxxxxxxx

	Note:
		This is a placeholder method, it has not been implemented yet
	*/
	I18N.prototype.text = function (text) {
	};

	/*
	Function: date(date, format)
		Get localized date

	Parameters:
		date - xxxxxxxxxxxx
		format - xxxxxxxxxxxx

	Returns:
		String - xxxxxxxxxxxxx

	Note:
		This is a placeholder method, it has not been implemented yet
	*/
	I18N.prototype.date = function () {
	};

	/*
	Function: time(time, format)
		Get localized time

	Parameters:
		time - xxxxxxxxxxxx
		format - xxxxxxxxxxxx

	Returns:
		String - xxxxxxxxxxxx

	Note:
		This is a placeholder method, it has not been implemented yet
	*/
	I18N.prototype.xxxxxxx = function () {
	};

	/*
	Function: currency(amount, format)
		Get localized currency

	Parameters:
		amount - xxxxxxxxxxxx
		format - xxxxxxxxxxxx

	Returns:
		String - xxxxxx

	Note:
		This is a placeholder method, it has not been implemented yet
	*/
	I18N.prototype.currency = function (amount, format) {
	};

	/*
	Class: Atomixapi.Apps.Api.Credentials
		To be documented...

	Note:
		This is a placeholder class, it has not been implemented yet
	*/

	/*
	Constructor: Credentials()
	*/
	Credentials = Api.Credentials = function () {};

	/*
	Function: set(id, string)
		Save sensible information such as username, password, nip or keys which relate to the user (this gives the user or the provider ways to manage this information more securelly depending on the context - database, internet faces, unsecure connections, etc., flush all passwords with a click)

	Parameters:
		id - xxxxxxxxxxxx
		string - xxxxxxxxxxxx

	Returns:
		Null

	Note:
		This is a placeholder method, it has not been implemented yet
	*/
	Credentials.prototype.set = function () {
	};

	/*
	Function: get(id)
		Retrieve the credentials (Could/Should this be achieved with a special type of item?)

	Parameters:
		xxxxx - xxxxxxxxxxxx

	Returns:
		String - xxxxxxxxx

	Note:
		This is a placeholder method, it has not been implemented yet
	*/
	Credentials.prototype.get = function () {
	};

}(window));

