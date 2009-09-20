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
	var Factory,
		$ = window.jQuery,
		Atomixapi = window.Atomixapi;

	/*
	Class: Atomixapi.Factory
		Class for creating new items from existing material such as text,
		url's or external documents.
		These classes permits a Atomixapi client to automate the creating of new
		and usefull items for the users by queueing requests to the various
		Atomix apps which supply "builder" classes.
		For example: A note taking app could capture any text starting
		with "FYI:" or "note:" and create a new note item.
	*/
	Atomixapi.Factory =  function () {
		this.builders = {};
	};

	Factory = Atomixapi.Factory;

	/*
	Function: build
	Instantiate new items from a base material. (This function will autodetect the type and then call <Factory.buildByType>)
	Parameters:
		material - The base material to use
	Returns:
		An array containing newly created items
	See Also:
		<buildByType>
	*/
	Factory.prototype.build = function (material) {
		console.log("Atomixapi.Factory.build", material);
		var materialType = Factory.Refinery.detectMaterialType(material);
		return this.buildByType(material, materialType);
	};

	/*
	Function: buildByType
	Instantiate new items from a base material, while specifying the type of material provided.
	Parameters:
		material - The base material to use
		materialType - The type of the material (ex.: text, url, request, htmldom, xmldom, item, collection)
	Returns:
		An array containing newly created items
	See Also:
		<build>
	*/
	Factory.prototype.buildByType = function (material, materialType) {
		var volunteer, builder, item, builders, volunteerBuilders, items = [];
		builders = Factory.FilterBuildersByMaterialType(materialType, this.builders);
		volunteerBuilders = this.getVolunteerBuilders(material, materialType, builders);
		$.each(volunteerBuilders, function(i, val){
			item = this.build(material, materialType);
			if (item) {
				items.push(item);
			}
		});
		console.log("FOLLOWING ITEMS CREATED ", items);
		return items;
	};

	Factory.RegisterBuilders = function (builders, builderGroup) {
		// Parse Instantiate and cache the builder object
		$.each(builders, function(i, val){
			builderGroup[val] = new this();
		});
	};

	Factory.FilterBuildersByMaterialType = function (materialType, builders) {
		console.log("Atomixapi.Factory.FilterBuildersByMaterialType", materialType);
		var newBuilder, filteredBuilders = [];
		$.each(builders, function(i, val){
			// If the builder has this material type, it is added in the list
			if (("//" + this.materialTypes.join("//")).indexOf("//" + materialType) + 1) {
				filteredBuilders.push(this);
			}
		});
		return filteredBuilders;
	};

	Factory.prototype.getVolunteerBuilders = function (material, materialType, builders) {
		var newVolunteer, builder,
			volunteers = [];
		for (builder in builders) {
			if (builders.hasOwnProperty(builder)) {
				newVolunteer = builders[builder];
				console.log("Asking for ", newVolunteer.id);
				newVolunteer = newVolunteer.volunteer(material, materialType);
				console.log("newVolunteer: ", newVolunteer);
				if (newVolunteer) {
					volunteers.push(newVolunteer);
				}
			}
		}
		console.log("Atomixapi.Factory.getVolunteerBuilders", material, volunteers);
		return volunteers;
	};

	Factory.Refinery = {};

	Factory.Refinery.refine = function (material) {
		console.log("Atomixapi.Factory.Refinery.refine", material);
		var refinedMaterial,
			materialType = this.detectMaterialType(material);
		if (materialType === "text") {
			refinedMaterial = this.textIntoURL(material);
		} else if (materialType === "url") {
			refinedMaterial = this.URLIntoRequest(material);
		} else if (materialType === "request") {
			refinedMaterial = this.requestIntoDOM(material);
		} else if (materialType === "xmldom") {
			refinedMaterial = this.XMLDOMIntoItem(material);
		} else if (materialType === "htmldom") {
			// Items cannot be refined further
		} else if (materialType === "item") {
			// Items cannot be refined further
			refinedMaterial = material;
		} else if (materialType === "collection") {
			// Item collections cannot be refined further
			refinedMaterial = material;
		} else {
			throw new Error("atomix.factory.refineMaterial.unknownMaterialType." + material);
		}

		// If the material has not been refined further, return it
		// else ferine the material again
		refinedMaterial = this.refiner(material);
		if (refinedMaterial !== material) {
			return this.refine(refinedMaterial);
		} else {
			return refinedMaterial;
		}
	};

	Factory.Refinery.textIntoURL = function (text) {
	};

	Factory.Refinery.URLIntoRequest = function (material) {
	};

	// Return either an XMLDOM or HTMLDOM
	Factory.Refinery.requestIntoDOM = function (material) {
	};

	Factory.Refinery.XMLDOMIntoItem = function (material) {
	};

	Factory.Refinery.XMLDOMIntoCollection = function (material) {
	};

	Factory.Refinery.detectMaterialType = function (material) {
		console.log("Atomixapi.Factory.Refinery.detectMaterialType", material);
		var materialType,
			type = typeof(material);
		if (type === "string") {
			// Test for URL, otherwise is text
			materialType = "text";
		} else if (type === "object") {
			if (type === "") {
				//check if is request
				materialType = "request";
			} else if (type === "") {
				//check if is dom
				materialType = "dom";
			} else if (type === "") {
				//check if is item
				materialType = "item";
			} else if (type === "") {
				//check if is collection
				materialType = "collection";
			} else {
				throw new Error("atomix.factory.unknownMaterialObjectType." + type);
			}
		} else {
			throw new Error("atomix.factory.unknownMaterialObjectType." + type);
		}
		console.log("Found materialType:", materialType);
		return materialType;
	};

	Factory.Builder = function () {
		this.id = "null-builder";
		this.name = "Null builder!";
		// Array containing compatible material types
		this.materialTypes = ["text"];

		this.volunteer = function (material, materialType) {
			//return [ array of new items ];
			return null;
		};
		this.build = function (material, materialType) {
			//return this;
			return null;
		};
		this.buildPreview = function (material, materialType) {
			//return this;
			return null;
		};
	};

	Factory.tests = {};

	Factory.tests.fetchText = function (text) {
		var factory = new Factory();
		Factory.RegisterBuilders([
			this.sampleBuilders.buildNote,
			this.sampleBuilders.buildWebSearch
		], factory.builders);
		console.info("factory.build()", text);
		factory.build(text);
		console.info("finished build test!");
	};

	Factory.tests.sampleBuilders = {};

	Factory.tests.sampleBuilders.buildNote = function () {
		this.id = "test-note-builder";
		this.name = "Note builder";
		this.materialTypes = ["text"];
		this.volunteer = function (material, materialType) {
			console.log("buildNote is volunteering!", material, materialType);
			if (materialType === "text") {
				if (material.substring(0, 5) === "note:") {
					return this;
				}
			}
			return null;
		};
		this.build = function (material, materialType) {
			var item = this.buildPreview(material, materialType);
			return item;
		};
		this.buildPreview = function (material, materialType) {
			var noteText, item;
			if (materialType === "text") {
				if (material.substring(0, 5) === "note:") {
					noteText = material.substring(6);
					item = new Atomixapi.Item();
					item.type = "http://notes.acme.com";
					item.title = "Note: " + noteText;
					return item;
				}
			}
			return null;
		};
	};
	Factory.tests.sampleBuilders.buildNote.prototype = Factory.Builder;

	Factory.tests.sampleBuilders.buildWebSearch = function () {
		this.id = "test-webSearch-builder";
		this.name = "Web Search builder";
		this.materialTypes = ["text", "url"];
		this.volunteer = function (material, materialType) {
			console.log("buildWebSearch is volunteering!", material, materialType);
			if (materialType === "text") {
				if (material.substring(0, 2) === "? ") {
					return this;
				}
			} else if (materialType === "url") {
				//http://www.google.com/#hl=en&source=hp&q=bunnies&aq=f&aqi=g10&oq=&fp=86f5260e043fbd8a
				if (material.hostname === "www.google.com") {
					return this;
				}
			}
			return null;
		};
		this.build = function (material, materialType) {
			var item = this.buildPreview(material, materialType);
			return item;
		};
		this.buildPreview = function (material, materialType) {
			var item,
				searchText = "";
			if (materialType === "text") {
				if (material.substring(0, 2) === "? ") {
					searchText = material.substring(3);
					item = new Atomixapi.Item();
					item.type = "http://webSearch.acme.com";
					item.title = 'Search for "' + searchText + '"';
					return item;
				}
			} else if (materialType === "url") {
				//http://www.google.com/#hl=en&source=hp&q=bunnies&aq=f&aqi=g10&oq=&fp=86f5260e043fbd8a
				if (material.hostname === "www.google.com") {
					searchText = "{PARSE LATER}";
					item = new Atomixapi.Item();
					item.type = "http://webSearch.acme.com";
					item.title = 'Search for "' + searchText + '" at ' + material.hostname;
					return item;
				}
			}
			return null;
		};
	};
	Factory.tests.sampleBuilders.buildWebSearch.prototype = Factory.Builder;

	/*
	$(document).ready(function () {
		Atomixapi.Factory.tests.fetchText("note: Bunnies are fun!");
		Atomixapi.Factory.tests.fetchText("? bunnies");
	});
	*/

}(window));

