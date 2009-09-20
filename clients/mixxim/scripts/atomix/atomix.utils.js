/*global window */

(function(window){

	/**
	* Atomix API Utility Class
	*
	* Contains:
	*	Atomixapi.Utils.Base64
	*	Atomixapi.Utils.SHA1
	*	Atomixapi.Utils.dateFormat
	*
	**/

	/**
	*
	*  Base64 encode / decode
	*  http://www.webtoolkit.info/
	*
	**/

	var Utils,
		Atomixapi = window.Atomixapi;

	/*
	Class: Atomixapi.Utils
		Static class - Various utility classes needed by the api in general. These utilities are not part of the common specs.
	*/
	Atomixapi.Utils = {};
	Utils = Atomixapi.Utils;

	Utils.Base64 = {
		// private property
		_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
		// public method for encoding
		encode : function (input) {
			var output = "";
			var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
			var i = 0;
			input = this._utf8_encode(input+"");
			while (i < input.length) {
				chr1 = input.charCodeAt(i++);
				chr2 = input.charCodeAt(i++);
				chr3 = input.charCodeAt(i++);
				enc1 = chr1 >> 2;
				enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
				enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
				enc4 = chr3 & 63;
				if (isNaN(chr2)) {
					enc3 = enc4 = 64;
				} else if (isNaN(chr3)) {
					enc4 = 64;
				}
				output = output +
				this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
				this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
			}
			return output;
		},
		// public method for decoding
		decode : function (input) {
			var output = "";
			var chr1, chr2, chr3;
			var enc1, enc2, enc3, enc4;
			var i = 0;
			input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
			while (i < input.length) {
				enc1 = this._keyStr.indexOf(input.charAt(i++));
				enc2 = this._keyStr.indexOf(input.charAt(i++));
				enc3 = this._keyStr.indexOf(input.charAt(i++));
				enc4 = this._keyStr.indexOf(input.charAt(i++));
				chr1 = (enc1 << 2) | (enc2 >> 4);
				chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
				chr3 = ((enc3 & 3) << 6) | enc4;
				output = output + String.fromCharCode(chr1);
				if (enc3 != 64) {
					output = output + String.fromCharCode(chr2);
				}
				if (enc4 != 64) {
					output = output + String.fromCharCode(chr3);
				}
			}
			output = this._utf8_decode(output);
			return output;
		},
		// private method for UTF-8 encoding
		_utf8_encode : function (string) {
			string = string.replace(/\r\n/g,"\n");
			var utftext = "";
			for (var n = 0; n < string.length; n++) {
				var c = string.charCodeAt(n);
				if (c < 128) {
					utftext += String.fromCharCode(c);
				}
				else if((c > 127) && (c < 2048)) {
					utftext += String.fromCharCode((c >> 6) | 192);
					utftext += String.fromCharCode((c & 63) | 128);
				}
				else {
					utftext += String.fromCharCode((c >> 12) | 224);
					utftext += String.fromCharCode(((c >> 6) & 63) | 128);
					utftext += String.fromCharCode((c & 63) | 128);
				}
			}
			return utftext;
		},
		// private method for UTF-8 decoding
		_utf8_decode : function (utftext) {
			var string = "";
			var i = 0;
			var c = c1 = c2 = 0;
			while ( i < utftext.length ) {
				c = utftext.charCodeAt(i);
				if (c < 128) {
					string += String.fromCharCode(c);
					i++;
				}
				else if((c > 191) && (c < 224)) {
					c2 = utftext.charCodeAt(i+1);
					string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
					i += 2;
				}
				else {
					c2 = utftext.charCodeAt(i+1);
					c3 = utftext.charCodeAt(i+2);
					string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
					i += 3;
				}
			}
			return string;
		}
	}
	
	
	/**
	*
	*  Secure Hash Algorithm (SHA1)
	*  http://www.webtoolkit.info/
	*
	**/
	
	Utils.SHA1 = function(msg) {
	
		function rotate_left(n,s) {
			var t4 = ( n<<s ) | (n>>>(32-s));
			return t4;
		};
	
		function lsb_hex(val) {
			var str="";
			var i;
			var vh;
			var vl;
	
			for( i=0; i<=6; i+=2 ) {
				vh = (val>>>(i*4+4))&0x0f;
				vl = (val>>>(i*4))&0x0f;
				str += vh.toString(16) + vl.toString(16);
			}
			return str;
		};
	
		function cvt_hex(val) {
			var str="";
			var i;
			var v;
	
			for( i=7; i>=0; i-- ) {
				v = (val>>>(i*4))&0x0f;
				str += v.toString(16);
			}
			return str;
		};
	
	
		function Utf8Encode(string) {
			string = string.replace(/\r\n/g,"\n");
			var utftext = "";
	
			for (var n = 0; n < string.length; n++) {
	
				var c = string.charCodeAt(n);
	
				if (c < 128) {
					utftext += String.fromCharCode(c);
				}
				else if((c > 127) && (c < 2048)) {
					utftext += String.fromCharCode((c >> 6) | 192);
					utftext += String.fromCharCode((c & 63) | 128);
				}
				else {
					utftext += String.fromCharCode((c >> 12) | 224);
					utftext += String.fromCharCode(((c >> 6) & 63) | 128);
					utftext += String.fromCharCode((c & 63) | 128);
				}
	
			}
	
			return utftext;
		};
	
		var blockstart;
		var i, j;
		var W = new Array(80);
		var H0 = 0x67452301;
		var H1 = 0xEFCDAB89;
		var H2 = 0x98BADCFE;
		var H3 = 0x10325476;
		var H4 = 0xC3D2E1F0;
		var A, B, C, D, E;
		var temp;
	
		msg = Utf8Encode(msg);
	
		var msg_len = msg.length;
	
		var word_array = new Array();
		for( i=0; i<msg_len-3; i+=4 ) {
			j = msg.charCodeAt(i)<<24 | msg.charCodeAt(i+1)<<16 |
			msg.charCodeAt(i+2)<<8 | msg.charCodeAt(i+3);
			word_array.push( j );
		}
	
		switch( msg_len % 4 ) {
			case 0:
				i = 0x080000000;
			break;
			case 1:
				i = msg.charCodeAt(msg_len-1)<<24 | 0x0800000;
			break;
	
			case 2:
				i = msg.charCodeAt(msg_len-2)<<24 | msg.charCodeAt(msg_len-1)<<16 | 0x08000;
			break;
	
			case 3:
				i = msg.charCodeAt(msg_len-3)<<24 | msg.charCodeAt(msg_len-2)<<16 | msg.charCodeAt(msg_len-1)<<8	| 0x80;
			break;
		}
	
		word_array.push( i );
	
		while( (word_array.length % 16) != 14 ) word_array.push( 0 );
	
		word_array.push( msg_len>>>29 );
		word_array.push( (msg_len<<3)&0x0ffffffff );
	
	
		for ( blockstart=0; blockstart<word_array.length; blockstart+=16 ) {
	
			for( i=0; i<16; i++ ) W[i] = word_array[blockstart+i];
			for( i=16; i<=79; i++ ) W[i] = rotate_left(W[i-3] ^ W[i-8] ^ W[i-14] ^ W[i-16], 1);
	
			A = H0;
			B = H1;
			C = H2;
			D = H3;
			E = H4;
	
			for( i= 0; i<=19; i++ ) {
				temp = (rotate_left(A,5) + ((B&C) | (~B&D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
				E = D;
				D = C;
				C = rotate_left(B,30);
				B = A;
				A = temp;
			}
	
			for( i=20; i<=39; i++ ) {
				temp = (rotate_left(A,5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
				E = D;
				D = C;
				C = rotate_left(B,30);
				B = A;
				A = temp;
			}
	
			for( i=40; i<=59; i++ ) {
				temp = (rotate_left(A,5) + ((B&C) | (B&D) | (C&D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
				E = D;
				D = C;
				C = rotate_left(B,30);
				B = A;
				A = temp;
			}
	
			for( i=60; i<=79; i++ ) {
				temp = (rotate_left(A,5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
				E = D;
				D = C;
				C = rotate_left(B,30);
				B = A;
				A = temp;
			}
	
			H0 = (H0 + A) & 0x0ffffffff;
			H1 = (H1 + B) & 0x0ffffffff;
			H2 = (H2 + C) & 0x0ffffffff;
			H3 = (H3 + D) & 0x0ffffffff;
			H4 = (H4 + E) & 0x0ffffffff;
	
		}
	
		var temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);
	
		return temp.toLowerCase();
	
	}

	/*
	 * Date Format 1.2.3
	 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
	 * MIT license
	 *
	 * Includes enhancements by Scott Trenda <scott.trenda.net>
	 * and Kris Kowal <cixar.com/~kris.kowal/>
	 *
	 * Accepts a date, a mask, or a date and a mask.
	 * Returns a formatted version of the given date.
	 * The date defaults to the current date/time.
	 * The mask defaults to dateFormat.masks.default.
	 */
	
	Utils.dateFormat = (function(){
		var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
			timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
			timezoneClip = /[^-+\dA-Z]/g,
			pad = function (val, len) {
				val = String(val);
				len = len || 2;
				while (val.length < len) val = "0" + val;
				return val;
			};
	
		// Regexes and supporting functions are cached through closure
		var dateFormat = function (date, mask, utc) {
	
			// You can't provide utc if you skip other args (use the "UTC:" mask prefix)
			if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
				mask = date;
				date = undefined;
			}
	
			// Passing date through Date applies Date.parse, if necessary
			date = date ? new Date(date) : new Date;
			if (isNaN(date)) throw SyntaxError("invalid date");
	
			mask = String(dateFormat.masks[mask] || mask || dateFormat.masks["default"]);
	
			// Allow setting the utc argument via the mask
			if (mask.slice(0, 4) == "UTC:") {
				mask = mask.slice(4);
				utc = true;
			}
	
			var	_ = utc ? "getUTC" : "get",
				d = date[_ + "Date"](),
				D = date[_ + "Day"](),
				m = date[_ + "Month"](),
				y = date[_ + "FullYear"](),
				H = date[_ + "Hours"](),
				M = date[_ + "Minutes"](),
				s = date[_ + "Seconds"](),
				L = date[_ + "Milliseconds"](),
				o = utc ? 0 : date.getTimezoneOffset(),
				flags = {
					d:    d,
					dd:   pad(d),
					ddd:  dateFormat.i18n.dayNames[D],
					dddd: dateFormat.i18n.dayNames[D + 7],
					m:    m + 1,
					mm:   pad(m + 1),
					mmm:  dateFormat.i18n.monthNames[m],
					mmmm: dateFormat.i18n.monthNames[m + 12],
					yy:   String(y).slice(2),
					yyyy: y,
					h:    H % 12 || 12,
					hh:   pad(H % 12 || 12),
					H:    H,
					HH:   pad(H),
					M:    M,
					MM:   pad(M),
					s:    s,
					ss:   pad(s),
					l:    pad(L, 3),
					L:    pad(L > 99 ? Math.round(L / 10) : L),
					t:    H < 12 ? "a"  : "p",
					tt:   H < 12 ? "am" : "pm",
					T:    H < 12 ? "A"  : "P",
					TT:   H < 12 ? "AM" : "PM",
					Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
					o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
					S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
				};
	
			return mask.replace(token, function ($0) {
				return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
			});
		};
	
		// Some common format strings
		dateFormat.masks = {
			"default":      "ddd mmm dd yyyy HH:MM:ss",
			shortDate:      "m/d/yy",
			mediumDate:     "mmm d, yyyy",
			longDate:       "mmmm d, yyyy",
			fullDate:       "dddd, mmmm d, yyyy",
			shortTime:      "h:MM TT",
			mediumTime:     "h:MM:ss TT",
			longTime:       "h:MM:ss TT Z",
			isoDate:        "yyyy-mm-dd",
			isoTime:        "HH:MM:ss",
			isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
			isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
		};
	
		// Internationalization strings
		dateFormat.i18n = {
			dayNames: [
				"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
				"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
			],
			monthNames: [
				"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
				"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
			]
		};
	
		return dateFormat;
	})();
	
	
	/*
	Normalized URL / Location Object
	Reference: http://www.daniweb.com/code/snippet217388.html#
	by AirShow May 27th, 2009
	*/
	Utils.Location = function (locObj) {
	   /*** URL ***********************************************
		*** A constructor function ****************************
		*** by Airshow ****************************************
		*** http://www.daniweb.com/forums/member512379.html ***
		*** Please keep this attribution intact ***************/
		if(!locObj || typeof locObj === 'string') {
			var temp = (!locObj) ? '' : locObj;
			var locObj = document.createElement('a');
			locObj.href = temp;
		}
		this.href = locObj.href;
		this.protocol = '';
		this.hostname = '';
		this.port = '';
		this.host = '';
		this.pathname = '';
		this.search = '';
		this.hash = '';
		this.setFragments = function(frags, commitIt) {
			frags = (!frags || typeof frags !== 'object') ? null : frags;
			commitIt = (!commitIt) ? false : true;
			if(frags) {
				for(prop in frags) {
					if('protocol,hostname,port,pathname,search,hash'.indexOf(prop) == -1) { continue; }//Reject irrelevant props
					// Note: For simplicity, 'host' is excluded as URL.host comprises ( URL.hostname + : + URL.port ), which can be set separately.
					this[prop] = frags[prop];
				}
				this.host = [this.hostname, this.port].join(':'); //In case .hostname or .port have changed.
			}
			(commitIt) ? this.commit() : (this.href = this.compose());
			return commitIt;
		};
		this.setHREF = function(href, commitIt) {
			href = (!href || typeof href !== 'string') ? '' : href;
			commitIt = (!commitIt) ? false : true;
			this.decompose();
			(commitIt) ? this.commit() : (this.href = this.compose());
			return commitIt;
		};
		this.commit = function() { return locObj.href = this.href = this.compose(); };
		this.compose = function() {
			// Build full href from the component fragments, including delimiter characters between each fragment.
			// For most fragments we check that delimiters are not already included, though decompose() should have already ensured thier removal. (belt-and-braces)
			var href = this.protocol + ((this.protocol !== '') ? ":\/\/" : '') +
				   this.hostname +
				   ((this.port     !== '' && !this.pathname.match(/^[:]/))  ? ':' : '') + this.port +
				   (((this.protocol || this.hostname || this.port) && this.pathname && !this.pathname.match(/^[./]/)) ? '/' : '') + this.pathname +
				   ((this.search   !== '' && !this.pathname.match(/^[?]/))  ? '?' : '') + this.search +
				   ((this.hash     !== '' && !this.pathname.match(/^[#]/))  ? '#' : '') + this.hash;
			return href;
		};
		this.decompose = function() {
			this.protocol = locObj.protocol.replace(/:$/, '');//All tested browsers leave the terminal : but let's strip it in case some don't.
			this.hostname = locObj.hostname;//Mmm, nothing to strip.
			this.port     = locObj.port.replace(/^:/, '');//All tested browsers strip the leading : but let's strip it in case some don't.
			this.host     = [this.hostname, this.port].join(':');//Build the composite fragment .host, in case someone expects it.
			this.pathname = locObj.pathname.replace(/^[/]/, '').replace(/\\/g, '/'); //Differences (flaws?) in Firefox and IE6 respectively, so let's standardise.
			this.search   = locObj.search.replace(/^[?]/, '');//All tested browsers leave the leading ? but let's strip it in case some don't
			this.hash     = locObj.hash.replace(/^[#]/, '');//All tested browsers leave the leading # but let's strip it in case some don't
			if(this.compose() === '') { this.pathname = locObj.href; }//Special case for relative urls
		};
		this.getLink = function() {
			if(!locObj.tagName) {// Allow a link to be returned even when a window.location object was passed in as locObj.
				var L = new LOCATION(this.compose());//single level recursion to create a "type 2" link.
				return L.getLink();
			}
			return locObj;
		};
		this.inspect = function(wrapperID) {//included to assist debugging
			// If href and compose() strings are differnt then somthing is wrong; 
			// your url is of an unsupported type and you will need to modify decompose() and/or compose().
			strArray = [];
			strArray.push('<b>protocol</b></td><td>'  + this.protocol);
			strArray.push('<b>hostname</b></td><td>'  + this.hostname);
			strArray.push('<b>port</b></td><td>'      + this.port);
			strArray.push('<b>pathname</b></td><td>'  + this.pathname);
			strArray.push('<b>search</b></td><td>'    + this.search);
			strArray.push('<b>hash</b></td><td>'      + this.hash);
			strArray.push('<b>href</b></td><td>'      + this.href);
			strArray.push('<b>committed</b></td><td>' + locObj.href);
			var str = '<table class="locationInspect" border cellpadding="3"><tr><td>' + strArray.join("</td></tr><tr><td>") + '</td></tr></table>';
			var wrapper = (document.getElementById) ? document.getElementById(wrapperID) : document.all[wrapperID];
			if(wrapper) { wrapper.innerHTML = str; }
			return str;
		};
		this.decompose();
	}
	
})(window);
