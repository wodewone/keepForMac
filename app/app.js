webpackJsonp([0],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(1);
	__webpack_require__(111);
	module.exports = __webpack_require__(113);


/***/ },

/***/ 1:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(__resourceQuery) {var url = __webpack_require__(2);
	var stripAnsi = __webpack_require__(3);
	var socket = __webpack_require__(5);

	function getCurrentScriptSource() {
		// `document.currentScript` is the most accurate way to find the current script,
		// but is not supported in all browsers.
		if(document.currentScript)
			return document.currentScript.getAttribute("src");
		// Fall back to getting all scripts in the document.
		var scriptElements = document.scripts || [];
		var currentScript = scriptElements[scriptElements.length - 1];
		if(currentScript)
			return currentScript.getAttribute("src");
		// Fail as there was no script to use.
		throw new Error("[WDS] Failed to get current script source");
	}

	var urlParts;
	if(true) {
		// If this bundle is inlined, use the resource query to get the correct url.
		urlParts = url.parse(__resourceQuery.substr(1));
	} else {
		// Else, get the url from the <script> this file was called with.
		var scriptHost = getCurrentScriptSource();
		scriptHost = scriptHost.replace(/\/[^\/]+$/, "");
		urlParts = url.parse((scriptHost ? scriptHost : "/"), false, true);
	}

	var hot = false;
	var initial = true;
	var currentHash = "";
	var logLevel = "info";

	function log(level, msg) {
		if(logLevel === "info" && level === "info")
			return console.log(msg);
		if(["info", "warning"].indexOf(logLevel) >= 0 && level === "warning")
			return console.warn(msg);
		if(["info", "warning", "error"].indexOf(logLevel) >= 0 && level === "error")
			return console.error(msg);
	}

	var onSocketMsg = {
		hot: function() {
			hot = true;
			log("info", "[WDS] Hot Module Replacement enabled.");
		},
		invalid: function() {
			log("info", "[WDS] App updated. Recompiling...");
		},
		hash: function(hash) {
			currentHash = hash;
		},
		"still-ok": function() {
			log("info", "[WDS] Nothing changed.")
		},
		"log-level": function(level) {
			logLevel = level;
		},
		ok: function() {
			if(initial) return initial = false;
			reloadApp();
		},
		warnings: function(warnings) {
			log("info", "[WDS] Warnings while compiling.");
			for(var i = 0; i < warnings.length; i++)
				console.warn(stripAnsi(warnings[i]));
			if(initial) return initial = false;
			reloadApp();
		},
		errors: function(errors) {
			log("info", "[WDS] Errors while compiling.");
			for(var i = 0; i < errors.length; i++)
				console.error(stripAnsi(errors[i]));
			if(initial) return initial = false;
			reloadApp();
		},
		"proxy-error": function(errors) {
			log("info", "[WDS] Proxy error.");
			for(var i = 0; i < errors.length; i++)
				log("error", stripAnsi(errors[i]));
			if(initial) return initial = false;
		},
		close: function() {
			log("error", "[WDS] Disconnected!");
		}
	};

	var hostname = urlParts.hostname;
	var protocol = urlParts.protocol;

	if(urlParts.hostname === '0.0.0.0') {
		// why do we need this check?
		// hostname n/a for file protocol (example, when using electron, ionic)
		// see: https://github.com/webpack/webpack-dev-server/pull/384
		if(window.location.hostname && !!~window.location.protocol.indexOf('http')) {
			hostname = window.location.hostname;
		}
	}

	// `hostname` can be empty when the script path is relative. In that case, specifying
	// a protocol would result in an invalid URL.
	// When https is used in the app, secure websockets are always necessary
	// because the browser doesn't accept non-secure websockets.
	if(hostname && (window.location.protocol === "https:" || urlParts.hostname === '0.0.0.0')) {
		protocol = window.location.protocol;
	}

	var socketUrl = url.format({
		protocol: protocol,
		auth: urlParts.auth,
		hostname: hostname,
		port: (urlParts.port === '0') ? window.location.port : urlParts.port,
		pathname: urlParts.path == null || urlParts.path === '/' ? "/sockjs-node" : urlParts.path
	});

	socket(socketUrl, onSocketMsg);

	function reloadApp() {
		if(hot) {
			log("info", "[WDS] App hot update...");
			window.postMessage("webpackHotUpdate" + currentHash, "*");
		} else {
			log("info", "[WDS] App updated. Reloading...");
			window.location.reload();
		}
	}

	/* WEBPACK VAR INJECTION */}.call(exports, "?http://localhost:3000"))

/***/ },

/***/ 2:
/***/ function(module, exports) {

	module.exports = require("url");

/***/ },

/***/ 3:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var ansiRegex = __webpack_require__(4)();

	module.exports = function (str) {
		return typeof str === 'string' ? str.replace(ansiRegex, '') : str;
	};


/***/ },

/***/ 4:
/***/ function(module, exports) {

	'use strict';
	module.exports = function () {
		return /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
	};


/***/ },

/***/ 5:
/***/ function(module, exports, __webpack_require__) {

	var SockJS = __webpack_require__(6);

	var retries = 0;
	var sock = null;

	function socket(url, handlers) {
		sock = new SockJS(url);

		sock.onopen = function() {
			retries = 0;
		}

		sock.onclose = function() {
			if(retries === 0)
				handlers.close();

			// Try to reconnect.
			sock = null;

			// After 10 retries stop trying, to prevent logspam.
			if(retries <= 10) {
				// Exponentially increase timeout to reconnect.
				// Respectfully copied from the package `got`.
				var retryInMs = 1000 * Math.pow(2, retries) + Math.random() * 100;
				retries += 1;

				setTimeout(function() {
					socket(url, handlers);
				}, retryInMs);
			}
		};

		sock.onmessage = function(e) {
			// This assumes that all data sent via the websocket is JSON.
			var msg = JSON.parse(e.data);
			if(handlers[msg.type])
				handlers[msg.type](msg.data);
		};
	}

	module.exports = socket;


/***/ },

/***/ 6:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var transportList = __webpack_require__(7);

	module.exports = __webpack_require__(94)(transportList);

	// TODO can't get rid of this until all servers do
	if ('_sockjs_onload' in global) {
	  setTimeout(global._sockjs_onload, 1);
	}


/***/ },

/***/ 7:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = [
	  // streaming transports
	  __webpack_require__(8)
	, __webpack_require__(59)
	, __webpack_require__(71)
	, __webpack_require__(73)
	, __webpack_require__(79)(__webpack_require__(73))

	  // polling transports
	, __webpack_require__(87)
	, __webpack_require__(79)(__webpack_require__(87))
	, __webpack_require__(89)
	, __webpack_require__(90)
	, __webpack_require__(79)(__webpack_require__(89))
	, __webpack_require__(91)
	];


/***/ },

/***/ 8:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(9)
	  , urlUtils = __webpack_require__(12)
	  , inherits = __webpack_require__(26)
	  , EventEmitter = __webpack_require__(28).EventEmitter
	  , WebsocketDriver = __webpack_require__(29)
	  ;

	var debug = function() {};
	if ((undefined) !== 'production') {
	  debug = __webpack_require__(17)('sockjs-client:websocket');
	}

	function WebSocketTransport(transUrl, ignore, options) {
	  if (!WebSocketTransport.enabled()) {
	    throw new Error('Transport created when disabled');
	  }

	  EventEmitter.call(this);
	  debug('constructor', transUrl);

	  var self = this;
	  var url = urlUtils.addPath(transUrl, '/websocket');
	  if (url.slice(0, 5) === 'https') {
	    url = 'wss' + url.slice(5);
	  } else {
	    url = 'ws' + url.slice(4);
	  }
	  this.url = url;

	  this.ws = new WebsocketDriver(this.url, [], options);
	  this.ws.onmessage = function(e) {
	    debug('message event', e.data);
	    self.emit('message', e.data);
	  };
	  // Firefox has an interesting bug. If a websocket connection is
	  // created after onunload, it stays alive even when user
	  // navigates away from the page. In such situation let's lie -
	  // let's not open the ws connection at all. See:
	  // https://github.com/sockjs/sockjs-client/issues/28
	  // https://bugzilla.mozilla.org/show_bug.cgi?id=696085
	  this.unloadRef = utils.unloadAdd(function() {
	    debug('unload');
	    self.ws.close();
	  });
	  this.ws.onclose = function(e) {
	    debug('close event', e.code, e.reason);
	    self.emit('close', e.code, e.reason);
	    self._cleanup();
	  };
	  this.ws.onerror = function(e) {
	    debug('error event', e);
	    self.emit('close', 1006, 'WebSocket connection broken');
	    self._cleanup();
	  };
	}

	inherits(WebSocketTransport, EventEmitter);

	WebSocketTransport.prototype.send = function(data) {
	  var msg = '[' + data + ']';
	  debug('send', msg);
	  this.ws.send(msg);
	};

	WebSocketTransport.prototype.close = function() {
	  debug('close');
	  if (this.ws) {
	    this.ws.close();
	  }
	  this._cleanup();
	};

	WebSocketTransport.prototype._cleanup = function() {
	  debug('_cleanup');
	  var ws = this.ws;
	  if (ws) {
	    ws.onmessage = ws.onclose = ws.onerror = null;
	  }
	  utils.unloadDel(this.unloadRef);
	  this.unloadRef = this.ws = null;
	  this.removeAllListeners();
	};

	WebSocketTransport.enabled = function() {
	  debug('enabled');
	  return !!WebsocketDriver;
	};
	WebSocketTransport.transportName = 'websocket';

	// In theory, ws should require 1 round trip. But in chrome, this is
	// not very stable over SSL. Most likely a ws connection requires a
	// separate SSL connection, in which case 2 round trips are an
	// absolute minumum.
	WebSocketTransport.roundTrips = 2;

	module.exports = WebSocketTransport;


/***/ },

/***/ 9:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var random = __webpack_require__(10);

	var onUnload = {}
	  , afterUnload = false
	    // detect google chrome packaged apps because they don't allow the 'unload' event
	  , isChromePackagedApp = global.chrome && global.chrome.app && global.chrome.app.runtime
	  ;

	module.exports = {
	  attachEvent: function(event, listener) {
	    if (typeof global.addEventListener !== 'undefined') {
	      global.addEventListener(event, listener, false);
	    } else if (global.document && global.attachEvent) {
	      // IE quirks.
	      // According to: http://stevesouders.com/misc/test-postmessage.php
	      // the message gets delivered only to 'document', not 'window'.
	      global.document.attachEvent('on' + event, listener);
	      // I get 'window' for ie8.
	      global.attachEvent('on' + event, listener);
	    }
	  }

	, detachEvent: function(event, listener) {
	    if (typeof global.addEventListener !== 'undefined') {
	      global.removeEventListener(event, listener, false);
	    } else if (global.document && global.detachEvent) {
	      global.document.detachEvent('on' + event, listener);
	      global.detachEvent('on' + event, listener);
	    }
	  }

	, unloadAdd: function(listener) {
	    if (isChromePackagedApp) {
	      return null;
	    }

	    var ref = random.string(8);
	    onUnload[ref] = listener;
	    if (afterUnload) {
	      setTimeout(this.triggerUnloadCallbacks, 0);
	    }
	    return ref;
	  }

	, unloadDel: function(ref) {
	    if (ref in onUnload) {
	      delete onUnload[ref];
	    }
	  }

	, triggerUnloadCallbacks: function() {
	    for (var ref in onUnload) {
	      onUnload[ref]();
	      delete onUnload[ref];
	    }
	  }
	};

	var unloadTriggered = function() {
	  if (afterUnload) {
	    return;
	  }
	  afterUnload = true;
	  module.exports.triggerUnloadCallbacks();
	};

	// 'unload' alone is not reliable in opera within an iframe, but we
	// can't use `beforeunload` as IE fires it on javascript: links.
	if (!isChromePackagedApp) {
	  module.exports.attachEvent('unload', unloadTriggered);
	}


/***/ },

/***/ 10:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/* global crypto:true */
	var crypto = __webpack_require__(11);

	// This string has length 32, a power of 2, so the modulus doesn't introduce a
	// bias.
	var _randomStringChars = 'abcdefghijklmnopqrstuvwxyz012345';
	module.exports = {
	  string: function(length) {
	    var max = _randomStringChars.length;
	    var bytes = crypto.randomBytes(length);
	    var ret = [];
	    for (var i = 0; i < length; i++) {
	      ret.push(_randomStringChars.substr(bytes[i] % max, 1));
	    }
	    return ret.join('');
	  }

	, number: function(max) {
	    return Math.floor(Math.random() * max);
	  }

	, numberString: function(max) {
	    var t = ('' + (max - 1)).length;
	    var p = new Array(t + 1).join('0');
	    return (p + this.number(max)).slice(-t);
	  }
	};


/***/ },

/***/ 11:
/***/ function(module, exports) {

	module.exports = require("crypto");

/***/ },

/***/ 12:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var URL = __webpack_require__(13);

	var debug = function() {};
	if ((undefined) !== 'production') {
	  debug = __webpack_require__(17)('sockjs-client:utils:url');
	}

	module.exports = {
	  getOrigin: function(url) {
	    if (!url) {
	      return null;
	    }

	    var p = new URL(url);
	    if (p.protocol === 'file:') {
	      return null;
	    }

	    var port = p.port;
	    if (!port) {
	      port = (p.protocol === 'https:') ? '443' : '80';
	    }

	    return p.protocol + '//' + p.hostname + ':' + port;
	  }

	, isOriginEqual: function(a, b) {
	    var res = this.getOrigin(a) === this.getOrigin(b);
	    debug('same', a, b, res);
	    return res;
	  }

	, isSchemeEqual: function(a, b) {
	    return (a.split(':')[0] === b.split(':')[0]);
	  }

	, addPath: function (url, path) {
	    var qs = url.split('?');
	    return qs[0] + path + (qs[1] ? '?' + qs[1] : '');
	  }

	, addQuery: function (url, q) {
	    return url + (url.indexOf('?') === -1 ? ('?' + q) : ('&' + q));
	  }
	};


/***/ },

/***/ 13:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var required = __webpack_require__(14)
	  , lolcation = __webpack_require__(15)
	  , qs = __webpack_require__(16)
	  , protocolre = /^([a-z][a-z0-9.+-]*:)?(\/\/)?([\S\s]*)/i;

	/**
	 * These are the parse rules for the URL parser, it informs the parser
	 * about:
	 *
	 * 0. The char it Needs to parse, if it's a string it should be done using
	 *    indexOf, RegExp using exec and NaN means set as current value.
	 * 1. The property we should set when parsing this value.
	 * 2. Indication if it's backwards or forward parsing, when set as number it's
	 *    the value of extra chars that should be split off.
	 * 3. Inherit from location if non existing in the parser.
	 * 4. `toLowerCase` the resulting value.
	 */
	var rules = [
	  ['#', 'hash'],                        // Extract from the back.
	  ['?', 'query'],                       // Extract from the back.
	  ['/', 'pathname'],                    // Extract from the back.
	  ['@', 'auth', 1],                     // Extract from the front.
	  [NaN, 'host', undefined, 1, 1],       // Set left over value.
	  [/:(\d+)$/, 'port', undefined, 1],    // RegExp the back.
	  [NaN, 'hostname', undefined, 1, 1]    // Set left over.
	];

	/**
	 * @typedef ProtocolExtract
	 * @type Object
	 * @property {String} protocol Protocol matched in the URL, in lowercase.
	 * @property {Boolean} slashes `true` if protocol is followed by "//", else `false`.
	 * @property {String} rest Rest of the URL that is not part of the protocol.
	 */

	/**
	 * Extract protocol information from a URL with/without double slash ("//").
	 *
	 * @param {String} address URL we want to extract from.
	 * @return {ProtocolExtract} Extracted information.
	 * @api private
	 */
	function extractProtocol(address) {
	  var match = protocolre.exec(address);

	  return {
	    protocol: match[1] ? match[1].toLowerCase() : '',
	    slashes: !!match[2],
	    rest: match[3]
	  };
	}

	/**
	 * Resolve a relative URL pathname against a base URL pathname.
	 *
	 * @param {String} relative Pathname of the relative URL.
	 * @param {String} base Pathname of the base URL.
	 * @return {String} Resolved pathname.
	 * @api private
	 */
	function resolve(relative, base) {
	  var path = (base || '/').split('/').slice(0, -1).concat(relative.split('/'))
	    , i = path.length
	    , last = path[i - 1]
	    , unshift = false
	    , up = 0;

	  while (i--) {
	    if (path[i] === '.') {
	      path.splice(i, 1);
	    } else if (path[i] === '..') {
	      path.splice(i, 1);
	      up++;
	    } else if (up) {
	      if (i === 0) unshift = true;
	      path.splice(i, 1);
	      up--;
	    }
	  }

	  if (unshift) path.unshift('');
	  if (last === '.' || last === '..') path.push('');

	  return path.join('/');
	}

	/**
	 * The actual URL instance. Instead of returning an object we've opted-in to
	 * create an actual constructor as it's much more memory efficient and
	 * faster and it pleases my OCD.
	 *
	 * @constructor
	 * @param {String} address URL we want to parse.
	 * @param {Object|String} location Location defaults for relative paths.
	 * @param {Boolean|Function} parser Parser for the query string.
	 * @api public
	 */
	function URL(address, location, parser) {
	  if (!(this instanceof URL)) {
	    return new URL(address, location, parser);
	  }

	  var relative, extracted, parse, instruction, index, key
	    , instructions = rules.slice()
	    , type = typeof location
	    , url = this
	    , i = 0;

	  //
	  // The following if statements allows this module two have compatibility with
	  // 2 different API:
	  //
	  // 1. Node.js's `url.parse` api which accepts a URL, boolean as arguments
	  //    where the boolean indicates that the query string should also be parsed.
	  //
	  // 2. The `URL` interface of the browser which accepts a URL, object as
	  //    arguments. The supplied object will be used as default values / fall-back
	  //    for relative paths.
	  //
	  if ('object' !== type && 'string' !== type) {
	    parser = location;
	    location = null;
	  }

	  if (parser && 'function' !== typeof parser) parser = qs.parse;

	  location = lolcation(location);

	  //
	  // Extract protocol information before running the instructions.
	  //
	  extracted = extractProtocol(address || '');
	  relative = !extracted.protocol && !extracted.slashes;
	  url.slashes = extracted.slashes || relative && location.slashes;
	  url.protocol = extracted.protocol || location.protocol || '';
	  address = extracted.rest;

	  //
	  // When the authority component is absent the URL starts with a path
	  // component.
	  //
	  if (!extracted.slashes) instructions[2] = [/(.*)/, 'pathname'];

	  for (; i < instructions.length; i++) {
	    instruction = instructions[i];
	    parse = instruction[0];
	    key = instruction[1];

	    if (parse !== parse) {
	      url[key] = address;
	    } else if ('string' === typeof parse) {
	      if (~(index = address.indexOf(parse))) {
	        if ('number' === typeof instruction[2]) {
	          url[key] = address.slice(0, index);
	          address = address.slice(index + instruction[2]);
	        } else {
	          url[key] = address.slice(index);
	          address = address.slice(0, index);
	        }
	      }
	    } else if (index = parse.exec(address)) {
	      url[key] = index[1];
	      address = address.slice(0, index.index);
	    }

	    url[key] = url[key] || (
	      relative && instruction[3] ? location[key] || '' : ''
	    );

	    //
	    // Hostname, host and protocol should be lowercased so they can be used to
	    // create a proper `origin`.
	    //
	    if (instruction[4]) url[key] = url[key].toLowerCase();
	  }

	  //
	  // Also parse the supplied query string in to an object. If we're supplied
	  // with a custom parser as function use that instead of the default build-in
	  // parser.
	  //
	  if (parser) url.query = parser(url.query);

	  //
	  // If the URL is relative, resolve the pathname against the base URL.
	  //
	  if (
	      relative
	    && location.slashes
	    && url.pathname.charAt(0) !== '/'
	    && (url.pathname !== '' || location.pathname !== '')
	  ) {
	    url.pathname = resolve(url.pathname, location.pathname);
	  }

	  //
	  // We should not add port numbers if they are already the default port number
	  // for a given protocol. As the host also contains the port number we're going
	  // override it with the hostname which contains no port number.
	  //
	  if (!required(url.port, url.protocol)) {
	    url.host = url.hostname;
	    url.port = '';
	  }

	  //
	  // Parse down the `auth` for the username and password.
	  //
	  url.username = url.password = '';
	  if (url.auth) {
	    instruction = url.auth.split(':');
	    url.username = instruction[0] || '';
	    url.password = instruction[1] || '';
	  }

	  url.origin = url.protocol && url.host && url.protocol !== 'file:'
	    ? url.protocol +'//'+ url.host
	    : 'null';

	  //
	  // The href is just the compiled result.
	  //
	  url.href = url.toString();
	}

	/**
	 * This is convenience method for changing properties in the URL instance to
	 * insure that they all propagate correctly.
	 *
	 * @param {String} part          Property we need to adjust.
	 * @param {Mixed} value          The newly assigned value.
	 * @param {Boolean|Function} fn  When setting the query, it will be the function
	 *                               used to parse the query.
	 *                               When setting the protocol, double slash will be
	 *                               removed from the final url if it is true.
	 * @returns {URL}
	 * @api public
	 */
	URL.prototype.set = function set(part, value, fn) {
	  var url = this;

	  switch (part) {
	    case 'query':
	      if ('string' === typeof value && value.length) {
	        value = (fn || qs.parse)(value);
	      }

	      url[part] = value;
	      break;

	    case 'port':
	      url[part] = value;

	      if (!required(value, url.protocol)) {
	        url.host = url.hostname;
	        url[part] = '';
	      } else if (value) {
	        url.host = url.hostname +':'+ value;
	      }

	      break;

	    case 'hostname':
	      url[part] = value;

	      if (url.port) value += ':'+ url.port;
	      url.host = value;
	      break;

	    case 'host':
	      url[part] = value;

	      if (/:\d+$/.test(value)) {
	        value = value.split(':');
	        url.port = value.pop();
	        url.hostname = value.join(':');
	      } else {
	        url.hostname = value;
	        url.port = '';
	      }

	      break;

	    case 'protocol':
	      url.protocol = value.toLowerCase();
	      url.slashes = !fn;
	      break;

	    case 'pathname':
	      url.pathname = value.length && value.charAt(0) !== '/' ? '/' + value : value;

	      break;

	    default:
	      url[part] = value;
	  }

	  for (var i = 0; i < rules.length; i++) {
	    var ins = rules[i];

	    if (ins[4]) url[ins[1]] = url[ins[1]].toLowerCase();
	  }

	  url.origin = url.protocol && url.host && url.protocol !== 'file:'
	    ? url.protocol +'//'+ url.host
	    : 'null';

	  url.href = url.toString();

	  return url;
	};

	/**
	 * Transform the properties back in to a valid and full URL string.
	 *
	 * @param {Function} stringify Optional query stringify function.
	 * @returns {String}
	 * @api public
	 */
	URL.prototype.toString = function toString(stringify) {
	  if (!stringify || 'function' !== typeof stringify) stringify = qs.stringify;

	  var query
	    , url = this
	    , protocol = url.protocol;

	  if (protocol && protocol.charAt(protocol.length - 1) !== ':') protocol += ':';

	  var result = protocol + (url.slashes ? '//' : '');

	  if (url.username) {
	    result += url.username;
	    if (url.password) result += ':'+ url.password;
	    result += '@';
	  }

	  result += url.host + url.pathname;

	  query = 'object' === typeof url.query ? stringify(url.query) : url.query;
	  if (query) result += '?' !== query.charAt(0) ? '?'+ query : query;

	  if (url.hash) result += url.hash;

	  return result;
	};

	//
	// Expose the URL parser and some additional properties that might be useful for
	// others or testing.
	//
	URL.extractProtocol = extractProtocol;
	URL.location = lolcation;
	URL.qs = qs;

	module.exports = URL;


/***/ },

/***/ 14:
/***/ function(module, exports) {

	'use strict';

	/**
	 * Check if we're required to add a port number.
	 *
	 * @see https://url.spec.whatwg.org/#default-port
	 * @param {Number|String} port Port number we need to check
	 * @param {String} protocol Protocol we need to check against.
	 * @returns {Boolean} Is it a default port for the given protocol
	 * @api private
	 */
	module.exports = function required(port, protocol) {
	  protocol = protocol.split(':')[0];
	  port = +port;

	  if (!port) return false;

	  switch (protocol) {
	    case 'http':
	    case 'ws':
	    return port !== 80;

	    case 'https':
	    case 'wss':
	    return port !== 443;

	    case 'ftp':
	    return port !== 21;

	    case 'gopher':
	    return port !== 70;

	    case 'file':
	    return false;
	  }

	  return port !== 0;
	};


/***/ },

/***/ 15:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var slashes = /^[A-Za-z][A-Za-z0-9+-.]*:\/\//;

	/**
	 * These properties should not be copied or inherited from. This is only needed
	 * for all non blob URL's as a blob URL does not include a hash, only the
	 * origin.
	 *
	 * @type {Object}
	 * @private
	 */
	var ignore = { hash: 1, query: 1 }
	  , URL;

	/**
	 * The location object differs when your code is loaded through a normal page,
	 * Worker or through a worker using a blob. And with the blobble begins the
	 * trouble as the location object will contain the URL of the blob, not the
	 * location of the page where our code is loaded in. The actual origin is
	 * encoded in the `pathname` so we can thankfully generate a good "default"
	 * location from it so we can generate proper relative URL's again.
	 *
	 * @param {Object|String} loc Optional default location object.
	 * @returns {Object} lolcation object.
	 * @api public
	 */
	module.exports = function lolcation(loc) {
	  loc = loc || global.location || {};
	  URL = URL || __webpack_require__(13);

	  var finaldestination = {}
	    , type = typeof loc
	    , key;

	  if ('blob:' === loc.protocol) {
	    finaldestination = new URL(unescape(loc.pathname), {});
	  } else if ('string' === type) {
	    finaldestination = new URL(loc, {});
	    for (key in ignore) delete finaldestination[key];
	  } else if ('object' === type) {
	    for (key in loc) {
	      if (key in ignore) continue;
	      finaldestination[key] = loc[key];
	    }

	    if (finaldestination.slashes === undefined) {
	      finaldestination.slashes = slashes.test(loc.href);
	    }
	  }

	  return finaldestination;
	};


/***/ },

/***/ 16:
/***/ function(module, exports) {

	'use strict';

	var has = Object.prototype.hasOwnProperty;

	/**
	 * Simple query string parser.
	 *
	 * @param {String} query The query string that needs to be parsed.
	 * @returns {Object}
	 * @api public
	 */
	function querystring(query) {
	  var parser = /([^=?&]+)=?([^&]*)/g
	    , result = {}
	    , part;

	  //
	  // Little nifty parsing hack, leverage the fact that RegExp.exec increments
	  // the lastIndex property so we can continue executing this loop until we've
	  // parsed all results.
	  //
	  for (;
	    part = parser.exec(query);
	    result[decodeURIComponent(part[1])] = decodeURIComponent(part[2])
	  );

	  return result;
	}

	/**
	 * Transform a query string to an object.
	 *
	 * @param {Object} obj Object that should be transformed.
	 * @param {String} prefix Optional prefix.
	 * @returns {String}
	 * @api public
	 */
	function querystringify(obj, prefix) {
	  prefix = prefix || '';

	  var pairs = [];

	  //
	  // Optionally prefix with a '?' if needed
	  //
	  if ('string' !== typeof prefix) prefix = '?';

	  for (var key in obj) {
	    if (has.call(obj, key)) {
	      pairs.push(encodeURIComponent(key) +'='+ encodeURIComponent(obj[key]));
	    }
	  }

	  return pairs.length ? prefix + pairs.join('&') : '';
	}

	//
	// Expose the module.
	//
	exports.stringify = querystringify;
	exports.parse = querystring;


/***/ },

/***/ 17:
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Detect Electron renderer process, which is node, but we should
	 * treat as a browser.
	 */

	if (typeof process !== 'undefined' && process.type === 'renderer') {
	  module.exports = __webpack_require__(18);
	} else {
	  module.exports = __webpack_require__(21);
	}


/***/ },

/***/ 18:
/***/ function(module, exports, __webpack_require__) {

	/**
	 * This is the web browser implementation of `debug()`.
	 *
	 * Expose `debug()` as the module.
	 */

	exports = module.exports = __webpack_require__(19);
	exports.log = log;
	exports.formatArgs = formatArgs;
	exports.save = save;
	exports.load = load;
	exports.useColors = useColors;
	exports.storage = 'undefined' != typeof chrome
	               && 'undefined' != typeof chrome.storage
	                  ? chrome.storage.local
	                  : localstorage();

	/**
	 * Colors.
	 */

	exports.colors = [
	  'lightseagreen',
	  'forestgreen',
	  'goldenrod',
	  'dodgerblue',
	  'darkorchid',
	  'crimson'
	];

	/**
	 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
	 * and the Firebug extension (any Firefox version) are known
	 * to support "%c" CSS customizations.
	 *
	 * TODO: add a `localStorage` variable to explicitly enable/disable colors
	 */

	function useColors() {
	  // NB: In an Electron preload script, document will be defined but not fully
	  // initialized. Since we know we're in Chrome, we'll just detect this case
	  // explicitly
	  if (typeof window !== 'undefined' && 'process' in window && window.process.type === 'renderer') {
	    return true;
	  }

	  // is webkit? http://stackoverflow.com/a/16459606/376773
	  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
	  return (typeof document !== 'undefined' && 'WebkitAppearance' in document.documentElement.style) ||
	    // is firebug? http://stackoverflow.com/a/398120/376773
	    (typeof window !== 'undefined' && window.console && (console.firebug || (console.exception && console.table))) ||
	    // is firefox >= v31?
	    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
	    (navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
	    // double check webkit in userAgent just in case we are in a worker
	    (navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
	}

	/**
	 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
	 */

	exports.formatters.j = function(v) {
	  try {
	    return JSON.stringify(v);
	  } catch (err) {
	    return '[UnexpectedJSONParseError]: ' + err.message;
	  }
	};


	/**
	 * Colorize log arguments if enabled.
	 *
	 * @api public
	 */

	function formatArgs(args) {
	  var useColors = this.useColors;

	  args[0] = (useColors ? '%c' : '')
	    + this.namespace
	    + (useColors ? ' %c' : ' ')
	    + args[0]
	    + (useColors ? '%c ' : ' ')
	    + '+' + exports.humanize(this.diff);

	  if (!useColors) return;

	  var c = 'color: ' + this.color;
	  args.splice(1, 0, c, 'color: inherit')

	  // the final "%c" is somewhat tricky, because there could be other
	  // arguments passed either before or after the %c, so we need to
	  // figure out the correct index to insert the CSS into
	  var index = 0;
	  var lastC = 0;
	  args[0].replace(/%[a-z%]/g, function(match) {
	    if ('%%' === match) return;
	    index++;
	    if ('%c' === match) {
	      // we only are interested in the *last* %c
	      // (the user may have provided their own)
	      lastC = index;
	    }
	  });

	  args.splice(lastC, 0, c);
	}

	/**
	 * Invokes `console.log()` when available.
	 * No-op when `console.log` is not a "function".
	 *
	 * @api public
	 */

	function log() {
	  // this hackery is required for IE8/9, where
	  // the `console.log` function doesn't have 'apply'
	  return 'object' === typeof console
	    && console.log
	    && Function.prototype.apply.call(console.log, console, arguments);
	}

	/**
	 * Save `namespaces`.
	 *
	 * @param {String} namespaces
	 * @api private
	 */

	function save(namespaces) {
	  try {
	    if (null == namespaces) {
	      exports.storage.removeItem('debug');
	    } else {
	      exports.storage.debug = namespaces;
	    }
	  } catch(e) {}
	}

	/**
	 * Load `namespaces`.
	 *
	 * @return {String} returns the previously persisted debug modes
	 * @api private
	 */

	function load() {
	  var r;
	  try {
	    return exports.storage.debug;
	  } catch(e) {}

	  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
	  if (typeof process !== 'undefined' && 'env' in process) {
	    return ({"NODE_ENV":undefined}).DEBUG;
	  }
	}

	/**
	 * Enable namespaces listed in `localStorage.debug` initially.
	 */

	exports.enable(load());

	/**
	 * Localstorage attempts to return the localstorage.
	 *
	 * This is necessary because safari throws
	 * when a user disables cookies/localstorage
	 * and you attempt to access it.
	 *
	 * @return {LocalStorage}
	 * @api private
	 */

	function localstorage() {
	  try {
	    return window.localStorage;
	  } catch (e) {}
	}


/***/ },

/***/ 19:
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * This is the common logic for both the Node.js and web browser
	 * implementations of `debug()`.
	 *
	 * Expose `debug()` as the module.
	 */

	exports = module.exports = createDebug.debug = createDebug.default = createDebug;
	exports.coerce = coerce;
	exports.disable = disable;
	exports.enable = enable;
	exports.enabled = enabled;
	exports.humanize = __webpack_require__(20);

	/**
	 * The currently active debug mode names, and names to skip.
	 */

	exports.names = [];
	exports.skips = [];

	/**
	 * Map of special "%n" handling functions, for the debug "format" argument.
	 *
	 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
	 */

	exports.formatters = {};

	/**
	 * Previous log timestamp.
	 */

	var prevTime;

	/**
	 * Select a color.
	 * @param {String} namespace
	 * @return {Number}
	 * @api private
	 */

	function selectColor(namespace) {
	  var hash = 0, i;

	  for (i in namespace) {
	    hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
	    hash |= 0; // Convert to 32bit integer
	  }

	  return exports.colors[Math.abs(hash) % exports.colors.length];
	}

	/**
	 * Create a debugger with the given `namespace`.
	 *
	 * @param {String} namespace
	 * @return {Function}
	 * @api public
	 */

	function createDebug(namespace) {

	  function debug() {
	    // disabled?
	    if (!debug.enabled) return;

	    var self = debug;

	    // set `diff` timestamp
	    var curr = +new Date();
	    var ms = curr - (prevTime || curr);
	    self.diff = ms;
	    self.prev = prevTime;
	    self.curr = curr;
	    prevTime = curr;

	    // turn the `arguments` into a proper Array
	    var args = new Array(arguments.length);
	    for (var i = 0; i < args.length; i++) {
	      args[i] = arguments[i];
	    }

	    args[0] = exports.coerce(args[0]);

	    if ('string' !== typeof args[0]) {
	      // anything else let's inspect with %O
	      args.unshift('%O');
	    }

	    // apply any `formatters` transformations
	    var index = 0;
	    args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
	      // if we encounter an escaped % then don't increase the array index
	      if (match === '%%') return match;
	      index++;
	      var formatter = exports.formatters[format];
	      if ('function' === typeof formatter) {
	        var val = args[index];
	        match = formatter.call(self, val);

	        // now we need to remove `args[index]` since it's inlined in the `format`
	        args.splice(index, 1);
	        index--;
	      }
	      return match;
	    });

	    // apply env-specific formatting (colors, etc.)
	    exports.formatArgs.call(self, args);

	    var logFn = enabled.log || exports.log || console.log.bind(console);
	    logFn.apply(self, args);
	  }

	  debug.namespace = namespace;
	  debug.enabled = exports.enabled(namespace);
	  debug.useColors = exports.useColors();
	  debug.color = selectColor(namespace);

	  // env-specific initialization logic for debug instances
	  if ('function' === typeof exports.init) {
	    exports.init(debug);
	  }

	  return debug;
	}

	/**
	 * Enables a debug mode by namespaces. This can include modes
	 * separated by a colon and wildcards.
	 *
	 * @param {String} namespaces
	 * @api public
	 */

	function enable(namespaces) {
	  exports.save(namespaces);

	  var split = (namespaces || '').split(/[\s,]+/);
	  var len = split.length;

	  for (var i = 0; i < len; i++) {
	    if (!split[i]) continue; // ignore empty strings
	    namespaces = split[i].replace(/\*/g, '.*?');
	    if (namespaces[0] === '-') {
	      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
	    } else {
	      exports.names.push(new RegExp('^' + namespaces + '$'));
	    }
	  }
	}

	/**
	 * Disable debug output.
	 *
	 * @api public
	 */

	function disable() {
	  exports.enable('');
	}

	/**
	 * Returns true if the given mode name is enabled, false otherwise.
	 *
	 * @param {String} name
	 * @return {Boolean}
	 * @api public
	 */

	function enabled(name) {
	  var i, len;
	  for (i = 0, len = exports.skips.length; i < len; i++) {
	    if (exports.skips[i].test(name)) {
	      return false;
	    }
	  }
	  for (i = 0, len = exports.names.length; i < len; i++) {
	    if (exports.names[i].test(name)) {
	      return true;
	    }
	  }
	  return false;
	}

	/**
	 * Coerce `val`.
	 *
	 * @param {Mixed} val
	 * @return {Mixed}
	 * @api private
	 */

	function coerce(val) {
	  if (val instanceof Error) return val.stack || val.message;
	  return val;
	}


/***/ },

/***/ 20:
/***/ function(module, exports) {

	/**
	 * Helpers.
	 */

	var s = 1000
	var m = s * 60
	var h = m * 60
	var d = h * 24
	var y = d * 365.25

	/**
	 * Parse or format the given `val`.
	 *
	 * Options:
	 *
	 *  - `long` verbose formatting [false]
	 *
	 * @param {String|Number} val
	 * @param {Object} options
	 * @throws {Error} throw an error if val is not a non-empty string or a number
	 * @return {String|Number}
	 * @api public
	 */

	module.exports = function (val, options) {
	  options = options || {}
	  var type = typeof val
	  if (type === 'string' && val.length > 0) {
	    return parse(val)
	  } else if (type === 'number' && isNaN(val) === false) {
	    return options.long ?
				fmtLong(val) :
				fmtShort(val)
	  }
	  throw new Error('val is not a non-empty string or a valid number. val=' + JSON.stringify(val))
	}

	/**
	 * Parse the given `str` and return milliseconds.
	 *
	 * @param {String} str
	 * @return {Number}
	 * @api private
	 */

	function parse(str) {
	  str = String(str)
	  if (str.length > 10000) {
	    return
	  }
	  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str)
	  if (!match) {
	    return
	  }
	  var n = parseFloat(match[1])
	  var type = (match[2] || 'ms').toLowerCase()
	  switch (type) {
	    case 'years':
	    case 'year':
	    case 'yrs':
	    case 'yr':
	    case 'y':
	      return n * y
	    case 'days':
	    case 'day':
	    case 'd':
	      return n * d
	    case 'hours':
	    case 'hour':
	    case 'hrs':
	    case 'hr':
	    case 'h':
	      return n * h
	    case 'minutes':
	    case 'minute':
	    case 'mins':
	    case 'min':
	    case 'm':
	      return n * m
	    case 'seconds':
	    case 'second':
	    case 'secs':
	    case 'sec':
	    case 's':
	      return n * s
	    case 'milliseconds':
	    case 'millisecond':
	    case 'msecs':
	    case 'msec':
	    case 'ms':
	      return n
	    default:
	      return undefined
	  }
	}

	/**
	 * Short format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function fmtShort(ms) {
	  if (ms >= d) {
	    return Math.round(ms / d) + 'd'
	  }
	  if (ms >= h) {
	    return Math.round(ms / h) + 'h'
	  }
	  if (ms >= m) {
	    return Math.round(ms / m) + 'm'
	  }
	  if (ms >= s) {
	    return Math.round(ms / s) + 's'
	  }
	  return ms + 'ms'
	}

	/**
	 * Long format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function fmtLong(ms) {
	  return plural(ms, d, 'day') ||
	    plural(ms, h, 'hour') ||
	    plural(ms, m, 'minute') ||
	    plural(ms, s, 'second') ||
	    ms + ' ms'
	}

	/**
	 * Pluralization helper.
	 */

	function plural(ms, n, name) {
	  if (ms < n) {
	    return
	  }
	  if (ms < n * 1.5) {
	    return Math.floor(ms / n) + ' ' + name
	  }
	  return Math.ceil(ms / n) + ' ' + name + 's'
	}


/***/ },

/***/ 21:
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module dependencies.
	 */

	var tty = __webpack_require__(22);
	var util = __webpack_require__(23);

	/**
	 * This is the Node.js implementation of `debug()`.
	 *
	 * Expose `debug()` as the module.
	 */

	exports = module.exports = __webpack_require__(19);
	exports.init = init;
	exports.log = log;
	exports.formatArgs = formatArgs;
	exports.save = save;
	exports.load = load;
	exports.useColors = useColors;

	/**
	 * Colors.
	 */

	exports.colors = [6, 2, 3, 4, 5, 1];

	/**
	 * Build up the default `inspectOpts` object from the environment variables.
	 *
	 *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
	 */

	exports.inspectOpts = Object.keys(({"NODE_ENV":undefined})).filter(function (key) {
	  return /^debug_/i.test(key);
	}).reduce(function (obj, key) {
	  // camel-case
	  var prop = key
	    .substring(6)
	    .toLowerCase()
	    .replace(/_([a-z])/, function (_, k) { return k.toUpperCase() });

	  // coerce string value into JS value
	  var val = ({"NODE_ENV":undefined})[key];
	  if (/^(yes|on|true|enabled)$/i.test(val)) val = true;
	  else if (/^(no|off|false|disabled)$/i.test(val)) val = false;
	  else if (val === 'null') val = null;
	  else val = Number(val);

	  obj[prop] = val;
	  return obj;
	}, {});

	/**
	 * The file descriptor to write the `debug()` calls to.
	 * Set the `DEBUG_FD` env variable to override with another value. i.e.:
	 *
	 *   $ DEBUG_FD=3 node script.js 3>debug.log
	 */

	var fd = parseInt(({"NODE_ENV":undefined}).DEBUG_FD, 10) || 2;
	var stream = 1 === fd ? process.stdout :
	             2 === fd ? process.stderr :
	             createWritableStdioStream(fd);

	/**
	 * Is stdout a TTY? Colored output is enabled when `true`.
	 */

	function useColors() {
	  return 'colors' in exports.inspectOpts
	    ? Boolean(exports.inspectOpts.colors)
	    : tty.isatty(fd);
	}

	/**
	 * Map %o to `util.inspect()`, all on a single line.
	 */

	exports.formatters.o = function(v) {
	  this.inspectOpts.colors = this.useColors;
	  return util.inspect(v, this.inspectOpts)
	    .replace(/\s*\n\s*/g, ' ');
	};

	/**
	 * Map %o to `util.inspect()`, allowing multiple lines if needed.
	 */

	exports.formatters.O = function(v) {
	  this.inspectOpts.colors = this.useColors;
	  return util.inspect(v, this.inspectOpts);
	};

	/**
	 * Adds ANSI color escape codes if enabled.
	 *
	 * @api public
	 */

	function formatArgs(args) {
	  var name = this.namespace;
	  var useColors = this.useColors;

	  if (useColors) {
	    var c = this.color;
	    var prefix = '  \u001b[3' + c + ';1m' + name + ' ' + '\u001b[0m';

	    args[0] = prefix + args[0].split('\n').join('\n' + prefix);
	    args.push('\u001b[3' + c + 'm+' + exports.humanize(this.diff) + '\u001b[0m');
	  } else {
	    args[0] = new Date().toUTCString()
	      + ' ' + name + ' ' + args[0];
	  }
	}

	/**
	 * Invokes `util.format()` with the specified arguments and writes to `stream`.
	 */

	function log() {
	  return stream.write(util.format.apply(util, arguments) + '\n');
	}

	/**
	 * Save `namespaces`.
	 *
	 * @param {String} namespaces
	 * @api private
	 */

	function save(namespaces) {
	  if (null == namespaces) {
	    // If you set a process.env field to null or undefined, it gets cast to the
	    // string 'null' or 'undefined'. Just delete instead.
	    delete ({"NODE_ENV":undefined}).DEBUG;
	  } else {
	    ({"NODE_ENV":undefined}).DEBUG = namespaces;
	  }
	}

	/**
	 * Load `namespaces`.
	 *
	 * @return {String} returns the previously persisted debug modes
	 * @api private
	 */

	function load() {
	  return ({"NODE_ENV":undefined}).DEBUG;
	}

	/**
	 * Copied from `node/src/node.js`.
	 *
	 * XXX: It's lame that node doesn't expose this API out-of-the-box. It also
	 * relies on the undocumented `tty_wrap.guessHandleType()` which is also lame.
	 */

	function createWritableStdioStream (fd) {
	  var stream;
	  var tty_wrap = process.binding('tty_wrap');

	  // Note stream._type is used for test-module-load-list.js

	  switch (tty_wrap.guessHandleType(fd)) {
	    case 'TTY':
	      stream = new tty.WriteStream(fd);
	      stream._type = 'tty';

	      // Hack to have stream not keep the event loop alive.
	      // See https://github.com/joyent/node/issues/1726
	      if (stream._handle && stream._handle.unref) {
	        stream._handle.unref();
	      }
	      break;

	    case 'FILE':
	      var fs = __webpack_require__(24);
	      stream = new fs.SyncWriteStream(fd, { autoClose: false });
	      stream._type = 'fs';
	      break;

	    case 'PIPE':
	    case 'TCP':
	      var net = __webpack_require__(25);
	      stream = new net.Socket({
	        fd: fd,
	        readable: false,
	        writable: true
	      });

	      // FIXME Should probably have an option in net.Socket to create a
	      // stream from an existing fd which is writable only. But for now
	      // we'll just add this hack and set the `readable` member to false.
	      // Test: ./node test/fixtures/echo.js < /etc/passwd
	      stream.readable = false;
	      stream.read = null;
	      stream._type = 'pipe';

	      // FIXME Hack to have stream not keep the event loop alive.
	      // See https://github.com/joyent/node/issues/1726
	      if (stream._handle && stream._handle.unref) {
	        stream._handle.unref();
	      }
	      break;

	    default:
	      // Probably an error on in uv_guess_handle()
	      throw new Error('Implement me. Unknown stream file type!');
	  }

	  // For supporting legacy API we put the FD here.
	  stream.fd = fd;

	  stream._isStdio = true;

	  return stream;
	}

	/**
	 * Init logic for `debug` instances.
	 *
	 * Create a new `inspectOpts` object in case `useColors` is set
	 * differently for a particular `debug` instance.
	 */

	function init (debug) {
	  debug.inspectOpts = util._extend({}, exports.inspectOpts);
	}

	/**
	 * Enable namespaces listed in `process.env.DEBUG` initially.
	 */

	exports.enable(load());


/***/ },

/***/ 22:
/***/ function(module, exports) {

	module.exports = require("tty");

/***/ },

/***/ 23:
/***/ function(module, exports) {

	module.exports = require("util");

/***/ },

/***/ 24:
/***/ function(module, exports) {

	module.exports = require("fs");

/***/ },

/***/ 25:
/***/ function(module, exports) {

	module.exports = require("net");

/***/ },

/***/ 26:
/***/ function(module, exports, __webpack_require__) {

	try {
	  var util = __webpack_require__(23);
	  if (typeof util.inherits !== 'function') throw '';
	  module.exports = util.inherits;
	} catch (e) {
	  module.exports = __webpack_require__(27);
	}


/***/ },

/***/ 27:
/***/ function(module, exports) {

	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  };
	} else {
	  // old school shim for old browsers
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    var TempCtor = function () {}
	    TempCtor.prototype = superCtor.prototype
	    ctor.prototype = new TempCtor()
	    ctor.prototype.constructor = ctor
	  }
	}


/***/ },

/***/ 28:
/***/ function(module, exports) {

	module.exports = require("events");

/***/ },

/***/ 29:
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(30).Client;


/***/ },

/***/ 30:
/***/ function(module, exports, __webpack_require__) {

	// API references:
	//
	// * http://dev.w3.org/html5/websockets/
	// * http://dvcs.w3.org/hg/domcore/raw-file/tip/Overview.html#interface-eventtarget
	// * http://dvcs.w3.org/hg/domcore/raw-file/tip/Overview.html#interface-event

	var util   = __webpack_require__(23),
	    driver = __webpack_require__(31),
	    API    = __webpack_require__(53);

	var WebSocket = function(request, socket, body, protocols, options) {
	  options = options || {};

	  this._stream = socket;
	  this._driver = driver.http(request, {maxLength: options.maxLength, protocols: protocols});

	  var self = this;
	  if (!this._stream || !this._stream.writable) return;
	  if (!this._stream.readable) return this._stream.end();

	  var catchup = function() { self._stream.removeListener('data', catchup) };
	  this._stream.on('data', catchup);

	  API.call(this, options);

	  process.nextTick(function() {
	    self._driver.start();
	    self._driver.io.write(body);
	  });
	};
	util.inherits(WebSocket, API);

	WebSocket.isWebSocket = function(request) {
	  return driver.isWebSocket(request);
	};

	WebSocket.validateOptions = function(options, validKeys) {
	  driver.validateOptions(options, validKeys);
	};

	WebSocket.WebSocket   = WebSocket;
	WebSocket.Client      = __webpack_require__(56);
	WebSocket.EventSource = __webpack_require__(58);

	module.exports        = WebSocket;


/***/ },

/***/ 31:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	// Protocol references:
	// 
	// * http://tools.ietf.org/html/draft-hixie-thewebsocketprotocol-75
	// * http://tools.ietf.org/html/draft-hixie-thewebsocketprotocol-76
	// * http://tools.ietf.org/html/draft-ietf-hybi-thewebsocketprotocol-17

	var Base   = __webpack_require__(32),
	    Client = __webpack_require__(37),
	    Server = __webpack_require__(50);

	var Driver = {
	  client: function(url, options) {
	    options = options || {};
	    if (options.masking === undefined) options.masking = true;
	    return new Client(url, options);
	  },

	  server: function(options) {
	    options = options || {};
	    if (options.requireMasking === undefined) options.requireMasking = true;
	    return new Server(options);
	  },

	  http: function() {
	    return Server.http.apply(Server, arguments);
	  },

	  isSecureRequest: function(request) {
	    return Server.isSecureRequest(request);
	  },

	  isWebSocket: function(request) {
	    if (request.method !== 'GET') return false;

	    var connection = request.headers.connection || '',
	        upgrade    = request.headers.upgrade || '';

	    return request.method === 'GET' &&
	           connection.toLowerCase().split(/ *, */).indexOf('upgrade') >= 0 &&
	           upgrade.toLowerCase() === 'websocket';
	  },

	  validateOptions: function(options, validKeys) {
	    Base.validateOptions(options, validKeys);
	  }
	};

	module.exports = Driver;


/***/ },

/***/ 32:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Emitter = __webpack_require__(28).EventEmitter,
	    util    = __webpack_require__(23),
	    streams = __webpack_require__(33),
	    Headers = __webpack_require__(35),
	    Reader  = __webpack_require__(36);

	var Base = function(request, url, options) {
	  Emitter.call(this);
	  Base.validateOptions(options || {}, ['maxLength', 'masking', 'requireMasking', 'protocols']);

	  this._request   = request;
	  this._reader    = new Reader();
	  this._options   = options || {};
	  this._maxLength = this._options.maxLength || this.MAX_LENGTH;
	  this._headers   = new Headers();
	  this.__queue    = [];
	  this.readyState = 0;
	  this.url        = url;

	  this.io = new streams.IO(this);
	  this.messages = new streams.Messages(this);
	  this._bindEventListeners();
	};
	util.inherits(Base, Emitter);

	Base.validateOptions = function(options, validKeys) {
	  for (var key in options) {
	    if (validKeys.indexOf(key) < 0)
	      throw new Error('Unrecognized option: ' + key);
	  }
	};

	var instance = {
	  // This is 64MB, small enough for an average VPS to handle without
	  // crashing from process out of memory
	  MAX_LENGTH: 0x3ffffff,

	  STATES: ['connecting', 'open', 'closing', 'closed'],

	  _bindEventListeners: function() {
	    var self = this;

	    // Protocol errors are informational and do not have to be handled
	    this.messages.on('error', function() {});

	    this.on('message', function(event) {
	      var messages = self.messages;
	      if (messages.readable) messages.emit('data', event.data);
	    });

	    this.on('error', function(error) {
	      var messages = self.messages;
	      if (messages.readable) messages.emit('error', error);
	    });

	    this.on('close', function() {
	      var messages = self.messages;
	      if (!messages.readable) return;
	      messages.readable = messages.writable = false;
	      messages.emit('end');
	    });
	  },

	  getState: function() {
	    return this.STATES[this.readyState] || null;
	  },

	  addExtension: function(extension) {
	    return false;
	  },

	  setHeader: function(name, value) {
	    if (this.readyState > 0) return false;
	    this._headers.set(name, value);
	    return true;
	  },

	  start: function() {
	    if (this.readyState !== 0) return false;
	    var response = this._handshakeResponse();
	    if (!response) return false;
	    this._write(response);
	    if (this._stage !== -1) this._open();
	    return true;
	  },

	  text: function(message) {
	    return this.frame(message);
	  },

	  binary: function(message) {
	    return false;
	  },

	  ping: function() {
	    return false;
	  },

	  pong: function() {
	      return false;
	  },

	  close: function(reason, code) {
	    if (this.readyState !== 1) return false;
	    this.readyState = 3;
	    this.emit('close', new Base.CloseEvent(null, null));
	    return true;
	  },

	  _open: function() {
	    this.readyState = 1;
	    this.__queue.forEach(function(args) { this.frame.apply(this, args) }, this);
	    this.__queue = [];
	    this.emit('open', new Base.OpenEvent());
	  },

	  _queue: function(message) {
	    this.__queue.push(message);
	    return true;
	  },

	  _write: function(chunk) {
	    var io = this.io;
	    if (io.readable) io.emit('data', chunk);
	  }
	};

	for (var key in instance)
	  Base.prototype[key] = instance[key];


	Base.ConnectEvent = function() {};

	Base.OpenEvent = function() {};

	Base.CloseEvent = function(code, reason) {
	  this.code   = code;
	  this.reason = reason;
	};

	Base.MessageEvent = function(data) {
	  this.data = data;
	};

	module.exports = Base;


/***/ },

/***/ 33:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/**

	Streams in a WebSocket connection
	---------------------------------

	We model a WebSocket as two duplex streams: one stream is for the wire protocol
	over an I/O socket, and the other is for incoming/outgoing messages.


	                        +----------+      +---------+      +----------+
	    [1] write(chunk) -->| ~~~~~~~~ +----->| parse() +----->| ~~~~~~~~ +--> emit('data') [2]
	                        |          |      +----+----+      |          |
	                        |          |           |           |          |
	                        |    IO    |           | [5]       | Messages |
	                        |          |           V           |          |
	                        |          |      +---------+      |          |
	    [4] emit('data') <--+ ~~~~~~~~ |<-----+ frame() |<-----+ ~~~~~~~~ |<-- write(chunk) [3]
	                        +----------+      +---------+      +----------+


	Message transfer in each direction is simple: IO receives a byte stream [1] and
	sends this stream for parsing. The parser will periodically emit a complete
	message text on the Messages stream [2]. Similarly, when messages are written
	to the Messages stream [3], they are framed using the WebSocket wire format and
	emitted via IO [4].

	There is a feedback loop via [5] since some input from [1] will be things like
	ping, pong and close frames. In these cases the protocol responds by emitting
	responses directly back to [4] rather than emitting messages via [2].

	For the purposes of flow control, we consider the sources of each Readable
	stream to be as follows:

	* [2] receives input from [1]
	* [4] receives input from [1] and [3]

	The classes below express the relationships described above without prescribing
	anything about how parse() and frame() work, other than assuming they emit
	'data' events to the IO and Messages streams. They will work with any protocol
	driver having these two methods.
	**/


	var Stream = __webpack_require__(34).Stream,
	    util   = __webpack_require__(23);


	var IO = function(driver) {
	  this.readable = this.writable = true;
	  this._paused  = false;
	  this._driver  = driver;
	};
	util.inherits(IO, Stream);

	// The IO pause() and resume() methods will be called when the socket we are
	// piping to gets backed up and drains. Since IO output [4] comes from IO input
	// [1] and Messages input [3], we need to tell both of those to return false
	// from write() when this stream is paused.

	IO.prototype.pause = function() {
	  this._paused = true;
	  this._driver.messages._paused = true;
	};

	IO.prototype.resume = function() {
	  this._paused = false;
	  this.emit('drain');

	  var messages = this._driver.messages;
	  messages._paused = false;
	  messages.emit('drain');
	};

	// When we receive input from a socket, send it to the parser and tell the
	// source whether to back off.
	IO.prototype.write = function(chunk) {
	  if (!this.writable) return false;
	  this._driver.parse(chunk);
	  return !this._paused;
	};

	// The IO end() method will be called when the socket piping into it emits
	// 'close' or 'end', i.e. the socket is closed. In this situation the Messages
	// stream will not emit any more data so we emit 'end'.
	IO.prototype.end = function(chunk) {
	  if (!this.writable) return;
	  if (chunk !== undefined) this.write(chunk);
	  this.writable = false;

	  var messages = this._driver.messages;
	  if (messages.readable) {
	    messages.readable = messages.writable = false;
	    messages.emit('end');
	  }
	};

	IO.prototype.destroy = function() {
	  this.end();
	};


	var Messages = function(driver) {
	  this.readable = this.writable = true;
	  this._paused  = false;
	  this._driver  = driver;
	};
	util.inherits(Messages, Stream);

	// The Messages pause() and resume() methods will be called when the app that's
	// processing the messages gets backed up and drains. If we're emitting
	// messages too fast we should tell the source to slow down. Message output [2]
	// comes from IO input [1].

	Messages.prototype.pause = function() {
	  this._driver.io._paused = true;
	};

	Messages.prototype.resume = function() {
	  this._driver.io._paused = false;
	  this._driver.io.emit('drain');
	};

	// When we receive messages from the user, send them to the formatter and tell
	// the source whether to back off.
	Messages.prototype.write = function(message) {
	  if (!this.writable) return false;
	  if (typeof message === 'string') this._driver.text(message);
	  else this._driver.binary(message);
	  return !this._paused;
	};

	// The Messages end() method will be called when a stream piping into it emits
	// 'end'. Many streams may be piped into the WebSocket and one of them ending
	// does not mean the whole socket is done, so just process the input and move
	// on leaving the socket open.
	Messages.prototype.end = function(message) {
	  if (message !== undefined) this.write(message);
	};

	Messages.prototype.destroy = function() {};


	exports.IO = IO;
	exports.Messages = Messages;


/***/ },

/***/ 34:
/***/ function(module, exports) {

	module.exports = require("stream");

/***/ },

/***/ 35:
/***/ function(module, exports) {

	'use strict';

	var Headers = function() {
	  this.clear();
	};

	Headers.prototype.ALLOWED_DUPLICATES = ['set-cookie', 'set-cookie2', 'warning', 'www-authenticate'];

	Headers.prototype.clear = function() {
	  this._sent  = {};
	  this._lines = [];
	};

	Headers.prototype.set = function(name, value) {
	  if (value === undefined) return;

	  name = this._strip(name);
	  value = this._strip(value);

	  var key = name.toLowerCase();
	  if (!this._sent.hasOwnProperty(key) || this.ALLOWED_DUPLICATES.indexOf(key) >= 0) {
	    this._sent[key] = true;
	    this._lines.push(name + ': ' + value + '\r\n');
	  }
	};

	Headers.prototype.toString = function() {
	  return this._lines.join('');
	};

	Headers.prototype._strip = function(string) {
	  return string.toString().replace(/^ */, '').replace(/ *$/, '');
	};

	module.exports = Headers;


/***/ },

/***/ 36:
/***/ function(module, exports) {

	'use strict';

	var StreamReader = function() {
	  this._queue     = [];
	  this._queueSize = 0;
	  this._offset    = 0;
	};

	StreamReader.prototype.put = function(buffer) {
	  if (!buffer || buffer.length === 0) return;
	  if (!buffer.copy) buffer = new Buffer(buffer);
	  this._queue.push(buffer);
	  this._queueSize += buffer.length;
	};

	StreamReader.prototype.read = function(length) {
	  if (length > this._queueSize) return null;
	  if (length === 0) return new Buffer(0);

	  this._queueSize -= length;

	  var queue  = this._queue,
	      remain = length,
	      first  = queue[0],
	      buffers, buffer;

	  if (first.length >= length) {
	    if (first.length === length) {
	      return queue.shift();
	    } else {
	      buffer = first.slice(0, length);
	      queue[0] = first.slice(length);
	      return buffer;
	    }
	  }

	  for (var i = 0, n = queue.length; i < n; i++) {
	    if (remain < queue[i].length) break;
	    remain -= queue[i].length;
	  }
	  buffers = queue.splice(0, i);

	  if (remain > 0 && queue.length > 0) {
	    buffers.push(queue[0].slice(0, remain));
	    queue[0] = queue[0].slice(remain);
	  }
	  return this._concat(buffers, length);
	};

	StreamReader.prototype.eachByte = function(callback, context) {
	  var buffer, n, index;

	  while (this._queue.length > 0) {
	    buffer = this._queue[0];
	    n = buffer.length;

	    while (this._offset < n) {
	      index = this._offset;
	      this._offset += 1;
	      callback.call(context, buffer[index]);
	    }
	    this._offset = 0;
	    this._queue.shift();
	  }
	};

	StreamReader.prototype._concat = function(buffers, length) {
	  if (Buffer.concat) return Buffer.concat(buffers, length);

	  var buffer = new Buffer(length),
	      offset = 0;

	  for (var i = 0, n = buffers.length; i < n; i++) {
	    buffers[i].copy(buffer, offset);
	    offset += buffers[i].length;
	  }
	  return buffer;
	};

	module.exports = StreamReader;


/***/ },

/***/ 37:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var crypto     = __webpack_require__(11),
	    url        = __webpack_require__(2),
	    util       = __webpack_require__(23),
	    HttpParser = __webpack_require__(38),
	    Base       = __webpack_require__(32),
	    Hybi       = __webpack_require__(39),
	    Proxy      = __webpack_require__(49);

	var Client = function(_url, options) {
	  this.version = 'hybi-13';
	  Hybi.call(this, null, _url, options);

	  this.readyState = -1;
	  this._key       = Client.generateKey();
	  this._accept    = Hybi.generateAccept(this._key);
	  this._http      = new HttpParser('response');

	  var uri  = url.parse(this.url),
	      auth = uri.auth && new Buffer(uri.auth, 'utf8').toString('base64');

	  if (this.VALID_PROTOCOLS.indexOf(uri.protocol) < 0)
	    throw new Error(this.url + ' is not a valid WebSocket URL');

	  this._pathname = (uri.pathname || '/') + (uri.search || '');

	  this._headers.set('Host', uri.host);
	  this._headers.set('Upgrade', 'websocket');
	  this._headers.set('Connection', 'Upgrade');
	  this._headers.set('Sec-WebSocket-Key', this._key);
	  this._headers.set('Sec-WebSocket-Version', '13');

	  if (this._protocols.length > 0)
	    this._headers.set('Sec-WebSocket-Protocol', this._protocols.join(', '));

	  if (auth)
	    this._headers.set('Authorization', 'Basic ' + auth);
	};
	util.inherits(Client, Hybi);

	Client.generateKey = function() {
	  return crypto.randomBytes(16).toString('base64');
	};

	var instance = {
	  VALID_PROTOCOLS: ['ws:', 'wss:'],

	  proxy: function(origin, options) {
	    return new Proxy(this, origin, options);
	  },

	  start: function() {
	    if (this.readyState !== -1) return false;
	    this._write(this._handshakeRequest());
	    this.readyState = 0;
	    return true;
	  },

	  parse: function(chunk) {
	    if (this.readyState === 3) return;
	    if (this.readyState > 0) return Hybi.prototype.parse.call(this, chunk);

	    this._http.parse(chunk);
	    if (!this._http.isComplete()) return;

	    this._validateHandshake();
	    if (this.readyState === 3) return;

	    this._open();
	    this.parse(this._http.body);
	  },

	  _handshakeRequest: function() {
	    var extensions = this._extensions.generateOffer();
	    if (extensions)
	      this._headers.set('Sec-WebSocket-Extensions', extensions);

	    var start   = 'GET ' + this._pathname + ' HTTP/1.1',
	        headers = [start, this._headers.toString(), ''];

	    return new Buffer(headers.join('\r\n'), 'utf8');
	  },

	  _failHandshake: function(message) {
	    message = 'Error during WebSocket handshake: ' + message;
	    this.readyState = 3;
	    this.emit('error', new Error(message));
	    this.emit('close', new Base.CloseEvent(this.ERRORS.protocol_error, message));
	  },

	  _validateHandshake: function() {
	    this.statusCode = this._http.statusCode;
	    this.headers    = this._http.headers;

	    if (this._http.statusCode !== 101)
	      return this._failHandshake('Unexpected response code: ' + this._http.statusCode);

	    var headers    = this._http.headers,
	        upgrade    = headers['upgrade'] || '',
	        connection = headers['connection'] || '',
	        accept     = headers['sec-websocket-accept'] || '',
	        protocol   = headers['sec-websocket-protocol'] || '';

	    if (upgrade === '')
	      return this._failHandshake("'Upgrade' header is missing");
	    if (upgrade.toLowerCase() !== 'websocket')
	      return this._failHandshake("'Upgrade' header value is not 'WebSocket'");

	    if (connection === '')
	      return this._failHandshake("'Connection' header is missing");
	    if (connection.toLowerCase() !== 'upgrade')
	      return this._failHandshake("'Connection' header value is not 'Upgrade'");

	    if (accept !== this._accept)
	      return this._failHandshake('Sec-WebSocket-Accept mismatch');

	    this.protocol = null;

	    if (protocol !== '') {
	      if (this._protocols.indexOf(protocol) < 0)
	        return this._failHandshake('Sec-WebSocket-Protocol mismatch');
	      else
	        this.protocol = protocol;
	    }

	    try {
	      this._extensions.activate(this.headers['sec-websocket-extensions']);
	    } catch (e) {
	      return this._failHandshake(e.message);
	    }
	  }
	};

	for (var key in instance)
	  Client.prototype[key] = instance[key];

	module.exports = Client;


/***/ },

/***/ 38:
/***/ function(module, exports) {

	'use strict';

	var NodeHTTPParser = process.binding('http_parser').HTTPParser,
	    version        = NodeHTTPParser.RESPONSE ? 6 : 4;

	var HttpParser = function(type) {
	  if (type === 'request')
	    this._parser = new NodeHTTPParser(NodeHTTPParser.REQUEST || 'request');
	  else
	    this._parser = new NodeHTTPParser(NodeHTTPParser.RESPONSE || 'response');

	  this._type     = type;
	  this._complete = false;
	  this.headers   = {};

	  var current = null,
	      self    = this;

	  this._parser.onHeaderField = function(b, start, length) {
	    current = b.toString('utf8', start, start + length).toLowerCase();
	  };

	  this._parser.onHeaderValue = function(b, start, length) {
	    var value = b.toString('utf8', start, start + length);

	    if (self.headers.hasOwnProperty(current))
	      self.headers[current] += ', ' + value;
	    else
	      self.headers[current] = value;
	  };

	  this._parser.onHeadersComplete = this._parser[NodeHTTPParser.kOnHeadersComplete] =
	  function(majorVersion, minorVersion, headers, method, pathname, statusCode) {
	    var info = arguments[0];

	    if (typeof info === 'object') {
	      method     = info.method;
	      pathname   = info.url;
	      statusCode = info.statusCode;
	      headers    = info.headers;
	    }

	    self.method     = (typeof method === 'number') ? HttpParser.METHODS[method] : method;
	    self.statusCode = statusCode;
	    self.url        = pathname;

	    if (!headers) return;

	    for (var i = 0, n = headers.length, key, value; i < n; i += 2) {
	      key   = headers[i].toLowerCase();
	      value = headers[i+1];
	      if (self.headers.hasOwnProperty(key))
	        self.headers[key] += ', ' + value;
	      else
	        self.headers[key] = value;
	    }

	    self._complete = true;
	  };
	};

	HttpParser.METHODS = {
	  0:  'DELETE',
	  1:  'GET',
	  2:  'HEAD',
	  3:  'POST',
	  4:  'PUT',
	  5:  'CONNECT',
	  6:  'OPTIONS',
	  7:  'TRACE',
	  8:  'COPY',
	  9:  'LOCK',
	  10: 'MKCOL',
	  11: 'MOVE',
	  12: 'PROPFIND',
	  13: 'PROPPATCH',
	  14: 'SEARCH',
	  15: 'UNLOCK',
	  16: 'REPORT',
	  17: 'MKACTIVITY',
	  18: 'CHECKOUT',
	  19: 'MERGE',
	  24: 'PATCH'
	};

	HttpParser.prototype.isComplete = function() {
	  return this._complete;
	};

	HttpParser.prototype.parse = function(chunk) {
	  var offset   = (version < 6) ? 1 : 0,
	      consumed = this._parser.execute(chunk, 0, chunk.length) + offset;

	  if (this._complete)
	    this.body = (consumed < chunk.length)
	              ? chunk.slice(consumed)
	              : new Buffer(0);
	};

	module.exports = HttpParser;


/***/ },

/***/ 39:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var crypto     = __webpack_require__(11),
	    util       = __webpack_require__(23),
	    Extensions = __webpack_require__(40),
	    Base       = __webpack_require__(32),
	    Frame      = __webpack_require__(47),
	    Message    = __webpack_require__(48);

	var Hybi = function(request, url, options) {
	  Base.apply(this, arguments);

	  this._extensions     = new Extensions();
	  this._stage          = 0;
	  this._masking        = this._options.masking;
	  this._protocols      = this._options.protocols || [];
	  this._requireMasking = this._options.requireMasking;
	  this._pingCallbacks  = {};

	  if (typeof this._protocols === 'string')
	    this._protocols = this._protocols.split(/ *, */);

	  if (!this._request) return;

	  var secKey    = this._request.headers['sec-websocket-key'],
	      protos    = this._request.headers['sec-websocket-protocol'],
	      version   = this._request.headers['sec-websocket-version'],
	      supported = this._protocols;

	  this._headers.set('Upgrade', 'websocket');
	  this._headers.set('Connection', 'Upgrade');
	  this._headers.set('Sec-WebSocket-Accept', Hybi.generateAccept(secKey));

	  if (protos !== undefined) {
	    if (typeof protos === 'string') protos = protos.split(/ *, */);
	    this.protocol = protos.filter(function(p) { return supported.indexOf(p) >= 0 })[0];
	    if (this.protocol) this._headers.set('Sec-WebSocket-Protocol', this.protocol);
	  }

	  this.version = 'hybi-' + version;
	};
	util.inherits(Hybi, Base);

	Hybi.mask = function(payload, mask, offset) {
	  if (!mask || mask.length === 0) return payload;
	  offset = offset || 0;

	  for (var i = 0, n = payload.length - offset; i < n; i++) {
	    payload[offset + i] = payload[offset + i] ^ mask[i % 4];
	  }
	  return payload;
	};

	Hybi.generateAccept = function(key) {
	  var sha1 = crypto.createHash('sha1');
	  sha1.update(key + Hybi.GUID);
	  return sha1.digest('base64');
	};

	Hybi.GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

	var instance = {
	  FIN:    0x80,
	  MASK:   0x80,
	  RSV1:   0x40,
	  RSV2:   0x20,
	  RSV3:   0x10,
	  OPCODE: 0x0F,
	  LENGTH: 0x7F,

	  OPCODES: {
	    continuation: 0,
	    text:         1,
	    binary:       2,
	    close:        8,
	    ping:         9,
	    pong:         10
	  },

	  OPCODE_CODES:    [0, 1, 2, 8, 9, 10],
	  MESSAGE_OPCODES: [0, 1, 2],
	  OPENING_OPCODES: [1, 2],

	  ERRORS: {
	    normal_closure:       1000,
	    going_away:           1001,
	    protocol_error:       1002,
	    unacceptable:         1003,
	    encoding_error:       1007,
	    policy_violation:     1008,
	    too_large:            1009,
	    extension_error:      1010,
	    unexpected_condition: 1011
	  },

	  ERROR_CODES:        [1000, 1001, 1002, 1003, 1007, 1008, 1009, 1010, 1011],
	  DEFAULT_ERROR_CODE: 1000,
	  MIN_RESERVED_ERROR: 3000,
	  MAX_RESERVED_ERROR: 4999,

	  // http://www.w3.org/International/questions/qa-forms-utf-8.en.php
	  UTF8_MATCH: /^([\x00-\x7F]|[\xC2-\xDF][\x80-\xBF]|\xE0[\xA0-\xBF][\x80-\xBF]|[\xE1-\xEC\xEE\xEF][\x80-\xBF]{2}|\xED[\x80-\x9F][\x80-\xBF]|\xF0[\x90-\xBF][\x80-\xBF]{2}|[\xF1-\xF3][\x80-\xBF]{3}|\xF4[\x80-\x8F][\x80-\xBF]{2})*$/,

	  addExtension: function(extension) {
	    this._extensions.add(extension);
	    return true;
	  },

	  parse: function(chunk) {
	    this._reader.put(chunk);
	    var buffer = true;
	    while (buffer) {
	      switch (this._stage) {
	        case 0:
	          buffer = this._reader.read(1);
	          if (buffer) this._parseOpcode(buffer[0]);
	          break;

	        case 1:
	          buffer = this._reader.read(1);
	          if (buffer) this._parseLength(buffer[0]);
	          break;

	        case 2:
	          buffer = this._reader.read(this._frame.lengthBytes);
	          if (buffer) this._parseExtendedLength(buffer);
	          break;

	        case 3:
	          buffer = this._reader.read(4);
	          if (buffer) {
	            this._stage = 4;
	            this._frame.maskingKey = buffer;
	          }
	          break;

	        case 4:
	          buffer = this._reader.read(this._frame.length);
	          if (buffer) {
	            this._stage = 0;
	            this._emitFrame(buffer);
	          }
	          break;

	        default:
	          buffer = null;
	      }
	    }
	  },

	  text: function(message) {
	    if (this.readyState > 1) return false;
	    return this.frame(message, 'text');
	  },

	  binary: function(message) {
	    if (this.readyState > 1) return false;
	    return this.frame(message, 'binary');
	  },

	  ping: function(message, callback) {
	    if (this.readyState > 1) return false;
	    message = message || '';
	    if (callback) this._pingCallbacks[message] = callback;
	    return this.frame(message, 'ping');
	  },

	  pong: function(message) {
	      if (this.readyState > 1) return false;
	      message = message ||'';
	      return this.frame(message, 'pong');
	  },

	  close: function(reason, code) {
	    reason = reason || '';
	    code   = code   || this.ERRORS.normal_closure;

	    if (this.readyState <= 0) {
	      this.readyState = 3;
	      this.emit('close', new Base.CloseEvent(code, reason));
	      return true;
	    } else if (this.readyState === 1) {
	      this.readyState = 2;
	      this._extensions.close(function() { this.frame(reason, 'close', code) }, this);
	      return true;
	    } else {
	      return false;
	    }
	  },

	  frame: function(buffer, type, code) {
	    if (this.readyState <= 0) return this._queue([buffer, type, code]);
	    if (this.readyState > 2) return false;

	    if (buffer instanceof Array)    buffer = new Buffer(buffer);
	    if (typeof buffer === 'number') buffer = buffer.toString();

	    var message = new Message(),
	        isText  = (typeof buffer === 'string'),
	        payload, copy;

	    message.rsv1   = message.rsv2 = message.rsv3 = false;
	    message.opcode = this.OPCODES[type || (isText ? 'text' : 'binary')];

	    payload = isText ? new Buffer(buffer, 'utf8') : buffer;

	    if (code) {
	      copy = payload;
	      payload = new Buffer(2 + copy.length);
	      payload.writeUInt16BE(code, 0);
	      copy.copy(payload, 2);
	    }
	    message.data = payload;

	    var onMessageReady = function(message) {
	      var frame = new Frame();

	      frame.final   = true;
	      frame.rsv1    = message.rsv1;
	      frame.rsv2    = message.rsv2;
	      frame.rsv3    = message.rsv3;
	      frame.opcode  = message.opcode;
	      frame.masked  = !!this._masking;
	      frame.length  = message.data.length;
	      frame.payload = message.data;

	      if (frame.masked) frame.maskingKey = crypto.randomBytes(4);

	      this._sendFrame(frame);
	    };

	    if (this.MESSAGE_OPCODES.indexOf(message.opcode) >= 0)
	      this._extensions.processOutgoingMessage(message, function(error, message) {
	        if (error) return this._fail('extension_error', error.message);
	        onMessageReady.call(this, message);
	      }, this);
	    else
	      onMessageReady.call(this, message);

	    return true;
	  },

	  _sendFrame: function(frame) {
	    var length = frame.length,
	        header = (length <= 125) ? 2 : (length <= 65535 ? 4 : 10),
	        offset = header + (frame.masked ? 4 : 0),
	        buffer = new Buffer(offset + length),
	        masked = frame.masked ? this.MASK : 0;

	    buffer[0] = (frame.final ? this.FIN : 0) |
	                (frame.rsv1 ? this.RSV1 : 0) |
	                (frame.rsv2 ? this.RSV2 : 0) |
	                (frame.rsv3 ? this.RSV3 : 0) |
	                frame.opcode;

	    if (length <= 125) {
	      buffer[1] = masked | length;
	    } else if (length <= 65535) {
	      buffer[1] = masked | 126;
	      buffer.writeUInt16BE(length, 2);
	    } else {
	      buffer[1] = masked | 127;
	      buffer.writeUInt32BE(Math.floor(length / 0x100000000), 2);
	      buffer.writeUInt32BE(length % 0x100000000, 6);
	    }

	    frame.payload.copy(buffer, offset);

	    if (frame.masked) {
	      frame.maskingKey.copy(buffer, header);
	      Hybi.mask(buffer, frame.maskingKey, offset);
	    }

	    this._write(buffer);
	  },

	  _handshakeResponse: function() {
	    try {
	      var extensions = this._extensions.generateResponse(this._request.headers['sec-websocket-extensions']);
	    } catch (e) {
	      return this._fail('protocol_error', e.message);
	    }

	    if (extensions) this._headers.set('Sec-WebSocket-Extensions', extensions);

	    var start   = 'HTTP/1.1 101 Switching Protocols',
	        headers = [start, this._headers.toString(), ''];

	    return new Buffer(headers.join('\r\n'), 'utf8');
	  },

	  _shutdown: function(code, reason, error) {
	    delete this._frame;
	    delete this._message;
	    this._stage = 5;

	    var sendCloseFrame = (this.readyState === 1);
	    this.readyState = 2;

	    this._extensions.close(function() {
	      if (sendCloseFrame) this.frame(reason, 'close', code);
	      this.readyState = 3;
	      if (error) this.emit('error', new Error(reason));
	      this.emit('close', new Base.CloseEvent(code, reason));
	    }, this);
	  },

	  _fail: function(type, message) {
	    if (this.readyState > 1) return;
	    this._shutdown(this.ERRORS[type], message, true);
	  },

	  _parseOpcode: function(octet) {
	    var rsvs = [this.RSV1, this.RSV2, this.RSV3].map(function(rsv) {
	      return (octet & rsv) === rsv;
	    });

	    var frame = this._frame = new Frame();

	    frame.final  = (octet & this.FIN) === this.FIN;
	    frame.rsv1   = rsvs[0];
	    frame.rsv2   = rsvs[1];
	    frame.rsv3   = rsvs[2];
	    frame.opcode = (octet & this.OPCODE);

	    this._stage = 1;

	    if (!this._extensions.validFrameRsv(frame))
	      return this._fail('protocol_error',
	          'One or more reserved bits are on: reserved1 = ' + (frame.rsv1 ? 1 : 0) +
	          ', reserved2 = ' + (frame.rsv2 ? 1 : 0) +
	          ', reserved3 = ' + (frame.rsv3 ? 1 : 0));

	    if (this.OPCODE_CODES.indexOf(frame.opcode) < 0)
	      return this._fail('protocol_error', 'Unrecognized frame opcode: ' + frame.opcode);

	    if (this.MESSAGE_OPCODES.indexOf(frame.opcode) < 0 && !frame.final)
	      return this._fail('protocol_error', 'Received fragmented control frame: opcode = ' + frame.opcode);

	    if (this._message && this.OPENING_OPCODES.indexOf(frame.opcode) >= 0)
	      return this._fail('protocol_error', 'Received new data frame but previous continuous frame is unfinished');
	  },

	  _parseLength: function(octet) {
	    var frame = this._frame;
	    frame.masked = (octet & this.MASK) === this.MASK;
	    frame.length = (octet & this.LENGTH);

	    if (frame.length >= 0 && frame.length <= 125) {
	      this._stage = frame.masked ? 3 : 4;
	      if (!this._checkFrameLength()) return;
	    } else {
	      this._stage = 2;
	      frame.lengthBytes = (frame.length === 126 ? 2 : 8);
	    }

	    if (this._requireMasking && !frame.masked)
	      return this._fail('unacceptable', 'Received unmasked frame but masking is required');
	  },

	  _parseExtendedLength: function(buffer) {
	    var frame = this._frame;
	    frame.length = this._readUInt(buffer);

	    this._stage = frame.masked ? 3 : 4;

	    if (this.MESSAGE_OPCODES.indexOf(frame.opcode) < 0 && frame.length > 125)
	      return this._fail('protocol_error', 'Received control frame having too long payload: ' + frame.length);

	    if (!this._checkFrameLength()) return;
	  },

	  _checkFrameLength: function() {
	    var length = this._message ? this._message.length : 0;

	    if (length + this._frame.length > this._maxLength) {
	      this._fail('too_large', 'WebSocket frame length too large');
	      return false;
	    } else {
	      return true;
	    }
	  },

	  _emitFrame: function(buffer) {
	    var frame   = this._frame,
	        payload = frame.payload = Hybi.mask(buffer, frame.maskingKey),
	        opcode  = frame.opcode,
	        message,
	        code, reason,
	        callbacks, callback;

	    delete this._frame;

	    if (opcode === this.OPCODES.continuation) {
	      if (!this._message) return this._fail('protocol_error', 'Received unexpected continuation frame');
	      this._message.pushFrame(frame);
	    }

	    if (opcode === this.OPCODES.text || opcode === this.OPCODES.binary) {
	      this._message = new Message();
	      this._message.pushFrame(frame);
	    }

	    if (frame.final && this.MESSAGE_OPCODES.indexOf(opcode) >= 0)
	      return this._emitMessage(this._message);

	    if (opcode === this.OPCODES.close) {
	      code   = (payload.length >= 2) ? payload.readUInt16BE(0) : null;
	      reason = (payload.length > 2) ? this._encode(payload.slice(2)) : null;

	      if (!(payload.length === 0) &&
	          !(code !== null && code >= this.MIN_RESERVED_ERROR && code <= this.MAX_RESERVED_ERROR) &&
	          this.ERROR_CODES.indexOf(code) < 0)
	        code = this.ERRORS.protocol_error;

	      if (payload.length > 125 || (payload.length > 2 && !reason))
	        code = this.ERRORS.protocol_error;

	      this._shutdown(code || this.DEFAULT_ERROR_CODE, reason || '');
	    }

	    if (opcode === this.OPCODES.ping) {
	      this.frame(payload, 'pong');
	    }

	    if (opcode === this.OPCODES.pong) {
	      callbacks = this._pingCallbacks;
	      message   = this._encode(payload);
	      callback  = callbacks[message];

	      delete callbacks[message];
	      if (callback) callback()
	    }
	  },

	  _emitMessage: function(message) {
	    var message = this._message;
	    message.read();

	    delete this._message;

	    this._extensions.processIncomingMessage(message, function(error, message) {
	      if (error) return this._fail('extension_error', error.message);

	      var payload = message.data;
	      if (message.opcode === this.OPCODES.text) payload = this._encode(payload);

	      if (payload === null)
	        return this._fail('encoding_error', 'Could not decode a text frame as UTF-8');
	      else
	        this.emit('message', new Base.MessageEvent(payload));
	    }, this);
	  },

	  _encode: function(buffer) {
	    try {
	      var string = buffer.toString('binary', 0, buffer.length);
	      if (!this.UTF8_MATCH.test(string)) return null;
	    } catch (e) {}
	    return buffer.toString('utf8', 0, buffer.length);
	  },

	  _readUInt: function(buffer) {
	    if (buffer.length === 2) return buffer.readUInt16BE(0);

	    return buffer.readUInt32BE(0) * 0x100000000 +
	           buffer.readUInt32BE(4);
	  }
	};

	for (var key in instance)
	  Hybi.prototype[key] = instance[key];

	module.exports = Hybi;


/***/ },

/***/ 40:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Parser   = __webpack_require__(41),
	    Pipeline = __webpack_require__(42);

	var Extensions = function() {
	  this._rsv1 = this._rsv2 = this._rsv3 = null;

	  this._byName   = {};
	  this._inOrder  = [];
	  this._sessions = [];
	  this._index    = {}
	};

	Extensions.MESSAGE_OPCODES = [1, 2];

	var instance = {
	  add: function(ext) {
	    if (typeof ext.name !== 'string') throw new TypeError('extension.name must be a string');
	    if (ext.type !== 'permessage') throw new TypeError('extension.type must be "permessage"');

	    if (typeof ext.rsv1 !== 'boolean') throw new TypeError('extension.rsv1 must be true or false');
	    if (typeof ext.rsv2 !== 'boolean') throw new TypeError('extension.rsv2 must be true or false');
	    if (typeof ext.rsv3 !== 'boolean') throw new TypeError('extension.rsv3 must be true or false');

	    if (this._byName.hasOwnProperty(ext.name))
	      throw new TypeError('An extension with name "' + ext.name + '" is already registered');

	    this._byName[ext.name] = ext;
	    this._inOrder.push(ext);
	  },

	  generateOffer: function() {
	    var sessions = [],
	        offer    = [],
	        index    = {};

	    this._inOrder.forEach(function(ext) {
	      var session = ext.createClientSession();
	      if (!session) return;

	      var record = [ext, session];
	      sessions.push(record);
	      index[ext.name] = record;

	      var offers = session.generateOffer();
	      offers = offers ? [].concat(offers) : [];

	      offers.forEach(function(off) {
	        offer.push(Parser.serializeParams(ext.name, off));
	      }, this);
	    }, this);

	    this._sessions = sessions;
	    this._index    = index;

	    return offer.length > 0 ? offer.join(', ') : null;
	  },

	  activate: function(header) {
	    var responses = Parser.parseHeader(header),
	        sessions  = [];

	    responses.eachOffer(function(name, params) {
	      var record = this._index[name];

	      if (!record)
	        throw new Error('Server sent an extension response for unknown extension "' + name + '"');

	      var ext      = record[0],
	          session  = record[1],
	          reserved = this._reserved(ext);

	      if (reserved)
	        throw new Error('Server sent two extension responses that use the RSV' +
	                        reserved[0] + ' bit: "' +
	                        reserved[1] + '" and "' + ext.name + '"');

	      if (session.activate(params) !== true)
	        throw new Error('Server sent unacceptable extension parameters: ' +
	                        Parser.serializeParams(name, params));

	      this._reserve(ext);
	      sessions.push(record);
	    }, this);

	    this._sessions = sessions;
	    this._pipeline = new Pipeline(sessions);
	  },

	  generateResponse: function(header) {
	    var offers   = Parser.parseHeader(header),
	        sessions = [],
	        response = [];

	    this._inOrder.forEach(function(ext) {
	      var offer = offers.byName(ext.name);
	      if (offer.length === 0 || this._reserved(ext)) return;

	      var session = ext.createServerSession(offer);
	      if (!session) return;

	      this._reserve(ext);
	      sessions.push([ext, session]);
	      response.push(Parser.serializeParams(ext.name, session.generateResponse()));
	    }, this);

	    this._sessions = sessions;
	    this._pipeline = new Pipeline(sessions);

	    return response.length > 0 ? response.join(', ') : null;
	  },

	  validFrameRsv: function(frame) {
	    var allowed = {rsv1: false, rsv2: false, rsv3: false},
	        ext;

	    if (Extensions.MESSAGE_OPCODES.indexOf(frame.opcode) >= 0) {
	      for (var i = 0, n = this._sessions.length; i < n; i++) {
	        ext = this._sessions[i][0];
	        allowed.rsv1 = allowed.rsv1 || ext.rsv1;
	        allowed.rsv2 = allowed.rsv2 || ext.rsv2;
	        allowed.rsv3 = allowed.rsv3 || ext.rsv3;
	      }
	    }

	    return (allowed.rsv1 || !frame.rsv1) &&
	           (allowed.rsv2 || !frame.rsv2) &&
	           (allowed.rsv3 || !frame.rsv3);
	  },

	  processIncomingMessage: function(message, callback, context) {
	    this._pipeline.processIncomingMessage(message, callback, context);
	  },

	  processOutgoingMessage: function(message, callback, context) {
	    this._pipeline.processOutgoingMessage(message, callback, context);
	  },

	  close: function(callback, context) {
	    if (!this._pipeline) return callback.call(context);
	    this._pipeline.close(callback, context);
	  },

	  _reserve: function(ext) {
	    this._rsv1 = this._rsv1 || (ext.rsv1 && ext.name);
	    this._rsv2 = this._rsv2 || (ext.rsv2 && ext.name);
	    this._rsv3 = this._rsv3 || (ext.rsv3 && ext.name);
	  },

	  _reserved: function(ext) {
	    if (this._rsv1 && ext.rsv1) return [1, this._rsv1];
	    if (this._rsv2 && ext.rsv2) return [2, this._rsv2];
	    if (this._rsv3 && ext.rsv3) return [3, this._rsv3];
	    return false;
	  }
	};

	for (var key in instance)
	  Extensions.prototype[key] = instance[key];

	module.exports = Extensions;


/***/ },

/***/ 41:
/***/ function(module, exports) {

	'use strict';

	var TOKEN    = /([!#\$%&'\*\+\-\.\^_`\|~0-9a-z]+)/,
	    NOTOKEN  = /([^!#\$%&'\*\+\-\.\^_`\|~0-9a-z])/g,
	    QUOTED   = /"((?:\\[\x00-\x7f]|[^\x00-\x08\x0a-\x1f\x7f"])*)"/,
	    PARAM    = new RegExp(TOKEN.source + '(?:=(?:' + TOKEN.source + '|' + QUOTED.source + '))?'),
	    EXT      = new RegExp(TOKEN.source + '(?: *; *' + PARAM.source + ')*', 'g'),
	    EXT_LIST = new RegExp('^' + EXT.source + '(?: *, *' + EXT.source + ')*$'),
	    NUMBER   = /^-?(0|[1-9][0-9]*)(\.[0-9]+)?$/;

	var Parser = {
	  parseHeader: function(header) {
	    var offers = new Offers();
	    if (header === '' || header === undefined) return offers;

	    if (!EXT_LIST.test(header))
	      throw new SyntaxError('Invalid Sec-WebSocket-Extensions header: ' + header);

	    var values = header.match(EXT);

	    values.forEach(function(value) {
	      var params = value.match(new RegExp(PARAM.source, 'g')),
	          name   = params.shift(),
	          offer  = {};

	      params.forEach(function(param) {
	        var args = param.match(PARAM), key = args[1], data;

	        if (args[2] !== undefined) {
	          data = args[2];
	        } else if (args[3] !== undefined) {
	          data = args[3].replace(/\\/g, '');
	        } else {
	          data = true;
	        }
	        if (NUMBER.test(data)) data = parseFloat(data);

	        if (offer.hasOwnProperty(key)) {
	          offer[key] = [].concat(offer[key]);
	          offer[key].push(data);
	        } else {
	          offer[key] = data;
	        }
	      }, this);
	      offers.push(name, offer);
	    }, this);

	    return offers;
	  },

	  serializeParams: function(name, params) {
	    var values = [];

	    var print = function(key, value) {
	      if (value instanceof Array) {
	        value.forEach(function(v) { print(key, v) });
	      } else if (value === true) {
	        values.push(key);
	      } else if (typeof value === 'number') {
	        values.push(key + '=' + value);
	      } else if (NOTOKEN.test(value)) {
	        values.push(key + '="' + value.replace(/"/g, '\\"') + '"');
	      } else {
	        values.push(key + '=' + value);
	      }
	    };

	    for (var key in params) print(key, params[key]);

	    return [name].concat(values).join('; ');
	  }
	};

	var Offers = function() {
	  this._byName  = {};
	  this._inOrder = [];
	};

	Offers.prototype.push = function(name, params) {
	  this._byName[name] = this._byName[name] || [];
	  this._byName[name].push(params);
	  this._inOrder.push({name: name, params: params});
	};

	Offers.prototype.eachOffer = function(callback, context) {
	  var list = this._inOrder;
	  for (var i = 0, n = list.length; i < n; i++)
	    callback.call(context, list[i].name, list[i].params);
	};

	Offers.prototype.byName = function(name) {
	  return this._byName[name] || [];
	};

	Offers.prototype.toArray = function() {
	  return this._inOrder.slice();
	};

	module.exports = Parser;


/***/ },

/***/ 42:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Cell   = __webpack_require__(43),
	    Pledge = __webpack_require__(46);

	var Pipeline = function(sessions) {
	  this._cells   = sessions.map(function(session) { return new Cell(session) });
	  this._stopped = {incoming: false, outgoing: false};
	};

	Pipeline.prototype.processIncomingMessage = function(message, callback, context) {
	  if (this._stopped.incoming) return;
	  this._loop('incoming', this._cells.length - 1, -1, -1, message, callback, context);
	};

	Pipeline.prototype.processOutgoingMessage = function(message, callback, context) {
	  if (this._stopped.outgoing) return;
	  this._loop('outgoing', 0, this._cells.length, 1, message, callback, context);
	};

	Pipeline.prototype.close = function(callback, context) {
	  this._stopped = {incoming: true, outgoing: true};

	  var closed = this._cells.map(function(a) { return a.close() });
	  if (callback)
	    Pledge.all(closed).then(function() { callback.call(context) });
	};

	Pipeline.prototype._loop = function(direction, start, end, step, message, callback, context) {
	  var cells = this._cells,
	      n     = cells.length,
	      self  = this;

	  while (n--) cells[n].pending(direction);

	  var pipe = function(index, error, msg) {
	    if (index === end) return callback.call(context, error, msg);

	    cells[index][direction](error, msg, function(err, m) {
	      if (err) self._stopped[direction] = true;
	      pipe(index + step, err, m);
	    });
	  };
	  pipe(start, null, message);
	};

	module.exports = Pipeline;


/***/ },

/***/ 43:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Functor = __webpack_require__(44),
	    Pledge  = __webpack_require__(46);

	var Cell = function(tuple) {
	  this._ext     = tuple[0];
	  this._session = tuple[1];

	  this._functors = {
	    incoming: new Functor(this._session, 'processIncomingMessage'),
	    outgoing: new Functor(this._session, 'processOutgoingMessage')
	  };
	};

	Cell.prototype.pending = function(direction) {
	  this._functors[direction].pending += 1;
	};

	Cell.prototype.incoming = function(error, message, callback, context) {
	  this._exec('incoming', error, message, callback, context);
	};

	Cell.prototype.outgoing = function(error, message, callback, context) {
	  this._exec('outgoing', error, message, callback, context);
	};

	Cell.prototype.close = function() {
	  this._closed = this._closed || new Pledge();
	  this._doClose();
	  return this._closed;
	};

	Cell.prototype._exec = function(direction, error, message, callback, context) {
	  this._functors[direction].call(error, message, function(err, msg) {
	    if (err) err.message = this._ext.name + ': ' + err.message;
	    callback.call(context, err, msg);
	    this._doClose();
	  }, this);
	};

	Cell.prototype._doClose = function() {
	  var fin  = this._functors.incoming,
	      fout = this._functors.outgoing;

	  if (!this._closed || fin.pending + fout.pending !== 0) return;
	  if (this._session) this._session.close();
	  this._session = null;
	  this._closed.done();
	};

	module.exports = Cell;


/***/ },

/***/ 44:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var RingBuffer = __webpack_require__(45);

	var Functor = function(session, method) {
	  this._session = session;
	  this._method  = method;
	  this._queue   = new RingBuffer(Functor.QUEUE_SIZE);
	  this._stopped = false;
	  this.pending  = 0;
	};

	Functor.QUEUE_SIZE = 8;

	Functor.prototype.call = function(error, message, callback, context) {
	  if (this._stopped) return;

	  var record = {error: error, message: message, callback: callback, context: context, done: false},
	      called = false,
	      self   = this;

	  this._queue.push(record);

	  if (record.error) {
	    record.done = true;
	    this._stop();
	    return this._flushQueue();
	  }

	  this._session[this._method](message, function(err, msg) {
	    if (!(called ^ (called = true))) return;

	    if (err) {
	      self._stop();
	      record.error   = err;
	      record.message = null;
	    } else {
	      record.message = msg;
	    }

	    record.done = true;
	    self._flushQueue();
	  });
	};

	Functor.prototype._stop = function() {
	  this.pending  = this._queue.length;
	  this._stopped = true;
	};

	Functor.prototype._flushQueue = function() {
	  var queue = this._queue, record;

	  while (queue.length > 0 && queue.peek().done) {
	    this.pending -= 1;
	    record = queue.shift();
	    record.callback.call(record.context, record.error, record.message);
	  }
	};

	module.exports = Functor;


/***/ },

/***/ 45:
/***/ function(module, exports) {

	'use strict';

	var RingBuffer = function(bufferSize) {
	  this._buffer     = new Array(bufferSize);
	  this._bufferSize = bufferSize;
	  this._ringOffset = 0;
	  this._ringSize   = bufferSize;
	  this._head       = 0;
	  this._tail       = 0;
	  this.length      = 0;
	};

	RingBuffer.prototype.push = function(value) {
	  var expandBuffer = false,
	      expandRing   = false;

	  if (this._ringSize < this._bufferSize) {
	    expandBuffer = (this._tail === 0);
	  } else if (this._ringOffset === this._ringSize) {
	    expandBuffer = true;
	    expandRing   = (this._tail === 0);
	  }

	  if (expandBuffer) {
	    this._tail       = this._bufferSize;
	    this._buffer     = this._buffer.concat(new Array(this._bufferSize));
	    this._bufferSize = this._buffer.length;

	    if (expandRing)
	      this._ringSize = this._bufferSize;
	  }

	  this._buffer[this._tail] = value;
	  this.length += 1;
	  if (this._tail < this._ringSize) this._ringOffset += 1;
	  this._tail = (this._tail + 1) % this._bufferSize;
	};

	RingBuffer.prototype.peek = function() {
	  if (this.length === 0) return void 0;
	  return this._buffer[this._head];
	};

	RingBuffer.prototype.shift = function() {
	  if (this.length === 0) return void 0;

	  var value = this._buffer[this._head];
	  this._buffer[this._head] = void 0;
	  this.length -= 1;
	  this._ringOffset -= 1;

	  if (this._ringOffset === 0 && this.length > 0) {
	    this._head       = this._ringSize;
	    this._ringOffset = this.length;
	    this._ringSize   = this._bufferSize;
	  } else {
	    this._head = (this._head + 1) % this._ringSize;
	  }
	  return value;
	};

	module.exports = RingBuffer;


/***/ },

/***/ 46:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var RingBuffer = __webpack_require__(45);

	var Pledge = function() {
	  this._complete  = false;
	  this._callbacks = new RingBuffer(Pledge.QUEUE_SIZE);
	};

	Pledge.QUEUE_SIZE = 4;

	Pledge.all = function(list) {
	  var pledge  = new Pledge(),
	      pending = list.length,
	      n       = pending;

	  if (pending === 0) pledge.done();

	  while (n--) list[n].then(function() {
	    pending -= 1;
	    if (pending === 0) pledge.done();
	  });
	  return pledge;
	};

	Pledge.prototype.then = function(callback) {
	  if (this._complete) callback();
	  else this._callbacks.push(callback);
	};

	Pledge.prototype.done = function() {
	  this._complete = true;
	  var callbacks = this._callbacks, callback;
	  while (callback = callbacks.shift()) callback();
	};

	module.exports = Pledge;


/***/ },

/***/ 47:
/***/ function(module, exports) {

	'use strict';

	var Frame = function() {};

	var instance = {
	  final:        false,
	  rsv1:         false,
	  rsv2:         false,
	  rsv3:         false,
	  opcode:       null,
	  masked:       false,
	  maskingKey:   null,
	  lengthBytes:  1,
	  length:       0,
	  payload:      null
	};

	for (var key in instance)
	  Frame.prototype[key] = instance[key];

	module.exports = Frame;


/***/ },

/***/ 48:
/***/ function(module, exports) {

	'use strict';

	var Message = function() {
	  this.rsv1    = false;
	  this.rsv2    = false;
	  this.rsv3    = false;
	  this.opcode  = null
	  this.length  = 0;
	  this._chunks = [];
	};

	var instance = {
	  read: function() {
	    if (this.data) return this.data;

	    this.data  = new Buffer(this.length);
	    var offset = 0;

	    for (var i = 0, n = this._chunks.length; i < n; i++) {
	      this._chunks[i].copy(this.data, offset);
	      offset += this._chunks[i].length;
	    }
	    return this.data;
	  },

	  pushFrame: function(frame) {
	    this.rsv1 = this.rsv1 || frame.rsv1;
	    this.rsv2 = this.rsv2 || frame.rsv2;
	    this.rsv3 = this.rsv3 || frame.rsv3;

	    if (this.opcode === null) this.opcode = frame.opcode;

	    this._chunks.push(frame.payload);
	    this.length += frame.length;
	  }
	};

	for (var key in instance)
	  Message.prototype[key] = instance[key];

	module.exports = Message;


/***/ },

/***/ 49:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Stream     = __webpack_require__(34).Stream,
	    url        = __webpack_require__(2),
	    util       = __webpack_require__(23),
	    Base       = __webpack_require__(32),
	    Headers    = __webpack_require__(35),
	    HttpParser = __webpack_require__(38);

	var PORTS = {'ws:': 80, 'wss:': 443};

	var Proxy = function(client, origin, options) {
	  this._client  = client;
	  this._http    = new HttpParser('response');
	  this._origin  = (typeof client.url === 'object') ? client.url : url.parse(client.url);
	  this._url     = (typeof origin === 'object') ? origin : url.parse(origin);
	  this._options = options || {};
	  this._state   = 0;

	  this.readable = this.writable = true;
	  this._paused  = false;

	  this._headers = new Headers();
	  this._headers.set('Host', this._origin.host);
	  this._headers.set('Connection', 'keep-alive');
	  this._headers.set('Proxy-Connection', 'keep-alive');

	  var auth = this._url.auth && new Buffer(this._url.auth, 'utf8').toString('base64');
	  if (auth) this._headers.set('Proxy-Authorization', 'Basic ' + auth);
	};
	util.inherits(Proxy, Stream);

	var instance = {
	  setHeader: function(name, value) {
	    if (this._state !== 0) return false;
	    this._headers.set(name, value);
	    return true;
	  },

	  start: function() {
	    if (this._state !== 0) return false;
	    this._state = 1;

	    var origin = this._origin,
	        port   = origin.port || PORTS[origin.protocol],
	        start  = 'CONNECT ' + origin.hostname + ':' + port + ' HTTP/1.1';

	    var headers = [start, this._headers.toString(), ''];

	    this.emit('data', new Buffer(headers.join('\r\n'), 'utf8'));
	    return true;
	  },

	  pause: function() {
	    this._paused = true;
	  },

	  resume: function() {
	    this._paused = false;
	    this.emit('drain');
	  },

	  write: function(chunk) {
	    if (!this.writable) return false;

	    this._http.parse(chunk);
	    if (!this._http.isComplete()) return !this._paused;

	    this.statusCode = this._http.statusCode;
	    this.headers    = this._http.headers;

	    if (this.statusCode === 200) {
	      this.emit('connect', new Base.ConnectEvent());
	    } else {
	      var message = "Can't establish a connection to the server at " + this._origin.href;
	      this.emit('error', new Error(message));
	    }
	    this.end();
	    return !this._paused;
	  },

	  end: function(chunk) {
	    if (!this.writable) return;
	    if (chunk !== undefined) this.write(chunk);
	    this.readable = this.writable = false;
	    this.emit('close');
	    this.emit('end');
	  },

	  destroy: function() {
	    this.end();
	  }
	};

	for (var key in instance)
	  Proxy.prototype[key] = instance[key];

	module.exports = Proxy;


/***/ },

/***/ 50:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var util       = __webpack_require__(23),
	    HttpParser = __webpack_require__(38),
	    Base       = __webpack_require__(32),
	    Draft75    = __webpack_require__(51),
	    Draft76    = __webpack_require__(52),
	    Hybi       = __webpack_require__(39);

	var Server = function(options) {
	  Base.call(this, null, null, options);
	  this._http = new HttpParser('request');
	};
	util.inherits(Server, Base);

	var instance = {
	  EVENTS: ['open', 'message', 'error', 'close'],

	  _bindEventListeners: function() {
	    this.messages.on('error', function() {});
	    this.on('error', function() {});
	  },

	  parse: function(chunk) {
	    if (this._delegate) return this._delegate.parse(chunk);

	    this._http.parse(chunk);
	    if (!this._http.isComplete()) return;

	    this.method  = this._http.method;
	    this.url     = this._http.url;
	    this.headers = this._http.headers;
	    this.body    = this._http.body;

	    var self = this;
	    this._delegate = Server.http(this, this._options);
	    this._delegate.messages = this.messages;
	    this._delegate.io = this.io;
	    this._open();

	    this.EVENTS.forEach(function(event) {
	      this._delegate.on(event, function(e) { self.emit(event, e) });
	    }, this);

	    this.protocol = this._delegate.protocol;
	    this.version  = this._delegate.version;

	    this.parse(this._http.body);
	    this.emit('connect', new Base.ConnectEvent());
	  },

	  _open: function() {
	    this.__queue.forEach(function(msg) {
	      this._delegate[msg[0]].apply(this._delegate, msg[1]);
	    }, this);
	    this.__queue = [];
	  }
	};

	['addExtension', 'setHeader', 'start', 'frame', 'text', 'binary', 'ping', 'close'].forEach(function(method) {
	  instance[method] = function() {
	    if (this._delegate) {
	      return this._delegate[method].apply(this._delegate, arguments);
	    } else {
	      this.__queue.push([method, arguments]);
	      return true;
	    }
	  };
	});

	for (var key in instance)
	  Server.prototype[key] = instance[key];

	Server.isSecureRequest = function(request) {
	  if (request.connection && request.connection.authorized !== undefined) return true;
	  if (request.socket && request.socket.secure) return true;

	  var headers = request.headers;
	  if (!headers) return false;
	  if (headers['https'] === 'on') return true;
	  if (headers['x-forwarded-ssl'] === 'on') return true;
	  if (headers['x-forwarded-scheme'] === 'https') return true;
	  if (headers['x-forwarded-proto'] === 'https') return true;

	  return false;
	};

	Server.determineUrl = function(request) {
	  var scheme = this.isSecureRequest(request) ? 'wss:' : 'ws:';
	  return scheme + '//' + request.headers.host + request.url;
	};

	Server.http = function(request, options) {
	  options = options || {};
	  if (options.requireMasking === undefined) options.requireMasking = true;

	  var headers = request.headers,
	      url     = this.determineUrl(request);

	  if (headers['sec-websocket-version'])
	    return new Hybi(request, url, options);
	  else if (headers['sec-websocket-key1'])
	    return new Draft76(request, url, options);
	  else
	    return new Draft75(request, url, options);
	};

	module.exports = Server;


/***/ },

/***/ 51:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Base = __webpack_require__(32),
	    util = __webpack_require__(23);

	var Draft75 = function(request, url, options) {
	  Base.apply(this, arguments);
	  this._stage  = 0;
	  this.version = 'hixie-75';

	  this._headers.set('Upgrade', 'WebSocket');
	  this._headers.set('Connection', 'Upgrade');
	  this._headers.set('WebSocket-Origin', this._request.headers.origin);
	  this._headers.set('WebSocket-Location', this.url);
	};
	util.inherits(Draft75, Base);

	var instance = {
	  close: function() {
	    if (this.readyState === 3) return false;
	    this.readyState = 3;
	    this.emit('close', new Base.CloseEvent(null, null));
	    return true;
	  },

	  parse: function(chunk) {
	    if (this.readyState > 1) return;

	    this._reader.put(chunk);

	    this._reader.eachByte(function(octet) {
	      var message;

	      switch (this._stage) {
	        case -1:
	          this._body.push(octet);
	          this._sendHandshakeBody();
	          break;

	        case 0:
	          this._parseLeadingByte(octet);
	          break;

	        case 1:
	          this._length = (octet & 0x7F) + 128 * this._length;

	          if (this._closing && this._length === 0) {
	            return this.close();
	          }
	          else if ((octet & 0x80) !== 0x80) {
	            if (this._length === 0) {
	              this._stage = 0;
	            }
	            else {
	              this._skipped = 0;
	              this._stage   = 2;
	            }
	          }
	          break;

	        case 2:
	          if (octet === 0xFF) {
	            this._stage = 0;
	            message = new Buffer(this._buffer).toString('utf8', 0, this._buffer.length);
	            this.emit('message', new Base.MessageEvent(message));
	          }
	          else {
	            if (this._length) {
	              this._skipped += 1;
	              if (this._skipped === this._length)
	                this._stage = 0;
	            } else {
	              this._buffer.push(octet);
	              if (this._buffer.length > this._maxLength) return this.close();
	            }
	          }
	          break;
	      }
	    }, this);
	  },

	  frame: function(buffer) {
	    if (this.readyState === 0) return this._queue([buffer]);
	    if (this.readyState > 1) return false;

	    if (typeof buffer !== 'string') buffer = buffer.toString();

	    var payload = new Buffer(buffer, 'utf8'),
	        frame   = new Buffer(payload.length + 2);

	    frame[0] = 0x00;
	    frame[payload.length + 1] = 0xFF;
	    payload.copy(frame, 1);

	    this._write(frame);
	    return true;
	  },

	  _handshakeResponse: function() {
	    var start   = 'HTTP/1.1 101 Web Socket Protocol Handshake',
	        headers = [start, this._headers.toString(), ''];

	    return new Buffer(headers.join('\r\n'), 'utf8');
	  },

	  _parseLeadingByte: function(octet) {
	    if ((octet & 0x80) === 0x80) {
	      this._length = 0;
	      this._stage  = 1;
	    } else {
	      delete this._length;
	      delete this._skipped;
	      this._buffer = [];
	      this._stage  = 2;
	    }
	  }
	};

	for (var key in instance)
	  Draft75.prototype[key] = instance[key];

	module.exports = Draft75;


/***/ },

/***/ 52:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Base    = __webpack_require__(32),
	    Draft75 = __webpack_require__(51),
	    crypto  = __webpack_require__(11),
	    util    = __webpack_require__(23);


	var numberFromKey = function(key) {
	  return parseInt(key.match(/[0-9]/g).join(''), 10);
	};

	var spacesInKey = function(key) {
	  return key.match(/ /g).length;
	};


	var Draft76 = function(request, url, options) {
	  Draft75.apply(this, arguments);
	  this._stage  = -1;
	  this._body   = [];
	  this.version = 'hixie-76';

	  this._headers.clear();

	  this._headers.set('Upgrade', 'WebSocket');
	  this._headers.set('Connection', 'Upgrade');
	  this._headers.set('Sec-WebSocket-Origin', this._request.headers.origin);
	  this._headers.set('Sec-WebSocket-Location', this.url);
	};
	util.inherits(Draft76, Draft75);

	var instance = {
	  BODY_SIZE: 8,

	  start: function() {
	    if (!Draft75.prototype.start.call(this)) return false;
	    this._started = true;
	    this._sendHandshakeBody();
	    return true;
	  },

	  close: function() {
	    if (this.readyState === 3) return false;
	    this._write(new Buffer([0xFF, 0x00]));
	    this.readyState = 3;
	    this.emit('close', new Base.CloseEvent(null, null));
	    return true;
	  },

	  _handshakeResponse: function() {
	    var headers = this._request.headers,

	        key1    = headers['sec-websocket-key1'],
	        number1 = numberFromKey(key1),
	        spaces1 = spacesInKey(key1),

	        key2    = headers['sec-websocket-key2'],
	        number2 = numberFromKey(key2),
	        spaces2 = spacesInKey(key2);

	    if (number1 % spaces1 !== 0 || number2 % spaces2 !== 0) {
	      this.emit('error', new Error('Client sent invalid Sec-WebSocket-Key headers'));
	      this.close();
	      return null;
	    }

	    this._keyValues = [number1 / spaces1, number2 / spaces2];

	    var start   = 'HTTP/1.1 101 WebSocket Protocol Handshake',
	        headers = [start, this._headers.toString(), ''];

	    return new Buffer(headers.join('\r\n'), 'binary');
	  },

	  _handshakeSignature: function() {
	    if (this._body.length < this.BODY_SIZE) return null;

	    var md5    = crypto.createHash('md5'),
	        buffer = new Buffer(8 + this.BODY_SIZE);

	    buffer.writeUInt32BE(this._keyValues[0], 0);
	    buffer.writeUInt32BE(this._keyValues[1], 4);
	    new Buffer(this._body).copy(buffer, 8, 0, this.BODY_SIZE);

	    md5.update(buffer);
	    return new Buffer(md5.digest('binary'), 'binary');
	  },

	  _sendHandshakeBody: function() {
	    if (!this._started) return;
	    var signature = this._handshakeSignature();
	    if (!signature) return;

	    this._write(signature);
	    this._stage = 0;
	    this._open();

	    if (this._body.length > this.BODY_SIZE)
	      this.parse(this._body.slice(this.BODY_SIZE));
	  },

	  _parseLeadingByte: function(octet) {
	    if (octet !== 0xFF)
	      return Draft75.prototype._parseLeadingByte.call(this, octet);

	    this._closing = true;
	    this._length  = 0;
	    this._stage   = 1;
	  }
	};

	for (var key in instance)
	  Draft76.prototype[key] = instance[key];

	module.exports = Draft76;


/***/ },

/***/ 53:
/***/ function(module, exports, __webpack_require__) {

	var Stream      = __webpack_require__(34).Stream,
	    util        = __webpack_require__(23),
	    driver      = __webpack_require__(31),
	    EventTarget = __webpack_require__(54),
	    Event       = __webpack_require__(55);

	var API = function(options) {
	  options = options || {};
	  driver.validateOptions(options, ['headers', 'extensions', 'maxLength', 'ping', 'proxy', 'tls', 'ca']);

	  this.readable = this.writable = true;

	  var headers = options.headers;
	  if (headers) {
	    for (var name in headers) this._driver.setHeader(name, headers[name]);
	  }

	  var extensions = options.extensions;
	  if (extensions) {
	    [].concat(extensions).forEach(this._driver.addExtension, this._driver);
	  }

	  this._ping          = options.ping;
	  this._pingId        = 0;
	  this.readyState     = API.CONNECTING;
	  this.bufferedAmount = 0;
	  this.protocol       = '';
	  this.url            = this._driver.url;
	  this.version        = this._driver.version;

	  var self = this;

	  this._driver.on('open',    function(e) { self._open() });
	  this._driver.on('message', function(e) { self._receiveMessage(e.data) });
	  this._driver.on('close',   function(e) { self._beginClose(e.reason, e.code) });

	  this._driver.on('error', function(error) {
	    self._emitError(error.message);
	  });
	  this.on('error', function() {});

	  this._driver.messages.on('drain', function() {
	    self.emit('drain');
	  });

	  if (this._ping)
	    this._pingTimer = setInterval(function() {
	      self._pingId += 1;
	      self.ping(self._pingId.toString());
	    }, this._ping * 1000);

	  this._configureStream();

	  if (!this._proxy) {
	    this._stream.pipe(this._driver.io);
	    this._driver.io.pipe(this._stream);
	  }
	};
	util.inherits(API, Stream);

	API.CONNECTING = 0;
	API.OPEN       = 1;
	API.CLOSING    = 2;
	API.CLOSED     = 3;

	var instance = {
	  write: function(data) {
	    return this.send(data);
	  },

	  end: function(data) {
	    if (data !== undefined) this.send(data);
	    this.close();
	  },

	  pause: function() {
	    return this._driver.messages.pause();
	  },

	  resume: function() {
	    return this._driver.messages.resume();
	  },

	  send: function(data) {
	    if (this.readyState > API.OPEN) return false;
	    if (!(data instanceof Buffer)) data = String(data);
	    return this._driver.messages.write(data);
	  },

	  ping: function(message, callback) {
	    if (this.readyState > API.OPEN) return false;
	    return this._driver.ping(message, callback);
	  },

	  close: function(code, reason) {
	    if (code === undefined) code = 1000;
	    if (reason === undefined) reason = '';

	    if (code !== 1000 && (code < 3000 || code > 4999))
	      throw new Error("Failed to execute 'close' on WebSocket: " +
	                      "The code must be either 1000, or between 3000 and 4999. " +
	                      code + " is neither.");

	    if (this.readyState !== API.CLOSED) this.readyState = API.CLOSING;
	    this._driver.close(reason, code);
	  },

	  _configureStream: function() {
	    var self = this;

	    this._stream.setTimeout(0);
	    this._stream.setNoDelay(true);

	    ['close', 'end'].forEach(function(event) {
	      this._stream.on(event, function() { self._finalizeClose() });
	    }, this);

	    this._stream.on('error', function(error) {
	      self._emitError('Network error: ' + self.url + ': ' + error.message);
	      self._finalizeClose();
	    });
	  },

	 _open: function() {
	    if (this.readyState !== API.CONNECTING) return;

	    this.readyState = API.OPEN;
	    this.protocol = this._driver.protocol || '';

	    var event = new Event('open');
	    event.initEvent('open', false, false);
	    this.dispatchEvent(event);
	  },

	  _receiveMessage: function(data) {
	    if (this.readyState > API.OPEN) return false;

	    if (this.readable) this.emit('data', data);

	    var event = new Event('message', {data: data});
	    event.initEvent('message', false, false);
	    this.dispatchEvent(event);
	  },

	  _emitError: function(message) {
	    if (this.readyState >= API.CLOSING) return;

	    var event = new Event('error', {message: message});
	    event.initEvent('error', false, false);
	    this.dispatchEvent(event);
	  },

	  _beginClose: function(reason, code) {
	    if (this.readyState === API.CLOSED) return;
	    this.readyState = API.CLOSING;
	    this._closeParams = [reason, code];

	    if (this._stream) {
	      this._stream.end();
	      if (!this._stream.readable) this._finalizeClose();
	    }
	  },

	  _finalizeClose: function() {
	    if (this.readyState === API.CLOSED) return;
	    this.readyState = API.CLOSED;

	    if (this._pingTimer) clearInterval(this._pingTimer);
	    if (this._stream) this._stream.end();

	    if (this.readable) this.emit('end');
	    this.readable = this.writable = false;

	    var reason = this._closeParams ? this._closeParams[0] : '',
	        code   = this._closeParams ? this._closeParams[1] : 1006;

	    var event = new Event('close', {code: code, reason: reason});
	    event.initEvent('close', false, false);
	    this.dispatchEvent(event);
	  }
	};

	for (var method in instance) API.prototype[method] = instance[method];
	for (var key in EventTarget) API.prototype[key] = EventTarget[key];

	module.exports = API;


/***/ },

/***/ 54:
/***/ function(module, exports, __webpack_require__) {

	var Event = __webpack_require__(55);

	var EventTarget = {
	  onopen:     null,
	  onmessage:  null,
	  onerror:    null,
	  onclose:    null,

	  addEventListener: function(eventType, listener, useCapture) {
	    this.on(eventType, listener);
	  },

	  removeEventListener: function(eventType, listener, useCapture) {
	    this.removeListener(eventType, listener);
	  },

	  dispatchEvent: function(event) {
	    event.target = event.currentTarget = this;
	    event.eventPhase = Event.AT_TARGET;

	    if (this['on' + event.type])
	      this['on' + event.type](event);

	    this.emit(event.type, event);
	  }
	};

	module.exports = EventTarget;


/***/ },

/***/ 55:
/***/ function(module, exports) {

	var Event = function(eventType, options) {
	  this.type = eventType;
	  for (var key in options)
	    this[key] = options[key];
	};

	Event.prototype.initEvent = function(eventType, canBubble, cancelable) {
	  this.type       = eventType;
	  this.bubbles    = canBubble;
	  this.cancelable = cancelable;
	};

	Event.prototype.stopPropagation = function() {};
	Event.prototype.preventDefault  = function() {};

	Event.CAPTURING_PHASE = 1;
	Event.AT_TARGET       = 2;
	Event.BUBBLING_PHASE  = 3;

	module.exports = Event;


/***/ },

/***/ 56:
/***/ function(module, exports, __webpack_require__) {

	var util   = __webpack_require__(23),
	    net    = __webpack_require__(25),
	    tls    = __webpack_require__(57),
	    url    = __webpack_require__(2),
	    driver = __webpack_require__(31),
	    API    = __webpack_require__(53),
	    Event  = __webpack_require__(55);

	var DEFAULT_PORTS    = {'http:': 80, 'https:': 443, 'ws:':80, 'wss:': 443},
	    SECURE_PROTOCOLS = ['https:', 'wss:'];

	var Client = function(_url, protocols, options) {
	  options = options || {};

	  this.url     = _url;
	  this._driver = driver.client(this.url, {maxLength: options.maxLength, protocols: protocols});

	  ['open', 'error'].forEach(function(event) {
	    this._driver.on(event, function() {
	      self.headers    = self._driver.headers;
	      self.statusCode = self._driver.statusCode;
	    });
	  }, this);

	  var proxy      = options.proxy || {},
	      endpoint   = url.parse(proxy.origin || this.url),
	      port       = endpoint.port || DEFAULT_PORTS[endpoint.protocol],
	      secure     = SECURE_PROTOCOLS.indexOf(endpoint.protocol) >= 0,
	      onConnect  = function() { self._onConnect() },
	      netOptions = options.net || {},
	      originTLS  = options.tls || {},
	      socketTLS  = proxy.origin ? (proxy.tls || {}) : originTLS,
	      self       = this;

	  netOptions.host = socketTLS.host = endpoint.hostname;
	  netOptions.port = socketTLS.port = port;

	  originTLS.ca = originTLS.ca || options.ca;
	  socketTLS.servername = socketTLS.servername || endpoint.hostname;

	  this._stream = secure
	               ? tls.connect(socketTLS, onConnect)
	               : net.connect(netOptions, onConnect);

	  if (proxy.origin) this._configureProxy(proxy, originTLS);

	  API.call(this, options);
	};
	util.inherits(Client, API);

	Client.prototype._onConnect = function() {
	  var worker = this._proxy || this._driver;
	  worker.start();
	};

	Client.prototype._configureProxy = function(proxy, originTLS) {
	  var uri    = url.parse(this.url),
	      secure = SECURE_PROTOCOLS.indexOf(uri.protocol) >= 0,
	      self   = this,
	      name;

	  this._proxy = this._driver.proxy(proxy.origin);

	  if (proxy.headers) {
	    for (name in proxy.headers) this._proxy.setHeader(name, proxy.headers[name]);
	  }

	  this._proxy.pipe(this._stream, {end: false});
	  this._stream.pipe(this._proxy);

	  this._proxy.on('connect', function() {
	    if (secure) {
	      var options = {socket: self._stream, servername: uri.hostname};
	      for (name in originTLS) options[name] = originTLS[name];
	      self._stream = tls.connect(options);
	      self._configureStream();
	    }
	    self._driver.io.pipe(self._stream);
	    self._stream.pipe(self._driver.io);
	    self._driver.start();
	  });

	  this._proxy.on('error', function(error) {
	    self._driver.emit('error', error);
	  });
	};

	module.exports = Client;


/***/ },

/***/ 57:
/***/ function(module, exports) {

	module.exports = require("tls");

/***/ },

/***/ 58:
/***/ function(module, exports, __webpack_require__) {

	var Stream      = __webpack_require__(34).Stream,
	    util        = __webpack_require__(23),
	    driver      = __webpack_require__(31),
	    Headers     = __webpack_require__(35),
	    API         = __webpack_require__(53),
	    EventTarget = __webpack_require__(54),
	    Event       = __webpack_require__(55);

	var EventSource = function(request, response, options) {
	  this.writable = true;
	  options = options || {};

	  this._stream = response.socket;
	  this._ping   = options.ping  || this.DEFAULT_PING;
	  this._retry  = options.retry || this.DEFAULT_RETRY;

	  var scheme       = driver.isSecureRequest(request) ? 'https:' : 'http:';
	  this.url         = scheme + '//' + request.headers.host + request.url;
	  this.lastEventId = request.headers['last-event-id'] || '';
	  this.readyState  = API.CONNECTING;

	  var headers = new Headers(),
	      self    = this;

	  if (options.headers) {
	    for (var key in options.headers) headers.set(key, options.headers[key]);
	  }

	  if (!this._stream || !this._stream.writable) return;
	  process.nextTick(function() { self._open() });

	  this._stream.setTimeout(0);
	  this._stream.setNoDelay(true);

	  var handshake = 'HTTP/1.1 200 OK\r\n' +
	                  'Content-Type: text/event-stream\r\n' +
	                  'Cache-Control: no-cache, no-store\r\n' +
	                  'Connection: close\r\n' +
	                  headers.toString() +
	                  '\r\n' +
	                  'retry: ' + Math.floor(this._retry * 1000) + '\r\n\r\n';

	  this._write(handshake);

	  this._stream.on('drain', function() { self.emit('drain') });

	  if (this._ping)
	    this._pingTimer = setInterval(function() { self.ping() }, this._ping * 1000);

	  ['error', 'end'].forEach(function(event) {
	    self._stream.on(event, function() { self.close() });
	  });
	};
	util.inherits(EventSource, Stream);

	EventSource.isEventSource = function(request) {
	  if (request.method !== 'GET') return false;
	  var accept = (request.headers.accept || '').split(/\s*,\s*/);
	  return accept.indexOf('text/event-stream') >= 0;
	};

	var instance = {
	  DEFAULT_PING:   10,
	  DEFAULT_RETRY:  5,

	  _write: function(chunk) {
	    if (!this.writable) return false;
	    try {
	      return this._stream.write(chunk, 'utf8');
	    } catch (e) {
	      return false;
	    }
	  },

	  _open: function() {
	    if (this.readyState !== API.CONNECTING) return;

	    this.readyState = API.OPEN;

	    var event = new Event('open');
	    event.initEvent('open', false, false);
	    this.dispatchEvent(event);
	  },

	  write: function(message) {
	    return this.send(message);
	  },

	  end: function(message) {
	    if (message !== undefined) this.write(message);
	    this.close();
	  },

	  send: function(message, options) {
	    if (this.readyState > API.OPEN) return false;

	    message = String(message).replace(/(\r\n|\r|\n)/g, '$1data: ');
	    options = options || {};

	    var frame = '';
	    if (options.event) frame += 'event: ' + options.event + '\r\n';
	    if (options.id)    frame += 'id: '    + options.id    + '\r\n';
	    frame += 'data: ' + message + '\r\n\r\n';

	    return this._write(frame);
	  },

	  ping: function() {
	    return this._write(':\r\n\r\n');
	  },

	  close: function() {
	    if (this.readyState > API.OPEN) return false;

	    this.readyState = API.CLOSED;
	    this.writable = false;
	    if (this._pingTimer) clearInterval(this._pingTimer);
	    if (this._stream) this._stream.end();

	    var event = new Event('close');
	    event.initEvent('close', false, false);
	    this.dispatchEvent(event);

	    return true;
	  }
	};

	for (var method in instance) EventSource.prototype[method] = instance[method];
	for (var key in EventTarget) EventSource.prototype[key] = EventTarget[key];

	module.exports = EventSource;


/***/ },

/***/ 59:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var inherits = __webpack_require__(26)
	  , AjaxBasedTransport = __webpack_require__(60)
	  , XhrReceiver = __webpack_require__(64)
	  , XHRCorsObject = __webpack_require__(65)
	  , XHRLocalObject = __webpack_require__(69)
	  , browser = __webpack_require__(70)
	  ;

	function XhrStreamingTransport(transUrl) {
	  if (!XHRLocalObject.enabled && !XHRCorsObject.enabled) {
	    throw new Error('Transport created when disabled');
	  }
	  AjaxBasedTransport.call(this, transUrl, '/xhr_streaming', XhrReceiver, XHRCorsObject);
	}

	inherits(XhrStreamingTransport, AjaxBasedTransport);

	XhrStreamingTransport.enabled = function(info) {
	  if (info.nullOrigin) {
	    return false;
	  }
	  // Opera doesn't support xhr-streaming #60
	  // But it might be able to #92
	  if (browser.isOpera()) {
	    return false;
	  }

	  return XHRCorsObject.enabled;
	};

	XhrStreamingTransport.transportName = 'xhr-streaming';
	XhrStreamingTransport.roundTrips = 2; // preflight, ajax

	// Safari gets confused when a streaming ajax request is started
	// before onload. This causes the load indicator to spin indefinetely.
	// Only require body when used in a browser
	XhrStreamingTransport.needBody = !!global.document;

	module.exports = XhrStreamingTransport;


/***/ },

/***/ 60:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var inherits = __webpack_require__(26)
	  , urlUtils = __webpack_require__(12)
	  , SenderReceiver = __webpack_require__(61)
	  ;

	var debug = function() {};
	if ((undefined) !== 'production') {
	  debug = __webpack_require__(17)('sockjs-client:ajax-based');
	}

	function createAjaxSender(AjaxObject) {
	  return function(url, payload, callback) {
	    debug('create ajax sender', url, payload);
	    var opt = {};
	    if (typeof payload === 'string') {
	      opt.headers = {'Content-type': 'text/plain'};
	    }
	    var ajaxUrl = urlUtils.addPath(url, '/xhr_send');
	    var xo = new AjaxObject('POST', ajaxUrl, payload, opt);
	    xo.once('finish', function(status) {
	      debug('finish', status);
	      xo = null;

	      if (status !== 200 && status !== 204) {
	        return callback(new Error('http status ' + status));
	      }
	      callback();
	    });
	    return function() {
	      debug('abort');
	      xo.close();
	      xo = null;

	      var err = new Error('Aborted');
	      err.code = 1000;
	      callback(err);
	    };
	  };
	}

	function AjaxBasedTransport(transUrl, urlSuffix, Receiver, AjaxObject) {
	  SenderReceiver.call(this, transUrl, urlSuffix, createAjaxSender(AjaxObject), Receiver, AjaxObject);
	}

	inherits(AjaxBasedTransport, SenderReceiver);

	module.exports = AjaxBasedTransport;


/***/ },

/***/ 61:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var inherits = __webpack_require__(26)
	  , urlUtils = __webpack_require__(12)
	  , BufferedSender = __webpack_require__(62)
	  , Polling = __webpack_require__(63)
	  ;

	var debug = function() {};
	if ((undefined) !== 'production') {
	  debug = __webpack_require__(17)('sockjs-client:sender-receiver');
	}

	function SenderReceiver(transUrl, urlSuffix, senderFunc, Receiver, AjaxObject) {
	  var pollUrl = urlUtils.addPath(transUrl, urlSuffix);
	  debug(pollUrl);
	  var self = this;
	  BufferedSender.call(this, transUrl, senderFunc);

	  this.poll = new Polling(Receiver, pollUrl, AjaxObject);
	  this.poll.on('message', function(msg) {
	    debug('poll message', msg);
	    self.emit('message', msg);
	  });
	  this.poll.once('close', function(code, reason) {
	    debug('poll close', code, reason);
	    self.poll = null;
	    self.emit('close', code, reason);
	    self.close();
	  });
	}

	inherits(SenderReceiver, BufferedSender);

	SenderReceiver.prototype.close = function() {
	  debug('close');
	  this.removeAllListeners();
	  if (this.poll) {
	    this.poll.abort();
	    this.poll = null;
	  }
	  this.stop();
	};

	module.exports = SenderReceiver;


/***/ },

/***/ 62:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var inherits = __webpack_require__(26)
	  , EventEmitter = __webpack_require__(28).EventEmitter
	  ;

	var debug = function() {};
	if ((undefined) !== 'production') {
	  debug = __webpack_require__(17)('sockjs-client:buffered-sender');
	}

	function BufferedSender(url, sender) {
	  debug(url);
	  EventEmitter.call(this);
	  this.sendBuffer = [];
	  this.sender = sender;
	  this.url = url;
	}

	inherits(BufferedSender, EventEmitter);

	BufferedSender.prototype.send = function(message) {
	  debug('send', message);
	  this.sendBuffer.push(message);
	  if (!this.sendStop) {
	    this.sendSchedule();
	  }
	};

	// For polling transports in a situation when in the message callback,
	// new message is being send. If the sending connection was started
	// before receiving one, it is possible to saturate the network and
	// timeout due to the lack of receiving socket. To avoid that we delay
	// sending messages by some small time, in order to let receiving
	// connection be started beforehand. This is only a halfmeasure and
	// does not fix the big problem, but it does make the tests go more
	// stable on slow networks.
	BufferedSender.prototype.sendScheduleWait = function() {
	  debug('sendScheduleWait');
	  var self = this;
	  var tref;
	  this.sendStop = function() {
	    debug('sendStop');
	    self.sendStop = null;
	    clearTimeout(tref);
	  };
	  tref = setTimeout(function() {
	    debug('timeout');
	    self.sendStop = null;
	    self.sendSchedule();
	  }, 25);
	};

	BufferedSender.prototype.sendSchedule = function() {
	  debug('sendSchedule', this.sendBuffer.length);
	  var self = this;
	  if (this.sendBuffer.length > 0) {
	    var payload = '[' + this.sendBuffer.join(',') + ']';
	    this.sendStop = this.sender(this.url, payload, function(err) {
	      self.sendStop = null;
	      if (err) {
	        debug('error', err);
	        self.emit('close', err.code || 1006, 'Sending error: ' + err);
	        self._cleanup();
	      } else {
	        self.sendScheduleWait();
	      }
	    });
	    this.sendBuffer = [];
	  }
	};

	BufferedSender.prototype._cleanup = function() {
	  debug('_cleanup');
	  this.removeAllListeners();
	};

	BufferedSender.prototype.stop = function() {
	  debug('stop');
	  this._cleanup();
	  if (this.sendStop) {
	    this.sendStop();
	    this.sendStop = null;
	  }
	};

	module.exports = BufferedSender;


/***/ },

/***/ 63:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var inherits = __webpack_require__(26)
	  , EventEmitter = __webpack_require__(28).EventEmitter
	  ;

	var debug = function() {};
	if ((undefined) !== 'production') {
	  debug = __webpack_require__(17)('sockjs-client:polling');
	}

	function Polling(Receiver, receiveUrl, AjaxObject) {
	  debug(receiveUrl);
	  EventEmitter.call(this);
	  this.Receiver = Receiver;
	  this.receiveUrl = receiveUrl;
	  this.AjaxObject = AjaxObject;
	  this._scheduleReceiver();
	}

	inherits(Polling, EventEmitter);

	Polling.prototype._scheduleReceiver = function() {
	  debug('_scheduleReceiver');
	  var self = this;
	  var poll = this.poll = new this.Receiver(this.receiveUrl, this.AjaxObject);

	  poll.on('message', function(msg) {
	    debug('message', msg);
	    self.emit('message', msg);
	  });

	  poll.once('close', function(code, reason) {
	    debug('close', code, reason, self.pollIsClosing);
	    self.poll = poll = null;

	    if (!self.pollIsClosing) {
	      if (reason === 'network') {
	        self._scheduleReceiver();
	      } else {
	        self.emit('close', code || 1006, reason);
	        self.removeAllListeners();
	      }
	    }
	  });
	};

	Polling.prototype.abort = function() {
	  debug('abort');
	  this.removeAllListeners();
	  this.pollIsClosing = true;
	  if (this.poll) {
	    this.poll.abort();
	  }
	};

	module.exports = Polling;


/***/ },

/***/ 64:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var inherits = __webpack_require__(26)
	  , EventEmitter = __webpack_require__(28).EventEmitter
	  ;

	var debug = function() {};
	if ((undefined) !== 'production') {
	  debug = __webpack_require__(17)('sockjs-client:receiver:xhr');
	}

	function XhrReceiver(url, AjaxObject) {
	  debug(url);
	  EventEmitter.call(this);
	  var self = this;

	  this.bufferPosition = 0;

	  this.xo = new AjaxObject('POST', url, null);
	  this.xo.on('chunk', this._chunkHandler.bind(this));
	  this.xo.once('finish', function(status, text) {
	    debug('finish', status, text);
	    self._chunkHandler(status, text);
	    self.xo = null;
	    var reason = status === 200 ? 'network' : 'permanent';
	    debug('close', reason);
	    self.emit('close', null, reason);
	    self._cleanup();
	  });
	}

	inherits(XhrReceiver, EventEmitter);

	XhrReceiver.prototype._chunkHandler = function(status, text) {
	  debug('_chunkHandler', status);
	  if (status !== 200 || !text) {
	    return;
	  }

	  for (var idx = -1; ; this.bufferPosition += idx + 1) {
	    var buf = text.slice(this.bufferPosition);
	    idx = buf.indexOf('\n');
	    if (idx === -1) {
	      break;
	    }
	    var msg = buf.slice(0, idx);
	    if (msg) {
	      debug('message', msg);
	      this.emit('message', msg);
	    }
	  }
	};

	XhrReceiver.prototype._cleanup = function() {
	  debug('_cleanup');
	  this.removeAllListeners();
	};

	XhrReceiver.prototype.abort = function() {
	  debug('abort');
	  if (this.xo) {
	    this.xo.close();
	    debug('close');
	    this.emit('close', null, 'user');
	    this.xo = null;
	  }
	  this._cleanup();
	};

	module.exports = XhrReceiver;


/***/ },

/***/ 65:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var inherits = __webpack_require__(26)
	  , XhrDriver = __webpack_require__(66)
	  ;

	function XHRCorsObject(method, url, payload, opts) {
	  XhrDriver.call(this, method, url, payload, opts);
	}

	inherits(XHRCorsObject, XhrDriver);

	XHRCorsObject.enabled = XhrDriver.enabled && XhrDriver.supportsCORS;

	module.exports = XHRCorsObject;


/***/ },

/***/ 66:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var EventEmitter = __webpack_require__(28).EventEmitter
	  , inherits = __webpack_require__(26)
	  , http = __webpack_require__(67)
	  , https = __webpack_require__(68)
	  , URL = __webpack_require__(13)
	  ;

	var debug = function() {};
	if ((undefined) !== 'production') {
	  debug = __webpack_require__(17)('sockjs-client:driver:xhr');
	}

	function XhrDriver(method, url, payload, opts) {
	  debug(method, url, payload);
	  var self = this;
	  EventEmitter.call(this);

	  var parsedUrl = new URL(url);
	  var options = {
	    method: method
	  , hostname: parsedUrl.hostname.replace(/\[|\]/g, '')
	  , port: parsedUrl.port
	  , path: parsedUrl.pathname + (parsedUrl.query || '')
	  , headers: opts && opts.headers
	  , agent: false
	  };

	  var protocol = parsedUrl.protocol === 'https:' ? https : http;
	  this.req = protocol.request(options, function(res) {
	    res.setEncoding('utf8');
	    var responseText = '';

	    res.on('data', function(chunk) {
	      debug('data', chunk);
	      responseText += chunk;
	      self.emit('chunk', 200, responseText);
	    });
	    res.once('end', function() {
	      debug('end');
	      self.emit('finish', res.statusCode, responseText);
	      self.req = null;
	    });
	  });

	  this.req.on('error', function(e) {
	    debug('error', e);
	    self.emit('finish', 0, e.message);
	  });

	  if (payload) {
	    this.req.write(payload);
	  }
	  this.req.end();
	}

	inherits(XhrDriver, EventEmitter);

	XhrDriver.prototype.close = function() {
	  debug('close');
	  this.removeAllListeners();
	  if (this.req) {
	    this.req.abort();
	    this.req = null;
	  }
	};

	XhrDriver.enabled = true;
	XhrDriver.supportsCORS = true;

	module.exports = XhrDriver;


/***/ },

/***/ 67:
/***/ function(module, exports) {

	module.exports = require("http");

/***/ },

/***/ 68:
/***/ function(module, exports) {

	module.exports = require("https");

/***/ },

/***/ 69:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var inherits = __webpack_require__(26)
	  , XhrDriver = __webpack_require__(66)
	  ;

	function XHRLocalObject(method, url, payload /*, opts */) {
	  XhrDriver.call(this, method, url, payload, {
	    noCredentials: true
	  });
	}

	inherits(XHRLocalObject, XhrDriver);

	XHRLocalObject.enabled = XhrDriver.enabled;

	module.exports = XHRLocalObject;


/***/ },

/***/ 70:
/***/ function(module, exports) {

	'use strict';

	module.exports = {
	  isOpera: function() {
	    return global.navigator &&
	      /opera/i.test(global.navigator.userAgent);
	  }

	, isKonqueror: function() {
	    return global.navigator &&
	      /konqueror/i.test(global.navigator.userAgent);
	  }

	  // #187 wrap document.domain in try/catch because of WP8 from file:///
	, hasDomain: function () {
	    // non-browser client always has a domain
	    if (!global.document) {
	      return true;
	    }

	    try {
	      return !!global.document.domain;
	    } catch (e) {
	      return false;
	    }
	  }
	};


/***/ },

/***/ 71:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var inherits = __webpack_require__(26)
	  , AjaxBasedTransport = __webpack_require__(60)
	  , XhrReceiver = __webpack_require__(64)
	  , XDRObject = __webpack_require__(72)
	  ;

	// According to:
	//   http://stackoverflow.com/questions/1641507/detect-browser-support-for-cross-domain-xmlhttprequests
	//   http://hacks.mozilla.org/2009/07/cross-site-xmlhttprequest-with-cors/

	function XdrStreamingTransport(transUrl) {
	  if (!XDRObject.enabled) {
	    throw new Error('Transport created when disabled');
	  }
	  AjaxBasedTransport.call(this, transUrl, '/xhr_streaming', XhrReceiver, XDRObject);
	}

	inherits(XdrStreamingTransport, AjaxBasedTransport);

	XdrStreamingTransport.enabled = function(info) {
	  if (info.cookie_needed || info.nullOrigin) {
	    return false;
	  }
	  return XDRObject.enabled && info.sameScheme;
	};

	XdrStreamingTransport.transportName = 'xdr-streaming';
	XdrStreamingTransport.roundTrips = 2; // preflight, ajax

	module.exports = XdrStreamingTransport;


/***/ },

/***/ 72:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var EventEmitter = __webpack_require__(28).EventEmitter
	  , inherits = __webpack_require__(26)
	  , eventUtils = __webpack_require__(9)
	  , browser = __webpack_require__(70)
	  , urlUtils = __webpack_require__(12)
	  ;

	var debug = function() {};
	if ((undefined) !== 'production') {
	  debug = __webpack_require__(17)('sockjs-client:sender:xdr');
	}

	// References:
	//   http://ajaxian.com/archives/100-line-ajax-wrapper
	//   http://msdn.microsoft.com/en-us/library/cc288060(v=VS.85).aspx

	function XDRObject(method, url, payload) {
	  debug(method, url);
	  var self = this;
	  EventEmitter.call(this);

	  setTimeout(function() {
	    self._start(method, url, payload);
	  }, 0);
	}

	inherits(XDRObject, EventEmitter);

	XDRObject.prototype._start = function(method, url, payload) {
	  debug('_start');
	  var self = this;
	  var xdr = new global.XDomainRequest();
	  // IE caches even POSTs
	  url = urlUtils.addQuery(url, 't=' + (+new Date()));

	  xdr.onerror = function() {
	    debug('onerror');
	    self._error();
	  };
	  xdr.ontimeout = function() {
	    debug('ontimeout');
	    self._error();
	  };
	  xdr.onprogress = function() {
	    debug('progress', xdr.responseText);
	    self.emit('chunk', 200, xdr.responseText);
	  };
	  xdr.onload = function() {
	    debug('load');
	    self.emit('finish', 200, xdr.responseText);
	    self._cleanup(false);
	  };
	  this.xdr = xdr;
	  this.unloadRef = eventUtils.unloadAdd(function() {
	    self._cleanup(true);
	  });
	  try {
	    // Fails with AccessDenied if port number is bogus
	    this.xdr.open(method, url);
	    if (this.timeout) {
	      this.xdr.timeout = this.timeout;
	    }
	    this.xdr.send(payload);
	  } catch (x) {
	    this._error();
	  }
	};

	XDRObject.prototype._error = function() {
	  this.emit('finish', 0, '');
	  this._cleanup(false);
	};

	XDRObject.prototype._cleanup = function(abort) {
	  debug('cleanup', abort);
	  if (!this.xdr) {
	    return;
	  }
	  this.removeAllListeners();
	  eventUtils.unloadDel(this.unloadRef);

	  this.xdr.ontimeout = this.xdr.onerror = this.xdr.onprogress = this.xdr.onload = null;
	  if (abort) {
	    try {
	      this.xdr.abort();
	    } catch (x) {
	      // intentionally empty
	    }
	  }
	  this.unloadRef = this.xdr = null;
	};

	XDRObject.prototype.close = function() {
	  debug('close');
	  this._cleanup(true);
	};

	// IE 8/9 if the request target uses the same scheme - #79
	XDRObject.enabled = !!(global.XDomainRequest && browser.hasDomain());

	module.exports = XDRObject;


/***/ },

/***/ 73:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var inherits = __webpack_require__(26)
	  , AjaxBasedTransport = __webpack_require__(60)
	  , EventSourceReceiver = __webpack_require__(74)
	  , XHRCorsObject = __webpack_require__(65)
	  , EventSourceDriver = __webpack_require__(75)
	  ;

	function EventSourceTransport(transUrl) {
	  if (!EventSourceTransport.enabled()) {
	    throw new Error('Transport created when disabled');
	  }

	  AjaxBasedTransport.call(this, transUrl, '/eventsource', EventSourceReceiver, XHRCorsObject);
	}

	inherits(EventSourceTransport, AjaxBasedTransport);

	EventSourceTransport.enabled = function() {
	  return !!EventSourceDriver;
	};

	EventSourceTransport.transportName = 'eventsource';
	EventSourceTransport.roundTrips = 2;

	module.exports = EventSourceTransport;


/***/ },

/***/ 74:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var inherits = __webpack_require__(26)
	  , EventEmitter = __webpack_require__(28).EventEmitter
	  , EventSourceDriver = __webpack_require__(75)
	  ;

	var debug = function() {};
	if ((undefined) !== 'production') {
	  debug = __webpack_require__(17)('sockjs-client:receiver:eventsource');
	}

	function EventSourceReceiver(url) {
	  debug(url);
	  EventEmitter.call(this);

	  var self = this;
	  var es = this.es = new EventSourceDriver(url);
	  es.onmessage = function(e) {
	    debug('message', e.data);
	    self.emit('message', decodeURI(e.data));
	  };
	  es.onerror = function(e) {
	    debug('error', es.readyState, e);
	    // ES on reconnection has readyState = 0 or 1.
	    // on network error it's CLOSED = 2
	    var reason = (es.readyState !== 2 ? 'network' : 'permanent');
	    self._cleanup();
	    self._close(reason);
	  };
	}

	inherits(EventSourceReceiver, EventEmitter);

	EventSourceReceiver.prototype.abort = function() {
	  debug('abort');
	  this._cleanup();
	  this._close('user');
	};

	EventSourceReceiver.prototype._cleanup = function() {
	  debug('cleanup');
	  var es = this.es;
	  if (es) {
	    es.onmessage = es.onerror = null;
	    es.close();
	    this.es = null;
	  }
	};

	EventSourceReceiver.prototype._close = function(reason) {
	  debug('close', reason);
	  var self = this;
	  // Safari and chrome < 15 crash if we close window before
	  // waiting for ES cleanup. See:
	  // https://code.google.com/p/chromium/issues/detail?id=89155
	  setTimeout(function() {
	    self.emit('close', null, reason);
	    self.removeAllListeners();
	  }, 200);
	};

	module.exports = EventSourceReceiver;


/***/ },

/***/ 75:
/***/ function(module, exports, __webpack_require__) {

	var original = __webpack_require__(76)
	  , parse = __webpack_require__(2).parse
	  , events = __webpack_require__(28)
	  , https = __webpack_require__(68)
	  , http = __webpack_require__(67)
	  , util = __webpack_require__(23);

	function isPlainObject(obj) {
	  return Object.getPrototypeOf(obj) === Object.prototype;
	}

	/**
	 * Creates a new EventSource object
	 *
	 * @param {String} url the URL to which to connect
	 * @param {Object} eventSourceInitDict extra init params. See README for details.
	 * @api public
	 **/
	function EventSource(url, eventSourceInitDict) {
	  var readyState = EventSource.CONNECTING;
	  Object.defineProperty(this, 'readyState', {
	    get: function () {
	      return readyState;
	    }
	  });

	  Object.defineProperty(this, 'url', {
	    get: function () {
	      return url;
	    }
	  });

	  var self = this;
	  self.reconnectInterval = 1000;
	  var connectPending = false;

	  function onConnectionClosed() {
	    if (connectPending || readyState === EventSource.CLOSED) return;
	    connectPending = true;
	    readyState = EventSource.CONNECTING;
	    _emit('error', new Event('error'));

	    // The url may have been changed by a temporary
	    // redirect. If that's the case, revert it now.
	    if (reconnectUrl) {
	      url = reconnectUrl;
	      reconnectUrl = null;
	    }
	    setTimeout(function () {
	      if (readyState !== EventSource.CONNECTING) {
	        return;
	      }
	      connect();
	    }, self.reconnectInterval);
	  }

	  var req;
	  var lastEventId = '';
	  if (eventSourceInitDict && eventSourceInitDict.headers && isPlainObject(eventSourceInitDict.headers) && eventSourceInitDict.headers['Last-Event-ID']) {
	    lastEventId = eventSourceInitDict.headers['Last-Event-ID'];
	    delete eventSourceInitDict.headers['Last-Event-ID'];
	  }

	  var discardTrailingNewline = false
	    , data = ''
	    , eventName = '';

	  var reconnectUrl = null;

	  function connect() {
	    connectPending = false;

	    var options = parse(url);
	    var isSecure = options.protocol == 'https:';
	    options.headers = { 'Cache-Control': 'no-cache', 'Accept': 'text/event-stream' };
	    if (lastEventId) options.headers['Last-Event-ID'] = lastEventId;
	    if (eventSourceInitDict && eventSourceInitDict.headers && isPlainObject(eventSourceInitDict.headers)) {
	      for (var i in eventSourceInitDict.headers) {
	        var header = eventSourceInitDict.headers[i];
	        if (header) {
	          options.headers[i] = header;
	        }
	      }
	    }

	    options.rejectUnauthorized = !(eventSourceInitDict && eventSourceInitDict.rejectUnauthorized == false);

	    req = (isSecure ? https : http).request(options, function (res) {
	      // Handle HTTP redirects
	      if (res.statusCode == 301 || res.statusCode == 307) {
	        if (!res.headers.location) {
	          // Server sent redirect response without Location header.
	          _emit('error', new Event('error', {status: res.statusCode}));
	          return;
	        }
	        if (res.statusCode == 307) reconnectUrl = url;
	        url = res.headers.location;
	        process.nextTick(connect);
	        return;
	      }

	      if (res.statusCode !== 200) {
	        _emit('error', new Event('error', {status: res.statusCode}));
	        return self.close();
	      }

	      readyState = EventSource.OPEN;
	      res.on('close', onConnectionClosed);
	      res.on('end', onConnectionClosed);
	      _emit('open', new Event('open'));

	      // text/event-stream parser adapted from webkit's
	      // Source/WebCore/page/EventSource.cpp
	      var buf = '';
	      res.on('data', function (chunk) {
	        buf += chunk;

	        var pos = 0
	          , length = buf.length;
	        while (pos < length) {
	          if (discardTrailingNewline) {
	            if (buf[pos] === '\n') {
	              ++pos;
	            }
	            discardTrailingNewline = false;
	          }

	          var lineLength = -1
	            , fieldLength = -1
	            , c;

	          for (var i = pos; lineLength < 0 && i < length; ++i) {
	            c = buf[i];
	            if (c === ':') {
	              if (fieldLength < 0) {
	                fieldLength = i - pos;
	              }
	            } else if (c === '\r') {
	              discardTrailingNewline = true;
	              lineLength = i - pos;
	            } else if (c === '\n') {
	              lineLength = i - pos;
	            }
	          }

	          if (lineLength < 0) {
	            break;
	          }

	          parseEventStreamLine(buf, pos, fieldLength, lineLength);

	          pos += lineLength + 1;
	        }

	        if (pos === length) {
	          buf = '';
	        } else if (pos > 0) {
	          buf = buf.slice(pos);
	        }
	      });
	    });

	    req.on('error', onConnectionClosed);
	    req.setNoDelay(true);
	    req.end();
	  }

	  connect();

	  function _emit() {
	    if (self.listeners(arguments[0]).length > 0) {
	      self.emit.apply(self, arguments);
	    }
	  }

	  this.close = function () {
	    if (readyState == EventSource.CLOSED) return;
	    readyState = EventSource.CLOSED;
	    req.abort();
	  };

	  function parseEventStreamLine(buf, pos, fieldLength, lineLength) {
	    if (lineLength === 0) {
	      if (data.length > 0) {
	        var type = eventName || 'message';
	        _emit(type, new MessageEvent(type, {
	          data: data.slice(0, -1), // remove trailing newline
	          lastEventId: lastEventId,
	          origin: original(url)
	        }));
	        data = '';
	      }
	      eventName = void 0;
	    } else if (fieldLength > 0) {
	      var noValue = fieldLength < 0
	        , step = 0
	        , field = buf.slice(pos, pos + (noValue ? lineLength : fieldLength));

	      if (noValue) {
	        step = lineLength;
	      } else if (buf[pos + fieldLength + 1] !== ' ') {
	        step = fieldLength + 1;
	      } else {
	        step = fieldLength + 2;
	      }
	      pos += step;
	      var valueLength = lineLength - step
	        , value = buf.slice(pos, pos + valueLength);

	      if (field === 'data') {
	        data += value + '\n';
	      } else if (field === 'event') {
	        eventName = value;
	      } else if (field === 'id') {
	        lastEventId = value;
	      } else if (field === 'retry') {
	        var retry = parseInt(value, 10);
	        if (!Number.isNaN(retry)) {
	          self.reconnectInterval = retry;
	        }
	      }
	    }
	  }
	}

	module.exports = EventSource;

	util.inherits(EventSource, events.EventEmitter);
	EventSource.prototype.constructor = EventSource; // make stacktraces readable

	['open', 'error', 'message'].forEach(function (method) {
	  Object.defineProperty(EventSource.prototype, 'on' + method, {
	    /**
	     * Returns the current listener
	     *
	     * @return {Mixed} the set function or undefined
	     * @api private
	     */
	    get: function get() {
	      var listener = this.listeners(method)[0];
	      return listener ? (listener._listener ? listener._listener : listener) : undefined;
	    },

	    /**
	     * Start listening for events
	     *
	     * @param {Function} listener the listener
	     * @return {Mixed} the set function or undefined
	     * @api private
	     */
	    set: function set(listener) {
	      this.removeAllListeners(method);
	      this.addEventListener(method, listener);
	    }
	  });
	});

	/**
	 * Ready states
	 */
	Object.defineProperty(EventSource, 'CONNECTING', { enumerable: true, value: 0});
	Object.defineProperty(EventSource, 'OPEN', { enumerable: true, value: 1});
	Object.defineProperty(EventSource, 'CLOSED', { enumerable: true, value: 2});

	/**
	 * Emulates the W3C Browser based WebSocket interface using addEventListener.
	 *
	 * @param {String} method Listen for an event
	 * @param {Function} listener callback
	 * @see https://developer.mozilla.org/en/DOM/element.addEventListener
	 * @see http://dev.w3.org/html5/websockets/#the-websocket-interface
	 * @api public
	 */
	EventSource.prototype.addEventListener = function addEventListener(method, listener) {
	  if (typeof listener === 'function') {
	    // store a reference so we can return the original function again
	    listener._listener = listener;
	    this.on(method, listener);
	  }
	};

	/**
	 * W3C Event
	 *
	 * @see http://www.w3.org/TR/DOM-Level-3-Events/#interface-Event
	 * @api private
	 */
	function Event(type, optionalProperties) {
	  Object.defineProperty(this, 'type', { writable: false, value: type, enumerable: true });
	  if (optionalProperties) {
	    for (var f in optionalProperties) {
	      if (optionalProperties.hasOwnProperty(f)) {
	        Object.defineProperty(this, f, { writable: false, value: optionalProperties[f], enumerable: true });
	      }
	    }
	  }
	}

	/**
	 * W3C MessageEvent
	 *
	 * @see http://www.w3.org/TR/webmessaging/#event-definitions
	 * @api private
	 */
	function MessageEvent(type, eventInitDict) {
	  Object.defineProperty(this, 'type', { writable: false, value: type, enumerable: true });
	  for (var f in eventInitDict) {
	    if (eventInitDict.hasOwnProperty(f)) {
	      Object.defineProperty(this, f, { writable: false, value: eventInitDict[f], enumerable: true });
	    }
	  }
	}


/***/ },

/***/ 76:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var parse = __webpack_require__(77);

	/**
	 * Transform an URL to a valid origin value.
	 *
	 * @param {String|Object} url URL to transform to it's origin.
	 * @returns {String} The origin.
	 * @api public
	 */
	function origin(url) {
	  if ('string' === typeof url) url = parse(url);

	  //
	  // 6.2.  ASCII Serialization of an Origin
	  // http://tools.ietf.org/html/rfc6454#section-6.2
	  //
	  if (!url.protocol || !url.hostname) return 'null';

	  //
	  // 4. Origin of a URI
	  // http://tools.ietf.org/html/rfc6454#section-4
	  //
	  // States that url.scheme, host should be converted to lower case. This also
	  // makes it easier to match origins as everything is just lower case.
	  //
	  return (url.protocol +'//'+ url.host).toLowerCase();
	}

	/**
	 * Check if the origins are the same.
	 *
	 * @param {String} a URL or origin of a.
	 * @param {String} b URL or origin of b.
	 * @returns {Boolean}
	 * @api public
	 */
	origin.same = function same(a, b) {
	  return origin(a) === origin(b);
	};

	//
	// Expose the origin
	//
	module.exports = origin;


/***/ },

/***/ 77:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var required = __webpack_require__(14)
	  , lolcation = __webpack_require__(78)
	  , qs = __webpack_require__(16)
	  , relativere = /^\/(?!\/)/;

	/**
	 * These are the parse instructions for the URL parsers, it informs the parser
	 * about:
	 *
	 * 0. The char it Needs to parse, if it's a string it should be done using
	 *    indexOf, RegExp using exec and NaN means set as current value.
	 * 1. The property we should set when parsing this value.
	 * 2. Indication if it's backwards or forward parsing, when set as number it's
	 *    the value of extra chars that should be split off.
	 * 3. Inherit from location if non existing in the parser.
	 * 4. `toLowerCase` the resulting value.
	 */
	var instructions = [
	  ['#', 'hash'],                        // Extract from the back.
	  ['?', 'query'],                       // Extract from the back.
	  ['//', 'protocol', 2, 1, 1],          // Extract from the front.
	  ['/', 'pathname'],                    // Extract from the back.
	  ['@', 'auth', 1],                     // Extract from the front.
	  [NaN, 'host', undefined, 1, 1],       // Set left over value.
	  [/\:(\d+)$/, 'port'],                 // RegExp the back.
	  [NaN, 'hostname', undefined, 1, 1]    // Set left over.
	];

	/**
	 * The actual URL instance. Instead of returning an object we've opted-in to
	 * create an actual constructor as it's much more memory efficient and
	 * faster and it pleases my CDO.
	 *
	 * @constructor
	 * @param {String} address URL we want to parse.
	 * @param {Boolean|function} parser Parser for the query string.
	 * @param {Object} location Location defaults for relative paths.
	 * @api public
	 */
	function URL(address, location, parser) {
	  if (!(this instanceof URL)) {
	    return new URL(address, location, parser);
	  }

	  var relative = relativere.test(address)
	    , parse, instruction, index, key
	    , type = typeof location
	    , url = this
	    , i = 0;

	  //
	  // The following if statements allows this module two have compatibility with
	  // 2 different API:
	  //
	  // 1. Node.js's `url.parse` api which accepts a URL, boolean as arguments
	  //    where the boolean indicates that the query string should also be parsed.
	  //
	  // 2. The `URL` interface of the browser which accepts a URL, object as
	  //    arguments. The supplied object will be used as default values / fall-back
	  //    for relative paths.
	  //
	  if ('object' !== type && 'string' !== type) {
	    parser = location;
	    location = null;
	  }

	  if (parser && 'function' !== typeof parser) {
	    parser = qs.parse;
	  }

	  location = lolcation(location);

	  for (; i < instructions.length; i++) {
	    instruction = instructions[i];
	    parse = instruction[0];
	    key = instruction[1];

	    if (parse !== parse) {
	      url[key] = address;
	    } else if ('string' === typeof parse) {
	      if (~(index = address.indexOf(parse))) {
	        if ('number' === typeof instruction[2]) {
	          url[key] = address.slice(0, index);
	          address = address.slice(index + instruction[2]);
	        } else {
	          url[key] = address.slice(index);
	          address = address.slice(0, index);
	        }
	      }
	    } else if (index = parse.exec(address)) {
	      url[key] = index[1];
	      address = address.slice(0, address.length - index[0].length);
	    }

	    url[key] = url[key] || (instruction[3] || ('port' === key && relative) ? location[key] || '' : '');

	    //
	    // Hostname, host and protocol should be lowercased so they can be used to
	    // create a proper `origin`.
	    //
	    if (instruction[4]) {
	      url[key] = url[key].toLowerCase();
	    }
	  }

	  //
	  // Also parse the supplied query string in to an object. If we're supplied
	  // with a custom parser as function use that instead of the default build-in
	  // parser.
	  //
	  if (parser) url.query = parser(url.query);

	  //
	  // We should not add port numbers if they are already the default port number
	  // for a given protocol. As the host also contains the port number we're going
	  // override it with the hostname which contains no port number.
	  //
	  if (!required(url.port, url.protocol)) {
	    url.host = url.hostname;
	    url.port = '';
	  }

	  //
	  // Parse down the `auth` for the username and password.
	  //
	  url.username = url.password = '';
	  if (url.auth) {
	    instruction = url.auth.split(':');
	    url.username = instruction[0] || '';
	    url.password = instruction[1] || '';
	  }

	  //
	  // The href is just the compiled result.
	  //
	  url.href = url.toString();
	}

	/**
	 * This is convenience method for changing properties in the URL instance to
	 * insure that they all propagate correctly.
	 *
	 * @param {String} prop Property we need to adjust.
	 * @param {Mixed} value The newly assigned value.
	 * @returns {URL}
	 * @api public
	 */
	URL.prototype.set = function set(part, value, fn) {
	  var url = this;

	  if ('query' === part) {
	    if ('string' === typeof value && value.length) {
	      value = (fn || qs.parse)(value);
	    }

	    url[part] = value;
	  } else if ('port' === part) {
	    url[part] = value;

	    if (!required(value, url.protocol)) {
	      url.host = url.hostname;
	      url[part] = '';
	    } else if (value) {
	      url.host = url.hostname +':'+ value;
	    }
	  } else if ('hostname' === part) {
	    url[part] = value;

	    if (url.port) value += ':'+ url.port;
	    url.host = value;
	  } else if ('host' === part) {
	    url[part] = value;

	    if (/\:\d+/.test(value)) {
	      value = value.split(':');
	      url.hostname = value[0];
	      url.port = value[1];
	    }
	  } else {
	    url[part] = value;
	  }

	  url.href = url.toString();
	  return url;
	};

	/**
	 * Transform the properties back in to a valid and full URL string.
	 *
	 * @param {Function} stringify Optional query stringify function.
	 * @returns {String}
	 * @api public
	 */
	URL.prototype.toString = function toString(stringify) {
	  if (!stringify || 'function' !== typeof stringify) stringify = qs.stringify;

	  var query
	    , url = this
	    , result = url.protocol +'//';

	  if (url.username) {
	    result += url.username;
	    if (url.password) result += ':'+ url.password;
	    result += '@';
	  }

	  result += url.hostname;
	  if (url.port) result += ':'+ url.port;

	  result += url.pathname;

	  query = 'object' === typeof url.query ? stringify(url.query) : url.query;
	  if (query) result += '?' !== query.charAt(0) ? '?'+ query : query;

	  if (url.hash) result += url.hash;

	  return result;
	};

	//
	// Expose the URL parser and some additional properties that might be useful for
	// others.
	//
	URL.qs = qs;
	URL.location = lolcation;
	module.exports = URL;


/***/ },

/***/ 78:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/**
	 * These properties should not be copied or inherited from. This is only needed
	 * for all non blob URL's as the a blob URL does not include a hash, only the
	 * origin.
	 *
	 * @type {Object}
	 * @private
	 */
	var ignore = { hash: 1, query: 1 }
	  , URL;

	/**
	 * The location object differs when your code is loaded through a normal page,
	 * Worker or through a worker using a blob. And with the blobble begins the
	 * trouble as the location object will contain the URL of the blob, not the
	 * location of the page where our code is loaded in. The actual origin is
	 * encoded in the `pathname` so we can thankfully generate a good "default"
	 * location from it so we can generate proper relative URL's again.
	 *
	 * @param {Object} loc Optional default location object.
	 * @returns {Object} lolcation object.
	 * @api public
	 */
	module.exports = function lolcation(loc) {
	  loc = loc || global.location || {};
	  URL = URL || __webpack_require__(77);

	  var finaldestination = {}
	    , type = typeof loc
	    , key;

	  if ('blob:' === loc.protocol) {
	    finaldestination = new URL(unescape(loc.pathname), {});
	  } else if ('string' === type) {
	    finaldestination = new URL(loc, {});
	    for (key in ignore) delete finaldestination[key];
	  } else if ('object' === type) for (key in loc) {
	    if (key in ignore) continue;
	    finaldestination[key] = loc[key];
	  }

	  return finaldestination;
	};


/***/ },

/***/ 79:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var inherits = __webpack_require__(26)
	  , IframeTransport = __webpack_require__(80)
	  , objectUtils = __webpack_require__(86)
	  ;

	module.exports = function(transport) {

	  function IframeWrapTransport(transUrl, baseUrl) {
	    IframeTransport.call(this, transport.transportName, transUrl, baseUrl);
	  }

	  inherits(IframeWrapTransport, IframeTransport);

	  IframeWrapTransport.enabled = function(url, info) {
	    if (!global.document) {
	      return false;
	    }

	    var iframeInfo = objectUtils.extend({}, info);
	    iframeInfo.sameOrigin = true;
	    return transport.enabled(iframeInfo) && IframeTransport.enabled();
	  };

	  IframeWrapTransport.transportName = 'iframe-' + transport.transportName;
	  IframeWrapTransport.needBody = true;
	  IframeWrapTransport.roundTrips = IframeTransport.roundTrips + transport.roundTrips - 1; // html, javascript (2) + transport - no CORS (1)

	  IframeWrapTransport.facadeTransport = transport;

	  return IframeWrapTransport;
	};


/***/ },

/***/ 80:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	// Few cool transports do work only for same-origin. In order to make
	// them work cross-domain we shall use iframe, served from the
	// remote domain. New browsers have capabilities to communicate with
	// cross domain iframe using postMessage(). In IE it was implemented
	// from IE 8+, but of course, IE got some details wrong:
	//    http://msdn.microsoft.com/en-us/library/cc197015(v=VS.85).aspx
	//    http://stevesouders.com/misc/test-postmessage.php

	var inherits = __webpack_require__(26)
	  , JSON3 = __webpack_require__(81)
	  , EventEmitter = __webpack_require__(28).EventEmitter
	  , version = __webpack_require__(84)
	  , urlUtils = __webpack_require__(12)
	  , iframeUtils = __webpack_require__(85)
	  , eventUtils = __webpack_require__(9)
	  , random = __webpack_require__(10)
	  ;

	var debug = function() {};
	if ((undefined) !== 'production') {
	  debug = __webpack_require__(17)('sockjs-client:transport:iframe');
	}

	function IframeTransport(transport, transUrl, baseUrl) {
	  if (!IframeTransport.enabled()) {
	    throw new Error('Transport created when disabled');
	  }
	  EventEmitter.call(this);

	  var self = this;
	  this.origin = urlUtils.getOrigin(baseUrl);
	  this.baseUrl = baseUrl;
	  this.transUrl = transUrl;
	  this.transport = transport;
	  this.windowId = random.string(8);

	  var iframeUrl = urlUtils.addPath(baseUrl, '/iframe.html') + '#' + this.windowId;
	  debug(transport, transUrl, iframeUrl);

	  this.iframeObj = iframeUtils.createIframe(iframeUrl, function(r) {
	    debug('err callback');
	    self.emit('close', 1006, 'Unable to load an iframe (' + r + ')');
	    self.close();
	  });

	  this.onmessageCallback = this._message.bind(this);
	  eventUtils.attachEvent('message', this.onmessageCallback);
	}

	inherits(IframeTransport, EventEmitter);

	IframeTransport.prototype.close = function() {
	  debug('close');
	  this.removeAllListeners();
	  if (this.iframeObj) {
	    eventUtils.detachEvent('message', this.onmessageCallback);
	    try {
	      // When the iframe is not loaded, IE raises an exception
	      // on 'contentWindow'.
	      this.postMessage('c');
	    } catch (x) {
	      // intentionally empty
	    }
	    this.iframeObj.cleanup();
	    this.iframeObj = null;
	    this.onmessageCallback = this.iframeObj = null;
	  }
	};

	IframeTransport.prototype._message = function(e) {
	  debug('message', e.data);
	  if (!urlUtils.isOriginEqual(e.origin, this.origin)) {
	    debug('not same origin', e.origin, this.origin);
	    return;
	  }

	  var iframeMessage;
	  try {
	    iframeMessage = JSON3.parse(e.data);
	  } catch (ignored) {
	    debug('bad json', e.data);
	    return;
	  }

	  if (iframeMessage.windowId !== this.windowId) {
	    debug('mismatched window id', iframeMessage.windowId, this.windowId);
	    return;
	  }

	  switch (iframeMessage.type) {
	  case 's':
	    this.iframeObj.loaded();
	    // window global dependency
	    this.postMessage('s', JSON3.stringify([
	      version
	    , this.transport
	    , this.transUrl
	    , this.baseUrl
	    ]));
	    break;
	  case 't':
	    this.emit('message', iframeMessage.data);
	    break;
	  case 'c':
	    var cdata;
	    try {
	      cdata = JSON3.parse(iframeMessage.data);
	    } catch (ignored) {
	      debug('bad json', iframeMessage.data);
	      return;
	    }
	    this.emit('close', cdata[0], cdata[1]);
	    this.close();
	    break;
	  }
	};

	IframeTransport.prototype.postMessage = function(type, data) {
	  debug('postMessage', type, data);
	  this.iframeObj.post(JSON3.stringify({
	    windowId: this.windowId
	  , type: type
	  , data: data || ''
	  }), this.origin);
	};

	IframeTransport.prototype.send = function(message) {
	  debug('send', message);
	  this.postMessage('m', message);
	};

	IframeTransport.enabled = function() {
	  return iframeUtils.iframeEnabled;
	};

	IframeTransport.transportName = 'iframe';
	IframeTransport.roundTrips = 2;

	module.exports = IframeTransport;


/***/ },

/***/ 81:
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module) {/*! JSON v3.3.2 | http://bestiejs.github.io/json3 | Copyright 2012-2014, Kit Cambridge | http://kit.mit-license.org */
	;(function () {
	  // Detect the `define` function exposed by asynchronous module loaders. The
	  // strict `define` check is necessary for compatibility with `r.js`.
	  var isLoader = "function" === "function" && __webpack_require__(83);

	  // A set of types used to distinguish objects from primitives.
	  var objectTypes = {
	    "function": true,
	    "object": true
	  };

	  // Detect the `exports` object exposed by CommonJS implementations.
	  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

	  // Use the `global` object exposed by Node (including Browserify via
	  // `insert-module-globals`), Narwhal, and Ringo as the default context,
	  // and the `window` object in browsers. Rhino exports a `global` function
	  // instead.
	  var root = objectTypes[typeof window] && window || this,
	      freeGlobal = freeExports && objectTypes[typeof module] && module && !module.nodeType && typeof global == "object" && global;

	  if (freeGlobal && (freeGlobal["global"] === freeGlobal || freeGlobal["window"] === freeGlobal || freeGlobal["self"] === freeGlobal)) {
	    root = freeGlobal;
	  }

	  // Public: Initializes JSON 3 using the given `context` object, attaching the
	  // `stringify` and `parse` functions to the specified `exports` object.
	  function runInContext(context, exports) {
	    context || (context = root["Object"]());
	    exports || (exports = root["Object"]());

	    // Native constructor aliases.
	    var Number = context["Number"] || root["Number"],
	        String = context["String"] || root["String"],
	        Object = context["Object"] || root["Object"],
	        Date = context["Date"] || root["Date"],
	        SyntaxError = context["SyntaxError"] || root["SyntaxError"],
	        TypeError = context["TypeError"] || root["TypeError"],
	        Math = context["Math"] || root["Math"],
	        nativeJSON = context["JSON"] || root["JSON"];

	    // Delegate to the native `stringify` and `parse` implementations.
	    if (typeof nativeJSON == "object" && nativeJSON) {
	      exports.stringify = nativeJSON.stringify;
	      exports.parse = nativeJSON.parse;
	    }

	    // Convenience aliases.
	    var objectProto = Object.prototype,
	        getClass = objectProto.toString,
	        isProperty, forEach, undef;

	    // Test the `Date#getUTC*` methods. Based on work by @Yaffle.
	    var isExtended = new Date(-3509827334573292);
	    try {
	      // The `getUTCFullYear`, `Month`, and `Date` methods return nonsensical
	      // results for certain dates in Opera >= 10.53.
	      isExtended = isExtended.getUTCFullYear() == -109252 && isExtended.getUTCMonth() === 0 && isExtended.getUTCDate() === 1 &&
	        // Safari < 2.0.2 stores the internal millisecond time value correctly,
	        // but clips the values returned by the date methods to the range of
	        // signed 32-bit integers ([-2 ** 31, 2 ** 31 - 1]).
	        isExtended.getUTCHours() == 10 && isExtended.getUTCMinutes() == 37 && isExtended.getUTCSeconds() == 6 && isExtended.getUTCMilliseconds() == 708;
	    } catch (exception) {}

	    // Internal: Determines whether the native `JSON.stringify` and `parse`
	    // implementations are spec-compliant. Based on work by Ken Snyder.
	    function has(name) {
	      if (has[name] !== undef) {
	        // Return cached feature test result.
	        return has[name];
	      }
	      var isSupported;
	      if (name == "bug-string-char-index") {
	        // IE <= 7 doesn't support accessing string characters using square
	        // bracket notation. IE 8 only supports this for primitives.
	        isSupported = "a"[0] != "a";
	      } else if (name == "json") {
	        // Indicates whether both `JSON.stringify` and `JSON.parse` are
	        // supported.
	        isSupported = has("json-stringify") && has("json-parse");
	      } else {
	        var value, serialized = '{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}';
	        // Test `JSON.stringify`.
	        if (name == "json-stringify") {
	          var stringify = exports.stringify, stringifySupported = typeof stringify == "function" && isExtended;
	          if (stringifySupported) {
	            // A test function object with a custom `toJSON` method.
	            (value = function () {
	              return 1;
	            }).toJSON = value;
	            try {
	              stringifySupported =
	                // Firefox 3.1b1 and b2 serialize string, number, and boolean
	                // primitives as object literals.
	                stringify(0) === "0" &&
	                // FF 3.1b1, b2, and JSON 2 serialize wrapped primitives as object
	                // literals.
	                stringify(new Number()) === "0" &&
	                stringify(new String()) == '""' &&
	                // FF 3.1b1, 2 throw an error if the value is `null`, `undefined`, or
	                // does not define a canonical JSON representation (this applies to
	                // objects with `toJSON` properties as well, *unless* they are nested
	                // within an object or array).
	                stringify(getClass) === undef &&
	                // IE 8 serializes `undefined` as `"undefined"`. Safari <= 5.1.7 and
	                // FF 3.1b3 pass this test.
	                stringify(undef) === undef &&
	                // Safari <= 5.1.7 and FF 3.1b3 throw `Error`s and `TypeError`s,
	                // respectively, if the value is omitted entirely.
	                stringify() === undef &&
	                // FF 3.1b1, 2 throw an error if the given value is not a number,
	                // string, array, object, Boolean, or `null` literal. This applies to
	                // objects with custom `toJSON` methods as well, unless they are nested
	                // inside object or array literals. YUI 3.0.0b1 ignores custom `toJSON`
	                // methods entirely.
	                stringify(value) === "1" &&
	                stringify([value]) == "[1]" &&
	                // Prototype <= 1.6.1 serializes `[undefined]` as `"[]"` instead of
	                // `"[null]"`.
	                stringify([undef]) == "[null]" &&
	                // YUI 3.0.0b1 fails to serialize `null` literals.
	                stringify(null) == "null" &&
	                // FF 3.1b1, 2 halts serialization if an array contains a function:
	                // `[1, true, getClass, 1]` serializes as "[1,true,],". FF 3.1b3
	                // elides non-JSON values from objects and arrays, unless they
	                // define custom `toJSON` methods.
	                stringify([undef, getClass, null]) == "[null,null,null]" &&
	                // Simple serialization test. FF 3.1b1 uses Unicode escape sequences
	                // where character escape codes are expected (e.g., `\b` => `\u0008`).
	                stringify({ "a": [value, true, false, null, "\x00\b\n\f\r\t"] }) == serialized &&
	                // FF 3.1b1 and b2 ignore the `filter` and `width` arguments.
	                stringify(null, value) === "1" &&
	                stringify([1, 2], null, 1) == "[\n 1,\n 2\n]" &&
	                // JSON 2, Prototype <= 1.7, and older WebKit builds incorrectly
	                // serialize extended years.
	                stringify(new Date(-8.64e15)) == '"-271821-04-20T00:00:00.000Z"' &&
	                // The milliseconds are optional in ES 5, but required in 5.1.
	                stringify(new Date(8.64e15)) == '"+275760-09-13T00:00:00.000Z"' &&
	                // Firefox <= 11.0 incorrectly serializes years prior to 0 as negative
	                // four-digit years instead of six-digit years. Credits: @Yaffle.
	                stringify(new Date(-621987552e5)) == '"-000001-01-01T00:00:00.000Z"' &&
	                // Safari <= 5.1.5 and Opera >= 10.53 incorrectly serialize millisecond
	                // values less than 1000. Credits: @Yaffle.
	                stringify(new Date(-1)) == '"1969-12-31T23:59:59.999Z"';
	            } catch (exception) {
	              stringifySupported = false;
	            }
	          }
	          isSupported = stringifySupported;
	        }
	        // Test `JSON.parse`.
	        if (name == "json-parse") {
	          var parse = exports.parse;
	          if (typeof parse == "function") {
	            try {
	              // FF 3.1b1, b2 will throw an exception if a bare literal is provided.
	              // Conforming implementations should also coerce the initial argument to
	              // a string prior to parsing.
	              if (parse("0") === 0 && !parse(false)) {
	                // Simple parsing test.
	                value = parse(serialized);
	                var parseSupported = value["a"].length == 5 && value["a"][0] === 1;
	                if (parseSupported) {
	                  try {
	                    // Safari <= 5.1.2 and FF 3.1b1 allow unescaped tabs in strings.
	                    parseSupported = !parse('"\t"');
	                  } catch (exception) {}
	                  if (parseSupported) {
	                    try {
	                      // FF 4.0 and 4.0.1 allow leading `+` signs and leading
	                      // decimal points. FF 4.0, 4.0.1, and IE 9-10 also allow
	                      // certain octal literals.
	                      parseSupported = parse("01") !== 1;
	                    } catch (exception) {}
	                  }
	                  if (parseSupported) {
	                    try {
	                      // FF 4.0, 4.0.1, and Rhino 1.7R3-R4 allow trailing decimal
	                      // points. These environments, along with FF 3.1b1 and 2,
	                      // also allow trailing commas in JSON objects and arrays.
	                      parseSupported = parse("1.") !== 1;
	                    } catch (exception) {}
	                  }
	                }
	              }
	            } catch (exception) {
	              parseSupported = false;
	            }
	          }
	          isSupported = parseSupported;
	        }
	      }
	      return has[name] = !!isSupported;
	    }

	    if (!has("json")) {
	      // Common `[[Class]]` name aliases.
	      var functionClass = "[object Function]",
	          dateClass = "[object Date]",
	          numberClass = "[object Number]",
	          stringClass = "[object String]",
	          arrayClass = "[object Array]",
	          booleanClass = "[object Boolean]";

	      // Detect incomplete support for accessing string characters by index.
	      var charIndexBuggy = has("bug-string-char-index");

	      // Define additional utility methods if the `Date` methods are buggy.
	      if (!isExtended) {
	        var floor = Math.floor;
	        // A mapping between the months of the year and the number of days between
	        // January 1st and the first of the respective month.
	        var Months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
	        // Internal: Calculates the number of days between the Unix epoch and the
	        // first day of the given month.
	        var getDay = function (year, month) {
	          return Months[month] + 365 * (year - 1970) + floor((year - 1969 + (month = +(month > 1))) / 4) - floor((year - 1901 + month) / 100) + floor((year - 1601 + month) / 400);
	        };
	      }

	      // Internal: Determines if a property is a direct property of the given
	      // object. Delegates to the native `Object#hasOwnProperty` method.
	      if (!(isProperty = objectProto.hasOwnProperty)) {
	        isProperty = function (property) {
	          var members = {}, constructor;
	          if ((members.__proto__ = null, members.__proto__ = {
	            // The *proto* property cannot be set multiple times in recent
	            // versions of Firefox and SeaMonkey.
	            "toString": 1
	          }, members).toString != getClass) {
	            // Safari <= 2.0.3 doesn't implement `Object#hasOwnProperty`, but
	            // supports the mutable *proto* property.
	            isProperty = function (property) {
	              // Capture and break the object's prototype chain (see section 8.6.2
	              // of the ES 5.1 spec). The parenthesized expression prevents an
	              // unsafe transformation by the Closure Compiler.
	              var original = this.__proto__, result = property in (this.__proto__ = null, this);
	              // Restore the original prototype chain.
	              this.__proto__ = original;
	              return result;
	            };
	          } else {
	            // Capture a reference to the top-level `Object` constructor.
	            constructor = members.constructor;
	            // Use the `constructor` property to simulate `Object#hasOwnProperty` in
	            // other environments.
	            isProperty = function (property) {
	              var parent = (this.constructor || constructor).prototype;
	              return property in this && !(property in parent && this[property] === parent[property]);
	            };
	          }
	          members = null;
	          return isProperty.call(this, property);
	        };
	      }

	      // Internal: Normalizes the `for...in` iteration algorithm across
	      // environments. Each enumerated key is yielded to a `callback` function.
	      forEach = function (object, callback) {
	        var size = 0, Properties, members, property;

	        // Tests for bugs in the current environment's `for...in` algorithm. The
	        // `valueOf` property inherits the non-enumerable flag from
	        // `Object.prototype` in older versions of IE, Netscape, and Mozilla.
	        (Properties = function () {
	          this.valueOf = 0;
	        }).prototype.valueOf = 0;

	        // Iterate over a new instance of the `Properties` class.
	        members = new Properties();
	        for (property in members) {
	          // Ignore all properties inherited from `Object.prototype`.
	          if (isProperty.call(members, property)) {
	            size++;
	          }
	        }
	        Properties = members = null;

	        // Normalize the iteration algorithm.
	        if (!size) {
	          // A list of non-enumerable properties inherited from `Object.prototype`.
	          members = ["valueOf", "toString", "toLocaleString", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "constructor"];
	          // IE <= 8, Mozilla 1.0, and Netscape 6.2 ignore shadowed non-enumerable
	          // properties.
	          forEach = function (object, callback) {
	            var isFunction = getClass.call(object) == functionClass, property, length;
	            var hasProperty = !isFunction && typeof object.constructor != "function" && objectTypes[typeof object.hasOwnProperty] && object.hasOwnProperty || isProperty;
	            for (property in object) {
	              // Gecko <= 1.0 enumerates the `prototype` property of functions under
	              // certain conditions; IE does not.
	              if (!(isFunction && property == "prototype") && hasProperty.call(object, property)) {
	                callback(property);
	              }
	            }
	            // Manually invoke the callback for each non-enumerable property.
	            for (length = members.length; property = members[--length]; hasProperty.call(object, property) && callback(property));
	          };
	        } else if (size == 2) {
	          // Safari <= 2.0.4 enumerates shadowed properties twice.
	          forEach = function (object, callback) {
	            // Create a set of iterated properties.
	            var members = {}, isFunction = getClass.call(object) == functionClass, property;
	            for (property in object) {
	              // Store each property name to prevent double enumeration. The
	              // `prototype` property of functions is not enumerated due to cross-
	              // environment inconsistencies.
	              if (!(isFunction && property == "prototype") && !isProperty.call(members, property) && (members[property] = 1) && isProperty.call(object, property)) {
	                callback(property);
	              }
	            }
	          };
	        } else {
	          // No bugs detected; use the standard `for...in` algorithm.
	          forEach = function (object, callback) {
	            var isFunction = getClass.call(object) == functionClass, property, isConstructor;
	            for (property in object) {
	              if (!(isFunction && property == "prototype") && isProperty.call(object, property) && !(isConstructor = property === "constructor")) {
	                callback(property);
	              }
	            }
	            // Manually invoke the callback for the `constructor` property due to
	            // cross-environment inconsistencies.
	            if (isConstructor || isProperty.call(object, (property = "constructor"))) {
	              callback(property);
	            }
	          };
	        }
	        return forEach(object, callback);
	      };

	      // Public: Serializes a JavaScript `value` as a JSON string. The optional
	      // `filter` argument may specify either a function that alters how object and
	      // array members are serialized, or an array of strings and numbers that
	      // indicates which properties should be serialized. The optional `width`
	      // argument may be either a string or number that specifies the indentation
	      // level of the output.
	      if (!has("json-stringify")) {
	        // Internal: A map of control characters and their escaped equivalents.
	        var Escapes = {
	          92: "\\\\",
	          34: '\\"',
	          8: "\\b",
	          12: "\\f",
	          10: "\\n",
	          13: "\\r",
	          9: "\\t"
	        };

	        // Internal: Converts `value` into a zero-padded string such that its
	        // length is at least equal to `width`. The `width` must be <= 6.
	        var leadingZeroes = "000000";
	        var toPaddedString = function (width, value) {
	          // The `|| 0` expression is necessary to work around a bug in
	          // Opera <= 7.54u2 where `0 == -0`, but `String(-0) !== "0"`.
	          return (leadingZeroes + (value || 0)).slice(-width);
	        };

	        // Internal: Double-quotes a string `value`, replacing all ASCII control
	        // characters (characters with code unit values between 0 and 31) with
	        // their escaped equivalents. This is an implementation of the
	        // `Quote(value)` operation defined in ES 5.1 section 15.12.3.
	        var unicodePrefix = "\\u00";
	        var quote = function (value) {
	          var result = '"', index = 0, length = value.length, useCharIndex = !charIndexBuggy || length > 10;
	          var symbols = useCharIndex && (charIndexBuggy ? value.split("") : value);
	          for (; index < length; index++) {
	            var charCode = value.charCodeAt(index);
	            // If the character is a control character, append its Unicode or
	            // shorthand escape sequence; otherwise, append the character as-is.
	            switch (charCode) {
	              case 8: case 9: case 10: case 12: case 13: case 34: case 92:
	                result += Escapes[charCode];
	                break;
	              default:
	                if (charCode < 32) {
	                  result += unicodePrefix + toPaddedString(2, charCode.toString(16));
	                  break;
	                }
	                result += useCharIndex ? symbols[index] : value.charAt(index);
	            }
	          }
	          return result + '"';
	        };

	        // Internal: Recursively serializes an object. Implements the
	        // `Str(key, holder)`, `JO(value)`, and `JA(value)` operations.
	        var serialize = function (property, object, callback, properties, whitespace, indentation, stack) {
	          var value, className, year, month, date, time, hours, minutes, seconds, milliseconds, results, element, index, length, prefix, result;
	          try {
	            // Necessary for host object support.
	            value = object[property];
	          } catch (exception) {}
	          if (typeof value == "object" && value) {
	            className = getClass.call(value);
	            if (className == dateClass && !isProperty.call(value, "toJSON")) {
	              if (value > -1 / 0 && value < 1 / 0) {
	                // Dates are serialized according to the `Date#toJSON` method
	                // specified in ES 5.1 section 15.9.5.44. See section 15.9.1.15
	                // for the ISO 8601 date time string format.
	                if (getDay) {
	                  // Manually compute the year, month, date, hours, minutes,
	                  // seconds, and milliseconds if the `getUTC*` methods are
	                  // buggy. Adapted from @Yaffle's `date-shim` project.
	                  date = floor(value / 864e5);
	                  for (year = floor(date / 365.2425) + 1970 - 1; getDay(year + 1, 0) <= date; year++);
	                  for (month = floor((date - getDay(year, 0)) / 30.42); getDay(year, month + 1) <= date; month++);
	                  date = 1 + date - getDay(year, month);
	                  // The `time` value specifies the time within the day (see ES
	                  // 5.1 section 15.9.1.2). The formula `(A % B + B) % B` is used
	                  // to compute `A modulo B`, as the `%` operator does not
	                  // correspond to the `modulo` operation for negative numbers.
	                  time = (value % 864e5 + 864e5) % 864e5;
	                  // The hours, minutes, seconds, and milliseconds are obtained by
	                  // decomposing the time within the day. See section 15.9.1.10.
	                  hours = floor(time / 36e5) % 24;
	                  minutes = floor(time / 6e4) % 60;
	                  seconds = floor(time / 1e3) % 60;
	                  milliseconds = time % 1e3;
	                } else {
	                  year = value.getUTCFullYear();
	                  month = value.getUTCMonth();
	                  date = value.getUTCDate();
	                  hours = value.getUTCHours();
	                  minutes = value.getUTCMinutes();
	                  seconds = value.getUTCSeconds();
	                  milliseconds = value.getUTCMilliseconds();
	                }
	                // Serialize extended years correctly.
	                value = (year <= 0 || year >= 1e4 ? (year < 0 ? "-" : "+") + toPaddedString(6, year < 0 ? -year : year) : toPaddedString(4, year)) +
	                  "-" + toPaddedString(2, month + 1) + "-" + toPaddedString(2, date) +
	                  // Months, dates, hours, minutes, and seconds should have two
	                  // digits; milliseconds should have three.
	                  "T" + toPaddedString(2, hours) + ":" + toPaddedString(2, minutes) + ":" + toPaddedString(2, seconds) +
	                  // Milliseconds are optional in ES 5.0, but required in 5.1.
	                  "." + toPaddedString(3, milliseconds) + "Z";
	              } else {
	                value = null;
	              }
	            } else if (typeof value.toJSON == "function" && ((className != numberClass && className != stringClass && className != arrayClass) || isProperty.call(value, "toJSON"))) {
	              // Prototype <= 1.6.1 adds non-standard `toJSON` methods to the
	              // `Number`, `String`, `Date`, and `Array` prototypes. JSON 3
	              // ignores all `toJSON` methods on these objects unless they are
	              // defined directly on an instance.
	              value = value.toJSON(property);
	            }
	          }
	          if (callback) {
	            // If a replacement function was provided, call it to obtain the value
	            // for serialization.
	            value = callback.call(object, property, value);
	          }
	          if (value === null) {
	            return "null";
	          }
	          className = getClass.call(value);
	          if (className == booleanClass) {
	            // Booleans are represented literally.
	            return "" + value;
	          } else if (className == numberClass) {
	            // JSON numbers must be finite. `Infinity` and `NaN` are serialized as
	            // `"null"`.
	            return value > -1 / 0 && value < 1 / 0 ? "" + value : "null";
	          } else if (className == stringClass) {
	            // Strings are double-quoted and escaped.
	            return quote("" + value);
	          }
	          // Recursively serialize objects and arrays.
	          if (typeof value == "object") {
	            // Check for cyclic structures. This is a linear search; performance
	            // is inversely proportional to the number of unique nested objects.
	            for (length = stack.length; length--;) {
	              if (stack[length] === value) {
	                // Cyclic structures cannot be serialized by `JSON.stringify`.
	                throw TypeError();
	              }
	            }
	            // Add the object to the stack of traversed objects.
	            stack.push(value);
	            results = [];
	            // Save the current indentation level and indent one additional level.
	            prefix = indentation;
	            indentation += whitespace;
	            if (className == arrayClass) {
	              // Recursively serialize array elements.
	              for (index = 0, length = value.length; index < length; index++) {
	                element = serialize(index, value, callback, properties, whitespace, indentation, stack);
	                results.push(element === undef ? "null" : element);
	              }
	              result = results.length ? (whitespace ? "[\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "]" : ("[" + results.join(",") + "]")) : "[]";
	            } else {
	              // Recursively serialize object members. Members are selected from
	              // either a user-specified list of property names, or the object
	              // itself.
	              forEach(properties || value, function (property) {
	                var element = serialize(property, value, callback, properties, whitespace, indentation, stack);
	                if (element !== undef) {
	                  // According to ES 5.1 section 15.12.3: "If `gap` {whitespace}
	                  // is not the empty string, let `member` {quote(property) + ":"}
	                  // be the concatenation of `member` and the `space` character."
	                  // The "`space` character" refers to the literal space
	                  // character, not the `space` {width} argument provided to
	                  // `JSON.stringify`.
	                  results.push(quote(property) + ":" + (whitespace ? " " : "") + element);
	                }
	              });
	              result = results.length ? (whitespace ? "{\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "}" : ("{" + results.join(",") + "}")) : "{}";
	            }
	            // Remove the object from the traversed object stack.
	            stack.pop();
	            return result;
	          }
	        };

	        // Public: `JSON.stringify`. See ES 5.1 section 15.12.3.
	        exports.stringify = function (source, filter, width) {
	          var whitespace, callback, properties, className;
	          if (objectTypes[typeof filter] && filter) {
	            if ((className = getClass.call(filter)) == functionClass) {
	              callback = filter;
	            } else if (className == arrayClass) {
	              // Convert the property names array into a makeshift set.
	              properties = {};
	              for (var index = 0, length = filter.length, value; index < length; value = filter[index++], ((className = getClass.call(value)), className == stringClass || className == numberClass) && (properties[value] = 1));
	            }
	          }
	          if (width) {
	            if ((className = getClass.call(width)) == numberClass) {
	              // Convert the `width` to an integer and create a string containing
	              // `width` number of space characters.
	              if ((width -= width % 1) > 0) {
	                for (whitespace = "", width > 10 && (width = 10); whitespace.length < width; whitespace += " ");
	              }
	            } else if (className == stringClass) {
	              whitespace = width.length <= 10 ? width : width.slice(0, 10);
	            }
	          }
	          // Opera <= 7.54u2 discards the values associated with empty string keys
	          // (`""`) only if they are used directly within an object member list
	          // (e.g., `!("" in { "": 1})`).
	          return serialize("", (value = {}, value[""] = source, value), callback, properties, whitespace, "", []);
	        };
	      }

	      // Public: Parses a JSON source string.
	      if (!has("json-parse")) {
	        var fromCharCode = String.fromCharCode;

	        // Internal: A map of escaped control characters and their unescaped
	        // equivalents.
	        var Unescapes = {
	          92: "\\",
	          34: '"',
	          47: "/",
	          98: "\b",
	          116: "\t",
	          110: "\n",
	          102: "\f",
	          114: "\r"
	        };

	        // Internal: Stores the parser state.
	        var Index, Source;

	        // Internal: Resets the parser state and throws a `SyntaxError`.
	        var abort = function () {
	          Index = Source = null;
	          throw SyntaxError();
	        };

	        // Internal: Returns the next token, or `"$"` if the parser has reached
	        // the end of the source string. A token may be a string, number, `null`
	        // literal, or Boolean literal.
	        var lex = function () {
	          var source = Source, length = source.length, value, begin, position, isSigned, charCode;
	          while (Index < length) {
	            charCode = source.charCodeAt(Index);
	            switch (charCode) {
	              case 9: case 10: case 13: case 32:
	                // Skip whitespace tokens, including tabs, carriage returns, line
	                // feeds, and space characters.
	                Index++;
	                break;
	              case 123: case 125: case 91: case 93: case 58: case 44:
	                // Parse a punctuator token (`{`, `}`, `[`, `]`, `:`, or `,`) at
	                // the current position.
	                value = charIndexBuggy ? source.charAt(Index) : source[Index];
	                Index++;
	                return value;
	              case 34:
	                // `"` delimits a JSON string; advance to the next character and
	                // begin parsing the string. String tokens are prefixed with the
	                // sentinel `@` character to distinguish them from punctuators and
	                // end-of-string tokens.
	                for (value = "@", Index++; Index < length;) {
	                  charCode = source.charCodeAt(Index);
	                  if (charCode < 32) {
	                    // Unescaped ASCII control characters (those with a code unit
	                    // less than the space character) are not permitted.
	                    abort();
	                  } else if (charCode == 92) {
	                    // A reverse solidus (`\`) marks the beginning of an escaped
	                    // control character (including `"`, `\`, and `/`) or Unicode
	                    // escape sequence.
	                    charCode = source.charCodeAt(++Index);
	                    switch (charCode) {
	                      case 92: case 34: case 47: case 98: case 116: case 110: case 102: case 114:
	                        // Revive escaped control characters.
	                        value += Unescapes[charCode];
	                        Index++;
	                        break;
	                      case 117:
	                        // `\u` marks the beginning of a Unicode escape sequence.
	                        // Advance to the first character and validate the
	                        // four-digit code point.
	                        begin = ++Index;
	                        for (position = Index + 4; Index < position; Index++) {
	                          charCode = source.charCodeAt(Index);
	                          // A valid sequence comprises four hexdigits (case-
	                          // insensitive) that form a single hexadecimal value.
	                          if (!(charCode >= 48 && charCode <= 57 || charCode >= 97 && charCode <= 102 || charCode >= 65 && charCode <= 70)) {
	                            // Invalid Unicode escape sequence.
	                            abort();
	                          }
	                        }
	                        // Revive the escaped character.
	                        value += fromCharCode("0x" + source.slice(begin, Index));
	                        break;
	                      default:
	                        // Invalid escape sequence.
	                        abort();
	                    }
	                  } else {
	                    if (charCode == 34) {
	                      // An unescaped double-quote character marks the end of the
	                      // string.
	                      break;
	                    }
	                    charCode = source.charCodeAt(Index);
	                    begin = Index;
	                    // Optimize for the common case where a string is valid.
	                    while (charCode >= 32 && charCode != 92 && charCode != 34) {
	                      charCode = source.charCodeAt(++Index);
	                    }
	                    // Append the string as-is.
	                    value += source.slice(begin, Index);
	                  }
	                }
	                if (source.charCodeAt(Index) == 34) {
	                  // Advance to the next character and return the revived string.
	                  Index++;
	                  return value;
	                }
	                // Unterminated string.
	                abort();
	              default:
	                // Parse numbers and literals.
	                begin = Index;
	                // Advance past the negative sign, if one is specified.
	                if (charCode == 45) {
	                  isSigned = true;
	                  charCode = source.charCodeAt(++Index);
	                }
	                // Parse an integer or floating-point value.
	                if (charCode >= 48 && charCode <= 57) {
	                  // Leading zeroes are interpreted as octal literals.
	                  if (charCode == 48 && ((charCode = source.charCodeAt(Index + 1)), charCode >= 48 && charCode <= 57)) {
	                    // Illegal octal literal.
	                    abort();
	                  }
	                  isSigned = false;
	                  // Parse the integer component.
	                  for (; Index < length && ((charCode = source.charCodeAt(Index)), charCode >= 48 && charCode <= 57); Index++);
	                  // Floats cannot contain a leading decimal point; however, this
	                  // case is already accounted for by the parser.
	                  if (source.charCodeAt(Index) == 46) {
	                    position = ++Index;
	                    // Parse the decimal component.
	                    for (; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
	                    if (position == Index) {
	                      // Illegal trailing decimal.
	                      abort();
	                    }
	                    Index = position;
	                  }
	                  // Parse exponents. The `e` denoting the exponent is
	                  // case-insensitive.
	                  charCode = source.charCodeAt(Index);
	                  if (charCode == 101 || charCode == 69) {
	                    charCode = source.charCodeAt(++Index);
	                    // Skip past the sign following the exponent, if one is
	                    // specified.
	                    if (charCode == 43 || charCode == 45) {
	                      Index++;
	                    }
	                    // Parse the exponential component.
	                    for (position = Index; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
	                    if (position == Index) {
	                      // Illegal empty exponent.
	                      abort();
	                    }
	                    Index = position;
	                  }
	                  // Coerce the parsed value to a JavaScript number.
	                  return +source.slice(begin, Index);
	                }
	                // A negative sign may only precede numbers.
	                if (isSigned) {
	                  abort();
	                }
	                // `true`, `false`, and `null` literals.
	                if (source.slice(Index, Index + 4) == "true") {
	                  Index += 4;
	                  return true;
	                } else if (source.slice(Index, Index + 5) == "false") {
	                  Index += 5;
	                  return false;
	                } else if (source.slice(Index, Index + 4) == "null") {
	                  Index += 4;
	                  return null;
	                }
	                // Unrecognized token.
	                abort();
	            }
	          }
	          // Return the sentinel `$` character if the parser has reached the end
	          // of the source string.
	          return "$";
	        };

	        // Internal: Parses a JSON `value` token.
	        var get = function (value) {
	          var results, hasMembers;
	          if (value == "$") {
	            // Unexpected end of input.
	            abort();
	          }
	          if (typeof value == "string") {
	            if ((charIndexBuggy ? value.charAt(0) : value[0]) == "@") {
	              // Remove the sentinel `@` character.
	              return value.slice(1);
	            }
	            // Parse object and array literals.
	            if (value == "[") {
	              // Parses a JSON array, returning a new JavaScript array.
	              results = [];
	              for (;; hasMembers || (hasMembers = true)) {
	                value = lex();
	                // A closing square bracket marks the end of the array literal.
	                if (value == "]") {
	                  break;
	                }
	                // If the array literal contains elements, the current token
	                // should be a comma separating the previous element from the
	                // next.
	                if (hasMembers) {
	                  if (value == ",") {
	                    value = lex();
	                    if (value == "]") {
	                      // Unexpected trailing `,` in array literal.
	                      abort();
	                    }
	                  } else {
	                    // A `,` must separate each array element.
	                    abort();
	                  }
	                }
	                // Elisions and leading commas are not permitted.
	                if (value == ",") {
	                  abort();
	                }
	                results.push(get(value));
	              }
	              return results;
	            } else if (value == "{") {
	              // Parses a JSON object, returning a new JavaScript object.
	              results = {};
	              for (;; hasMembers || (hasMembers = true)) {
	                value = lex();
	                // A closing curly brace marks the end of the object literal.
	                if (value == "}") {
	                  break;
	                }
	                // If the object literal contains members, the current token
	                // should be a comma separator.
	                if (hasMembers) {
	                  if (value == ",") {
	                    value = lex();
	                    if (value == "}") {
	                      // Unexpected trailing `,` in object literal.
	                      abort();
	                    }
	                  } else {
	                    // A `,` must separate each object member.
	                    abort();
	                  }
	                }
	                // Leading commas are not permitted, object property names must be
	                // double-quoted strings, and a `:` must separate each property
	                // name and value.
	                if (value == "," || typeof value != "string" || (charIndexBuggy ? value.charAt(0) : value[0]) != "@" || lex() != ":") {
	                  abort();
	                }
	                results[value.slice(1)] = get(lex());
	              }
	              return results;
	            }
	            // Unexpected token encountered.
	            abort();
	          }
	          return value;
	        };

	        // Internal: Updates a traversed object member.
	        var update = function (source, property, callback) {
	          var element = walk(source, property, callback);
	          if (element === undef) {
	            delete source[property];
	          } else {
	            source[property] = element;
	          }
	        };

	        // Internal: Recursively traverses a parsed JSON object, invoking the
	        // `callback` function for each value. This is an implementation of the
	        // `Walk(holder, name)` operation defined in ES 5.1 section 15.12.2.
	        var walk = function (source, property, callback) {
	          var value = source[property], length;
	          if (typeof value == "object" && value) {
	            // `forEach` can't be used to traverse an array in Opera <= 8.54
	            // because its `Object#hasOwnProperty` implementation returns `false`
	            // for array indices (e.g., `![1, 2, 3].hasOwnProperty("0")`).
	            if (getClass.call(value) == arrayClass) {
	              for (length = value.length; length--;) {
	                update(value, length, callback);
	              }
	            } else {
	              forEach(value, function (property) {
	                update(value, property, callback);
	              });
	            }
	          }
	          return callback.call(source, property, value);
	        };

	        // Public: `JSON.parse`. See ES 5.1 section 15.12.2.
	        exports.parse = function (source, callback) {
	          var result, value;
	          Index = 0;
	          Source = "" + source;
	          result = get(lex());
	          // If a JSON string contains multiple tokens, it is invalid.
	          if (lex() != "$") {
	            abort();
	          }
	          // Reset the parser state.
	          Index = Source = null;
	          return callback && getClass.call(callback) == functionClass ? walk((value = {}, value[""] = result, value), "", callback) : result;
	        };
	      }
	    }

	    exports["runInContext"] = runInContext;
	    return exports;
	  }

	  if (freeExports && !isLoader) {
	    // Export for CommonJS environments.
	    runInContext(root, freeExports);
	  } else {
	    // Export for web browsers and JavaScript engines.
	    var nativeJSON = root.JSON,
	        previousJSON = root["JSON3"],
	        isRestored = false;

	    var JSON3 = runInContext(root, (root["JSON3"] = {
	      // Public: Restores the original value of the global `JSON` object and
	      // returns a reference to the `JSON3` object.
	      "noConflict": function () {
	        if (!isRestored) {
	          isRestored = true;
	          root.JSON = nativeJSON;
	          root["JSON3"] = previousJSON;
	          nativeJSON = previousJSON = null;
	        }
	        return JSON3;
	      }
	    }));

	    root.JSON = {
	      "parse": JSON3.parse,
	      "stringify": JSON3.stringify
	    };
	  }

	  // Export for asynchronous module loaders.
	  if (isLoader) {
	    !(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
	      return JSON3;
	    }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  }
	}).call(this);

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(82)(module)))

/***/ },

/***/ 83:
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(__webpack_amd_options__) {module.exports = __webpack_amd_options__;

	/* WEBPACK VAR INJECTION */}.call(exports, {}))

/***/ },

/***/ 84:
/***/ function(module, exports) {

	module.exports = '1.1.1';


/***/ },

/***/ 85:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var eventUtils = __webpack_require__(9)
	  , JSON3 = __webpack_require__(81)
	  , browser = __webpack_require__(70)
	  ;

	var debug = function() {};
	if ((undefined) !== 'production') {
	  debug = __webpack_require__(17)('sockjs-client:utils:iframe');
	}

	module.exports = {
	  WPrefix: '_jp'
	, currentWindowId: null

	, polluteGlobalNamespace: function() {
	    if (!(module.exports.WPrefix in global)) {
	      global[module.exports.WPrefix] = {};
	    }
	  }

	, postMessage: function(type, data) {
	    if (global.parent !== global) {
	      global.parent.postMessage(JSON3.stringify({
	        windowId: module.exports.currentWindowId
	      , type: type
	      , data: data || ''
	      }), '*');
	    } else {
	      debug('Cannot postMessage, no parent window.', type, data);
	    }
	  }

	, createIframe: function(iframeUrl, errorCallback) {
	    var iframe = global.document.createElement('iframe');
	    var tref, unloadRef;
	    var unattach = function() {
	      debug('unattach');
	      clearTimeout(tref);
	      // Explorer had problems with that.
	      try {
	        iframe.onload = null;
	      } catch (x) {
	        // intentionally empty
	      }
	      iframe.onerror = null;
	    };
	    var cleanup = function() {
	      debug('cleanup');
	      if (iframe) {
	        unattach();
	        // This timeout makes chrome fire onbeforeunload event
	        // within iframe. Without the timeout it goes straight to
	        // onunload.
	        setTimeout(function() {
	          if (iframe) {
	            iframe.parentNode.removeChild(iframe);
	          }
	          iframe = null;
	        }, 0);
	        eventUtils.unloadDel(unloadRef);
	      }
	    };
	    var onerror = function(err) {
	      debug('onerror', err);
	      if (iframe) {
	        cleanup();
	        errorCallback(err);
	      }
	    };
	    var post = function(msg, origin) {
	      debug('post', msg, origin);
	      try {
	        // When the iframe is not loaded, IE raises an exception
	        // on 'contentWindow'.
	        setTimeout(function() {
	          if (iframe && iframe.contentWindow) {
	            iframe.contentWindow.postMessage(msg, origin);
	          }
	        }, 0);
	      } catch (x) {
	        // intentionally empty
	      }
	    };

	    iframe.src = iframeUrl;
	    iframe.style.display = 'none';
	    iframe.style.position = 'absolute';
	    iframe.onerror = function() {
	      onerror('onerror');
	    };
	    iframe.onload = function() {
	      debug('onload');
	      // `onload` is triggered before scripts on the iframe are
	      // executed. Give it few seconds to actually load stuff.
	      clearTimeout(tref);
	      tref = setTimeout(function() {
	        onerror('onload timeout');
	      }, 2000);
	    };
	    global.document.body.appendChild(iframe);
	    tref = setTimeout(function() {
	      onerror('timeout');
	    }, 15000);
	    unloadRef = eventUtils.unloadAdd(cleanup);
	    return {
	      post: post
	    , cleanup: cleanup
	    , loaded: unattach
	    };
	  }

	/* jshint undef: false, newcap: false */
	/* eslint no-undef: 0, new-cap: 0 */
	, createHtmlfile: function(iframeUrl, errorCallback) {
	    var axo = ['Active'].concat('Object').join('X');
	    var doc = new global[axo]('htmlfile');
	    var tref, unloadRef;
	    var iframe;
	    var unattach = function() {
	      clearTimeout(tref);
	      iframe.onerror = null;
	    };
	    var cleanup = function() {
	      if (doc) {
	        unattach();
	        eventUtils.unloadDel(unloadRef);
	        iframe.parentNode.removeChild(iframe);
	        iframe = doc = null;
	        CollectGarbage();
	      }
	    };
	    var onerror = function(r) {
	      debug('onerror', r);
	      if (doc) {
	        cleanup();
	        errorCallback(r);
	      }
	    };
	    var post = function(msg, origin) {
	      try {
	        // When the iframe is not loaded, IE raises an exception
	        // on 'contentWindow'.
	        setTimeout(function() {
	          if (iframe && iframe.contentWindow) {
	              iframe.contentWindow.postMessage(msg, origin);
	          }
	        }, 0);
	      } catch (x) {
	        // intentionally empty
	      }
	    };

	    doc.open();
	    doc.write('<html><s' + 'cript>' +
	              'document.domain="' + global.document.domain + '";' +
	              '</s' + 'cript></html>');
	    doc.close();
	    doc.parentWindow[module.exports.WPrefix] = global[module.exports.WPrefix];
	    var c = doc.createElement('div');
	    doc.body.appendChild(c);
	    iframe = doc.createElement('iframe');
	    c.appendChild(iframe);
	    iframe.src = iframeUrl;
	    iframe.onerror = function() {
	      onerror('onerror');
	    };
	    tref = setTimeout(function() {
	      onerror('timeout');
	    }, 15000);
	    unloadRef = eventUtils.unloadAdd(cleanup);
	    return {
	      post: post
	    , cleanup: cleanup
	    , loaded: unattach
	    };
	  }
	};

	module.exports.iframeEnabled = false;
	if (global.document) {
	  // postMessage misbehaves in konqueror 4.6.5 - the messages are delivered with
	  // huge delay, or not at all.
	  module.exports.iframeEnabled = (typeof global.postMessage === 'function' ||
	    typeof global.postMessage === 'object') && (!browser.isKonqueror());
	}


/***/ },

/***/ 86:
/***/ function(module, exports) {

	'use strict';

	module.exports = {
	  isObject: function(obj) {
	    var type = typeof obj;
	    return type === 'function' || type === 'object' && !!obj;
	  }

	, extend: function(obj) {
	    if (!this.isObject(obj)) {
	      return obj;
	    }
	    var source, prop;
	    for (var i = 1, length = arguments.length; i < length; i++) {
	      source = arguments[i];
	      for (prop in source) {
	        if (Object.prototype.hasOwnProperty.call(source, prop)) {
	          obj[prop] = source[prop];
	        }
	      }
	    }
	    return obj;
	  }
	};


/***/ },

/***/ 87:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var inherits = __webpack_require__(26)
	  , HtmlfileReceiver = __webpack_require__(88)
	  , XHRLocalObject = __webpack_require__(69)
	  , AjaxBasedTransport = __webpack_require__(60)
	  ;

	function HtmlFileTransport(transUrl) {
	  if (!HtmlfileReceiver.enabled) {
	    throw new Error('Transport created when disabled');
	  }
	  AjaxBasedTransport.call(this, transUrl, '/htmlfile', HtmlfileReceiver, XHRLocalObject);
	}

	inherits(HtmlFileTransport, AjaxBasedTransport);

	HtmlFileTransport.enabled = function(info) {
	  return HtmlfileReceiver.enabled && info.sameOrigin;
	};

	HtmlFileTransport.transportName = 'htmlfile';
	HtmlFileTransport.roundTrips = 2;

	module.exports = HtmlFileTransport;


/***/ },

/***/ 88:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var inherits = __webpack_require__(26)
	  , iframeUtils = __webpack_require__(85)
	  , urlUtils = __webpack_require__(12)
	  , EventEmitter = __webpack_require__(28).EventEmitter
	  , random = __webpack_require__(10)
	  ;

	var debug = function() {};
	if ((undefined) !== 'production') {
	  debug = __webpack_require__(17)('sockjs-client:receiver:htmlfile');
	}

	function HtmlfileReceiver(url) {
	  debug(url);
	  EventEmitter.call(this);
	  var self = this;
	  iframeUtils.polluteGlobalNamespace();

	  this.id = 'a' + random.string(6);
	  url = urlUtils.addQuery(url, 'c=' + decodeURIComponent(iframeUtils.WPrefix + '.' + this.id));

	  debug('using htmlfile', HtmlfileReceiver.htmlfileEnabled);
	  var constructFunc = HtmlfileReceiver.htmlfileEnabled ?
	      iframeUtils.createHtmlfile : iframeUtils.createIframe;

	  global[iframeUtils.WPrefix][this.id] = {
	    start: function() {
	      debug('start');
	      self.iframeObj.loaded();
	    }
	  , message: function(data) {
	      debug('message', data);
	      self.emit('message', data);
	    }
	  , stop: function() {
	      debug('stop');
	      self._cleanup();
	      self._close('network');
	    }
	  };
	  this.iframeObj = constructFunc(url, function() {
	    debug('callback');
	    self._cleanup();
	    self._close('permanent');
	  });
	}

	inherits(HtmlfileReceiver, EventEmitter);

	HtmlfileReceiver.prototype.abort = function() {
	  debug('abort');
	  this._cleanup();
	  this._close('user');
	};

	HtmlfileReceiver.prototype._cleanup = function() {
	  debug('_cleanup');
	  if (this.iframeObj) {
	    this.iframeObj.cleanup();
	    this.iframeObj = null;
	  }
	  delete global[iframeUtils.WPrefix][this.id];
	};

	HtmlfileReceiver.prototype._close = function(reason) {
	  debug('_close', reason);
	  this.emit('close', null, reason);
	  this.removeAllListeners();
	};

	HtmlfileReceiver.htmlfileEnabled = false;

	// obfuscate to avoid firewalls
	var axo = ['Active'].concat('Object').join('X');
	if (axo in global) {
	  try {
	    HtmlfileReceiver.htmlfileEnabled = !!new global[axo]('htmlfile');
	  } catch (x) {
	    // intentionally empty
	  }
	}

	HtmlfileReceiver.enabled = HtmlfileReceiver.htmlfileEnabled || iframeUtils.iframeEnabled;

	module.exports = HtmlfileReceiver;


/***/ },

/***/ 89:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var inherits = __webpack_require__(26)
	  , AjaxBasedTransport = __webpack_require__(60)
	  , XhrReceiver = __webpack_require__(64)
	  , XHRCorsObject = __webpack_require__(65)
	  , XHRLocalObject = __webpack_require__(69)
	  ;

	function XhrPollingTransport(transUrl) {
	  if (!XHRLocalObject.enabled && !XHRCorsObject.enabled) {
	    throw new Error('Transport created when disabled');
	  }
	  AjaxBasedTransport.call(this, transUrl, '/xhr', XhrReceiver, XHRCorsObject);
	}

	inherits(XhrPollingTransport, AjaxBasedTransport);

	XhrPollingTransport.enabled = function(info) {
	  if (info.nullOrigin) {
	    return false;
	  }

	  if (XHRLocalObject.enabled && info.sameOrigin) {
	    return true;
	  }
	  return XHRCorsObject.enabled;
	};

	XhrPollingTransport.transportName = 'xhr-polling';
	XhrPollingTransport.roundTrips = 2; // preflight, ajax

	module.exports = XhrPollingTransport;


/***/ },

/***/ 90:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var inherits = __webpack_require__(26)
	  , AjaxBasedTransport = __webpack_require__(60)
	  , XdrStreamingTransport = __webpack_require__(71)
	  , XhrReceiver = __webpack_require__(64)
	  , XDRObject = __webpack_require__(72)
	  ;

	function XdrPollingTransport(transUrl) {
	  if (!XDRObject.enabled) {
	    throw new Error('Transport created when disabled');
	  }
	  AjaxBasedTransport.call(this, transUrl, '/xhr', XhrReceiver, XDRObject);
	}

	inherits(XdrPollingTransport, AjaxBasedTransport);

	XdrPollingTransport.enabled = XdrStreamingTransport.enabled;
	XdrPollingTransport.transportName = 'xdr-polling';
	XdrPollingTransport.roundTrips = 2; // preflight, ajax

	module.exports = XdrPollingTransport;


/***/ },

/***/ 91:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	// The simplest and most robust transport, using the well-know cross
	// domain hack - JSONP. This transport is quite inefficient - one
	// message could use up to one http request. But at least it works almost
	// everywhere.
	// Known limitations:
	//   o you will get a spinning cursor
	//   o for Konqueror a dumb timer is needed to detect errors

	var inherits = __webpack_require__(26)
	  , SenderReceiver = __webpack_require__(61)
	  , JsonpReceiver = __webpack_require__(92)
	  , jsonpSender = __webpack_require__(93)
	  ;

	function JsonPTransport(transUrl) {
	  if (!JsonPTransport.enabled()) {
	    throw new Error('Transport created when disabled');
	  }
	  SenderReceiver.call(this, transUrl, '/jsonp', jsonpSender, JsonpReceiver);
	}

	inherits(JsonPTransport, SenderReceiver);

	JsonPTransport.enabled = function() {
	  return !!global.document;
	};

	JsonPTransport.transportName = 'jsonp-polling';
	JsonPTransport.roundTrips = 1;
	JsonPTransport.needBody = true;

	module.exports = JsonPTransport;


/***/ },

/***/ 92:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(85)
	  , random = __webpack_require__(10)
	  , browser = __webpack_require__(70)
	  , urlUtils = __webpack_require__(12)
	  , inherits = __webpack_require__(26)
	  , EventEmitter = __webpack_require__(28).EventEmitter
	  ;

	var debug = function() {};
	if ((undefined) !== 'production') {
	  debug = __webpack_require__(17)('sockjs-client:receiver:jsonp');
	}

	function JsonpReceiver(url) {
	  debug(url);
	  var self = this;
	  EventEmitter.call(this);

	  utils.polluteGlobalNamespace();

	  this.id = 'a' + random.string(6);
	  var urlWithId = urlUtils.addQuery(url, 'c=' + encodeURIComponent(utils.WPrefix + '.' + this.id));

	  global[utils.WPrefix][this.id] = this._callback.bind(this);
	  this._createScript(urlWithId);

	  // Fallback mostly for Konqueror - stupid timer, 35 seconds shall be plenty.
	  this.timeoutId = setTimeout(function() {
	    debug('timeout');
	    self._abort(new Error('JSONP script loaded abnormally (timeout)'));
	  }, JsonpReceiver.timeout);
	}

	inherits(JsonpReceiver, EventEmitter);

	JsonpReceiver.prototype.abort = function() {
	  debug('abort');
	  if (global[utils.WPrefix][this.id]) {
	    var err = new Error('JSONP user aborted read');
	    err.code = 1000;
	    this._abort(err);
	  }
	};

	JsonpReceiver.timeout = 35000;
	JsonpReceiver.scriptErrorTimeout = 1000;

	JsonpReceiver.prototype._callback = function(data) {
	  debug('_callback', data);
	  this._cleanup();

	  if (this.aborting) {
	    return;
	  }

	  if (data) {
	    debug('message', data);
	    this.emit('message', data);
	  }
	  this.emit('close', null, 'network');
	  this.removeAllListeners();
	};

	JsonpReceiver.prototype._abort = function(err) {
	  debug('_abort', err);
	  this._cleanup();
	  this.aborting = true;
	  this.emit('close', err.code, err.message);
	  this.removeAllListeners();
	};

	JsonpReceiver.prototype._cleanup = function() {
	  debug('_cleanup');
	  clearTimeout(this.timeoutId);
	  if (this.script2) {
	    this.script2.parentNode.removeChild(this.script2);
	    this.script2 = null;
	  }
	  if (this.script) {
	    var script = this.script;
	    // Unfortunately, you can't really abort script loading of
	    // the script.
	    script.parentNode.removeChild(script);
	    script.onreadystatechange = script.onerror =
	        script.onload = script.onclick = null;
	    this.script = null;
	  }
	  delete global[utils.WPrefix][this.id];
	};

	JsonpReceiver.prototype._scriptError = function() {
	  debug('_scriptError');
	  var self = this;
	  if (this.errorTimer) {
	    return;
	  }

	  this.errorTimer = setTimeout(function() {
	    if (!self.loadedOkay) {
	      self._abort(new Error('JSONP script loaded abnormally (onerror)'));
	    }
	  }, JsonpReceiver.scriptErrorTimeout);
	};

	JsonpReceiver.prototype._createScript = function(url) {
	  debug('_createScript', url);
	  var self = this;
	  var script = this.script = global.document.createElement('script');
	  var script2;  // Opera synchronous load trick.

	  script.id = 'a' + random.string(8);
	  script.src = url;
	  script.type = 'text/javascript';
	  script.charset = 'UTF-8';
	  script.onerror = this._scriptError.bind(this);
	  script.onload = function() {
	    debug('onload');
	    self._abort(new Error('JSONP script loaded abnormally (onload)'));
	  };

	  // IE9 fires 'error' event after onreadystatechange or before, in random order.
	  // Use loadedOkay to determine if actually errored
	  script.onreadystatechange = function() {
	    debug('onreadystatechange', script.readyState);
	    if (/loaded|closed/.test(script.readyState)) {
	      if (script && script.htmlFor && script.onclick) {
	        self.loadedOkay = true;
	        try {
	          // In IE, actually execute the script.
	          script.onclick();
	        } catch (x) {
	          // intentionally empty
	        }
	      }
	      if (script) {
	        self._abort(new Error('JSONP script loaded abnormally (onreadystatechange)'));
	      }
	    }
	  };
	  // IE: event/htmlFor/onclick trick.
	  // One can't rely on proper order for onreadystatechange. In order to
	  // make sure, set a 'htmlFor' and 'event' properties, so that
	  // script code will be installed as 'onclick' handler for the
	  // script object. Later, onreadystatechange, manually execute this
	  // code. FF and Chrome doesn't work with 'event' and 'htmlFor'
	  // set. For reference see:
	  //   http://jaubourg.net/2010/07/loading-script-as-onclick-handler-of.html
	  // Also, read on that about script ordering:
	  //   http://wiki.whatwg.org/wiki/Dynamic_Script_Execution_Order
	  if (typeof script.async === 'undefined' && global.document.attachEvent) {
	    // According to mozilla docs, in recent browsers script.async defaults
	    // to 'true', so we may use it to detect a good browser:
	    // https://developer.mozilla.org/en/HTML/Element/script
	    if (!browser.isOpera()) {
	      // Naively assume we're in IE
	      try {
	        script.htmlFor = script.id;
	        script.event = 'onclick';
	      } catch (x) {
	        // intentionally empty
	      }
	      script.async = true;
	    } else {
	      // Opera, second sync script hack
	      script2 = this.script2 = global.document.createElement('script');
	      script2.text = "try{var a = document.getElementById('" + script.id + "'); if(a)a.onerror();}catch(x){};";
	      script.async = script2.async = false;
	    }
	  }
	  if (typeof script.async !== 'undefined') {
	    script.async = true;
	  }

	  var head = global.document.getElementsByTagName('head')[0];
	  head.insertBefore(script, head.firstChild);
	  if (script2) {
	    head.insertBefore(script2, head.firstChild);
	  }
	};

	module.exports = JsonpReceiver;


/***/ },

/***/ 93:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var random = __webpack_require__(10)
	  , urlUtils = __webpack_require__(12)
	  ;

	var debug = function() {};
	if ((undefined) !== 'production') {
	  debug = __webpack_require__(17)('sockjs-client:sender:jsonp');
	}

	var form, area;

	function createIframe(id) {
	  debug('createIframe', id);
	  try {
	    // ie6 dynamic iframes with target="" support (thanks Chris Lambacher)
	    return global.document.createElement('<iframe name="' + id + '">');
	  } catch (x) {
	    var iframe = global.document.createElement('iframe');
	    iframe.name = id;
	    return iframe;
	  }
	}

	function createForm() {
	  debug('createForm');
	  form = global.document.createElement('form');
	  form.style.display = 'none';
	  form.style.position = 'absolute';
	  form.method = 'POST';
	  form.enctype = 'application/x-www-form-urlencoded';
	  form.acceptCharset = 'UTF-8';

	  area = global.document.createElement('textarea');
	  area.name = 'd';
	  form.appendChild(area);

	  global.document.body.appendChild(form);
	}

	module.exports = function(url, payload, callback) {
	  debug(url, payload);
	  if (!form) {
	    createForm();
	  }
	  var id = 'a' + random.string(8);
	  form.target = id;
	  form.action = urlUtils.addQuery(urlUtils.addPath(url, '/jsonp_send'), 'i=' + id);

	  var iframe = createIframe(id);
	  iframe.id = id;
	  iframe.style.display = 'none';
	  form.appendChild(iframe);

	  try {
	    area.value = payload;
	  } catch (e) {
	    // seriously broken browsers get here
	  }
	  form.submit();

	  var completed = function(err) {
	    debug('completed', id, err);
	    if (!iframe.onerror) {
	      return;
	    }
	    iframe.onreadystatechange = iframe.onerror = iframe.onload = null;
	    // Opera mini doesn't like if we GC iframe
	    // immediately, thus this timeout.
	    setTimeout(function() {
	      debug('cleaning up', id);
	      iframe.parentNode.removeChild(iframe);
	      iframe = null;
	    }, 500);
	    area.value = '';
	    // It is not possible to detect if the iframe succeeded or
	    // failed to submit our form.
	    callback(err);
	  };
	  iframe.onerror = function() {
	    debug('onerror', id);
	    completed();
	  };
	  iframe.onload = function() {
	    debug('onload', id);
	    completed();
	  };
	  iframe.onreadystatechange = function(e) {
	    debug('onreadystatechange', id, iframe.readyState, e);
	    if (iframe.readyState === 'complete') {
	      completed();
	    }
	  };
	  return function() {
	    debug('aborted', id);
	    completed(new Error('Aborted'));
	  };
	};


/***/ },

/***/ 94:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	__webpack_require__(95);

	var URL = __webpack_require__(13)
	  , inherits = __webpack_require__(26)
	  , JSON3 = __webpack_require__(81)
	  , random = __webpack_require__(10)
	  , escape = __webpack_require__(96)
	  , urlUtils = __webpack_require__(12)
	  , eventUtils = __webpack_require__(9)
	  , transport = __webpack_require__(97)
	  , objectUtils = __webpack_require__(86)
	  , browser = __webpack_require__(70)
	  , log = __webpack_require__(98)
	  , Event = __webpack_require__(99)
	  , EventTarget = __webpack_require__(100)
	  , loc = __webpack_require__(101)
	  , CloseEvent = __webpack_require__(102)
	  , TransportMessageEvent = __webpack_require__(103)
	  , InfoReceiver = __webpack_require__(104)
	  ;

	var debug = function() {};
	if ((undefined) !== 'production') {
	  debug = __webpack_require__(17)('sockjs-client:main');
	}

	var transports;

	// follow constructor steps defined at http://dev.w3.org/html5/websockets/#the-websocket-interface
	function SockJS(url, protocols, options) {
	  if (!(this instanceof SockJS)) {
	    return new SockJS(url, protocols, options);
	  }
	  if (arguments.length < 1) {
	    throw new TypeError("Failed to construct 'SockJS: 1 argument required, but only 0 present");
	  }
	  EventTarget.call(this);

	  this.readyState = SockJS.CONNECTING;
	  this.extensions = '';
	  this.protocol = '';

	  // non-standard extension
	  options = options || {};
	  if (options.protocols_whitelist) {
	    log.warn("'protocols_whitelist' is DEPRECATED. Use 'transports' instead.");
	  }
	  this._transportsWhitelist = options.transports;
	  this._transportOptions = options.transportOptions || {};

	  var sessionId = options.sessionId || 8;
	  if (typeof sessionId === 'function') {
	    this._generateSessionId = sessionId;
	  } else if (typeof sessionId === 'number') {
	    this._generateSessionId = function() {
	      return random.string(sessionId);
	    };
	  } else {
	    throw new TypeError('If sessionId is used in the options, it needs to be a number or a function.');
	  }

	  this._server = options.server || random.numberString(1000);

	  // Step 1 of WS spec - parse and validate the url. Issue #8
	  var parsedUrl = new URL(url);
	  if (!parsedUrl.host || !parsedUrl.protocol) {
	    throw new SyntaxError("The URL '" + url + "' is invalid");
	  } else if (parsedUrl.hash) {
	    throw new SyntaxError('The URL must not contain a fragment');
	  } else if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
	    throw new SyntaxError("The URL's scheme must be either 'http:' or 'https:'. '" + parsedUrl.protocol + "' is not allowed.");
	  }

	  var secure = parsedUrl.protocol === 'https:';
	  // Step 2 - don't allow secure origin with an insecure protocol
	  if (loc.protocol === 'https' && !secure) {
	    throw new Error('SecurityError: An insecure SockJS connection may not be initiated from a page loaded over HTTPS');
	  }

	  // Step 3 - check port access - no need here
	  // Step 4 - parse protocols argument
	  if (!protocols) {
	    protocols = [];
	  } else if (!Array.isArray(protocols)) {
	    protocols = [protocols];
	  }

	  // Step 5 - check protocols argument
	  var sortedProtocols = protocols.sort();
	  sortedProtocols.forEach(function(proto, i) {
	    if (!proto) {
	      throw new SyntaxError("The protocols entry '" + proto + "' is invalid.");
	    }
	    if (i < (sortedProtocols.length - 1) && proto === sortedProtocols[i + 1]) {
	      throw new SyntaxError("The protocols entry '" + proto + "' is duplicated.");
	    }
	  });

	  // Step 6 - convert origin
	  var o = urlUtils.getOrigin(loc.href);
	  this._origin = o ? o.toLowerCase() : null;

	  // remove the trailing slash
	  parsedUrl.set('pathname', parsedUrl.pathname.replace(/\/+$/, ''));

	  // store the sanitized url
	  this.url = parsedUrl.href;
	  debug('using url', this.url);

	  // Step 7 - start connection in background
	  // obtain server info
	  // http://sockjs.github.io/sockjs-protocol/sockjs-protocol-0.3.3.html#section-26
	  this._urlInfo = {
	    nullOrigin: !browser.hasDomain()
	  , sameOrigin: urlUtils.isOriginEqual(this.url, loc.href)
	  , sameScheme: urlUtils.isSchemeEqual(this.url, loc.href)
	  };

	  this._ir = new InfoReceiver(this.url, this._urlInfo);
	  this._ir.once('finish', this._receiveInfo.bind(this));
	}

	inherits(SockJS, EventTarget);

	function userSetCode(code) {
	  return code === 1000 || (code >= 3000 && code <= 4999);
	}

	SockJS.prototype.close = function(code, reason) {
	  // Step 1
	  if (code && !userSetCode(code)) {
	    throw new Error('InvalidAccessError: Invalid code');
	  }
	  // Step 2.4 states the max is 123 bytes, but we are just checking length
	  if (reason && reason.length > 123) {
	    throw new SyntaxError('reason argument has an invalid length');
	  }

	  // Step 3.1
	  if (this.readyState === SockJS.CLOSING || this.readyState === SockJS.CLOSED) {
	    return;
	  }

	  // TODO look at docs to determine how to set this
	  var wasClean = true;
	  this._close(code || 1000, reason || 'Normal closure', wasClean);
	};

	SockJS.prototype.send = function(data) {
	  // #13 - convert anything non-string to string
	  // TODO this currently turns objects into [object Object]
	  if (typeof data !== 'string') {
	    data = '' + data;
	  }
	  if (this.readyState === SockJS.CONNECTING) {
	    throw new Error('InvalidStateError: The connection has not been established yet');
	  }
	  if (this.readyState !== SockJS.OPEN) {
	    return;
	  }
	  this._transport.send(escape.quote(data));
	};

	SockJS.version = __webpack_require__(84);

	SockJS.CONNECTING = 0;
	SockJS.OPEN = 1;
	SockJS.CLOSING = 2;
	SockJS.CLOSED = 3;

	SockJS.prototype._receiveInfo = function(info, rtt) {
	  debug('_receiveInfo', rtt);
	  this._ir = null;
	  if (!info) {
	    this._close(1002, 'Cannot connect to server');
	    return;
	  }

	  // establish a round-trip timeout (RTO) based on the
	  // round-trip time (RTT)
	  this._rto = this.countRTO(rtt);
	  // allow server to override url used for the actual transport
	  this._transUrl = info.base_url ? info.base_url : this.url;
	  info = objectUtils.extend(info, this._urlInfo);
	  debug('info', info);
	  // determine list of desired and supported transports
	  var enabledTransports = transports.filterToEnabled(this._transportsWhitelist, info);
	  this._transports = enabledTransports.main;
	  debug(this._transports.length + ' enabled transports');

	  this._connect();
	};

	SockJS.prototype._connect = function() {
	  for (var Transport = this._transports.shift(); Transport; Transport = this._transports.shift()) {
	    debug('attempt', Transport.transportName);
	    if (Transport.needBody) {
	      if (!global.document.body ||
	          (typeof global.document.readyState !== 'undefined' &&
	            global.document.readyState !== 'complete' &&
	            global.document.readyState !== 'interactive')) {
	        debug('waiting for body');
	        this._transports.unshift(Transport);
	        eventUtils.attachEvent('load', this._connect.bind(this));
	        return;
	      }
	    }

	    // calculate timeout based on RTO and round trips. Default to 5s
	    var timeoutMs = (this._rto * Transport.roundTrips) || 5000;
	    this._transportTimeoutId = setTimeout(this._transportTimeout.bind(this), timeoutMs);
	    debug('using timeout', timeoutMs);

	    var transportUrl = urlUtils.addPath(this._transUrl, '/' + this._server + '/' + this._generateSessionId());
	    var options = this._transportOptions[Transport.transportName];
	    debug('transport url', transportUrl);
	    var transportObj = new Transport(transportUrl, this._transUrl, options);
	    transportObj.on('message', this._transportMessage.bind(this));
	    transportObj.once('close', this._transportClose.bind(this));
	    transportObj.transportName = Transport.transportName;
	    this._transport = transportObj;

	    return;
	  }
	  this._close(2000, 'All transports failed', false);
	};

	SockJS.prototype._transportTimeout = function() {
	  debug('_transportTimeout');
	  if (this.readyState === SockJS.CONNECTING) {
	    this._transportClose(2007, 'Transport timed out');
	  }
	};

	SockJS.prototype._transportMessage = function(msg) {
	  debug('_transportMessage', msg);
	  var self = this
	    , type = msg.slice(0, 1)
	    , content = msg.slice(1)
	    , payload
	    ;

	  // first check for messages that don't need a payload
	  switch (type) {
	    case 'o':
	      this._open();
	      return;
	    case 'h':
	      this.dispatchEvent(new Event('heartbeat'));
	      debug('heartbeat', this.transport);
	      return;
	  }

	  if (content) {
	    try {
	      payload = JSON3.parse(content);
	    } catch (e) {
	      debug('bad json', content);
	    }
	  }

	  if (typeof payload === 'undefined') {
	    debug('empty payload', content);
	    return;
	  }

	  switch (type) {
	    case 'a':
	      if (Array.isArray(payload)) {
	        payload.forEach(function(p) {
	          debug('message', self.transport, p);
	          self.dispatchEvent(new TransportMessageEvent(p));
	        });
	      }
	      break;
	    case 'm':
	      debug('message', this.transport, payload);
	      this.dispatchEvent(new TransportMessageEvent(payload));
	      break;
	    case 'c':
	      if (Array.isArray(payload) && payload.length === 2) {
	        this._close(payload[0], payload[1], true);
	      }
	      break;
	  }
	};

	SockJS.prototype._transportClose = function(code, reason) {
	  debug('_transportClose', this.transport, code, reason);
	  if (this._transport) {
	    this._transport.removeAllListeners();
	    this._transport = null;
	    this.transport = null;
	  }

	  if (!userSetCode(code) && code !== 2000 && this.readyState === SockJS.CONNECTING) {
	    this._connect();
	    return;
	  }

	  this._close(code, reason);
	};

	SockJS.prototype._open = function() {
	  debug('_open', this._transport.transportName, this.readyState);
	  if (this.readyState === SockJS.CONNECTING) {
	    if (this._transportTimeoutId) {
	      clearTimeout(this._transportTimeoutId);
	      this._transportTimeoutId = null;
	    }
	    this.readyState = SockJS.OPEN;
	    this.transport = this._transport.transportName;
	    this.dispatchEvent(new Event('open'));
	    debug('connected', this.transport);
	  } else {
	    // The server might have been restarted, and lost track of our
	    // connection.
	    this._close(1006, 'Server lost session');
	  }
	};

	SockJS.prototype._close = function(code, reason, wasClean) {
	  debug('_close', this.transport, code, reason, wasClean, this.readyState);
	  var forceFail = false;

	  if (this._ir) {
	    forceFail = true;
	    this._ir.close();
	    this._ir = null;
	  }
	  if (this._transport) {
	    this._transport.close();
	    this._transport = null;
	    this.transport = null;
	  }

	  if (this.readyState === SockJS.CLOSED) {
	    throw new Error('InvalidStateError: SockJS has already been closed');
	  }

	  this.readyState = SockJS.CLOSING;
	  setTimeout(function() {
	    this.readyState = SockJS.CLOSED;

	    if (forceFail) {
	      this.dispatchEvent(new Event('error'));
	    }

	    var e = new CloseEvent('close');
	    e.wasClean = wasClean || false;
	    e.code = code || 1000;
	    e.reason = reason;

	    this.dispatchEvent(e);
	    this.onmessage = this.onclose = this.onerror = null;
	    debug('disconnected');
	  }.bind(this), 0);
	};

	// See: http://www.erg.abdn.ac.uk/~gerrit/dccp/notes/ccid2/rto_estimator/
	// and RFC 2988.
	SockJS.prototype.countRTO = function(rtt) {
	  // In a local environment, when using IE8/9 and the `jsonp-polling`
	  // transport the time needed to establish a connection (the time that pass
	  // from the opening of the transport to the call of `_dispatchOpen`) is
	  // around 200msec (the lower bound used in the article above) and this
	  // causes spurious timeouts. For this reason we calculate a value slightly
	  // larger than that used in the article.
	  if (rtt > 100) {
	    return 4 * rtt; // rto > 400msec
	  }
	  return 300 + rtt; // 300msec < rto <= 400msec
	};

	module.exports = function(availableTransports) {
	  transports = transport(availableTransports);
	  __webpack_require__(109)(SockJS, availableTransports);
	  return SockJS;
	};


/***/ },

/***/ 95:
/***/ function(module, exports) {

	/* eslint-disable */
	/* jscs: disable */
	'use strict';

	// pulled specific shims from https://github.com/es-shims/es5-shim

	var ArrayPrototype = Array.prototype;
	var ObjectPrototype = Object.prototype;
	var FunctionPrototype = Function.prototype;
	var StringPrototype = String.prototype;
	var array_slice = ArrayPrototype.slice;

	var _toString = ObjectPrototype.toString;
	var isFunction = function (val) {
	    return ObjectPrototype.toString.call(val) === '[object Function]';
	};
	var isArray = function isArray(obj) {
	    return _toString.call(obj) === '[object Array]';
	};
	var isString = function isString(obj) {
	    return _toString.call(obj) === '[object String]';
	};

	var supportsDescriptors = Object.defineProperty && (function () {
	    try {
	        Object.defineProperty({}, 'x', {});
	        return true;
	    } catch (e) { /* this is ES3 */
	        return false;
	    }
	}());

	// Define configurable, writable and non-enumerable props
	// if they don't exist.
	var defineProperty;
	if (supportsDescriptors) {
	    defineProperty = function (object, name, method, forceAssign) {
	        if (!forceAssign && (name in object)) { return; }
	        Object.defineProperty(object, name, {
	            configurable: true,
	            enumerable: false,
	            writable: true,
	            value: method
	        });
	    };
	} else {
	    defineProperty = function (object, name, method, forceAssign) {
	        if (!forceAssign && (name in object)) { return; }
	        object[name] = method;
	    };
	}
	var defineProperties = function (object, map, forceAssign) {
	    for (var name in map) {
	        if (ObjectPrototype.hasOwnProperty.call(map, name)) {
	          defineProperty(object, name, map[name], forceAssign);
	        }
	    }
	};

	var toObject = function (o) {
	    if (o == null) { // this matches both null and undefined
	        throw new TypeError("can't convert " + o + ' to object');
	    }
	    return Object(o);
	};

	//
	// Util
	// ======
	//

	// ES5 9.4
	// http://es5.github.com/#x9.4
	// http://jsperf.com/to-integer

	function toInteger(num) {
	    var n = +num;
	    if (n !== n) { // isNaN
	        n = 0;
	    } else if (n !== 0 && n !== (1 / 0) && n !== -(1 / 0)) {
	        n = (n > 0 || -1) * Math.floor(Math.abs(n));
	    }
	    return n;
	}

	function ToUint32(x) {
	    return x >>> 0;
	}

	//
	// Function
	// ========
	//

	// ES-5 15.3.4.5
	// http://es5.github.com/#x15.3.4.5

	function Empty() {}

	defineProperties(FunctionPrototype, {
	    bind: function bind(that) { // .length is 1
	        // 1. Let Target be the this value.
	        var target = this;
	        // 2. If IsCallable(Target) is false, throw a TypeError exception.
	        if (!isFunction(target)) {
	            throw new TypeError('Function.prototype.bind called on incompatible ' + target);
	        }
	        // 3. Let A be a new (possibly empty) internal list of all of the
	        //   argument values provided after thisArg (arg1, arg2 etc), in order.
	        // XXX slicedArgs will stand in for "A" if used
	        var args = array_slice.call(arguments, 1); // for normal call
	        // 4. Let F be a new native ECMAScript object.
	        // 11. Set the [[Prototype]] internal property of F to the standard
	        //   built-in Function prototype object as specified in 15.3.3.1.
	        // 12. Set the [[Call]] internal property of F as described in
	        //   15.3.4.5.1.
	        // 13. Set the [[Construct]] internal property of F as described in
	        //   15.3.4.5.2.
	        // 14. Set the [[HasInstance]] internal property of F as described in
	        //   15.3.4.5.3.
	        var binder = function () {

	            if (this instanceof bound) {
	                // 15.3.4.5.2 [[Construct]]
	                // When the [[Construct]] internal method of a function object,
	                // F that was created using the bind function is called with a
	                // list of arguments ExtraArgs, the following steps are taken:
	                // 1. Let target be the value of F's [[TargetFunction]]
	                //   internal property.
	                // 2. If target has no [[Construct]] internal method, a
	                //   TypeError exception is thrown.
	                // 3. Let boundArgs be the value of F's [[BoundArgs]] internal
	                //   property.
	                // 4. Let args be a new list containing the same values as the
	                //   list boundArgs in the same order followed by the same
	                //   values as the list ExtraArgs in the same order.
	                // 5. Return the result of calling the [[Construct]] internal
	                //   method of target providing args as the arguments.

	                var result = target.apply(
	                    this,
	                    args.concat(array_slice.call(arguments))
	                );
	                if (Object(result) === result) {
	                    return result;
	                }
	                return this;

	            } else {
	                // 15.3.4.5.1 [[Call]]
	                // When the [[Call]] internal method of a function object, F,
	                // which was created using the bind function is called with a
	                // this value and a list of arguments ExtraArgs, the following
	                // steps are taken:
	                // 1. Let boundArgs be the value of F's [[BoundArgs]] internal
	                //   property.
	                // 2. Let boundThis be the value of F's [[BoundThis]] internal
	                //   property.
	                // 3. Let target be the value of F's [[TargetFunction]] internal
	                //   property.
	                // 4. Let args be a new list containing the same values as the
	                //   list boundArgs in the same order followed by the same
	                //   values as the list ExtraArgs in the same order.
	                // 5. Return the result of calling the [[Call]] internal method
	                //   of target providing boundThis as the this value and
	                //   providing args as the arguments.

	                // equiv: target.call(this, ...boundArgs, ...args)
	                return target.apply(
	                    that,
	                    args.concat(array_slice.call(arguments))
	                );

	            }

	        };

	        // 15. If the [[Class]] internal property of Target is "Function", then
	        //     a. Let L be the length property of Target minus the length of A.
	        //     b. Set the length own property of F to either 0 or L, whichever is
	        //       larger.
	        // 16. Else set the length own property of F to 0.

	        var boundLength = Math.max(0, target.length - args.length);

	        // 17. Set the attributes of the length own property of F to the values
	        //   specified in 15.3.5.1.
	        var boundArgs = [];
	        for (var i = 0; i < boundLength; i++) {
	            boundArgs.push('$' + i);
	        }

	        // XXX Build a dynamic function with desired amount of arguments is the only
	        // way to set the length property of a function.
	        // In environments where Content Security Policies enabled (Chrome extensions,
	        // for ex.) all use of eval or Function costructor throws an exception.
	        // However in all of these environments Function.prototype.bind exists
	        // and so this code will never be executed.
	        var bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this, arguments); }')(binder);

	        if (target.prototype) {
	            Empty.prototype = target.prototype;
	            bound.prototype = new Empty();
	            // Clean up dangling references.
	            Empty.prototype = null;
	        }

	        // TODO
	        // 18. Set the [[Extensible]] internal property of F to true.

	        // TODO
	        // 19. Let thrower be the [[ThrowTypeError]] function Object (13.2.3).
	        // 20. Call the [[DefineOwnProperty]] internal method of F with
	        //   arguments "caller", PropertyDescriptor {[[Get]]: thrower, [[Set]]:
	        //   thrower, [[Enumerable]]: false, [[Configurable]]: false}, and
	        //   false.
	        // 21. Call the [[DefineOwnProperty]] internal method of F with
	        //   arguments "arguments", PropertyDescriptor {[[Get]]: thrower,
	        //   [[Set]]: thrower, [[Enumerable]]: false, [[Configurable]]: false},
	        //   and false.

	        // TODO
	        // NOTE Function objects created using Function.prototype.bind do not
	        // have a prototype property or the [[Code]], [[FormalParameters]], and
	        // [[Scope]] internal properties.
	        // XXX can't delete prototype in pure-js.

	        // 22. Return F.
	        return bound;
	    }
	});

	//
	// Array
	// =====
	//

	// ES5 15.4.3.2
	// http://es5.github.com/#x15.4.3.2
	// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray
	defineProperties(Array, { isArray: isArray });


	var boxedString = Object('a');
	var splitString = boxedString[0] !== 'a' || !(0 in boxedString);

	var properlyBoxesContext = function properlyBoxed(method) {
	    // Check node 0.6.21 bug where third parameter is not boxed
	    var properlyBoxesNonStrict = true;
	    var properlyBoxesStrict = true;
	    if (method) {
	        method.call('foo', function (_, __, context) {
	            if (typeof context !== 'object') { properlyBoxesNonStrict = false; }
	        });

	        method.call([1], function () {
	            'use strict';
	            properlyBoxesStrict = typeof this === 'string';
	        }, 'x');
	    }
	    return !!method && properlyBoxesNonStrict && properlyBoxesStrict;
	};

	defineProperties(ArrayPrototype, {
	    forEach: function forEach(fun /*, thisp*/) {
	        var object = toObject(this),
	            self = splitString && isString(this) ? this.split('') : object,
	            thisp = arguments[1],
	            i = -1,
	            length = self.length >>> 0;

	        // If no callback function or if callback is not a callable function
	        if (!isFunction(fun)) {
	            throw new TypeError(); // TODO message
	        }

	        while (++i < length) {
	            if (i in self) {
	                // Invoke the callback function with call, passing arguments:
	                // context, property value, property key, thisArg object
	                // context
	                fun.call(thisp, self[i], i, object);
	            }
	        }
	    }
	}, !properlyBoxesContext(ArrayPrototype.forEach));

	// ES5 15.4.4.14
	// http://es5.github.com/#x15.4.4.14
	// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
	var hasFirefox2IndexOfBug = Array.prototype.indexOf && [0, 1].indexOf(1, 2) !== -1;
	defineProperties(ArrayPrototype, {
	    indexOf: function indexOf(sought /*, fromIndex */ ) {
	        var self = splitString && isString(this) ? this.split('') : toObject(this),
	            length = self.length >>> 0;

	        if (!length) {
	            return -1;
	        }

	        var i = 0;
	        if (arguments.length > 1) {
	            i = toInteger(arguments[1]);
	        }

	        // handle negative indices
	        i = i >= 0 ? i : Math.max(0, length + i);
	        for (; i < length; i++) {
	            if (i in self && self[i] === sought) {
	                return i;
	            }
	        }
	        return -1;
	    }
	}, hasFirefox2IndexOfBug);

	//
	// String
	// ======
	//

	// ES5 15.5.4.14
	// http://es5.github.com/#x15.5.4.14

	// [bugfix, IE lt 9, firefox 4, Konqueror, Opera, obscure browsers]
	// Many browsers do not split properly with regular expressions or they
	// do not perform the split correctly under obscure conditions.
	// See http://blog.stevenlevithan.com/archives/cross-browser-split
	// I've tested in many browsers and this seems to cover the deviant ones:
	//    'ab'.split(/(?:ab)*/) should be ["", ""], not [""]
	//    '.'.split(/(.?)(.?)/) should be ["", ".", "", ""], not ["", ""]
	//    'tesst'.split(/(s)*/) should be ["t", undefined, "e", "s", "t"], not
	//       [undefined, "t", undefined, "e", ...]
	//    ''.split(/.?/) should be [], not [""]
	//    '.'.split(/()()/) should be ["."], not ["", "", "."]

	var string_split = StringPrototype.split;
	if (
	    'ab'.split(/(?:ab)*/).length !== 2 ||
	    '.'.split(/(.?)(.?)/).length !== 4 ||
	    'tesst'.split(/(s)*/)[1] === 't' ||
	    'test'.split(/(?:)/, -1).length !== 4 ||
	    ''.split(/.?/).length ||
	    '.'.split(/()()/).length > 1
	) {
	    (function () {
	        var compliantExecNpcg = /()??/.exec('')[1] === void 0; // NPCG: nonparticipating capturing group

	        StringPrototype.split = function (separator, limit) {
	            var string = this;
	            if (separator === void 0 && limit === 0) {
	                return [];
	            }

	            // If `separator` is not a regex, use native split
	            if (_toString.call(separator) !== '[object RegExp]') {
	                return string_split.call(this, separator, limit);
	            }

	            var output = [],
	                flags = (separator.ignoreCase ? 'i' : '') +
	                        (separator.multiline  ? 'm' : '') +
	                        (separator.extended   ? 'x' : '') + // Proposed for ES6
	                        (separator.sticky     ? 'y' : ''), // Firefox 3+
	                lastLastIndex = 0,
	                // Make `global` and avoid `lastIndex` issues by working with a copy
	                separator2, match, lastIndex, lastLength;
	            separator = new RegExp(separator.source, flags + 'g');
	            string += ''; // Type-convert
	            if (!compliantExecNpcg) {
	                // Doesn't need flags gy, but they don't hurt
	                separator2 = new RegExp('^' + separator.source + '$(?!\\s)', flags);
	            }
	            /* Values for `limit`, per the spec:
	             * If undefined: 4294967295 // Math.pow(2, 32) - 1
	             * If 0, Infinity, or NaN: 0
	             * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
	             * If negative number: 4294967296 - Math.floor(Math.abs(limit))
	             * If other: Type-convert, then use the above rules
	             */
	            limit = limit === void 0 ?
	                -1 >>> 0 : // Math.pow(2, 32) - 1
	                ToUint32(limit);
	            while (match = separator.exec(string)) {
	                // `separator.lastIndex` is not reliable cross-browser
	                lastIndex = match.index + match[0].length;
	                if (lastIndex > lastLastIndex) {
	                    output.push(string.slice(lastLastIndex, match.index));
	                    // Fix browsers whose `exec` methods don't consistently return `undefined` for
	                    // nonparticipating capturing groups
	                    if (!compliantExecNpcg && match.length > 1) {
	                        match[0].replace(separator2, function () {
	                            for (var i = 1; i < arguments.length - 2; i++) {
	                                if (arguments[i] === void 0) {
	                                    match[i] = void 0;
	                                }
	                            }
	                        });
	                    }
	                    if (match.length > 1 && match.index < string.length) {
	                        ArrayPrototype.push.apply(output, match.slice(1));
	                    }
	                    lastLength = match[0].length;
	                    lastLastIndex = lastIndex;
	                    if (output.length >= limit) {
	                        break;
	                    }
	                }
	                if (separator.lastIndex === match.index) {
	                    separator.lastIndex++; // Avoid an infinite loop
	                }
	            }
	            if (lastLastIndex === string.length) {
	                if (lastLength || !separator.test('')) {
	                    output.push('');
	                }
	            } else {
	                output.push(string.slice(lastLastIndex));
	            }
	            return output.length > limit ? output.slice(0, limit) : output;
	        };
	    }());

	// [bugfix, chrome]
	// If separator is undefined, then the result array contains just one String,
	// which is the this value (converted to a String). If limit is not undefined,
	// then the output array is truncated so that it contains no more than limit
	// elements.
	// "0".split(undefined, 0) -> []
	} else if ('0'.split(void 0, 0).length) {
	    StringPrototype.split = function split(separator, limit) {
	        if (separator === void 0 && limit === 0) { return []; }
	        return string_split.call(this, separator, limit);
	    };
	}

	// ES5 15.5.4.20
	// whitespace from: http://es5.github.io/#x15.5.4.20
	var ws = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003' +
	    '\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028' +
	    '\u2029\uFEFF';
	var zeroWidth = '\u200b';
	var wsRegexChars = '[' + ws + ']';
	var trimBeginRegexp = new RegExp('^' + wsRegexChars + wsRegexChars + '*');
	var trimEndRegexp = new RegExp(wsRegexChars + wsRegexChars + '*$');
	var hasTrimWhitespaceBug = StringPrototype.trim && (ws.trim() || !zeroWidth.trim());
	defineProperties(StringPrototype, {
	    // http://blog.stevenlevithan.com/archives/faster-trim-javascript
	    // http://perfectionkills.com/whitespace-deviations/
	    trim: function trim() {
	        if (this === void 0 || this === null) {
	            throw new TypeError("can't convert " + this + ' to object');
	        }
	        return String(this).replace(trimBeginRegexp, '').replace(trimEndRegexp, '');
	    }
	}, hasTrimWhitespaceBug);

	// ECMA-262, 3rd B.2.3
	// Not an ECMAScript standard, although ECMAScript 3rd Edition has a
	// non-normative section suggesting uniform semantics and it should be
	// normalized across all browsers
	// [bugfix, IE lt 9] IE < 9 substr() with negative value not working in IE
	var string_substr = StringPrototype.substr;
	var hasNegativeSubstrBug = ''.substr && '0b'.substr(-1) !== 'b';
	defineProperties(StringPrototype, {
	    substr: function substr(start, length) {
	        return string_substr.call(
	            this,
	            start < 0 ? ((start = this.length + start) < 0 ? 0 : start) : start,
	            length
	        );
	    }
	}, hasNegativeSubstrBug);


/***/ },

/***/ 96:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var JSON3 = __webpack_require__(81);

	// Some extra characters that Chrome gets wrong, and substitutes with
	// something else on the wire.
	var extraEscapable = /[\x00-\x1f\ud800-\udfff\ufffe\uffff\u0300-\u0333\u033d-\u0346\u034a-\u034c\u0350-\u0352\u0357-\u0358\u035c-\u0362\u0374\u037e\u0387\u0591-\u05af\u05c4\u0610-\u0617\u0653-\u0654\u0657-\u065b\u065d-\u065e\u06df-\u06e2\u06eb-\u06ec\u0730\u0732-\u0733\u0735-\u0736\u073a\u073d\u073f-\u0741\u0743\u0745\u0747\u07eb-\u07f1\u0951\u0958-\u095f\u09dc-\u09dd\u09df\u0a33\u0a36\u0a59-\u0a5b\u0a5e\u0b5c-\u0b5d\u0e38-\u0e39\u0f43\u0f4d\u0f52\u0f57\u0f5c\u0f69\u0f72-\u0f76\u0f78\u0f80-\u0f83\u0f93\u0f9d\u0fa2\u0fa7\u0fac\u0fb9\u1939-\u193a\u1a17\u1b6b\u1cda-\u1cdb\u1dc0-\u1dcf\u1dfc\u1dfe\u1f71\u1f73\u1f75\u1f77\u1f79\u1f7b\u1f7d\u1fbb\u1fbe\u1fc9\u1fcb\u1fd3\u1fdb\u1fe3\u1feb\u1fee-\u1fef\u1ff9\u1ffb\u1ffd\u2000-\u2001\u20d0-\u20d1\u20d4-\u20d7\u20e7-\u20e9\u2126\u212a-\u212b\u2329-\u232a\u2adc\u302b-\u302c\uaab2-\uaab3\uf900-\ufa0d\ufa10\ufa12\ufa15-\ufa1e\ufa20\ufa22\ufa25-\ufa26\ufa2a-\ufa2d\ufa30-\ufa6d\ufa70-\ufad9\ufb1d\ufb1f\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40-\ufb41\ufb43-\ufb44\ufb46-\ufb4e\ufff0-\uffff]/g
	  , extraLookup;

	// This may be quite slow, so let's delay until user actually uses bad
	// characters.
	var unrollLookup = function(escapable) {
	  var i;
	  var unrolled = {};
	  var c = [];
	  for (i = 0; i < 65536; i++) {
	    c.push( String.fromCharCode(i) );
	  }
	  escapable.lastIndex = 0;
	  c.join('').replace(escapable, function(a) {
	    unrolled[ a ] = '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
	    return '';
	  });
	  escapable.lastIndex = 0;
	  return unrolled;
	};

	// Quote string, also taking care of unicode characters that browsers
	// often break. Especially, take care of unicode surrogates:
	// http://en.wikipedia.org/wiki/Mapping_of_Unicode_characters#Surrogates
	module.exports = {
	  quote: function(string) {
	    var quoted = JSON3.stringify(string);

	    // In most cases this should be very fast and good enough.
	    extraEscapable.lastIndex = 0;
	    if (!extraEscapable.test(quoted)) {
	      return quoted;
	    }

	    if (!extraLookup) {
	      extraLookup = unrollLookup(extraEscapable);
	    }

	    return quoted.replace(extraEscapable, function(a) {
	      return extraLookup[a];
	    });
	  }
	};


/***/ },

/***/ 97:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var debug = function() {};
	if ((undefined) !== 'production') {
	  debug = __webpack_require__(17)('sockjs-client:utils:transport');
	}

	module.exports = function(availableTransports) {
	  return {
	    filterToEnabled: function(transportsWhitelist, info) {
	      var transports = {
	        main: []
	      , facade: []
	      };
	      if (!transportsWhitelist) {
	        transportsWhitelist = [];
	      } else if (typeof transportsWhitelist === 'string') {
	        transportsWhitelist = [transportsWhitelist];
	      }

	      availableTransports.forEach(function(trans) {
	        if (!trans) {
	          return;
	        }

	        if (trans.transportName === 'websocket' && info.websocket === false) {
	          debug('disabled from server', 'websocket');
	          return;
	        }

	        if (transportsWhitelist.length &&
	            transportsWhitelist.indexOf(trans.transportName) === -1) {
	          debug('not in whitelist', trans.transportName);
	          return;
	        }

	        if (trans.enabled(info)) {
	          debug('enabled', trans.transportName);
	          transports.main.push(trans);
	          if (trans.facadeTransport) {
	            transports.facade.push(trans.facadeTransport);
	          }
	        } else {
	          debug('disabled', trans.transportName);
	        }
	      });
	      return transports;
	    }
	  };
	};


/***/ },

/***/ 98:
/***/ function(module, exports) {

	'use strict';

	var logObject = {};
	['log', 'debug', 'warn'].forEach(function (level) {
	  var levelExists;

	  try {
	    levelExists = global.console && global.console[level] && global.console[level].apply;
	  } catch(e) {
	    // do nothing
	  }

	  logObject[level] = levelExists ? function () {
	    return global.console[level].apply(global.console, arguments);
	  } : (level === 'log' ? function () {} : logObject.log);
	});

	module.exports = logObject;


/***/ },

/***/ 99:
/***/ function(module, exports) {

	'use strict';

	function Event(eventType) {
	  this.type = eventType;
	}

	Event.prototype.initEvent = function(eventType, canBubble, cancelable) {
	  this.type = eventType;
	  this.bubbles = canBubble;
	  this.cancelable = cancelable;
	  this.timeStamp = +new Date();
	  return this;
	};

	Event.prototype.stopPropagation = function() {};
	Event.prototype.preventDefault = function() {};

	Event.CAPTURING_PHASE = 1;
	Event.AT_TARGET = 2;
	Event.BUBBLING_PHASE = 3;

	module.exports = Event;


/***/ },

/***/ 100:
/***/ function(module, exports) {

	'use strict';

	/* Simplified implementation of DOM2 EventTarget.
	 *   http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-EventTarget
	 */

	function EventTarget() {
	  this._listeners = {};
	}

	EventTarget.prototype.addEventListener = function(eventType, listener) {
	  if (!(eventType in this._listeners)) {
	    this._listeners[eventType] = [];
	  }
	  var arr = this._listeners[eventType];
	  // #4
	  if (arr.indexOf(listener) === -1) {
	    // Make a copy so as not to interfere with a current dispatchEvent.
	    arr = arr.concat([listener]);
	  }
	  this._listeners[eventType] = arr;
	};

	EventTarget.prototype.removeEventListener = function(eventType, listener) {
	  var arr = this._listeners[eventType];
	  if (!arr) {
	    return;
	  }
	  var idx = arr.indexOf(listener);
	  if (idx !== -1) {
	    if (arr.length > 1) {
	      // Make a copy so as not to interfere with a current dispatchEvent.
	      this._listeners[eventType] = arr.slice(0, idx).concat(arr.slice(idx + 1));
	    } else {
	      delete this._listeners[eventType];
	    }
	    return;
	  }
	};

	EventTarget.prototype.dispatchEvent = function() {
	  var event = arguments[0];
	  var t = event.type;
	  // equivalent of Array.prototype.slice.call(arguments, 0);
	  var args = arguments.length === 1 ? [event] : Array.apply(null, arguments);
	  // TODO: This doesn't match the real behavior; per spec, onfoo get
	  // their place in line from the /first/ time they're set from
	  // non-null. Although WebKit bumps it to the end every time it's
	  // set.
	  if (this['on' + t]) {
	    this['on' + t].apply(this, args);
	  }
	  if (t in this._listeners) {
	    // Grab a reference to the listeners list. removeEventListener may alter the list.
	    var listeners = this._listeners[t];
	    for (var i = 0; i < listeners.length; i++) {
	      listeners[i].apply(this, args);
	    }
	  }
	};

	module.exports = EventTarget;


/***/ },

/***/ 101:
/***/ function(module, exports) {

	'use strict';

	module.exports = global.location || {
	  origin: 'http://localhost:80'
	, protocol: 'http'
	, host: 'localhost'
	, port: 80
	, href: 'http://localhost/'
	, hash: ''
	};


/***/ },

/***/ 102:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var inherits = __webpack_require__(26)
	  , Event = __webpack_require__(99)
	  ;

	function CloseEvent() {
	  Event.call(this);
	  this.initEvent('close', false, false);
	  this.wasClean = false;
	  this.code = 0;
	  this.reason = '';
	}

	inherits(CloseEvent, Event);

	module.exports = CloseEvent;


/***/ },

/***/ 103:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var inherits = __webpack_require__(26)
	  , Event = __webpack_require__(99)
	  ;

	function TransportMessageEvent(data) {
	  Event.call(this);
	  this.initEvent('message', false, false);
	  this.data = data;
	}

	inherits(TransportMessageEvent, Event);

	module.exports = TransportMessageEvent;


/***/ },

/***/ 104:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var EventEmitter = __webpack_require__(28).EventEmitter
	  , inherits = __webpack_require__(26)
	  , urlUtils = __webpack_require__(12)
	  , XDR = __webpack_require__(72)
	  , XHRCors = __webpack_require__(65)
	  , XHRLocal = __webpack_require__(69)
	  , XHRFake = __webpack_require__(105)
	  , InfoIframe = __webpack_require__(106)
	  , InfoAjax = __webpack_require__(108)
	  ;

	var debug = function() {};
	if ((undefined) !== 'production') {
	  debug = __webpack_require__(17)('sockjs-client:info-receiver');
	}

	function InfoReceiver(baseUrl, urlInfo) {
	  debug(baseUrl);
	  var self = this;
	  EventEmitter.call(this);

	  setTimeout(function() {
	    self.doXhr(baseUrl, urlInfo);
	  }, 0);
	}

	inherits(InfoReceiver, EventEmitter);

	// TODO this is currently ignoring the list of available transports and the whitelist

	InfoReceiver._getReceiver = function(baseUrl, url, urlInfo) {
	  // determine method of CORS support (if needed)
	  if (urlInfo.sameOrigin) {
	    return new InfoAjax(url, XHRLocal);
	  }
	  if (XHRCors.enabled) {
	    return new InfoAjax(url, XHRCors);
	  }
	  if (XDR.enabled && urlInfo.sameScheme) {
	    return new InfoAjax(url, XDR);
	  }
	  if (InfoIframe.enabled()) {
	    return new InfoIframe(baseUrl, url);
	  }
	  return new InfoAjax(url, XHRFake);
	};

	InfoReceiver.prototype.doXhr = function(baseUrl, urlInfo) {
	  var self = this
	    , url = urlUtils.addPath(baseUrl, '/info')
	    ;
	  debug('doXhr', url);

	  this.xo = InfoReceiver._getReceiver(baseUrl, url, urlInfo);

	  this.timeoutRef = setTimeout(function() {
	    debug('timeout');
	    self._cleanup(false);
	    self.emit('finish');
	  }, InfoReceiver.timeout);

	  this.xo.once('finish', function(info, rtt) {
	    debug('finish', info, rtt);
	    self._cleanup(true);
	    self.emit('finish', info, rtt);
	  });
	};

	InfoReceiver.prototype._cleanup = function(wasClean) {
	  debug('_cleanup');
	  clearTimeout(this.timeoutRef);
	  this.timeoutRef = null;
	  if (!wasClean && this.xo) {
	    this.xo.close();
	  }
	  this.xo = null;
	};

	InfoReceiver.prototype.close = function() {
	  debug('close');
	  this.removeAllListeners();
	  this._cleanup(false);
	};

	InfoReceiver.timeout = 8000;

	module.exports = InfoReceiver;


/***/ },

/***/ 105:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var EventEmitter = __webpack_require__(28).EventEmitter
	  , inherits = __webpack_require__(26)
	  ;

	function XHRFake(/* method, url, payload, opts */) {
	  var self = this;
	  EventEmitter.call(this);

	  this.to = setTimeout(function() {
	    self.emit('finish', 200, '{}');
	  }, XHRFake.timeout);
	}

	inherits(XHRFake, EventEmitter);

	XHRFake.prototype.close = function() {
	  clearTimeout(this.to);
	};

	XHRFake.timeout = 2000;

	module.exports = XHRFake;


/***/ },

/***/ 106:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var EventEmitter = __webpack_require__(28).EventEmitter
	  , inherits = __webpack_require__(26)
	  , JSON3 = __webpack_require__(81)
	  , utils = __webpack_require__(9)
	  , IframeTransport = __webpack_require__(80)
	  , InfoReceiverIframe = __webpack_require__(107)
	  ;

	var debug = function() {};
	if ((undefined) !== 'production') {
	  debug = __webpack_require__(17)('sockjs-client:info-iframe');
	}

	function InfoIframe(baseUrl, url) {
	  var self = this;
	  EventEmitter.call(this);

	  var go = function() {
	    var ifr = self.ifr = new IframeTransport(InfoReceiverIframe.transportName, url, baseUrl);

	    ifr.once('message', function(msg) {
	      if (msg) {
	        var d;
	        try {
	          d = JSON3.parse(msg);
	        } catch (e) {
	          debug('bad json', msg);
	          self.emit('finish');
	          self.close();
	          return;
	        }

	        var info = d[0], rtt = d[1];
	        self.emit('finish', info, rtt);
	      }
	      self.close();
	    });

	    ifr.once('close', function() {
	      self.emit('finish');
	      self.close();
	    });
	  };

	  // TODO this seems the same as the 'needBody' from transports
	  if (!global.document.body) {
	    utils.attachEvent('load', go);
	  } else {
	    go();
	  }
	}

	inherits(InfoIframe, EventEmitter);

	InfoIframe.enabled = function() {
	  return IframeTransport.enabled();
	};

	InfoIframe.prototype.close = function() {
	  if (this.ifr) {
	    this.ifr.close();
	  }
	  this.removeAllListeners();
	  this.ifr = null;
	};

	module.exports = InfoIframe;


/***/ },

/***/ 107:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var inherits = __webpack_require__(26)
	  , EventEmitter = __webpack_require__(28).EventEmitter
	  , JSON3 = __webpack_require__(81)
	  , XHRLocalObject = __webpack_require__(69)
	  , InfoAjax = __webpack_require__(108)
	  ;

	function InfoReceiverIframe(transUrl) {
	  var self = this;
	  EventEmitter.call(this);

	  this.ir = new InfoAjax(transUrl, XHRLocalObject);
	  this.ir.once('finish', function(info, rtt) {
	    self.ir = null;
	    self.emit('message', JSON3.stringify([info, rtt]));
	  });
	}

	inherits(InfoReceiverIframe, EventEmitter);

	InfoReceiverIframe.transportName = 'iframe-info-receiver';

	InfoReceiverIframe.prototype.close = function() {
	  if (this.ir) {
	    this.ir.close();
	    this.ir = null;
	  }
	  this.removeAllListeners();
	};

	module.exports = InfoReceiverIframe;


/***/ },

/***/ 108:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var EventEmitter = __webpack_require__(28).EventEmitter
	  , inherits = __webpack_require__(26)
	  , JSON3 = __webpack_require__(81)
	  , objectUtils = __webpack_require__(86)
	  ;

	var debug = function() {};
	if ((undefined) !== 'production') {
	  debug = __webpack_require__(17)('sockjs-client:info-ajax');
	}

	function InfoAjax(url, AjaxObject) {
	  EventEmitter.call(this);

	  var self = this;
	  var t0 = +new Date();
	  this.xo = new AjaxObject('GET', url);

	  this.xo.once('finish', function(status, text) {
	    var info, rtt;
	    if (status === 200) {
	      rtt = (+new Date()) - t0;
	      if (text) {
	        try {
	          info = JSON3.parse(text);
	        } catch (e) {
	          debug('bad json', text);
	        }
	      }

	      if (!objectUtils.isObject(info)) {
	        info = {};
	      }
	    }
	    self.emit('finish', info, rtt);
	    self.removeAllListeners();
	  });
	}

	inherits(InfoAjax, EventEmitter);

	InfoAjax.prototype.close = function() {
	  this.removeAllListeners();
	  this.xo.close();
	};

	module.exports = InfoAjax;


/***/ },

/***/ 109:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var urlUtils = __webpack_require__(12)
	  , eventUtils = __webpack_require__(9)
	  , JSON3 = __webpack_require__(81)
	  , FacadeJS = __webpack_require__(110)
	  , InfoIframeReceiver = __webpack_require__(107)
	  , iframeUtils = __webpack_require__(85)
	  , loc = __webpack_require__(101)
	  ;

	var debug = function() {};
	if ((undefined) !== 'production') {
	  debug = __webpack_require__(17)('sockjs-client:iframe-bootstrap');
	}

	module.exports = function(SockJS, availableTransports) {
	  var transportMap = {};
	  availableTransports.forEach(function(at) {
	    if (at.facadeTransport) {
	      transportMap[at.facadeTransport.transportName] = at.facadeTransport;
	    }
	  });

	  // hard-coded for the info iframe
	  // TODO see if we can make this more dynamic
	  transportMap[InfoIframeReceiver.transportName] = InfoIframeReceiver;
	  var parentOrigin;

	  /* eslint-disable camelcase */
	  SockJS.bootstrap_iframe = function() {
	    /* eslint-enable camelcase */
	    var facade;
	    iframeUtils.currentWindowId = loc.hash.slice(1);
	    var onMessage = function(e) {
	      if (e.source !== parent) {
	        return;
	      }
	      if (typeof parentOrigin === 'undefined') {
	        parentOrigin = e.origin;
	      }
	      if (e.origin !== parentOrigin) {
	        return;
	      }

	      var iframeMessage;
	      try {
	        iframeMessage = JSON3.parse(e.data);
	      } catch (ignored) {
	        debug('bad json', e.data);
	        return;
	      }

	      if (iframeMessage.windowId !== iframeUtils.currentWindowId) {
	        return;
	      }
	      switch (iframeMessage.type) {
	      case 's':
	        var p;
	        try {
	          p = JSON3.parse(iframeMessage.data);
	        } catch (ignored) {
	          debug('bad json', iframeMessage.data);
	          break;
	        }
	        var version = p[0];
	        var transport = p[1];
	        var transUrl = p[2];
	        var baseUrl = p[3];
	        debug(version, transport, transUrl, baseUrl);
	        // change this to semver logic
	        if (version !== SockJS.version) {
	          throw new Error('Incompatible SockJS! Main site uses:' +
	                    ' "' + version + '", the iframe:' +
	                    ' "' + SockJS.version + '".');
	        }

	        if (!urlUtils.isOriginEqual(transUrl, loc.href) ||
	            !urlUtils.isOriginEqual(baseUrl, loc.href)) {
	          throw new Error('Can\'t connect to different domain from within an ' +
	                    'iframe. (' + loc.href + ', ' + transUrl + ', ' + baseUrl + ')');
	        }
	        facade = new FacadeJS(new transportMap[transport](transUrl, baseUrl));
	        break;
	      case 'm':
	        facade._send(iframeMessage.data);
	        break;
	      case 'c':
	        if (facade) {
	          facade._close();
	        }
	        facade = null;
	        break;
	      }
	    };

	    eventUtils.attachEvent('message', onMessage);

	    // Start
	    iframeUtils.postMessage('s');
	  };
	};


/***/ },

/***/ 110:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var JSON3 = __webpack_require__(81)
	  , iframeUtils = __webpack_require__(85)
	  ;

	function FacadeJS(transport) {
	  this._transport = transport;
	  transport.on('message', this._transportMessage.bind(this));
	  transport.on('close', this._transportClose.bind(this));
	}

	FacadeJS.prototype._transportClose = function(code, reason) {
	  iframeUtils.postMessage('c', JSON3.stringify([code, reason]));
	};
	FacadeJS.prototype._transportMessage = function(frame) {
	  iframeUtils.postMessage('t', frame);
	};
	FacadeJS.prototype._send = function(data) {
	  this._transport.send(data);
	};
	FacadeJS.prototype._close = function() {
	  this._transport.close();
	  this._transport.removeAllListeners();
	};

	module.exports = FacadeJS;


/***/ },

/***/ 111:
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	/*globals window __webpack_hash__ */
	if(true) {
		var lastData;
		var upToDate = function upToDate() {
			return lastData.indexOf(__webpack_require__.h()) >= 0;
		};
		var check = function check() {
			module.hot.check(function(err, updatedModules) {
				if(err) {
					if(module.hot.status() in {
							abort: 1,
							fail: 1
						}) {
						console.warn("[HMR] Cannot check for update. Need to do a full reload!");
						console.warn("[HMR] " + err.stack || err.message);
					} else {
						console.warn("[HMR] Update check failed: " + err.stack || err.message);
					}
					return;
				}

				if(!updatedModules) {
					console.warn("[HMR] Cannot find update. Need to do a full reload!");
					console.warn("[HMR] (Probably because of restarting the webpack-dev-server)");
					return;
				}

				module.hot.apply({
					ignoreUnaccepted: true
				}, function(err, renewedModules) {
					if(err) {
						if(module.hot.status() in {
								abort: 1,
								fail: 1
							}) {
							console.warn("[HMR] Cannot apply update. Need to do a full reload!");
							console.warn("[HMR] " + err.stack || err.message);
						} else {
							console.warn("[HMR] Update failed: " + err.stack || err.message);
						}
						return;
					}

					if(!upToDate()) {
						check();
					}

					__webpack_require__(112)(updatedModules, renewedModules);

					if(upToDate()) {
						console.log("[HMR] App is up to date.");
					}
				});
			});
		};
		var addEventListener = window.addEventListener ? function(eventName, listener) {
			window.addEventListener(eventName, listener, false);
		} : function(eventName, listener) {
			window.attachEvent("on" + eventName, listener);
		};
		addEventListener("message", function(event) {
			if(typeof event.data === "string" && event.data.indexOf("webpackHotUpdate") === 0) {
				lastData = event.data;
				if(!upToDate() && module.hot.status() === "idle") {
					console.log("[HMR] Checking for updates on the server...");
					check();
				}
			}
		});
		console.log("[HMR] Waiting for update signal from WDS...");
	} else {
		throw new Error("[HMR] Hot Module Replacement is disabled.");
	}


/***/ },

/***/ 112:
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	module.exports = function(updatedModules, renewedModules) {
		var unacceptedModules = updatedModules.filter(function(moduleId) {
			return renewedModules && renewedModules.indexOf(moduleId) < 0;
		});

		if(unacceptedModules.length > 0) {
			console.warn("[HMR] The following modules couldn't be hot updated: (They would need a full reload!)");
			unacceptedModules.forEach(function(moduleId) {
				console.warn("[HMR]  - " + moduleId);
			});
		}

		if(!renewedModules || renewedModules.length === 0) {
			console.log("[HMR] Nothing hot updated.");
		} else {
			console.log("[HMR] Updated modules:");
			renewedModules.forEach(function(moduleId) {
				console.log("[HMR]  - " + moduleId);
			});
		}
	};


/***/ },

/***/ 113:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	__webpack_require__(114);

	var _react = __webpack_require__(122);

	var _react2 = _interopRequireDefault(_react);

	var _reactDom = __webpack_require__(152);

	var _reactDom2 = _interopRequireDefault(_reactDom);

	var _reactRouter = __webpack_require__(298);

	var _App = __webpack_require__(353);

	var _App2 = _interopRequireDefault(_App);

	var _AppLogin = __webpack_require__(635);

	var _AppLogin2 = _interopRequireDefault(_AppLogin);

	var _AppTraining = __webpack_require__(640);

	var _AppTraining2 = _interopRequireDefault(_AppTraining);

	var _AppExplore = __webpack_require__(645);

	var _AppExplore2 = _interopRequireDefault(_AppExplore);

	var _AppRecord = __webpack_require__(649);

	var _AppRecord2 = _interopRequireDefault(_AppRecord);

	var _AppUserCenter = __webpack_require__(650);

	var _AppUserCenter2 = _interopRequireDefault(_AppUserCenter);

	var _AppWorkout = __webpack_require__(651);

	var _AppWorkout2 = _interopRequireDefault(_AppWorkout);

	var _WorkoutDescription = __webpack_require__(654);

	var _WorkoutDescription2 = _interopRequireDefault(_WorkoutDescription);

	var _RequireAuth = __webpack_require__(659);

	var _RequireAuth2 = _interopRequireDefault(_RequireAuth);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	//import { AppContainer } from 'react-hot-loader'
	var app = document.createElement('div');
	app.id = 'app';
	app.className = "container";
	document.querySelector('body').appendChild(app);

	_reactDom2.default.render(_react2.default.createElement(
	    _reactRouter.Router,
	    { history: _reactRouter.hashHistory },
	    _react2.default.createElement(
	        _reactRouter.Route,
	        { path: '/', onEnter: _RequireAuth2.default, component: _App2.default },
	        _react2.default.createElement(_reactRouter.IndexRoute, { component: _AppTraining2.default }),
	        _react2.default.createElement(_reactRouter.Route, { path: 'training', component: _AppTraining2.default }),
	        _react2.default.createElement(
	            _reactRouter.Route,
	            { path: 'plan/:plan_id', component: _AppWorkout2.default },
	            _react2.default.createElement(_reactRouter.Route, { path: ':desc_id', component: _WorkoutDescription2.default })
	        ),
	        _react2.default.createElement(_reactRouter.Route, { path: 'explore', component: _AppExplore2.default }),
	        _react2.default.createElement(_reactRouter.Route, { path: 'record', component: _AppRecord2.default }),
	        _react2.default.createElement(_reactRouter.Route, { path: 'user-center', component: _AppUserCenter2.default })
	    ),
	    _react2.default.createElement(_reactRouter.Route, { path: '/login', component: _AppLogin2.default })
	), document.getElementById('app'));

	// Hot Module Replacement API
	//if (module.hot) {
	//    module.hot.accept('./components/App', () => {
	//        const NextApp = require('./components/App').default;
	//        ReactDOM.render(
	//            <AppContainer>
	//                <App />
	//            </AppContainer>,
	//            document.getElementById('app')
	//        );
	//    });
	//}

	;

	var _temp = function () {
	    if (typeof __REACT_HOT_LOADER__ === 'undefined') {
	        return;
	    }

	    __REACT_HOT_LOADER__.register(app, 'app', '/Users/liucong/Documents/Github/keepForMac/src/main.js');
	}();

	;

	 ;(function register() { /* react-hot-loader/webpack */ if ((undefined) !== 'production') { if (typeof __REACT_HOT_LOADER__ === 'undefined') { return; } if (typeof module.exports === 'function') { __REACT_HOT_LOADER__.register(module.exports, 'module.exports', "/Users/liucong/Documents/Github/keepForMac/src/main.js"); return; } for (var key in module.exports) { if (!Object.prototype.hasOwnProperty.call(module.exports, key)) { continue; } var namedExport = void 0; try { namedExport = module.exports[key]; } catch (err) { continue; } __REACT_HOT_LOADER__.register(namedExport, key, "/Users/liucong/Documents/Github/keepForMac/src/main.js"); } } })();

/***/ },

/***/ 353:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _dec, _class, _desc, _value, _class2;

	var _react = __webpack_require__(122);

	var _react2 = _interopRequireDefault(_react);

	var _reactCssModules = __webpack_require__(354);

	var _reactCssModules2 = _interopRequireDefault(_reactCssModules);

	var _autobindDecorator = __webpack_require__(513);

	var _autobindDecorator2 = _interopRequireDefault(_autobindDecorator);

	var _reactRouter = __webpack_require__(298);

	var _index = __webpack_require__(514);

	var _index2 = _interopRequireDefault(_index);

	var _AppSearch = __webpack_require__(517);

	var _AppSearch2 = _interopRequireDefault(_AppSearch);

	var _UserWindow = __webpack_require__(520);

	var _UserWindow2 = _interopRequireDefault(_UserWindow);

	var _Utils = __webpack_require__(521);

	var _Utils2 = _interopRequireDefault(_Utils);

	var _HttpRequest = __webpack_require__(523);

	var _HttpRequest2 = _interopRequireDefault(_HttpRequest);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
	    var desc = {};
	    Object['ke' + 'ys'](descriptor).forEach(function (key) {
	        desc[key] = descriptor[key];
	    });
	    desc.enumerable = !!desc.enumerable;
	    desc.configurable = !!desc.configurable;

	    if ('value' in desc || desc.initializer) {
	        desc.writable = true;
	    }

	    desc = decorators.slice().reverse().reduce(function (desc, decorator) {
	        return decorator(target, property, desc) || desc;
	    }, desc);

	    if (context && desc.initializer !== void 0) {
	        desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
	        desc.initializer = undefined;
	    }

	    if (desc.initializer === void 0) {
	        Object['define' + 'Property'](target, property, desc);
	        desc = null;
	    }

	    return desc;
	}

	var App = (_dec = (0, _reactCssModules2.default)(_index2.default), _dec(_class = (_class2 = function (_Component) {
	    _inherits(App, _Component);

	    function App(props) {
	        _classCallCheck(this, App);

	        var _this = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, props));

	        _this.state = {
	            user: {},
	            disabledBack: true,
	            disabledForward: true
	        };
	        return _this;
	    }

	    _createClass(App, [{
	        key: 'componentDidMount',
	        value: function componentDidMount() {
	            var userData = _Utils2.default.storage.get('userData') || {};
	            if (userData._id) {
	                this.setState({
	                    user: userData
	                });
	            }
	        }
	    }, {
	        key: 'getUser',
	        value: function getUser() {
	            if (this.state.user._id) return _react2.default.createElement(
	                'div',
	                { styleName: 'header-user' },
	                _react2.default.createElement('img', { onClick: function onClick() {
	                        _Utils2.default.storage.set('userInfo', _Utils2.default.storage.get('mineInfo'));_UserWindow2.default.create('我的资料');
	                    }, styleName: 'header-avatar', src: this.state.user.avatar, alt: '' }),
	                _react2.default.createElement(
	                    'ul',
	                    { styleName: 'header-menu' },
	                    _react2.default.createElement(
	                        'li',
	                        null,
	                        _react2.default.createElement(
	                            'div',
	                            { styleName: 'header-mine' },
	                            _react2.default.createElement('div', { styleName: 'header-mine-back', style: { backgroundImage: 'url(' + this.state.user.avatar + ')' } }),
	                            _react2.default.createElement(
	                                'div',
	                                { styleName: 'header-mine-inner' },
	                                _react2.default.createElement('img', { styleName: 'mine-avatar', src: this.state.user.avatar, alt: '' }),
	                                this.state.user.username
	                            )
	                        )
	                    ),
	                    _react2.default.createElement(
	                        'li',
	                        null,
	                        _react2.default.createElement(
	                            'a',
	                            { href: 'javascript:;' },
	                            _react2.default.createElement('i', { className: 'iconfont icon-keep fz14' }),
	                            '\u4E2A\u4EBA\u4E2D\u5FC3'
	                        )
	                    ),
	                    _react2.default.createElement(
	                        'li',
	                        null,
	                        _react2.default.createElement(
	                            'a',
	                            { href: 'javascript:;' },
	                            _react2.default.createElement('i', { className: 'iconfont icon-collect fz14' }),
	                            '\u6211\u7684\u6536\u85CF'
	                        )
	                    ),
	                    _react2.default.createElement(
	                        'li',
	                        { onClick: this.handleLogout },
	                        _react2.default.createElement(
	                            'a',
	                            { styleName: 'exit-btn', href: 'javascript:;' },
	                            _react2.default.createElement('i', { className: 'iconfont icon-logout fz14' }),
	                            '\u9000\u51FA\u767B\u5F55'
	                        )
	                    )
	                )
	            );
	        }
	    }, {
	        key: 'componentWillMount',
	        value: function componentWillMount() {
	            console.warn(this.props.router.routes);
	            var userData = _Utils2.default.storage.get('userData') || {};

	            if (userData._id) {
	                // 获取登录用户信息缓存
	                _HttpRequest2.default.getUserData(_Utils2.default.storage.get('userData')._id).then(function (response) {
	                    if (response.ok) {
	                        _Utils2.default.storage.set('mineInfo', response.data);
	                    }
	                });
	            }

	            if (!_Utils2.default.storage.has('cityData')) {
	                // 获取地区信息缓存
	                _HttpRequest2.default.getCityJson().then(function (response) {
	                    if (response.ok) {
	                        (function () {
	                            _Utils2.default.storage.set('cityData', response.data);
	                            var cityArr = [];
	                            response.data.forEach(function (city) {
	                                cityArr = [].concat(_toConsumableArray(cityArr), _toConsumableArray(city.children.map(function (item) {
	                                    return {
	                                        'cityCode': item.code,
	                                        'cityName': city.name + ',' + item.name
	                                    };
	                                })));
	                            });
	                            _Utils2.default.storage.set('cityJson', cityArr);
	                        })();
	                    }
	                });
	            }
	        }
	    }, {
	        key: 'historyActionBack',
	        value: function historyActionBack() {
	            _reactRouter.hashHistory.goBack();
	            if (1) this.setState({ disabledBack: true });else this.setState({ disabledForward: false });
	        }
	    }, {
	        key: 'historyActionForward',
	        value: function historyActionForward() {
	            //if(hashHistory.component[hashHistory.component-1].displayName) {
	            if (_reactRouter.hashHistory) {
	                this.setState({
	                    disabledBack: false
	                });
	                _reactRouter.hashHistory.goForward();
	            } else {
	                this.setState({
	                    disabledForward: true
	                });
	            }
	        }
	    }, {
	        key: 'handleBuild',
	        value: function handleBuild() {
	            alert('此模块功能暂未完成，敬请期待！');
	        }
	    }, {
	        key: 'handleLogout',
	        value: function handleLogout() {
	            if (confirm('确定退出？')) {
	                _Utils2.default.storage.clear();
	                _reactRouter.hashHistory.replace('/login');
	            }
	        }
	    }, {
	        key: 'render',
	        value: function render() {
	            return _react2.default.createElement(
	                'div',
	                { style: { width: '100%' } },
	                _react2.default.createElement(
	                    'header',
	                    { styleName: 'index-header' },
	                    _react2.default.createElement(
	                        'div',
	                        { styleName: 'index-logo' },
	                        _react2.default.createElement('img', { src: __webpack_require__(634), alt: '' })
	                    ),
	                    _react2.default.createElement(
	                        'div',
	                        { styleName: 'history-col' },
	                        _react2.default.createElement(
	                            'button',
	                            { disabled: 0, styleName: 'history-button', onClick: this.historyActionBack },
	                            _react2.default.createElement('i', { className: 'iconfont icon-forward' })
	                        ),
	                        _react2.default.createElement(
	                            'button',
	                            { disabled: 0, styleName: 'history-button', onClick: this.historyActionForward },
	                            _react2.default.createElement('i', { className: 'iconfont icon-goback' })
	                        )
	                    ),
	                    _react2.default.createElement(
	                        'div',
	                        { styleName: 'col' },
	                        _react2.default.createElement(_AppSearch2.default, null)
	                    ),
	                    _react2.default.createElement(
	                        'div',
	                        { styleName: 'col' },
	                        this.getUser()
	                    )
	                ),
	                _react2.default.createElement(
	                    'main',
	                    { styleName: 'main-container' },
	                    _react2.default.createElement(
	                        'nav',
	                        { styleName: 'index-left-menu' },
	                        _react2.default.createElement('div', { styleName: 'index-menu-bg' }),
	                        _react2.default.createElement(
	                            'li',
	                            null,
	                            _react2.default.createElement(
	                                _reactRouter.Link,
	                                { to: '/training', activeClassName: 'active' },
	                                _react2.default.createElement('i', { className: 'iconfont icon-training fz18' }),
	                                '\u8BAD\u7EC3'
	                            )
	                        ),
	                        _react2.default.createElement(
	                            'li',
	                            null,
	                            _react2.default.createElement(
	                                _reactRouter.Link,
	                                { to: '/explore', activeClassName: 'active' },
	                                _react2.default.createElement('i', { className: 'iconfont icon-discovery fz18' }),
	                                '\u53D1\u73B0'
	                            )
	                        ),
	                        _react2.default.createElement(
	                            'li',
	                            { onClick: this.handleBuild },
	                            _react2.default.createElement(
	                                _reactRouter.Link,
	                                { activeClassName: 'active' },
	                                _react2.default.createElement('i', { className: 'iconfont icon-record fz18' }),
	                                '\u52A8\u6001'
	                            )
	                        ),
	                        _react2.default.createElement(
	                            'li',
	                            { onClick: this.handleBuild },
	                            _react2.default.createElement(
	                                _reactRouter.Link,
	                                { activeClassName: 'active' },
	                                _react2.default.createElement('i', { className: 'iconfont icon-usercenter fz18' }),
	                                '\u6211'
	                            )
	                        )
	                    ),
	                    _react2.default.createElement(
	                        'div',
	                        { styleName: 'index-content' },
	                        this.props.children
	                    )
	                )
	            );
	        }
	    }]);

	    return App;
	}(_react.Component), (_applyDecoratedDescriptor(_class2.prototype, 'componentDidMount', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'componentDidMount'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'getUser', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'getUser'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'componentWillMount', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'componentWillMount'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'historyActionBack', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'historyActionBack'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'historyActionForward', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'historyActionForward'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'handleBuild', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'handleBuild'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'handleLogout', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'handleLogout'), _class2.prototype)), _class2)) || _class);
	var _default = App;
	exports.default = _default;
	;

	var _temp = function () {
	    if (typeof __REACT_HOT_LOADER__ === 'undefined') {
	        return;
	    }

	    __REACT_HOT_LOADER__.register(App, 'App', '/Users/liucong/Documents/Github/keepForMac/src/js/App.js');

	    __REACT_HOT_LOADER__.register(_default, 'default', '/Users/liucong/Documents/Github/keepForMac/src/js/App.js');
	}();

	;

	 ;(function register() { /* react-hot-loader/webpack */ if ((undefined) !== 'production') { if (typeof __REACT_HOT_LOADER__ === 'undefined') { return; } if (typeof module.exports === 'function') { __REACT_HOT_LOADER__.register(module.exports, 'module.exports', "/Users/liucong/Documents/Github/keepForMac/src/js/App.js"); return; } for (var key in module.exports) { if (!Object.prototype.hasOwnProperty.call(module.exports, key)) { continue; } var namedExport = void 0; try { namedExport = module.exports[key]; } catch (err) { continue; } __REACT_HOT_LOADER__.register(namedExport, key, "/Users/liucong/Documents/Github/keepForMac/src/js/App.js"); } } })();

/***/ },

/***/ 514:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(515);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(121)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(true) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept(515, function() {
				var newContent = __webpack_require__(515);
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 515:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(116)();
	// imports


	// module
	exports.push([module.id, ".Mb-bh {\n  height: 100%;\n  width: 150px;\n  float: left;\n  display: flex;\n  flex-direction: column;\n  border-right: 1px solid #eee;\n  padding: 25vh 0;\n  background: rgba(240, 240, 240, 0.7);\n  position: relative; }\n  .Mb-bh li {\n    display: flex;\n    flex: 1; }\n  .Mb-bh a {\n    outline: none;\n    display: flex;\n    width: 100%;\n    padding-left: 20px;\n    align-items: center;\n    border-left: 2px solid transparent; }\n    .Mb-bh a:hover, .Mb-bh a:focus {\n      border-left-color: #584f5f; }\n\n._1MkFd {\n  position: absolute;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  opacity: .8;\n  z-index: -1;\n  filter: blur(2px);\n  overflow: hidden;\n  background: url(" + __webpack_require__(516) + ") center/cover; }\n\n._3fJ39 {\n  position: absolute;\n  top: 60px;\n  right: 0;\n  bottom: 0;\n  left: 0; }\n\n._2R7RT {\n  position: relative;\n  overflow: hidden;\n  height: 100%;\n  margin-left: 150px;\n  background: #E5ECEF; }\n\n.ZE6hx {\n  padding-top: 20px;\n  height: 60px;\n  background: #584f5f;\n  -webkit-app-region: drag;\n  display: flex;\n  border-bottom: 1px solid #584f5f; }\n  .ZE6hx ._2LnKA {\n    flex: 1;\n    align-self: center; }\n  .ZE6hx h2 {\n    flex: 1;\n    margin: 0;\n    color: #fff;\n    text-align: center;\n    align-self: center; }\n\n._3iOBj {\n  display: flex;\n  align-items: center; }\n\n.WPT6- {\n  width: 32px;\n  height: 32px;\n  line-height: 29px;\n  display: inline-block;\n  background: none;\n  border: none;\n  color: #fff;\n  cursor: pointer; }\n  .WPT6- i {\n    margin: 0; }\n  .WPT6-:active {\n    background: #473e4e; }\n  .WPT6-:last-child {\n    margin-right: 15px; }\n  .WPT6-[disabled] {\n    cursor: default;\n    color: #999; }\n\n._18Mek {\n  padding-left: 10px;\n  width: 150px;\n  display: flex;\n  align-self: center; }\n  ._18Mek img {\n    width: 80px;\n    height: 25px; }\n\n._3-6wn {\n  padding: 0 23px 0 0;\n  float: right;\n  cursor: pointer;\n  position: relative; }\n  ._3-6wn:after {\n    content: '';\n    position: absolute;\n    top: 45%;\n    right: 10px;\n    width: 0;\n    border: 4px solid transparent;\n    border-top-color: #fff; }\n  ._3-6wn:hover ._12Snl {\n    display: block; }\n\n._4a-00 {\n  width: 30px;\n  height: 30px;\n  border-radius: 50%;\n  border: 2px solid #00c78c; }\n\n._2hRSM {\n  color: #fff;\n  font-size: 10px; }\n\n._12Snl {\n  display: none;\n  position: absolute;\n  z-index: 50;\n  top: 120%;\n  right: 10px;\n  width: 220px;\n  padding: 0;\n  border-radius: 4px;\n  filter: drop-shadow(0px 0px 3px rgba(0, 0, 0, 0.5));\n  background: #fff;\n  margin: 5px 0 0; }\n  ._12Snl:before {\n    content: '';\n    position: absolute;\n    top: -15px;\n    right: 18px;\n    border: 8px solid transparent;\n    border-bottom-color: #584f5f; }\n  ._12Snl li {\n    line-height: 30px; }\n    ._12Snl li:last-child {\n      border-top: 1px solid #eee; }\n  ._12Snl a {\n    cursor: pointer;\n    font-size: 12px;\n    display: block;\n    padding: 2px 15px;\n    color: #584f5f; }\n    ._12Snl a:hover {\n      color: #fff;\n      background: #00c78c; }\n\n._1MWTN {\n  border-bottom: 1px solid #eee;\n  overflow: hidden;\n  position: relative;\n  background: #584f5f;\n  border-radius: 4px 4px 0 0; }\n  ._1MWTN:hover ._1hIft {\n    transform: scale(0.8); }\n\n._1hIft {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  transform: scale(1.01);\n  background: #584f5f no-repeat center/200% auto;\n  filter: blur(5px);\n  transition: transform 1s; }\n\n.ZllJc {\n  position: relative;\n  display: flex;\n  padding: 15px;\n  align-items: center;\n  z-index: 10;\n  color: #fff;\n  background: rgba(0, 0, 0, 0.5); }\n\n._29Ebc {\n  width: 40px;\n  height: 40px;\n  border-radius: 50%;\n  margin-right: 8px;\n  background: #584f5f;\n  border: 1px solid #00c78c; }\n\na.qF9CS {\n  border-radius: 0 0 4px 4px; }\n\na.qF9CS:hover {\n  background: #ff5065; }\n", ""]);

	// exports
	exports.locals = {
		"index-left-menu": "Mb-bh",
		"index-menu-bg": "_1MkFd",
		"main-container": "_3fJ39",
		"index-content": "_2R7RT",
		"index-header": "ZE6hx",
		"col": "_2LnKA",
		"history-col": "_3iOBj",
		"history-button": "WPT6-",
		"index-logo": "_18Mek",
		"header-user": "_3-6wn",
		"header-menu": "_12Snl",
		"header-avatar": "_4a-00",
		"header-nickname": "_2hRSM",
		"header-mine": "_1MWTN",
		"header-mine-back": "_1hIft",
		"header-mine-inner": "ZllJc",
		"mine-avatar": "_29Ebc",
		"exit-btn": "qF9CS"
	};

/***/ },

/***/ 516:
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "images/ebd4082d.keep-menu-bg.jpg";

/***/ },

/***/ 517:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _dec, _class;

	var _react = __webpack_require__(122);

	var _react2 = _interopRequireDefault(_react);

	var _reactCssModules = __webpack_require__(354);

	var _reactCssModules2 = _interopRequireDefault(_reactCssModules);

	var _appSearch = __webpack_require__(518);

	var _appSearch2 = _interopRequireDefault(_appSearch);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var AppSearch = (_dec = (0, _reactCssModules2.default)(_appSearch2.default), _dec(_class = function (_Component) {
	    _inherits(AppSearch, _Component);

	    function AppSearch(props) {
	        _classCallCheck(this, AppSearch);

	        return _possibleConstructorReturn(this, (AppSearch.__proto__ || Object.getPrototypeOf(AppSearch)).call(this, props));
	    }

	    _createClass(AppSearch, [{
	        key: 'render',
	        value: function render() {
	            return _react2.default.createElement(
	                'div',
	                { styleName: 'common-search-wrap' },
	                _react2.default.createElement('i', { styleName: 'icon-search', className: 'iconfont icon-search fz18' }),
	                _react2.default.createElement('input', { styleName: 'common-search', type: 'search', placeholder: '\u641C\u7D22' })
	            );
	        }
	    }]);

	    return AppSearch;
	}(_react.Component)) || _class);
	var _default = AppSearch;
	exports.default = _default;
	;

	var _temp = function () {
	    if (typeof __REACT_HOT_LOADER__ === 'undefined') {
	        return;
	    }

	    __REACT_HOT_LOADER__.register(AppSearch, 'AppSearch', '/Users/liucong/Documents/Github/keepForMac/src/components/AppSearch.js');

	    __REACT_HOT_LOADER__.register(_default, 'default', '/Users/liucong/Documents/Github/keepForMac/src/components/AppSearch.js');
	}();

	;

	 ;(function register() { /* react-hot-loader/webpack */ if ((undefined) !== 'production') { if (typeof __REACT_HOT_LOADER__ === 'undefined') { return; } if (typeof module.exports === 'function') { __REACT_HOT_LOADER__.register(module.exports, 'module.exports', "/Users/liucong/Documents/Github/keepForMac/src/components/AppSearch.js"); return; } for (var key in module.exports) { if (!Object.prototype.hasOwnProperty.call(module.exports, key)) { continue; } var namedExport = void 0; try { namedExport = module.exports[key]; } catch (err) { continue; } __REACT_HOT_LOADER__.register(namedExport, key, "/Users/liucong/Documents/Github/keepForMac/src/components/AppSearch.js"); } } })();

/***/ },

/***/ 518:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(519);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(121)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(true) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept(519, function() {
				var newContent = __webpack_require__(519);
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 519:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(116)();
	// imports


	// module
	exports.push([module.id, "._3lEoT {\n  height: 25px;\n  border-radius: 20px;\n  border: 1px solid #eee;\n  background: #fff;\n  padding-left: 5px;\n  width: 200px;\n  display: flex; }\n\n._1Vdge {\n  margin-right: 3px;\n  line-height: 24px;\n  float: left; }\n\n._2Mvad {\n  flex: 1;\n  outline: none;\n  height: 100%;\n  background: none;\n  border: none;\n  font-size: 12px;\n  padding-right: 10px; }\n", ""]);

	// exports
	exports.locals = {
		"common-search-wrap": "_3lEoT",
		"icon-search": "_1Vdge",
		"common-search": "_2Mvad"
	};

/***/ },

/***/ 520:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _autobindDecorator = __webpack_require__(513);

	var _autobindDecorator2 = _interopRequireDefault(_autobindDecorator);

	var _Utils = __webpack_require__(521);

	var _Utils2 = _interopRequireDefault(_Utils);

	var _electron = __webpack_require__(522);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _default = {
	    winUser: null,
	    has: function has() {
	        return !!this.winUser;
	    },
	    check: function check() {
	        return this.winUser;
	    },
	    create: function create(title) {
	        var _this = this;

	        this.winUser = new _electron.remote.BrowserWindow({
	            'width': 333,
	            'height': 520,
	            'title': title,
	            'titleBarStyle': 'hidden',
	            'center': true,
	            'minimizable': false,
	            'maximizable': false,
	            'fullscreen': false,
	            'fullscreenable': false,
	            'backgroundColor': '#584f5f',
	            'alwaysOnTop': true,
	            //'show': false,
	            'resizable': false
	        });
	        this.winUser.loadURL('file://' + (__dirname) + '/userContent.html');
	        this.winUser.on('close', function () {
	            _this.winUser = null;
	        });
	        //this.winUser.once('ready-to-show', () => {
	        //    this.winUser.show()
	        //})
	    },
	    show: function show(title) {
	        try {
	            if (this.winUser) {
	                this.winUser.setTitle(title);
	                this.winUser.focus();
	            }
	        } catch (e) {
	            console.info(e);
	        }
	    }
	};
	exports.default = _default;
	;

	var _temp = function () {
	    if (typeof __REACT_HOT_LOADER__ === 'undefined') {
	        return;
	    }

	    __REACT_HOT_LOADER__.register(_default, 'default', '/Users/liucong/Documents/Github/keepForMac/src/components/common/UserWindow.js');
	}();

	;

	 ;(function register() { /* react-hot-loader/webpack */ if ((undefined) !== 'production') { if (typeof __REACT_HOT_LOADER__ === 'undefined') { return; } if (typeof module.exports === 'function') { __REACT_HOT_LOADER__.register(module.exports, 'module.exports', "/Users/liucong/Documents/Github/keepForMac/src/components/common/UserWindow.js"); return; } for (var key in module.exports) { if (!Object.prototype.hasOwnProperty.call(module.exports, key)) { continue; } var namedExport = void 0; try { namedExport = module.exports[key]; } catch (err) { continue; } __REACT_HOT_LOADER__.register(namedExport, key, "/Users/liucong/Documents/Github/keepForMac/src/components/common/UserWindow.js"); } } })();

/***/ },

/***/ 523:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _default2;

	var _Utils = __webpack_require__(521);

	var _Utils2 = _interopRequireDefault(_Utils);

	var _moment = __webpack_require__(524);

	var _moment2 = _interopRequireDefault(_moment);

	var _autobindDecorator = __webpack_require__(513);

	var _autobindDecorator2 = _interopRequireDefault(_autobindDecorator);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	var hostname = 'https://api.gotokeep.com';

	var serializeJSON = function serializeJSON(data) {
	    return Object.keys(data).map(function (keyName) {
	        return encodeURIComponent(keyName) + '=' + encodeURIComponent(data[keyName]);
	    }).join('&');
	};

	var _default = (_default2 = {
	    getToken: function getToken() {
	        var authentication = _Utils2.default.storage.get('authentication') || {};
	        return 'Bearer ' + authentication.token;
	    },
	    httpGet: function httpGet(url) {
	        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	        if (!url) {
	            return false;
	        }

	        options = Object.assign({
	            method: 'GET',
	            headers: {
	                'Authorization': this.getToken()
	            }
	        }, options);

	        return fetch(hostname + url, options).then(function (res) {
	            return res.json();
	        });
	    },
	    httpPost: function httpPost(url) {
	        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	        if (!url) {
	            return false;
	        }
	        options = Object.assign({
	            method: 'GET',
	            headers: {
	                'Authorization': this.getToken()
	            }
	        }, options);

	        return fetch(hostname + url, options).then(function (res) {
	            return res.json();
	        });
	    }

	    /**
	     * Dashboard
	     */
	    // Plans
	    ,
	    getDashboardTraining: function getDashboardTraining() {
	        return this.httpGet('/training/v2/home');
	    },
	    getDashboardWorkouts: function getDashboardWorkouts() {
	        return this.httpGet('/v2/home/dashboard/pwData');
	    }

	    // Statistics
	    ,
	    getDashboardStatistics: function getDashboardStatistics() {
	        return this.httpGet('/v1.1/home/dashboard/statistics');
	    }
	    // User
	    ,
	    getDashboardUser: function getDashboardUser() {
	        return this.httpGet('/v1.1/home/dashboard/user');
	    },
	    getRankingData: function getRankingData() {
	        var para = serializeJSON({
	            date: (0, _moment2.default)().format('YYYYMMDD')
	        });
	        return this.httpGet('/social/v2/rankinglist/brief?' + para);
	    }

	    // user login
	    ,
	    login: function login(data) {
	        return this.httpPost('/v1.1/users/login', {
	            method: "POST",
	            headers: {
	                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
	            },
	            body: serializeJSON(data)
	        });
	    }

	    // 用户个人信息
	    ,
	    getUserData: function getUserData(userID) {
	        return this.httpGet('/v2/people/' + userID);
	    }

	    // workouts content
	    //getExploreContent() {
	    //    return fetch('https://show.gotokeep.com/explore/', {
	    //        method: 'GET',
	    //        headers: {
	    //            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
	    //            'Authorization': this.getToken()
	    //        }
	    //    })
	    //}

	    // workout plan
	    ,
	    getPlansContent: function getPlansContent(workoutsId) {
	        var gender = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'm';

	        return this.httpGet('/v2/plans/' + workoutsId + '?trainer_gender=' + gender);
	    }
	    // 获取训练内容计划[以及同类推荐]
	    ,
	    getWorkoutsPlans: function getWorkoutsPlans(planId) {
	        return this.httpGet('/training/v2/plans/' + planId + '/dynamic?tLimit=3&tSlimWorkout=true');
	    }
	    // 获取 总打卡数量/训练评论/完成用户/座右铭
	    ,
	    getWorkoutsWorks: function getWorkoutsWorks(workoutId) {
	        return this.httpGet('/training/v2/workouts/' + workoutId + '/dynamic?tLimit=3');
	    }

	    // 完成训练
	    ,
	    completeExercise: function completeExercise() {
	        return this.httpGet('/now');
	    },
	    commitTrainingLog: function commitTrainingLog(json) {
	        return this.httpPost('/v1.1/home/saveTrainingLog', Object.assign({
	            'serverEndTime': new Date().toISOString(),
	            'doneDate': new Date().toISOString()
	        }));
	    }
	}, _defineProperty(_default2, 'commitTrainingLog', function commitTrainingLog(json) {
	    return this.httpPost('/v1.1/home/achievements/new');
	}), _defineProperty(_default2, 'getCityJson', function getCityJson() {
	    return this.httpGet('/v1.1/home/cities');
	}), _default2);

	exports.default = _default;
	;

	var _temp = function () {
	    if (typeof __REACT_HOT_LOADER__ === 'undefined') {
	        return;
	    }

	    __REACT_HOT_LOADER__.register(hostname, 'hostname', '/Users/liucong/Documents/Github/keepForMac/src/js/HttpRequest.js');

	    __REACT_HOT_LOADER__.register(serializeJSON, 'serializeJSON', '/Users/liucong/Documents/Github/keepForMac/src/js/HttpRequest.js');

	    __REACT_HOT_LOADER__.register(_default, 'default', '/Users/liucong/Documents/Github/keepForMac/src/js/HttpRequest.js');
	}();

	;

	 ;(function register() { /* react-hot-loader/webpack */ if ((undefined) !== 'production') { if (typeof __REACT_HOT_LOADER__ === 'undefined') { return; } if (typeof module.exports === 'function') { __REACT_HOT_LOADER__.register(module.exports, 'module.exports', "/Users/liucong/Documents/Github/keepForMac/src/js/HttpRequest.js"); return; } for (var key in module.exports) { if (!Object.prototype.hasOwnProperty.call(module.exports, key)) { continue; } var namedExport = void 0; try { namedExport = module.exports[key]; } catch (err) { continue; } __REACT_HOT_LOADER__.register(namedExport, key, "/Users/liucong/Documents/Github/keepForMac/src/js/HttpRequest.js"); } } })();

/***/ },

/***/ 634:
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "images/ec5cad8f.keep-logo.png";

/***/ },

/***/ 635:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _dec, _class, _desc, _value, _class2;

	var _react = __webpack_require__(122);

	var _react2 = _interopRequireDefault(_react);

	var _reactCssModules = __webpack_require__(354);

	var _reactCssModules2 = _interopRequireDefault(_reactCssModules);

	var _reactRouter = __webpack_require__(298);

	var _Utils = __webpack_require__(521);

	var _Utils2 = _interopRequireDefault(_Utils);

	var _appLogin = __webpack_require__(636);

	var _appLogin2 = _interopRequireDefault(_appLogin);

	var _autobindDecorator = __webpack_require__(513);

	var _autobindDecorator2 = _interopRequireDefault(_autobindDecorator);

	var _jsBase = __webpack_require__(638);

	var _HttpRequest = __webpack_require__(523);

	var _HttpRequest2 = _interopRequireDefault(_HttpRequest);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
	    var desc = {};
	    Object['ke' + 'ys'](descriptor).forEach(function (key) {
	        desc[key] = descriptor[key];
	    });
	    desc.enumerable = !!desc.enumerable;
	    desc.configurable = !!desc.configurable;

	    if ('value' in desc || desc.initializer) {
	        desc.writable = true;
	    }

	    desc = decorators.slice().reverse().reduce(function (desc, decorator) {
	        return decorator(target, property, desc) || desc;
	    }, desc);

	    if (context && desc.initializer !== void 0) {
	        desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
	        desc.initializer = undefined;
	    }

	    if (desc.initializer === void 0) {
	        Object['define' + 'Property'](target, property, desc);
	        desc = null;
	    }

	    return desc;
	}

	var AppLogin = (_dec = (0, _reactCssModules2.default)(_appLogin2.default), _dec(_class = (_class2 = function (_Component) {
	    _inherits(AppLogin, _Component);

	    function AppLogin(props) {
	        _classCallCheck(this, AppLogin);

	        var _this = _possibleConstructorReturn(this, (AppLogin.__proto__ || Object.getPrototypeOf(AppLogin)).call(this, props));

	        _this.state = {
	            mobile: '',
	            password: ''
	        };
	        return _this;
	    }

	    _createClass(AppLogin, [{
	        key: 'componentWillMount',
	        value: function componentWillMount() {
	            var user = _Utils2.default.storage.get('authentication');
	            if (user && user.token) {
	                _reactRouter.hashHistory.replace('/training');
	            }
	        }
	    }, {
	        key: 'handleChange',
	        value: function handleChange(e) {
	            this.setState(_defineProperty({}, e.target.name, e.target.value));
	        }
	    }, {
	        key: 'handleSubmit',
	        value: function handleSubmit(e) {
	            e.preventDefault();

	            if (this.state.mobile.length < 11) {
	                alert('请输入正确的手机号码');
	                return false;
	            }
	            if (!this.state.password) {
	                alert('请输入正确的登录密码');
	                return false;
	            }

	            _HttpRequest2.default.login({
	                mobile: this.state.mobile,
	                password: this.state.password
	            }).then(function (response) {
	                if (response.ok) {
	                    _Utils2.default.storage.set('authentication', response.data);
	                    _Utils2.default.storage.set('userData', _jsBase.Base64.decode(response.data.token.split('.')[1]));
	                    _reactRouter.hashHistory.replace('/training');
	                } else {
	                    alert(response.text || '登录失败');
	                }
	            }, function (error) {
	                console.info(error);
	            });
	        }
	    }, {
	        key: 'render',
	        value: function render() {
	            return _react2.default.createElement(
	                'div',
	                { styleName: 'app-container' },
	                _react2.default.createElement('video', { styleName: 'bg-video', src: 'http://static1.gotokeep.com/homepage/5s.mp4', muted: true, autoPlay: true, loop: true }),
	                _react2.default.createElement(
	                    'form',
	                    { id: 'loginForm', styleName: 'app-login', onSubmit: this.handleSubmit },
	                    _react2.default.createElement(
	                        'h2',
	                        { styleName: 'login-title' },
	                        '\u767B\u5F55\u4F60\u7684 Keep'
	                    ),
	                    _react2.default.createElement(
	                        'div',
	                        { styleName: 'form-control' },
	                        _react2.default.createElement('input', { name: 'mobile', value: this.state.mobile, onChange: this.handleChange, styleName: 'form-input', type: 'text', maxLength: '11', autoFocus: true, placeholder: '\u4F60\u7684\u624B\u673A\u53F7' })
	                    ),
	                    _react2.default.createElement(
	                        'div',
	                        { styleName: 'form-control' },
	                        _react2.default.createElement('input', { name: 'password', value: this.state.password, onChange: this.handleChange, styleName: 'form-input', type: 'password', placeholder: '\u767B\u5F55\u5BC6\u7801' })
	                    ),
	                    _react2.default.createElement(
	                        'div',
	                        { styleName: 'form-control' },
	                        _react2.default.createElement(
	                            'button',
	                            { styleName: 'login-btn', type: 'submit' },
	                            '\u767B\u5F55'
	                        )
	                    )
	                )
	            );
	        }
	    }]);

	    return AppLogin;
	}(_react.Component), (_applyDecoratedDescriptor(_class2.prototype, 'componentWillMount', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'componentWillMount'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'handleChange', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'handleChange'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'handleSubmit', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'handleSubmit'), _class2.prototype)), _class2)) || _class);
	var _default = AppLogin;
	exports.default = _default;
	;

	var _temp = function () {
	    if (typeof __REACT_HOT_LOADER__ === 'undefined') {
	        return;
	    }

	    __REACT_HOT_LOADER__.register(AppLogin, 'AppLogin', '/Users/liucong/Documents/Github/keepForMac/src/js/AppLogin.js');

	    __REACT_HOT_LOADER__.register(_default, 'default', '/Users/liucong/Documents/Github/keepForMac/src/js/AppLogin.js');
	}();

	;

	 ;(function register() { /* react-hot-loader/webpack */ if ((undefined) !== 'production') { if (typeof __REACT_HOT_LOADER__ === 'undefined') { return; } if (typeof module.exports === 'function') { __REACT_HOT_LOADER__.register(module.exports, 'module.exports', "/Users/liucong/Documents/Github/keepForMac/src/js/AppLogin.js"); return; } for (var key in module.exports) { if (!Object.prototype.hasOwnProperty.call(module.exports, key)) { continue; } var namedExport = void 0; try { namedExport = module.exports[key]; } catch (err) { continue; } __REACT_HOT_LOADER__.register(namedExport, key, "/Users/liucong/Documents/Github/keepForMac/src/js/AppLogin.js"); } } })();

/***/ },

/***/ 636:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(637);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(121)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(true) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept(637, function() {
				var newContent = __webpack_require__(637);
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 637:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(116)();
	// imports


	// module
	exports.push([module.id, "._3N_UK {\n  width: 100%;\n  height: 100%;\n  padding-top: 30vh;\n  background: #584f5f;\n  position: relative;\n  -webkit-app-region: drag; }\n  ._3N_UK:before {\n    content: '';\n    position: absolute;\n    top: 0;\n    left: 0;\n    width: 100%;\n    height: 100%;\n    background: rgba(0, 0, 0, 0.3);\n    z-index: 2; }\n\n._3GFq9 {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  z-index: 1; }\n\n.W31p7 {\n  width: 300px;\n  margin: auto;\n  position: relative;\n  z-index: 3;\n  -webkit-app-region: no-drag; }\n\n._3bEfO {\n  color: #fff; }\n\n._1dle1 {\n  margin-bottom: 10px; }\n\n._2aPka {\n  width: 100%;\n  border: 1px solid #584f5f;\n  border-radius: 5px;\n  padding: 10px;\n  background: #fff;\n  color: #584f5f; }\n  ._2aPka:focus {\n    border-color: #00c78c; }\n\n.wz0bl {\n  display: block;\n  width: 100%;\n  padding: 10px;\n  background: #00c78c;\n  border-radius: 5px;\n  border: none;\n  color: #fff; }\n", ""]);

	// exports
	exports.locals = {
		"app-container": "_3N_UK",
		"bg-video": "_3GFq9",
		"app-login": "W31p7",
		"login-title": "_3bEfO",
		"form-control": "_1dle1",
		"form-input": "_2aPka",
		"login-btn": "wz0bl"
	};

/***/ },

/***/ 638:
/***/ function(module, exports, __webpack_require__) {

	/*
	 * $Id: base64.js,v 2.15 2014/04/05 12:58:57 dankogai Exp dankogai $
	 *
	 *  Licensed under the MIT license.
	 *    http://opensource.org/licenses/mit-license
	 *
	 *  References:
	 *    http://en.wikipedia.org/wiki/Base64
	 */

	(function(global) {
	    'use strict';
	    // existing version for noConflict()
	    var _Base64 = global.Base64;
	    var version = "2.1.9";
	    // if node.js, we use Buffer
	    var buffer;
	    if (typeof module !== 'undefined' && module.exports) {
	        try {
	            buffer = __webpack_require__(639).Buffer;
	        } catch (err) {}
	    }
	    // constants
	    var b64chars
	        = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	    var b64tab = function(bin) {
	        var t = {};
	        for (var i = 0, l = bin.length; i < l; i++) t[bin.charAt(i)] = i;
	        return t;
	    }(b64chars);
	    var fromCharCode = String.fromCharCode;
	    // encoder stuff
	    var cb_utob = function(c) {
	        if (c.length < 2) {
	            var cc = c.charCodeAt(0);
	            return cc < 0x80 ? c
	                : cc < 0x800 ? (fromCharCode(0xc0 | (cc >>> 6))
	                                + fromCharCode(0x80 | (cc & 0x3f)))
	                : (fromCharCode(0xe0 | ((cc >>> 12) & 0x0f))
	                   + fromCharCode(0x80 | ((cc >>>  6) & 0x3f))
	                   + fromCharCode(0x80 | ( cc         & 0x3f)));
	        } else {
	            var cc = 0x10000
	                + (c.charCodeAt(0) - 0xD800) * 0x400
	                + (c.charCodeAt(1) - 0xDC00);
	            return (fromCharCode(0xf0 | ((cc >>> 18) & 0x07))
	                    + fromCharCode(0x80 | ((cc >>> 12) & 0x3f))
	                    + fromCharCode(0x80 | ((cc >>>  6) & 0x3f))
	                    + fromCharCode(0x80 | ( cc         & 0x3f)));
	        }
	    };
	    var re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
	    var utob = function(u) {
	        return u.replace(re_utob, cb_utob);
	    };
	    var cb_encode = function(ccc) {
	        var padlen = [0, 2, 1][ccc.length % 3],
	        ord = ccc.charCodeAt(0) << 16
	            | ((ccc.length > 1 ? ccc.charCodeAt(1) : 0) << 8)
	            | ((ccc.length > 2 ? ccc.charCodeAt(2) : 0)),
	        chars = [
	            b64chars.charAt( ord >>> 18),
	            b64chars.charAt((ord >>> 12) & 63),
	            padlen >= 2 ? '=' : b64chars.charAt((ord >>> 6) & 63),
	            padlen >= 1 ? '=' : b64chars.charAt(ord & 63)
	        ];
	        return chars.join('');
	    };
	    var btoa = global.btoa ? function(b) {
	        return global.btoa(b);
	    } : function(b) {
	        return b.replace(/[\s\S]{1,3}/g, cb_encode);
	    };
	    var _encode = buffer ? function (u) {
	        return (u.constructor === buffer.constructor ? u : new buffer(u))
	        .toString('base64')
	    }
	    : function (u) { return btoa(utob(u)) }
	    ;
	    var encode = function(u, urisafe) {
	        return !urisafe
	            ? _encode(String(u))
	            : _encode(String(u)).replace(/[+\/]/g, function(m0) {
	                return m0 == '+' ? '-' : '_';
	            }).replace(/=/g, '');
	    };
	    var encodeURI = function(u) { return encode(u, true) };
	    // decoder stuff
	    var re_btou = new RegExp([
	        '[\xC0-\xDF][\x80-\xBF]',
	        '[\xE0-\xEF][\x80-\xBF]{2}',
	        '[\xF0-\xF7][\x80-\xBF]{3}'
	    ].join('|'), 'g');
	    var cb_btou = function(cccc) {
	        switch(cccc.length) {
	        case 4:
	            var cp = ((0x07 & cccc.charCodeAt(0)) << 18)
	                |    ((0x3f & cccc.charCodeAt(1)) << 12)
	                |    ((0x3f & cccc.charCodeAt(2)) <<  6)
	                |     (0x3f & cccc.charCodeAt(3)),
	            offset = cp - 0x10000;
	            return (fromCharCode((offset  >>> 10) + 0xD800)
	                    + fromCharCode((offset & 0x3FF) + 0xDC00));
	        case 3:
	            return fromCharCode(
	                ((0x0f & cccc.charCodeAt(0)) << 12)
	                    | ((0x3f & cccc.charCodeAt(1)) << 6)
	                    |  (0x3f & cccc.charCodeAt(2))
	            );
	        default:
	            return  fromCharCode(
	                ((0x1f & cccc.charCodeAt(0)) << 6)
	                    |  (0x3f & cccc.charCodeAt(1))
	            );
	        }
	    };
	    var btou = function(b) {
	        return b.replace(re_btou, cb_btou);
	    };
	    var cb_decode = function(cccc) {
	        var len = cccc.length,
	        padlen = len % 4,
	        n = (len > 0 ? b64tab[cccc.charAt(0)] << 18 : 0)
	            | (len > 1 ? b64tab[cccc.charAt(1)] << 12 : 0)
	            | (len > 2 ? b64tab[cccc.charAt(2)] <<  6 : 0)
	            | (len > 3 ? b64tab[cccc.charAt(3)]       : 0),
	        chars = [
	            fromCharCode( n >>> 16),
	            fromCharCode((n >>>  8) & 0xff),
	            fromCharCode( n         & 0xff)
	        ];
	        chars.length -= [0, 0, 2, 1][padlen];
	        return chars.join('');
	    };
	    var atob = global.atob ? function(a) {
	        return global.atob(a);
	    } : function(a){
	        return a.replace(/[\s\S]{1,4}/g, cb_decode);
	    };
	    var _decode = buffer ? function(a) {
	        return (a.constructor === buffer.constructor
	                ? a : new buffer(a, 'base64')).toString();
	    }
	    : function(a) { return btou(atob(a)) };
	    var decode = function(a){
	        return _decode(
	            String(a).replace(/[-_]/g, function(m0) { return m0 == '-' ? '+' : '/' })
	                .replace(/[^A-Za-z0-9\+\/]/g, '')
	        );
	    };
	    var noConflict = function() {
	        var Base64 = global.Base64;
	        global.Base64 = _Base64;
	        return Base64;
	    };
	    // export Base64
	    global.Base64 = {
	        VERSION: version,
	        atob: atob,
	        btoa: btoa,
	        fromBase64: decode,
	        toBase64: encode,
	        utob: utob,
	        encode: encode,
	        encodeURI: encodeURI,
	        btou: btou,
	        decode: decode,
	        noConflict: noConflict
	    };
	    // if ES5 is available, make Base64.extendString() available
	    if (typeof Object.defineProperty === 'function') {
	        var noEnum = function(v){
	            return {value:v,enumerable:false,writable:true,configurable:true};
	        };
	        global.Base64.extendString = function () {
	            Object.defineProperty(
	                String.prototype, 'fromBase64', noEnum(function () {
	                    return decode(this)
	                }));
	            Object.defineProperty(
	                String.prototype, 'toBase64', noEnum(function (urisafe) {
	                    return encode(this, urisafe)
	                }));
	            Object.defineProperty(
	                String.prototype, 'toBase64URI', noEnum(function () {
	                    return encode(this, true)
	                }));
	        };
	    }
	    // that's it!
	    if (global['Meteor']) {
	       Base64 = global.Base64; // for normal export in Meteor.js
	    }
	})(this);


/***/ },

/***/ 639:
/***/ function(module, exports) {

	module.exports = require("buffer");

/***/ },

/***/ 640:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _dec, _class, _desc, _value, _class2;

	var _react = __webpack_require__(122);

	var _react2 = _interopRequireDefault(_react);

	var _reactCssModules = __webpack_require__(354);

	var _reactCssModules2 = _interopRequireDefault(_reactCssModules);

	var _autobindDecorator = __webpack_require__(513);

	var _autobindDecorator2 = _interopRequireDefault(_autobindDecorator);

	var _moment = __webpack_require__(524);

	var _moment2 = _interopRequireDefault(_moment);

	var _reactRouter = __webpack_require__(298);

	var _Utils = __webpack_require__(521);

	var _Utils2 = _interopRequireDefault(_Utils);

	var _TrainingBlock = __webpack_require__(641);

	var _TrainingBlock2 = _interopRequireDefault(_TrainingBlock);

	var _AppScroll = __webpack_require__(644);

	var _AppScroll2 = _interopRequireDefault(_AppScroll);

	var _appTraining = __webpack_require__(642);

	var _appTraining2 = _interopRequireDefault(_appTraining);

	var _HttpRequest = __webpack_require__(523);

	var _HttpRequest2 = _interopRequireDefault(_HttpRequest);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
	    var desc = {};
	    Object['ke' + 'ys'](descriptor).forEach(function (key) {
	        desc[key] = descriptor[key];
	    });
	    desc.enumerable = !!desc.enumerable;
	    desc.configurable = !!desc.configurable;

	    if ('value' in desc || desc.initializer) {
	        desc.writable = true;
	    }

	    desc = decorators.slice().reverse().reduce(function (desc, decorator) {
	        return decorator(target, property, desc) || desc;
	    }, desc);

	    if (context && desc.initializer !== void 0) {
	        desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
	        desc.initializer = undefined;
	    }

	    if (desc.initializer === void 0) {
	        Object['define' + 'Property'](target, property, desc);
	        desc = null;
	    }

	    return desc;
	}

	var AppTraining = (_dec = (0, _reactCssModules2.default)(_appTraining2.default), _dec(_class = (_class2 = function (_Component) {
	    _inherits(AppTraining, _Component);

	    function AppTraining(props) {
	        _classCallCheck(this, AppTraining);

	        var _this = _possibleConstructorReturn(this, (AppTraining.__proto__ || Object.getPrototypeOf(AppTraining)).call(this, props));

	        var localTraining = _Utils2.default.storage.get('trainingWorkouts');

	        _this.state = {
	            trainingGuidance: localTraining ? localTraining[0] : {},
	            trainingSchedules: localTraining ? localTraining[1] : {},
	            trainingWorkouts: localTraining ? localTraining[2] : {},
	            recommendCourses: localTraining ? localTraining[3] : {},
	            recommendBook: localTraining ? localTraining[4] : {},
	            trainingData: {},
	            rankingData: {
	                'paperwork': '本周好友训练排名'
	            }
	        };
	        return _this;
	    }

	    _createClass(AppTraining, [{
	        key: 'componentWillMount',
	        value: function componentWillMount() {
	            var _this2 = this;

	            var authentication = _Utils2.default.storage.get('authentication') || {};

	            // 判断是否登录
	            if (authentication && authentication.token) {
	                _HttpRequest2.default.getDashboardStatistics().then(function (response) {
	                    if (response.ok) {
	                        _this2.setState({ trainingData: response.data });
	                    }
	                }).catch(function (error) {
	                    console.info('getDashboardStatistics:', error);
	                });

	                _HttpRequest2.default.getRankingData().then(function (response) {
	                    if (response.ok) {
	                        _this2.setState({ rankingData: response.data });
	                    }
	                }).catch(function (error) {
	                    console.info('getRankingData:', error);
	                });

	                _HttpRequest2.default.getDashboardTraining().then(function (response) {
	                    if (response.ok) {
	                        _this2.setState({
	                            trainingGuidance: response.data[0],
	                            trainingSchedules: response.data[1],
	                            trainingWorkouts: response.data[2],
	                            recommendCourses: response.data[3],
	                            recommendBook: response.data[4]
	                        });
	                        //Utils.storage.set('trainingPlan',response.data)
	                        _Utils2.default.storage.set('trainingWorkouts', response.data);
	                    }
	                }).catch(function (error) {
	                    console.info('getDashboardTraining:', error);
	                });

	                //$http.getDashboardWorkouts().then((response) => {
	                //    if (response.ok) {
	                //        this.setState({
	                //            trainingWorkouts: response.data.workouts
	                //        })
	                //        Utils.storage.set('trainingWorkouts',response.data)
	                //    }
	                //}).catch((error) => {
	                //    console.info('getDashboardWorkouts:', error)
	                //})
	            } else {
	                this.props.router.replace('/login');
	            }
	        }
	    }, {
	        key: 'getScheduleContent',
	        value: function getScheduleContent() {
	            var schedule = this.state.trainingSchedules;
	            if (!schedule.schedule) return false;

	            var lesson = schedule.schedule;
	            var startDate = (0, _moment2.default)((0, _moment2.default)(lesson.startDate).format('YYYYMMDD')).diff((0, _moment2.default)().format('YYYYMMDD'), 'd');
	            var workouts = lesson.schedule.days;
	            var totalPlansDays = lesson.schedule.totalDaysCount;
	            var successDays = 1 - startDate < totalPlansDays ? 1 - startDate : totalPlansDays;
	            var workTotalTime = [];
	            var dateTips = '';

	            var _iteratorNormalCompletion = true;
	            var _didIteratorError = false;
	            var _iteratorError = undefined;

	            try {
	                for (var _iterator = workouts[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	                    var item = _step.value;

	                    workTotalTime = [].concat(_toConsumableArray(workTotalTime), _toConsumableArray(item.workouts));
	                    //workTotalTime += item.duration
	                }
	            } catch (err) {
	                _didIteratorError = true;
	                _iteratorError = err;
	            } finally {
	                try {
	                    if (!_iteratorNormalCompletion && _iterator.return) {
	                        _iterator.return();
	                    }
	                } finally {
	                    if (_didIteratorError) {
	                        throw _iteratorError;
	                    }
	                }
	            }

	            var planProgress = (lesson.completedWorkouts.length / workTotalTime.length * 100).toFixed(2);

	            switch (true) {
	                case startDate <= -totalPlansDays:
	                    dateTips = '已过期';
	                    break;

	                case startDate == 0:
	                    dateTips = false;
	                    break;

	                case startDate == 1:
	                    dateTips = '课程将于明天开始，准备好了吗？';
	                    break;

	                case startDate > 1:
	                    dateTips = '\u8BFE\u7A0B\u5C06\u4E8E ' + (0, _moment2.default)(lesson.startDate).format('MM') + '/' + (0, _moment2.default)(lesson.startDate).format('DD') + ' \u5F00\u59CB';
	                    break;

	                default:
	                    dateTips = '';
	            }

	            if (!dateTips) {
	                dateTips = '\u7B2C ' + successDays + '/' + totalPlansDays + ' \u5929 ';
	                if (workouts[-startDate].workouts.length) {
	                    dateTips += workouts[-startDate].duration + '\u5206\u949F  ' + workouts[-startDate].workouts.length + '\u4E2A\u8BAD\u7EC3';
	                } else {
	                    dateTips += '\u4F11\u606F\u65E5';
	                }
	            }

	            return _react2.default.createElement(
	                'article',
	                { styleName: 'training-lesson', style: { backgroundImage: 'url(' + lesson.schedule.picture + ')' } },
	                _react2.default.createElement(
	                    'p',
	                    { styleName: 'training-block-title' },
	                    lesson.schedule.name
	                ),
	                _react2.default.createElement(
	                    'p',
	                    { styleName: 'training-block-desc' },
	                    dateTips
	                ),
	                _react2.default.createElement(
	                    'span',
	                    { className: 'text-left', styleName: 'training-block-info' },
	                    _react2.default.createElement(
	                        'span',
	                        { className: 'fz10' },
	                        '\u5B8C\u6210',
	                        planProgress,
	                        '%'
	                    ),
	                    _react2.default.createElement(
	                        'div',
	                        { styleName: 'plan-progress-bar' },
	                        _react2.default.createElement('span', { style: { width: planProgress + '%' }, styleName: 'progress-bar-inner' })
	                    )
	                )
	            );
	        }
	    }, {
	        key: 'getTrainingData',
	        value: function getTrainingData() {
	            var workouts = this.state.trainingWorkouts;

	            if (workouts.plans && workouts.plans.length) return workouts.plans.map(function (item) {
	                return _react2.default.createElement(_TrainingBlock2.default, { key: item.id, data: item });
	            });
	        }
	    }, {
	        key: 'getPhysicalGuide',
	        value: function getPhysicalGuide() {
	            var data = this.state.trainingGuidance;
	            if (!data.physicalGuide) {
	                return false;
	            }

	            return _react2.default.createElement(
	                'section',
	                { hidden: !data.physicalGuide.launch, className: 'margin-bottom white-background' },
	                _react2.default.createElement(
	                    'p',
	                    { styleName: 'guide-tips' },
	                    _react2.default.createElement('i', { style: { marginLeft: '-3px' }, className: 'iconfont icon-symbol fz18' }),
	                    _react2.default.createElement('br', null),
	                    data.physicalGuide.tips
	                ),
	                _react2.default.createElement(
	                    'div',
	                    { className: 'text-center' },
	                    _react2.default.createElement(
	                        _reactRouter.Link,
	                        { styleName: 'button-guide-start' },
	                        '\u8FDB\u884C\u8FD0\u52A8\u80FD\u529B\u6D4B\u8BD5'
	                    )
	                )
	            );
	        }
	    }, {
	        key: 'render',
	        value: function render() {
	            return _react2.default.createElement(
	                'div',
	                { className: 'scroll-content' },
	                _react2.default.createElement(
	                    'section',
	                    { className: 'margin-bottom white-background' },
	                    _react2.default.createElement(
	                        _reactRouter.Link,
	                        { styleName: 'training-data' },
	                        _react2.default.createElement(
	                            'div',
	                            { styleName: 'training-data-title' },
	                            '\u603B\u5171\u8BAD\u7EC3',
	                            _react2.default.createElement('i', { className: 'iconfont icon-more pull-right' })
	                        ),
	                        _react2.default.createElement(
	                            'div',
	                            { className: 'text-center' },
	                            _react2.default.createElement(
	                                'span',
	                                { style: { fontSize: '50px' } },
	                                this.state.trainingData.totalDuration
	                            ),
	                            ' \u5206\u949F'
	                        ),
	                        _react2.default.createElement(
	                            'div',
	                            { styleName: 'training-data-other' },
	                            _react2.default.createElement(
	                                'figure',
	                                { styleName: 'other-item-first' },
	                                '\u5B8C\u6210',
	                                _react2.default.createElement('br', null),
	                                _react2.default.createElement(
	                                    'span',
	                                    { styleName: 'data-val' },
	                                    this.state.trainingData.totalTraining
	                                ),
	                                '\u6B21'
	                            ),
	                            _react2.default.createElement(
	                                'figure',
	                                { styleName: 'other-item-second' },
	                                '\u7D2F\u8BA1',
	                                _react2.default.createElement('br', null),
	                                _react2.default.createElement(
	                                    'span',
	                                    { styleName: 'data-val' },
	                                    this.state.trainingData.totalTrainingDay
	                                ),
	                                '\u5929'
	                            ),
	                            _react2.default.createElement(
	                                'figure',
	                                { styleName: 'other-item-three' },
	                                '\u6D88\u8017',
	                                _react2.default.createElement('br', null),
	                                _react2.default.createElement(
	                                    'span',
	                                    { styleName: 'data-val' },
	                                    this.state.trainingData.totalCalorie
	                                ),
	                                '\u5343\u5361'
	                            )
	                        )
	                    ),
	                    _react2.default.createElement(
	                        _reactRouter.Link,
	                        { styleName: 'training-ranking' },
	                        _react2.default.createElement(
	                            'p',
	                            { styleName: 'training-ranking-title' },
	                            _react2.default.createElement(
	                                'span',
	                                { styleName: 'training-ranking-num' },
	                                this.state.rankingData.me && this.state.rankingData.me.ranking,
	                                ' '
	                            ),
	                            ' ',
	                            this.state.rankingData.paperwork
	                        ),
	                        _react2.default.createElement(
	                            'div',
	                            null,
	                            _react2.default.createElement(
	                                'span',
	                                { hidden: !this.state.rankingData.next, styleName: 'ranking-user' },
	                                _react2.default.createElement('img', { src: this.state.rankingData.next && this.state.rankingData.next.user.avatar, alt: '' })
	                            ),
	                            _react2.default.createElement(
	                                'span',
	                                { styleName: 'ranking-user' },
	                                _react2.default.createElement('img', { src: this.state.rankingData.me && this.state.rankingData.me.user.avatar, alt: '' })
	                            ),
	                            _react2.default.createElement(
	                                'span',
	                                { hidden: !this.state.rankingData.prev, styleName: 'ranking-user' },
	                                _react2.default.createElement('img', { src: this.state.rankingData.prev && this.state.rankingData.prev.user.avatar, alt: '' })
	                            )
	                        )
	                    )
	                ),
	                this.getPhysicalGuide(),
	                _react2.default.createElement(
	                    'section',
	                    { className: 'margin-bottom white-background' },
	                    _react2.default.createElement(
	                        'div',
	                        { className: 'padding' },
	                        '\u6211\u7684\u8BFE\u7A0B\u8868'
	                    ),
	                    this.getScheduleContent()
	                ),
	                _react2.default.createElement(
	                    'section',
	                    { className: 'margin-bottom white-background' },
	                    _react2.default.createElement(
	                        'div',
	                        { className: 'padding' },
	                        '\u6211\u7684\u8BAD\u7EC3'
	                    ),
	                    _react2.default.createElement(
	                        'div',
	                        { styleName: 'training-block-wrap' },
	                        this.getTrainingData()
	                    )
	                ),
	                _react2.default.createElement(_AppScroll2.default, { data: this.state.recommendCourses }),
	                _react2.default.createElement(_AppScroll2.default, { data: this.state.recommendBook })
	            );
	        }
	    }]);

	    return AppTraining;
	}(_react.Component), (_applyDecoratedDescriptor(_class2.prototype, 'componentWillMount', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'componentWillMount'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'getScheduleContent', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'getScheduleContent'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'getTrainingData', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'getTrainingData'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'getPhysicalGuide', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'getPhysicalGuide'), _class2.prototype)), _class2)) || _class);
	var _default = AppTraining;
	exports.default = _default;
	;

	var _temp = function () {
	    if (typeof __REACT_HOT_LOADER__ === 'undefined') {
	        return;
	    }

	    __REACT_HOT_LOADER__.register(AppTraining, 'AppTraining', '/Users/liucong/Documents/Github/keepForMac/src/components/AppTraining/AppTraining.js');

	    __REACT_HOT_LOADER__.register(_default, 'default', '/Users/liucong/Documents/Github/keepForMac/src/components/AppTraining/AppTraining.js');
	}();

	;

	 ;(function register() { /* react-hot-loader/webpack */ if ((undefined) !== 'production') { if (typeof __REACT_HOT_LOADER__ === 'undefined') { return; } if (typeof module.exports === 'function') { __REACT_HOT_LOADER__.register(module.exports, 'module.exports', "/Users/liucong/Documents/Github/keepForMac/src/components/AppTraining/AppTraining.js"); return; } for (var key in module.exports) { if (!Object.prototype.hasOwnProperty.call(module.exports, key)) { continue; } var namedExport = void 0; try { namedExport = module.exports[key]; } catch (err) { continue; } __REACT_HOT_LOADER__.register(namedExport, key, "/Users/liucong/Documents/Github/keepForMac/src/components/AppTraining/AppTraining.js"); } } })();

/***/ },

/***/ 641:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _dec, _class, _desc, _value, _class2;

	var _react = __webpack_require__(122);

	var _react2 = _interopRequireDefault(_react);

	var _autobindDecorator = __webpack_require__(513);

	var _autobindDecorator2 = _interopRequireDefault(_autobindDecorator);

	var _reactCssModules = __webpack_require__(354);

	var _reactCssModules2 = _interopRequireDefault(_reactCssModules);

	var _moment = __webpack_require__(524);

	var _moment2 = _interopRequireDefault(_moment);

	var _reactRouter = __webpack_require__(298);

	var _appTraining = __webpack_require__(642);

	var _appTraining2 = _interopRequireDefault(_appTraining);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
	    var desc = {};
	    Object['ke' + 'ys'](descriptor).forEach(function (key) {
	        desc[key] = descriptor[key];
	    });
	    desc.enumerable = !!desc.enumerable;
	    desc.configurable = !!desc.configurable;

	    if ('value' in desc || desc.initializer) {
	        desc.writable = true;
	    }

	    desc = decorators.slice().reverse().reduce(function (desc, decorator) {
	        return decorator(target, property, desc) || desc;
	    }, desc);

	    if (context && desc.initializer !== void 0) {
	        desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
	        desc.initializer = undefined;
	    }

	    if (desc.initializer === void 0) {
	        Object['define' + 'Property'](target, property, desc);
	        desc = null;
	    }

	    return desc;
	}

	var TrainingBlock = (_dec = (0, _reactCssModules2.default)(_appTraining2.default), _dec(_class = (_class2 = function (_Component) {
	    _inherits(TrainingBlock, _Component);

	    function TrainingBlock(props) {
	        _classCallCheck(this, TrainingBlock);

	        return _possibleConstructorReturn(this, (TrainingBlock.__proto__ || Object.getPrototypeOf(TrainingBlock)).call(this, props));
	    }

	    _createClass(TrainingBlock, [{
	        key: 'getLastTrainingDate',
	        value: function getLastTrainingDate(datetime) {
	            if (datetime) {
	                var days = (0, _moment2.default)().diff((0, _moment2.default)(datetime), 'd');
	                var hours = (0, _moment2.default)().diff((0, _moment2.default)(datetime), 'h');
	                if (days > 100) return '';

	                if (days >= 1) return '上次训练 ' + days + ' 天前';

	                if (hours >= 1) return hours + ' 小时前训练过';

	                return '刚刚训练过';
	            } else {
	                return '';
	            }
	        }
	    }, {
	        key: 'render',
	        value: function render() {
	            var workout = this.props.data;
	            return _react2.default.createElement(
	                _reactRouter.Link,
	                { to: '/plan/' + workout.id, styleName: 'training-block', style: { backgroundImage: 'url(' + workout.picture + ')' } },
	                _react2.default.createElement(
	                    'p',
	                    { styleName: 'training-block-title' },
	                    workout.name
	                ),
	                _react2.default.createElement(
	                    'p',
	                    { styleName: 'training-block-desc' },
	                    this.getLastTrainingDate(workout.lastTrainingDate)
	                ),
	                _react2.default.createElement(
	                    'span',
	                    { styleName: 'training-block-info' },
	                    _react2.default.createElement(
	                        'span',
	                        { styleName: 'block-info-time' },
	                        workout.averageDuration,
	                        '\u5206\u949F'
	                    ),
	                    _react2.default.createElement(
	                        'span',
	                        { styleName: 'block-info-time' },
	                        '\u5B8C\u6210',
	                        workout.curWorkoutFinishTimes,
	                        '\u6B21'
	                    )
	                )
	            );
	        }
	    }]);

	    return TrainingBlock;
	}(_react.Component), (_applyDecoratedDescriptor(_class2.prototype, 'getLastTrainingDate', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'getLastTrainingDate'), _class2.prototype)), _class2)) || _class);
	var _default = TrainingBlock;
	exports.default = _default;
	;

	var _temp = function () {
	    if (typeof __REACT_HOT_LOADER__ === 'undefined') {
	        return;
	    }

	    __REACT_HOT_LOADER__.register(TrainingBlock, 'TrainingBlock', '/Users/liucong/Documents/Github/keepForMac/src/components/AppTraining/TrainingBlock.js');

	    __REACT_HOT_LOADER__.register(_default, 'default', '/Users/liucong/Documents/Github/keepForMac/src/components/AppTraining/TrainingBlock.js');
	}();

	;

	 ;(function register() { /* react-hot-loader/webpack */ if ((undefined) !== 'production') { if (typeof __REACT_HOT_LOADER__ === 'undefined') { return; } if (typeof module.exports === 'function') { __REACT_HOT_LOADER__.register(module.exports, 'module.exports', "/Users/liucong/Documents/Github/keepForMac/src/components/AppTraining/TrainingBlock.js"); return; } for (var key in module.exports) { if (!Object.prototype.hasOwnProperty.call(module.exports, key)) { continue; } var namedExport = void 0; try { namedExport = module.exports[key]; } catch (err) { continue; } __REACT_HOT_LOADER__.register(namedExport, key, "/Users/liucong/Documents/Github/keepForMac/src/components/AppTraining/TrainingBlock.js"); } } })();

/***/ },

/***/ 642:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(643);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(121)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(true) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept(643, function() {
				var newContent = __webpack_require__(643);
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 643:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(116)();
	// imports


	// module
	exports.push([module.id, "._2Nv_2 {\n  display: block;\n  width: 100%; }\n\n.akWWR {\n  padding: 5px 10px;\n  overflow: hidden; }\n\n._2CkpE {\n  display: flex;\n  padding: 5px 10px 15px;\n  border-bottom: 1px solid #eee;\n  font-size: 10px;\n  position: relative; }\n  ._2CkpE figure {\n    flex: 1;\n    color: #999; }\n    ._2CkpE figure ._1nZ5H {\n      font-size: 16px;\n      color: #584f5f; }\n  ._2CkpE:before {\n    content: '';\n    position: absolute;\n    left: 50%;\n    bottom: 0;\n    z-index: 1;\n    transform: translateX(-50%);\n    width: 0;\n    border: 6px solid transparent;\n    border-bottom-color: #eee; }\n  ._2CkpE:after {\n    content: '';\n    position: absolute;\n    left: 50%;\n    bottom: -1.5px;\n    z-index: 2;\n    transform: translateX(-50%);\n    width: 0;\n    border: 6px solid transparent;\n    border-bottom-color: #fff; }\n\n._2xGm9 {\n  text-align: left; }\n\n._1AekU {\n  text-align: center; }\n\n._2zrRj {\n  text-align: right; }\n\n._1SGGr {\n  display: flex;\n  padding: 10px;\n  overflow: hidden; }\n\n._2Awuf {\n  flex: 1;\n  margin: 0;\n  align-self: center; }\n\n._2vjI7 {\n  font-size: 18px;\n  color: #00c78c;\n  font-weight: bold; }\n\n._22cXH {\n  margin-top: 1px;\n  border: .5px solid #fff;\n  float: right;\n  width: 30px;\n  height: 30px;\n  border-radius: 50%;\n  position: relative;\n  margin-left: -10px;\n  text-align: center;\n  box-sizing: content-box; }\n  ._22cXH:nth-child(2) {\n    margin-top: 0;\n    border: 2px solid #00c78c; }\n  ._22cXH img {\n    border-radius: 50%;\n    width: 100%; }\n\n._3ydNS,\n._2iAnH {\n  display: block;\n  padding: 10px;\n  height: 200px;\n  background-color: #999;\n  position: relative; }\n  ._3ydNS:before,\n  ._2iAnH:before {\n    content: '';\n    position: absolute;\n    top: 0;\n    left: 0;\n    width: 100%;\n    height: 100%;\n    background: rgba(0, 0, 0, 0.42); }\n  ._3ydNS p,\n  ._2iAnH p {\n    position: relative;\n    z-index: auto; }\n\n._3ydNS {\n  background-size: cover;\n  background-repeat: no-repeat;\n  background-position: center; }\n  ._3ydNS:before {\n    content: '';\n    background: rgba(0, 0, 0, 0.22); }\n  ._3ydNS:hover ._2wTwu {\n    transition: background .35s;\n    background: #fff; }\n  ._3ydNS:hover ._2LjaT {\n    background: #00c78c; }\n\n.dGXEk {\n  overflow: hidden;\n  padding: 5px;\n  border-top: 1px solid #eee; }\n\n._2iAnH {\n  width: 31%;\n  height: 22vh;\n  float: left;\n  background: #999 no-repeat center/100% auto;\n  margin: 1.16%;\n  position: relative;\n  transition: box-shadow .35s .1s, transform .35s .1s; }\n  ._2iAnH:hover {\n    box-shadow: 0 0 10px rgba(0, 0, 0, 0.8);\n    transform: scale(1.01); }\n\n.ED31q {\n  color: #fff;\n  font-size: 18px; }\n\n._25ujx {\n  color: #ddd;\n  font-size: 12px; }\n\n._3z7y5 {\n  color: #fff;\n  position: absolute;\n  left: 0;\n  bottom: 0;\n  padding: 10px;\n  width: 100%;\n  text-align: right; }\n\n._3Ditf {\n  font-size: 10px;\n  margin-left: 5px; }\n\n._2wTwu {\n  width: 100%;\n  height: 8px;\n  background: rgba(255, 255, 255, 0.5); }\n\n._2LjaT {\n  display: block;\n  height: 100%;\n  max-width: 10%;\n  background: #fff;\n  transition: background .5s .2s; }\n\n.UhFWg {\n  padding: 20px; }\n\n._1qDeN {\n  display: inline-block;\n  padding: 5px 10px;\n  border-radius: 30px;\n  color: #00c78c;\n  border: 1px solid #00c78c;\n  opacity: .6;\n  margin-bottom: 20px; }\n\n._32EG3 {\n  padding: 0 10px 10px; }\n\n._2kVBi {\n  padding-top: 10px; }\n\n._1GnNk {\n  margin: 0;\n  padding: 0;\n  overflow-x: scroll;\n  overflow-y: hidden;\n  white-space: nowrap; }\n  ._1GnNk li {\n    position: relative;\n    overflow: hidden;\n    display: inline-block;\n    margin-right: 10px;\n    width: 40%;\n    min-height: 180px;\n    background: no-repeat center/cover; }\n    ._1GnNk li:last-child {\n      margin: 0; }\n\n.XXgaN {\n  padding-bottom: 55%;\n  background: #999 no-repeat center/cover; }\n\n._25FwQ,\n._2Lzjf {\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis; }\n\n._25FwQ {\n  font-size: 14px; }\n\n._2Lzjf {\n  font-size: 10px;\n  margin: 0;\n  color: #999; }\n", ""]);

	// exports
	exports.locals = {
		"training-data": "_2Nv_2",
		"training-data-title": "akWWR",
		"training-data-other": "_2CkpE",
		"data-val": "_1nZ5H",
		"other-item-first": "_2xGm9",
		"other-item-second": "_1AekU",
		"other-item-three": "_2zrRj",
		"training-ranking": "_1SGGr",
		"training-ranking-title": "_2Awuf",
		"training-ranking-num": "_2vjI7",
		"ranking-user": "_22cXH",
		"training-lesson": "_3ydNS",
		"training-block": "_2iAnH",
		"plan-progress-bar": "_2wTwu",
		"progress-bar-inner": "_2LjaT",
		"training-block-wrap": "dGXEk",
		"training-block-title": "ED31q",
		"training-block-desc": "_25ujx",
		"training-block-info": "_3z7y5",
		"block-info-time": "_3Ditf",
		"guide-tips": "UhFWg",
		"button-guide-start": "_1qDeN",
		"scroll-wrap": "_32EG3",
		"scroll-title": "_2kVBi",
		"scroll-list": "_1GnNk",
		"scroll-cover": "XXgaN",
		"scroll-hot-title": "_25FwQ",
		"scroll-hot-desc": "_2Lzjf"
	};

/***/ },

/***/ 644:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _dec, _class;

	var _react = __webpack_require__(122);

	var _react2 = _interopRequireDefault(_react);

	var _reactCssModules = __webpack_require__(354);

	var _reactCssModules2 = _interopRequireDefault(_reactCssModules);

	var _appTraining = __webpack_require__(642);

	var _appTraining2 = _interopRequireDefault(_appTraining);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var AppScroll = (_dec = (0, _reactCssModules2.default)(_appTraining2.default), _dec(_class = function (_Component) {
	    _inherits(AppScroll, _Component);

	    function AppScroll(props) {
	        _classCallCheck(this, AppScroll);

	        return _possibleConstructorReturn(this, (AppScroll.__proto__ || Object.getPrototypeOf(AppScroll)).call(this, props));
	    }

	    _createClass(AppScroll, [{
	        key: 'getItem',
	        value: function getItem(type) {
	            var data = [];
	            if (type === 'article') {
	                this.props.data.data.forEach(function (item) {
	                    data.push(_react2.default.createElement(
	                        'li',
	                        { key: item.id },
	                        _react2.default.createElement('div', { styleName: 'scroll-cover', style: { backgroundImage: 'url(' + item.picture + ')' } }),
	                        _react2.default.createElement(
	                            'div',
	                            { className: 'text-center padding' },
	                            _react2.default.createElement(
	                                'p',
	                                { styleName: 'scroll-hot-title' },
	                                item.title
	                            ),
	                            _react2.default.createElement(
	                                'p',
	                                { styleName: 'scroll-hot-desc' },
	                                item.description
	                            )
	                        )
	                    ));
	                });
	            } else {
	                this.props.data.data.forEach(function (item) {
	                    data.push(_react2.default.createElement(
	                        'li',
	                        { key: item.id, className: 'padding', style: { backgroundImage: 'url(' + item.picture + ')' } },
	                        _react2.default.createElement(
	                            'p',
	                            { styleName: 'training-block-title' },
	                            item.title
	                        ),
	                        _react2.default.createElement(
	                            'p',
	                            { styleName: 'training-block-desc' },
	                            item.pioneer,
	                            '\u5DF2\u53C2\u52A0'
	                        ),
	                        _react2.default.createElement(
	                            'span',
	                            { className: 'text-left', styleName: 'training-block-info' },
	                            _react2.default.createElement(
	                                'span',
	                                { className: 'fz18 font-bold' },
	                                'K',
	                                item.rating
	                            ),
	                            _react2.default.createElement(
	                                'span',
	                                { styleName: 'block-info-time' },
	                                item.itemValue,
	                                '\u5206\u949F'
	                            )
	                        )
	                    ));
	                });
	            }

	            return data;
	        }
	    }, {
	        key: 'render',
	        value: function render() {
	            if (!this.props.data.data) {
	                return false;
	            }

	            return _react2.default.createElement(
	                'section',
	                { className: 'white-background margin-bottom', styleName: 'scroll-wrap' },
	                _react2.default.createElement(
	                    'p',
	                    { styleName: 'scroll-title' },
	                    this.props.data.sectionName
	                ),
	                _react2.default.createElement(
	                    'ul',
	                    { styleName: 'scroll-list' },
	                    this.getItem(this.props.data.type)
	                )
	            );
	        }
	    }]);

	    return AppScroll;
	}(_react.Component)) || _class);
	var _default = AppScroll;
	exports.default = _default;
	;

	var _temp = function () {
	    if (typeof __REACT_HOT_LOADER__ === 'undefined') {
	        return;
	    }

	    __REACT_HOT_LOADER__.register(AppScroll, 'AppScroll', '/Users/liucong/Documents/Github/keepForMac/src/components/AppTraining/AppScroll.js');

	    __REACT_HOT_LOADER__.register(_default, 'default', '/Users/liucong/Documents/Github/keepForMac/src/components/AppTraining/AppScroll.js');
	}();

	;

	 ;(function register() { /* react-hot-loader/webpack */ if ((undefined) !== 'production') { if (typeof __REACT_HOT_LOADER__ === 'undefined') { return; } if (typeof module.exports === 'function') { __REACT_HOT_LOADER__.register(module.exports, 'module.exports', "/Users/liucong/Documents/Github/keepForMac/src/components/AppTraining/AppScroll.js"); return; } for (var key in module.exports) { if (!Object.prototype.hasOwnProperty.call(module.exports, key)) { continue; } var namedExport = void 0; try { namedExport = module.exports[key]; } catch (err) { continue; } __REACT_HOT_LOADER__.register(namedExport, key, "/Users/liucong/Documents/Github/keepForMac/src/components/AppTraining/AppScroll.js"); } } })();

/***/ },

/***/ 645:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _dec, _class, _desc, _value, _class2;

	var _react = __webpack_require__(122);

	var _react2 = _interopRequireDefault(_react);

	var _reactCssModules = __webpack_require__(354);

	var _reactCssModules2 = _interopRequireDefault(_reactCssModules);

	var _autobindDecorator = __webpack_require__(513);

	var _autobindDecorator2 = _interopRequireDefault(_autobindDecorator);

	var _AppMenu = __webpack_require__(646);

	var _AppMenu2 = _interopRequireDefault(_AppMenu);

	var _appExplore = __webpack_require__(647);

	var _appExplore2 = _interopRequireDefault(_appExplore);

	var _HttpRequest = __webpack_require__(523);

	var _HttpRequest2 = _interopRequireDefault(_HttpRequest);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
	    var desc = {};
	    Object['ke' + 'ys'](descriptor).forEach(function (key) {
	        desc[key] = descriptor[key];
	    });
	    desc.enumerable = !!desc.enumerable;
	    desc.configurable = !!desc.configurable;

	    if ('value' in desc || desc.initializer) {
	        desc.writable = true;
	    }

	    desc = decorators.slice().reverse().reduce(function (desc, decorator) {
	        return decorator(target, property, desc) || desc;
	    }, desc);

	    if (context && desc.initializer !== void 0) {
	        desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
	        desc.initializer = undefined;
	    }

	    if (desc.initializer === void 0) {
	        Object['define' + 'Property'](target, property, desc);
	        desc = null;
	    }

	    return desc;
	}

	var AppExplore = (_dec = (0, _reactCssModules2.default)(_appExplore2.default), _dec(_class = (_class2 = function (_Component) {
	    _inherits(AppExplore, _Component);

	    function AppExplore(props) {
	        _classCallCheck(this, AppExplore);

	        var _this = _possibleConstructorReturn(this, (AppExplore.__proto__ || Object.getPrototypeOf(AppExplore)).call(this, props));

	        _this.state = {
	            exploreContent: ''
	        };
	        return _this;
	    }

	    //@autobind
	    //componentWillMount(){
	    //    $http.getExploreContent().then((res) => {
	    //        if(res.status == 200)
	    //            return res.text()
	    //        else
	    //            return false
	    //    }).then((res) => {
	    //        if(res)
	    //            this.setState({exploreContent: res})
	    //    }).catch((error) => {
	    //        console.info(error)
	    //    })
	    //}

	    _createClass(AppExplore, [{
	        key: 'getExploreHtml',
	        value: function getExploreHtml() {
	            return _react2.default.createElement('webview', { styleName: 'explore-frame', src: 'http://show.gotokeep.com/explore/' });
	        }
	    }, {
	        key: 'render',
	        value: function render() {
	            return _react2.default.createElement(
	                'div',
	                { style: { height: "100%" } },
	                this.getExploreHtml()
	            );
	        }
	    }]);

	    return AppExplore;
	}(_react.Component), (_applyDecoratedDescriptor(_class2.prototype, 'getExploreHtml', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'getExploreHtml'), _class2.prototype)), _class2)) || _class);
	var _default = AppExplore;
	exports.default = _default;
	;

	var _temp = function () {
	    if (typeof __REACT_HOT_LOADER__ === 'undefined') {
	        return;
	    }

	    __REACT_HOT_LOADER__.register(AppExplore, 'AppExplore', '/Users/liucong/Documents/Github/keepForMac/src/components/AppExplore/AppExplore.js');

	    __REACT_HOT_LOADER__.register(_default, 'default', '/Users/liucong/Documents/Github/keepForMac/src/components/AppExplore/AppExplore.js');
	}();

	;

	 ;(function register() { /* react-hot-loader/webpack */ if ((undefined) !== 'production') { if (typeof __REACT_HOT_LOADER__ === 'undefined') { return; } if (typeof module.exports === 'function') { __REACT_HOT_LOADER__.register(module.exports, 'module.exports', "/Users/liucong/Documents/Github/keepForMac/src/components/AppExplore/AppExplore.js"); return; } for (var key in module.exports) { if (!Object.prototype.hasOwnProperty.call(module.exports, key)) { continue; } var namedExport = void 0; try { namedExport = module.exports[key]; } catch (err) { continue; } __REACT_HOT_LOADER__.register(namedExport, key, "/Users/liucong/Documents/Github/keepForMac/src/components/AppExplore/AppExplore.js"); } } })();

/***/ },

/***/ 646:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _dec, _class, _desc, _value, _class2;

	var _react = __webpack_require__(122);

	var _react2 = _interopRequireDefault(_react);

	var _reactCssModules = __webpack_require__(354);

	var _reactCssModules2 = _interopRequireDefault(_reactCssModules);

	var _autobindDecorator = __webpack_require__(513);

	var _autobindDecorator2 = _interopRequireDefault(_autobindDecorator);

	var _reactRouter = __webpack_require__(298);

	var _index = __webpack_require__(514);

	var _index2 = _interopRequireDefault(_index);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
	    var desc = {};
	    Object['ke' + 'ys'](descriptor).forEach(function (key) {
	        desc[key] = descriptor[key];
	    });
	    desc.enumerable = !!desc.enumerable;
	    desc.configurable = !!desc.configurable;

	    if ('value' in desc || desc.initializer) {
	        desc.writable = true;
	    }

	    desc = decorators.slice().reverse().reduce(function (desc, decorator) {
	        return decorator(target, property, desc) || desc;
	    }, desc);

	    if (context && desc.initializer !== void 0) {
	        desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
	        desc.initializer = undefined;
	    }

	    if (desc.initializer === void 0) {
	        Object['define' + 'Property'](target, property, desc);
	        desc = null;
	    }

	    return desc;
	}

	var AppMenu = (_dec = (0, _reactCssModules2.default)(_index2.default), _dec(_class = (_class2 = function (_Component) {
	    _inherits(AppMenu, _Component);

	    function AppMenu(props) {
	        _classCallCheck(this, AppMenu);

	        return _possibleConstructorReturn(this, (AppMenu.__proto__ || Object.getPrototypeOf(AppMenu)).call(this, props));
	    }

	    _createClass(AppMenu, [{
	        key: 'handleClick',
	        value: function handleClick() {
	            alert('此模块功能暂未完成，敬请期待！');
	        }
	    }, {
	        key: 'render',
	        value: function render() {
	            return _react2.default.createElement(
	                'nav',
	                { styleName: 'index-left-menu' },
	                _react2.default.createElement(
	                    'li',
	                    null,
	                    _react2.default.createElement(
	                        _reactRouter.Link,
	                        { to: '/training', activeClassName: 'active' },
	                        _react2.default.createElement('i', { className: 'iconfont icon-training fz22' }),
	                        '\u8BAD\u7EC3'
	                    )
	                ),
	                _react2.default.createElement(
	                    'li',
	                    null,
	                    _react2.default.createElement(
	                        _reactRouter.Link,
	                        { to: '/explore', activeClassName: 'active' },
	                        _react2.default.createElement('i', { className: 'iconfont icon-discovery fz22' }),
	                        '\u53D1\u73B0'
	                    )
	                ),
	                _react2.default.createElement(
	                    'li',
	                    { onClick: 'handleClick()' },
	                    _react2.default.createElement(
	                        _reactRouter.Link,
	                        { activeClassName: 'active' },
	                        _react2.default.createElement('i', { className: 'iconfont icon-record fz22' }),
	                        '\u52A8\u6001'
	                    )
	                ),
	                _react2.default.createElement(
	                    'li',
	                    { onClick: 'handleClick()' },
	                    _react2.default.createElement(
	                        _reactRouter.Link,
	                        { activeClassName: 'active' },
	                        _react2.default.createElement('i', { className: 'iconfont icon-usercenter fz22' }),
	                        '\u6211'
	                    )
	                )
	            );
	        }
	    }]);

	    return AppMenu;
	}(_react.Component), (_applyDecoratedDescriptor(_class2.prototype, 'handleClick', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'handleClick'), _class2.prototype)), _class2)) || _class);
	var _default = AppMenu;
	exports.default = _default;
	;

	var _temp = function () {
	    if (typeof __REACT_HOT_LOADER__ === 'undefined') {
	        return;
	    }

	    __REACT_HOT_LOADER__.register(AppMenu, 'AppMenu', '/Users/liucong/Documents/Github/keepForMac/src/components/AppMenu.js');

	    __REACT_HOT_LOADER__.register(_default, 'default', '/Users/liucong/Documents/Github/keepForMac/src/components/AppMenu.js');
	}();

	;

	 ;(function register() { /* react-hot-loader/webpack */ if ((undefined) !== 'production') { if (typeof __REACT_HOT_LOADER__ === 'undefined') { return; } if (typeof module.exports === 'function') { __REACT_HOT_LOADER__.register(module.exports, 'module.exports', "/Users/liucong/Documents/Github/keepForMac/src/components/AppMenu.js"); return; } for (var key in module.exports) { if (!Object.prototype.hasOwnProperty.call(module.exports, key)) { continue; } var namedExport = void 0; try { namedExport = module.exports[key]; } catch (err) { continue; } __REACT_HOT_LOADER__.register(namedExport, key, "/Users/liucong/Documents/Github/keepForMac/src/components/AppMenu.js"); } } })();

/***/ },

/***/ 647:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(648);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(121)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(true) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept(648, function() {
				var newContent = __webpack_require__(648);
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 648:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(116)();
	// imports


	// module
	exports.push([module.id, "._2UPdY {\n  width: 100%;\n  height: 100%;\n  border: none; }\n", ""]);

	// exports
	exports.locals = {
		"explore-frame": "_2UPdY"
	};

/***/ },

/***/ 649:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(122);

	var _react2 = _interopRequireDefault(_react);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var AppRecord = function (_Component) {
	    _inherits(AppRecord, _Component);

	    function AppRecord(props) {
	        _classCallCheck(this, AppRecord);

	        return _possibleConstructorReturn(this, (AppRecord.__proto__ || Object.getPrototypeOf(AppRecord)).call(this, props));
	    }

	    _createClass(AppRecord, [{
	        key: 'render',
	        value: function render() {
	            return _react2.default.createElement(
	                'div',
	                { style: { width: '100%' } },
	                _react2.default.createElement(AppMenu, null),
	                _react2.default.createElement(
	                    'div',
	                    { styleName: 'index-content' },
	                    _react2.default.createElement(
	                        'div',
	                        null,
	                        'AppRecord'
	                    )
	                )
	            );
	        }
	    }]);

	    return AppRecord;
	}(_react.Component);

	var _default = AppRecord;
	exports.default = _default;
	;

	var _temp = function () {
	    if (typeof __REACT_HOT_LOADER__ === 'undefined') {
	        return;
	    }

	    __REACT_HOT_LOADER__.register(AppRecord, 'AppRecord', '/Users/liucong/Documents/Github/keepForMac/src/components/AppRecord/AppRecord.js');

	    __REACT_HOT_LOADER__.register(_default, 'default', '/Users/liucong/Documents/Github/keepForMac/src/components/AppRecord/AppRecord.js');
	}();

	;

	 ;(function register() { /* react-hot-loader/webpack */ if ((undefined) !== 'production') { if (typeof __REACT_HOT_LOADER__ === 'undefined') { return; } if (typeof module.exports === 'function') { __REACT_HOT_LOADER__.register(module.exports, 'module.exports', "/Users/liucong/Documents/Github/keepForMac/src/components/AppRecord/AppRecord.js"); return; } for (var key in module.exports) { if (!Object.prototype.hasOwnProperty.call(module.exports, key)) { continue; } var namedExport = void 0; try { namedExport = module.exports[key]; } catch (err) { continue; } __REACT_HOT_LOADER__.register(namedExport, key, "/Users/liucong/Documents/Github/keepForMac/src/components/AppRecord/AppRecord.js"); } } })();

/***/ },

/***/ 650:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(122);

	var _react2 = _interopRequireDefault(_react);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var AppUserCenter = function (_Component) {
	    _inherits(AppUserCenter, _Component);

	    function AppUserCenter(props) {
	        _classCallCheck(this, AppUserCenter);

	        return _possibleConstructorReturn(this, (AppUserCenter.__proto__ || Object.getPrototypeOf(AppUserCenter)).call(this, props));
	    }

	    _createClass(AppUserCenter, [{
	        key: 'render',
	        value: function render() {
	            return _react2.default.createElement(
	                'div',
	                { style: { width: '100%' } },
	                _react2.default.createElement(AppMenu, null),
	                _react2.default.createElement(
	                    'div',
	                    { className: 'index-content' },
	                    _react2.default.createElement(
	                        'div',
	                        null,
	                        'AppUserCenter'
	                    )
	                )
	            );
	        }
	    }]);

	    return AppUserCenter;
	}(_react.Component);

	var _default = AppUserCenter;
	exports.default = _default;
	;

	var _temp = function () {
	    if (typeof __REACT_HOT_LOADER__ === 'undefined') {
	        return;
	    }

	    __REACT_HOT_LOADER__.register(AppUserCenter, 'AppUserCenter', '/Users/liucong/Documents/Github/keepForMac/src/components/AppUserCenter/AppUserCenter.js');

	    __REACT_HOT_LOADER__.register(_default, 'default', '/Users/liucong/Documents/Github/keepForMac/src/components/AppUserCenter/AppUserCenter.js');
	}();

	;

	 ;(function register() { /* react-hot-loader/webpack */ if ((undefined) !== 'production') { if (typeof __REACT_HOT_LOADER__ === 'undefined') { return; } if (typeof module.exports === 'function') { __REACT_HOT_LOADER__.register(module.exports, 'module.exports', "/Users/liucong/Documents/Github/keepForMac/src/components/AppUserCenter/AppUserCenter.js"); return; } for (var key in module.exports) { if (!Object.prototype.hasOwnProperty.call(module.exports, key)) { continue; } var namedExport = void 0; try { namedExport = module.exports[key]; } catch (err) { continue; } __REACT_HOT_LOADER__.register(namedExport, key, "/Users/liucong/Documents/Github/keepForMac/src/components/AppUserCenter/AppUserCenter.js"); } } })();

/***/ },

/***/ 651:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _dec, _class, _desc, _value, _class2;

	var _react = __webpack_require__(122);

	var _react2 = _interopRequireDefault(_react);

	var _reactRouter = __webpack_require__(298);

	var _reactCssModules = __webpack_require__(354);

	var _reactCssModules2 = _interopRequireDefault(_reactCssModules);

	var _autobindDecorator = __webpack_require__(513);

	var _autobindDecorator2 = _interopRequireDefault(_autobindDecorator);

	var _moment = __webpack_require__(524);

	var _moment2 = _interopRequireDefault(_moment);

	var _Utils = __webpack_require__(521);

	var _Utils2 = _interopRequireDefault(_Utils);

	var _HttpRequest = __webpack_require__(523);

	var _HttpRequest2 = _interopRequireDefault(_HttpRequest);

	var _UserWindow = __webpack_require__(520);

	var _UserWindow2 = _interopRequireDefault(_UserWindow);

	var _appWorkouts = __webpack_require__(652);

	var _appWorkouts2 = _interopRequireDefault(_appWorkouts);

	var _electron = __webpack_require__(522);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
	    var desc = {};
	    Object['ke' + 'ys'](descriptor).forEach(function (key) {
	        desc[key] = descriptor[key];
	    });
	    desc.enumerable = !!desc.enumerable;
	    desc.configurable = !!desc.configurable;

	    if ('value' in desc || desc.initializer) {
	        desc.writable = true;
	    }

	    desc = decorators.slice().reverse().reduce(function (desc, decorator) {
	        return decorator(target, property, desc) || desc;
	    }, desc);

	    if (context && desc.initializer !== void 0) {
	        desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
	        desc.initializer = undefined;
	    }

	    if (desc.initializer === void 0) {
	        Object['define' + 'Property'](target, property, desc);
	        desc = null;
	    }

	    return desc;
	}

	var AppWorkout = (_dec = (0, _reactCssModules2.default)(_appWorkouts2.default, { allowMultiple: true }), _dec(_class = (_class2 = function (_Component) {
	    _inherits(AppWorkout, _Component);

	    function AppWorkout(props) {
	        _classCallCheck(this, AppWorkout);

	        var _this = _possibleConstructorReturn(this, (AppWorkout.__proto__ || Object.getPrototypeOf(AppWorkout)).call(this, props));

	        var workouts = _Utils2.default.storage.get('workouts') || [];

	        _this.state = {
	            user: _Utils2.default.storage.get('userData') || {},
	            workouts: !workouts.length ? workouts : [],
	            workout: !workouts.length ? {} : new Map(workouts).has(_this.props.params.plan_id) ? new Map(workouts).get(_this.props.params.plan_id) : {},
	            content: {},
	            recommends: [],
	            classBlur: 'workout-mask' // 显示弹出层时内容层 *blurry*
	        };
	        return _this;
	    }

	    _createClass(AppWorkout, [{
	        key: 'componentWillMount',
	        value: function componentWillMount() {
	            var _this2 = this;

	            console.info(this.state.workout);
	            if (!this.state.workout._id) {
	                // 获取锻炼项目详情
	                _HttpRequest2.default.getPlansContent(this.props.params.plan_id, this.state.user.gender).then(function (response) {
	                    if (response.ok) {
	                        _Utils2.default.storage.set('workouts', [].concat(_toConsumableArray(new Set(_this2.state.workouts).add([_this2.props.params.plan_id, response.data]))));

	                        _this2.setState({
	                            workout: response.data
	                        });
	                    }
	                });
	            }

	            // 获取训练计划[以及同类推荐]
	            _HttpRequest2.default.getWorkoutsPlans(this.props.params.plan_id).then(function (response) {
	                if (response.ok) {
	                    console.table(response.data);
	                    _this2.setState({
	                        recommends: response.data.recommends
	                    });
	                    return response.data.workoutId;
	                }
	            }).then(function (workoutId) {
	                // 获取 总打卡数量/训练评论/完成用户/座右铭
	                _HttpRequest2.default.getWorkoutsWorks(workoutId).then(function (response) {
	                    if (response.ok) {
	                        _Utils2.default.storage.set('timeoutTip', response.data.motto);
	                        _this2.setState({
	                            content: response.data
	                        });
	                    }
	                });
	            });
	        }

	        // 查看用户个人信息

	    }, {
	        key: 'handleUserInfo',
	        value: function handleUserInfo(userId) {
	            _HttpRequest2.default.getUserData(userId).then(function (response) {
	                if (response.ok) {
	                    _Utils2.default.storage.set('userInfo', response.data);
	                    if (_UserWindow2.default.has()) _UserWindow2.default.show('keeper - ' + response.data.user.username);else _UserWindow2.default.create('keeper - ' + response.data.user.username);
	                }
	            });
	        }
	    }, {
	        key: 'getPioneerContent',
	        value: function getPioneerContent() {
	            var _this3 = this;

	            var list = this.state.content.pioneer;
	            console.info(this.state.content);
	            // const userImg = require('url-loader?mimetype=image/png!../../../assets/images/keep-small.jpg')
	            if (list && list.length > 0) return list.map(function (item, index) {
	                return _react2.default.createElement(
	                    'li',
	                    { key: item._id + index },
	                    _react2.default.createElement(
	                        _reactRouter.Link,
	                        { styleName: 'pioneer-item', onClick: function onClick() {
	                                return _this3.handleUserInfo(item._id);
	                            } },
	                        _react2.default.createElement('img', { src: item.avatar, alt: '' })
	                    )
	                );
	            });
	        }
	    }, {
	        key: 'getWorkoutDynamic',
	        value: function getWorkoutDynamic() {
	            var list = this.state.content.timeline;
	            if (!list) return false;

	            return list.map(function (item) {
	                var completeTime = (0, _moment2.default)(new Date()).diff((0, _moment2.default)(item.created), 'h') < 24 ? (0, _moment2.default)(item.created).format('h') + ' 小时前完成训练' : (0, _moment2.default)(new Date(item.created)).format('YYYY/MM/DD hh:ss') + '完成训练';

	                return _react2.default.createElement(
	                    'div',
	                    { styleName: 'dynamic-item', key: item._id },
	                    _react2.default.createElement('div', { styleName: 'item-photo', style: { backgroundImage: 'url(' + item.photo + ')' } }),
	                    _react2.default.createElement(
	                        'div',
	                        { styleName: 'dynamic-content' },
	                        _react2.default.createElement(
	                            'div',
	                            { styleName: 'dynamic-desc' },
	                            _react2.default.createElement(
	                                'p',
	                                null,
	                                item.content
	                            )
	                        ),
	                        _react2.default.createElement(
	                            'div',
	                            null,
	                            _react2.default.createElement(
	                                'div',
	                                { styleName: 'dynamic-user' },
	                                _react2.default.createElement('img', { styleName: 'item-avatar', src: item.author.avatar, alt: '' }),
	                                ' ',
	                                item.author.username,
	                                ' \xA0 ',
	                                _react2.default.createElement(
	                                    'span',
	                                    { styleName: 'dynamic-time' },
	                                    completeTime
	                                )
	                            )
	                        )
	                    )
	                );
	            });
	        }
	    }, {
	        key: 'getTrainingWorkoutItem',
	        value: function getTrainingWorkoutItem(workoutStep) {
	            var _this4 = this;

	            var steps = this.state.workout.workouts[0].steps;
	            var stepList = new Map(steps.map(function (step) {
	                return [step._id, step];
	            }));
	            return workoutStep.map(function (stepItem, index) {
	                var Gender = _this4.state.user.gender.toLowerCase();
	                var item = stepList.has(stepItem) ? stepList.get(stepItem) : {};
	                var detail = item.exercise.videos[0] || {};
	                return _react2.default.createElement(
	                    'li',
	                    { key: item._id + index, styleName: 'line-item' },
	                    _react2.default.createElement(
	                        _reactRouter.Link,
	                        { to: _this4.props.router.getCurrentLocation().pathname + '/' + item._id },
	                        _react2.default.createElement(
	                            'div',
	                            { styleName: 'line-work-item' },
	                            _react2.default.createElement('div', { styleName: 'work-item-cover', style: { backgroundImage: 'url(' + detail.thumbnail + ')' } }),
	                            _react2.default.createElement(
	                                'p',
	                                { styleName: 'work-item-title' },
	                                item.exercise.name
	                            ),
	                            _react2.default.createElement(
	                                'p',
	                                { className: 'fz12', styleName: 'work-item-desc' },
	                                Gender === 'm' ? item.mgroup : item.fgroup,
	                                ' x ',
	                                item.type === 'times' ? Gender === 'm' ? item.mpergroup : item.fpergroup : Gender === 'm' ? item.mduration : item.mduration,
	                                _react2.default.createElement(
	                                    'span',
	                                    { className: 'fz12' },
	                                    item.type === 'times' ? '次' : '"'
	                                )
	                            )
	                        ),
	                        _react2.default.createElement(
	                            'div',
	                            { styleName: 'work-gap' },
	                            '\u4F11\u606F ',
	                            item.gap,
	                            '"'
	                        )
	                    )
	                );
	            });
	        }
	    }, {
	        key: 'getTrainingDetail',
	        value: function getTrainingDetail() {
	            var _this5 = this;

	            var workContent = this.state.workout.workouts[0];

	            return workContent.sections.map(function (item, index) {
	                return _react2.default.createElement(
	                    'div',
	                    { key: item._id + index },
	                    _react2.default.createElement(
	                        'p',
	                        { styleName: 'line-title' },
	                        item.name
	                    ),
	                    _react2.default.createElement(
	                        'ul',
	                        { styleName: 'training-line' },
	                        _this5.getTrainingWorkoutItem(item.subSteps)
	                    )
	                );
	            });
	        }
	    }, {
	        key: 'handleToggleDetail',
	        value: function handleToggleDetail() {
	            var $workoutDetial = this.refs.workoutDetail;
	            if ($workoutDetial.className.indexOf('show') > 0) {
	                $workoutDetial.className = 'workout-introduce';
	                this.setState({
	                    classBlur: 'workout-mask'
	                });
	                setTimeout(function () {
	                    $workoutDetial.style.display = 'none';
	                }, 500);
	            } else {
	                this.setState({
	                    classBlur: 'workout-mask workout-blur-mask'
	                });
	                $workoutDetial.style.display = 'block';
	                setTimeout(function () {
	                    $workoutDetial.className += ' show';
	                }, 100);
	            }
	        }
	    }, {
	        key: 'handleStartExercise',
	        value: function handleStartExercise() {
	            var winWorkout = new _electron.remote.BrowserWindow({
	                'width': 1199,
	                'height': 777,
	                'title': this.state.workout.name,
	                'center': true
	            });
	            winWorkout.loadURL('file://' + (__dirname) + '/startExercise.html?planid=' + this.props.params.plan_id);
	            winWorkout.on('close', function () {
	                winWorkout = null;
	            });
	            winWorkout.show();
	        }
	    }, {
	        key: 'render',
	        value: function render() {
	            var workout = this.state.workout;
	            if (workout._id) {
	                var workContent = workout.workouts[0];

	                return _react2.default.createElement(
	                    'div',
	                    { ref: 'scrollContent', className: 'scroll-content' },
	                    _react2.default.createElement(
	                        'div',
	                        { styleName: this.state.classBlur },
	                        _react2.default.createElement(
	                            'section',
	                            { styleName: 'workout-header', style: { backgroundImage: 'url(' + workout.picture + ')' } },
	                            _react2.default.createElement(
	                                'div',
	                                { styleName: 'header-inner' },
	                                _react2.default.createElement(
	                                    'p',
	                                    { styleName: 'header-title' },
	                                    workout.name
	                                ),
	                                _react2.default.createElement(
	                                    'p',
	                                    { styleName: 'header-desc' },
	                                    workout.description
	                                ),
	                                _react2.default.createElement(
	                                    'ul',
	                                    { styleName: 'header-nav' },
	                                    _react2.default.createElement(
	                                        'li',
	                                        { className: 'pull-left' },
	                                        _react2.default.createElement(
	                                            _reactRouter.Link,
	                                            { onClick: this.handleToggleDetail },
	                                            _react2.default.createElement(
	                                                'span',
	                                                { styleName: 'header-link' },
	                                                _react2.default.createElement(
	                                                    'span',
	                                                    { styleName: 'link-val' },
	                                                    _react2.default.createElement('i', {
	                                                        className: 'iconfont icon-description fz14' }),
	                                                    '\u8BAD\u7EC3\u8BF4\u660E'
	                                                )
	                                            )
	                                        )
	                                    ),
	                                    _react2.default.createElement(
	                                        'li',
	                                        null,
	                                        _react2.default.createElement(
	                                            'span',
	                                            { styleName: 'header-sp' },
	                                            _react2.default.createElement(
	                                                'span',
	                                                { styleName: 'sp-desc' },
	                                                '\u71C3\u8102'
	                                            ),
	                                            _react2.default.createElement('br', null),
	                                            _react2.default.createElement(
	                                                'span',
	                                                {
	                                                    className: 'fz18' },
	                                                workout.calorie
	                                            ),
	                                            '\u5343\u5361'
	                                        )
	                                    ),
	                                    _react2.default.createElement(
	                                        'li',
	                                        null,
	                                        _react2.default.createElement(
	                                            'span',
	                                            { styleName: 'header-sp' },
	                                            _react2.default.createElement(
	                                                'span',
	                                                { styleName: 'sp-desc' },
	                                                '\u65F6\u95F4'
	                                            ),
	                                            _react2.default.createElement('br', null),
	                                            _react2.default.createElement(
	                                                'span',
	                                                {
	                                                    className: 'fz18' },
	                                                workout.averageDuration
	                                            ),
	                                            '\u5206\u949F'
	                                        )
	                                    ),
	                                    _react2.default.createElement(
	                                        'li',
	                                        null,
	                                        _react2.default.createElement(
	                                            'span',
	                                            { styleName: 'header-sp' },
	                                            _react2.default.createElement(
	                                                'span',
	                                                { styleName: 'sp-desc' },
	                                                '\u96BE\u5EA6'
	                                            ),
	                                            _react2.default.createElement('br', null),
	                                            _react2.default.createElement(
	                                                'span',
	                                                {
	                                                    className: 'fz18' },
	                                                'K',
	                                                workout.difficulty
	                                            )
	                                        )
	                                    )
	                                )
	                            )
	                        ),
	                        _react2.default.createElement(
	                            'section',
	                            { className: 'white-background' },
	                            _react2.default.createElement(
	                                'div',
	                                { styleName: 'list-nav' },
	                                _react2.default.createElement(
	                                    'div',
	                                    { styleName: 'nav-participation' },
	                                    _react2.default.createElement(
	                                        'span',
	                                        {
	                                            className: 'fz10' },
	                                        '\u603B\u6253\u5361\u6B21\u6570'
	                                    ),
	                                    _react2.default.createElement('br', null),
	                                    workContent.totalFinished
	                                ),
	                                _react2.default.createElement(
	                                    'ul',
	                                    { styleName: 'complete-list' },
	                                    this.getPioneerContent()
	                                ),
	                                _react2.default.createElement(
	                                    _reactRouter.Link,
	                                    { styleName: 'show-more' },
	                                    _react2.default.createElement('i', { className: 'iconfont icon-more' })
	                                )
	                            )
	                        ),
	                        _react2.default.createElement(
	                            'section',
	                            { styleName: 'training-content' },
	                            _react2.default.createElement(
	                                'div',
	                                { styleName: 'training-title' },
	                                '\u52A8\u4F5C\u5217\u8868 ',
	                                _react2.default.createElement(
	                                    'span',
	                                    {
	                                        styleName: 'training-sp' },
	                                    workContent.steps.length,
	                                    '\u4E2A\u52A8\u4F5C'
	                                )
	                            ),
	                            _react2.default.createElement(
	                                'div',
	                                { className: 'padding' },
	                                this.getTrainingDetail()
	                            )
	                        ),
	                        _react2.default.createElement(
	                            'section',
	                            { styleName: 'training-dynamic' },
	                            _react2.default.createElement(
	                                'div',
	                                { styleName: 'dynamic-title' },
	                                '\u8BAD\u7EC3\u6210\u679C'
	                            ),
	                            _react2.default.createElement(
	                                'div',
	                                null,
	                                this.getWorkoutDynamic()
	                            )
	                        ),
	                        _react2.default.createElement(
	                            'section',
	                            { hidden: !this.state.recommends.length, className: 'white-background margin-top', styleName: 'scroll-wrap' },
	                            _react2.default.createElement(
	                                'div',
	                                { styleName: 'dynamic-title' },
	                                '\u76F8\u5173\u8BAD\u7EC3'
	                            ),
	                            _react2.default.createElement(
	                                'ul',
	                                { styleName: 'scroll-list' },
	                                this.state.recommends.map(function (item) {
	                                    return _react2.default.createElement(
	                                        'li',
	                                        { key: item.id, className: 'padding', styleName: 'training-block', style: { backgroundImage: 'url(' + item.picture + ')' } },
	                                        _react2.default.createElement(
	                                            'p',
	                                            { styleName: 'training-block-title' },
	                                            item.title
	                                        ),
	                                        _react2.default.createElement(
	                                            'p',
	                                            { styleName: 'training-block-desc' },
	                                            item.pioneer,
	                                            '\u5DF2\u53C2\u52A0'
	                                        ),
	                                        _react2.default.createElement(
	                                            'div',
	                                            { className: 'text-left', styleName: 'training-block-info' },
	                                            _react2.default.createElement(
	                                                'span',
	                                                { className: 'fz18 font-bold' },
	                                                'K',
	                                                item.difficulty
	                                            ),
	                                            _react2.default.createElement(
	                                                'span',
	                                                { styleName: 'block-info-time' },
	                                                item.averageDuration,
	                                                '\u5206\u949F'
	                                            ),
	                                            _react2.default.createElement(
	                                                'span',
	                                                { styleName: 'block-info-tag' },
	                                                item.source
	                                            )
	                                        )
	                                    );
	                                })
	                            )
	                        ),
	                        _react2.default.createElement(
	                            'button',
	                            { styleName: 'button-start-training', onClick: this.handleStartExercise },
	                            '\u5F00\u59CB\u8BAD\u7EC3'
	                        )
	                    ),
	                    _react2.default.createElement(
	                        'section',
	                        { ref: 'workoutDetail', className: 'workout-introduce', style: { display: 'none' } },
	                        _react2.default.createElement(
	                            'article',
	                            { className: 'workout-introduce-inner' },
	                            _react2.default.createElement(
	                                'p',
	                                { styleName: 'header-title' },
	                                workout.name
	                            ),
	                            _react2.default.createElement('div', { className: 'article-wrap', dangerouslySetInnerHTML: { __html: this.state.workout.detail } })
	                        ),
	                        _react2.default.createElement(
	                            'button',
	                            { styleName: 'button-introduce-desc', onClick: this.handleToggleDetail },
	                            _react2.default.createElement('i', { className: 'iconfont icon-close' })
	                        )
	                    ),
	                    this.props.children
	                );
	            }
	        }
	    }]);

	    return AppWorkout;
	}(_react.Component), (_applyDecoratedDescriptor(_class2.prototype, 'componentWillMount', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'componentWillMount'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'handleUserInfo', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'handleUserInfo'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'getPioneerContent', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'getPioneerContent'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'getWorkoutDynamic', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'getWorkoutDynamic'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'getTrainingWorkoutItem', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'getTrainingWorkoutItem'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'getTrainingDetail', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'getTrainingDetail'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'handleToggleDetail', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'handleToggleDetail'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'handleStartExercise', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'handleStartExercise'), _class2.prototype)), _class2)) || _class);
	var _default = AppWorkout;
	exports.default = _default;
	;

	var _temp = function () {
	    if (typeof __REACT_HOT_LOADER__ === 'undefined') {
	        return;
	    }

	    __REACT_HOT_LOADER__.register(AppWorkout, 'AppWorkout', '/Users/liucong/Documents/Github/keepForMac/src/components/AppTraining/workouts/AppWorkout.js');

	    __REACT_HOT_LOADER__.register(_default, 'default', '/Users/liucong/Documents/Github/keepForMac/src/components/AppTraining/workouts/AppWorkout.js');
	}();

	;

	 ;(function register() { /* react-hot-loader/webpack */ if ((undefined) !== 'production') { if (typeof __REACT_HOT_LOADER__ === 'undefined') { return; } if (typeof module.exports === 'function') { __REACT_HOT_LOADER__.register(module.exports, 'module.exports', "/Users/liucong/Documents/Github/keepForMac/src/components/AppTraining/workouts/AppWorkout.js"); return; } for (var key in module.exports) { if (!Object.prototype.hasOwnProperty.call(module.exports, key)) { continue; } var namedExport = void 0; try { namedExport = module.exports[key]; } catch (err) { continue; } __REACT_HOT_LOADER__.register(namedExport, key, "/Users/liucong/Documents/Github/keepForMac/src/components/AppTraining/workouts/AppWorkout.js"); } } })();

/***/ },

/***/ 652:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(653);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(121)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(true) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept(653, function() {
				var newContent = __webpack_require__(653);
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 653:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(116)();
	// imports


	// module
	exports.push([module.id, ".gGG3G {\n  position: relative; }\n\n.T56YL {\n  background: #584f5f no-repeat center/cover;\n  position: relative;\n  box-shadow: 0 0 10px rgba(0, 0, 0, 0.6); }\n  .T56YL:before {\n    content: '';\n    position: absolute;\n    top: 0;\n    left: 0;\n    width: 100%;\n    height: 100%;\n    background: rgba(0, 0, 0, 0.5); }\n\n._1hEVu {\n  position: relative;\n  padding: 10px;\n  height: 180px; }\n\n._1kXZF {\n  font-size: 24px;\n  color: #fff;\n  margin-top: 10px; }\n\n._3n5Ak {\n  color: #ddd;\n  font-size: 12px; }\n\n.YVuU5 {\n  position: absolute;\n  bottom: 10px;\n  left: 0;\n  width: 100%;\n  margin: 0;\n  padding: 0 10px;\n  overflow: hidden;\n  text-align: right;\n  white-space: nowrap; }\n  .YVuU5 li {\n    display: inline-block; }\n\n._1wE0v {\n  text-align: left;\n  display: block;\n  font-size: 14px;\n  color: #fff;\n  padding: 12px 0 0; }\n\n._1_YaU {\n  padding: 5px 0;\n  border-top: 1px solid #fff;\n  border-bottom: 1px solid #fff; }\n\n._1vG24 {\n  color: #fff;\n  font-size: 10px;\n  display: block;\n  padding-left: 50px;\n  padding-right: 10px; }\n\n._1j7xa {\n  color: #ddd; }\n\n._2MKks {\n  padding: 10px;\n  display: flex;\n  border-bottom: 1px solid #eee; }\n\n._1qiEN {\n  text-align: center;\n  margin-right: 10px; }\n\n._32OId {\n  margin: 0;\n  padding: 0;\n  flex: 1;\n  align-self: center;\n  text-align: right; }\n  ._32OId li {\n    display: inline-flex; }\n\n._2r7mC {\n  width: 30px;\n  height: 30px;\n  border-radius: 50%;\n  overflow: hidden;\n  display: block;\n  position: relative;\n  background: #eee;\n  border: 1px solid #eee;\n  margin-right: 10px; }\n  ._2r7mC img {\n    border: none;\n    width: 100%;\n    height: 100%; }\n\n._3P-i6 {\n  text-align: center;\n  width: 30px;\n  position: relative; }\n  ._3P-i6 i {\n    margin: 0;\n    position: absolute;\n    top: 50%;\n    left: 50%;\n    transform: translate(-50%, -50%); }\n\n.gEjE- {\n  background: #fff;\n  border-bottom: 1px solid #eee; }\n\n._1hUN3 {\n  padding: 10px;\n  overflow: hidden; }\n\n._2fS-z {\n  float: right;\n  color: #999;\n  font-size: 12px; }\n\n._1Vgwh {\n  border-left: 2px solid #00c78c;\n  padding-left: 5px;\n  line-height: 1; }\n\n._2tzoZ {\n  display: block;\n  margin: 0;\n  padding: 0;\n  overflow: hidden; }\n\n._21hmZ {\n  float: left;\n  width: 33.33%;\n  padding: 10px;\n  position: relative; }\n\n.LM-oO {\n  margin-right: 15px; }\n\n._1oREy {\n  width: 15px;\n  text-align: center;\n  font-size: 12px;\n  position: absolute;\n  top: 26%;\n  right: 5px;\n  color: #999; }\n\n.K8_bp {\n  width: 100%;\n  padding-bottom: 64%;\n  margin-bottom: 10px;\n  background: #999 center/cover; }\n\n._39a3J {\n  margin-bottom: 5px; }\n\n._3CNEr {\n  color: #999; }\n\n._3HQju {\n  cursor: pointer;\n  position: fixed;\n  bottom: 50px;\n  right: 50px;\n  width: 60px;\n  padding: 0 10px;\n  height: 60px;\n  border-radius: 50%;\n  background: rgba(0, 199, 140, 0.8);\n  border: 2px solid rgba(88, 79, 95, 0.2);\n  color: #fff;\n  box-shadow: 0 0 5px rgba(85, 85, 85, 0.8);\n  transition: all .35s; }\n  ._3HQju:hover {\n    background: #00c78c;\n    border: 2px solid rgba(88, 79, 95, 0.6); }\n\n._1mcce {\n  background: #fff;\n  padding: 0 10px; }\n\n._2NGue {\n  padding: 10px 0; }\n\n._3ZI5H {\n  display: flex;\n  border-bottom: 1px solid #eee;\n  padding: 10px 0; }\n  ._3ZI5H:first-child {\n    padding-top: 0; }\n\n._3zpl4 {\n  width: 100px;\n  height: 100px;\n  margin-right: 10px;\n  background: #999 no-repeat center/cover; }\n\n._1KBy0 {\n  flex: 1;\n  display: flex;\n  flex-direction: column; }\n\n._3FTXV {\n  flex: 1; }\n  ._3FTXV p {\n    overflow: hidden;\n    display: -webkit-box;\n    -webkit-line-clamp: 3;\n    -webkit-box-orient: vertical; }\n\n._30yij {\n  overflow: hidden;\n  display: flex;\n  align-items: center; }\n\n._19wAn {\n  width: 30px;\n  height: 30px;\n  border-radius: 50%;\n  margin-right: 10px;\n  border: 1px solid #eee; }\n\n._2YtCi {\n  color: #ddd; }\n\n.jJH-4 {\n  transition: transform .5s .2s; }\n\n._2Sf8g {\n  display: block;\n  filter: blur(5px);\n  position: relative;\n  transform: scale(1.01); }\n\n.workout-introduce {\n  opacity: 0;\n  position: fixed;\n  top: 60px;\n  right: 0;\n  bottom: 0;\n  left: 150px;\n  padding: 20px 30px 80px;\n  background: rgba(0, 0, 0, 0.8);\n  transition: opacity .5s .2s; }\n\n.workout-introduce.show {\n  opacity: 1;\n  transition: opacity .5s; }\n\n.workout-introduce.show .workout-introduce-inner {\n  opacity: 1;\n  margin-top: 0;\n  transition: all .5s .2s; }\n\n.workout-introduce-inner {\n  transition: all .5s;\n  opacity: 0;\n  margin-top: 10px;\n  height: 100%;\n  padding-right: 10px;\n  margin-right: -10px;\n  overflow-x: hidden;\n  overflow-y: auto;\n  color: #fff; }\n\n._3HnIN {\n  position: absolute;\n  bottom: 20px;\n  left: 50%;\n  padding: 0;\n  width: 30px;\n  height: 30px;\n  line-height: 30px;\n  overflow: hidden;\n  margin-left: -15px;\n  border: none;\n  background: none;\n  color: #fff;\n  cursor: pointer;\n  transition: transform .35s; }\n  ._3HnIN:hover {\n    transform: scale(1.3); }\n  ._3HnIN i {\n    font-size: 30px;\n    margin: 0; }\n\n._3ESct {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  overflow-x: hidden;\n  overflow-y: auto; }\n\n._1Fdk2 {\n  width: 100%; }\n\n._1QVe8 {\n  padding: 5px;\n  margin: 10px;\n  font-size: 24px;\n  color: #fff;\n  border-bottom: 1px solid #00c78c; }\n\n._16Fkx {\n  padding: 10px 20px;\n  color: #fff; }\n\n.c-93L {\n  color: #fff;\n  margin-top: 10px;\n  margin-bottom: 0;\n  margin-left: 20px; }\n\n._2BoKE {\n  width: 100%;\n  overflow-x: auto;\n  overflow-y: hidden;\n  white-space: nowrap;\n  padding: 10px; }\n\n._2fU4a {\n  padding: 10px;\n  vertical-align: top;\n  display: inline-block; }\n\n._24vS1 {\n  position: relative; }\n\n._1z3Ha {\n  border-radius: 10px;\n  border: 1px solid #999;\n  height: 500px; }\n\n._15A6x {\n  position: absolute;\n  color: #fff;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 30px;\n  height: 30px;\n  max-width: 10%;\n  max-height: 10%;\n  transform: translate(-50%, -50%);\n  line-height: 30px;\n  text-align: center;\n  border-radius: 50%;\n  font-size: 14px;\n  background: rgba(0, 199, 140, 0.66); }\n\n.cIiAg {\n  margin-top: 10px;\n  font-size: 14px;\n  color: #fff; }\n\n._3aZ9T {\n  padding: 0 10px 10px; }\n\n._30KDK {\n  padding-top: 10px; }\n\n._2lV3o {\n  margin: 0;\n  padding: 0;\n  overflow-x: scroll;\n  overflow-y: hidden;\n  white-space: nowrap; }\n  ._2lV3o li {\n    position: relative;\n    overflow: hidden;\n    display: inline-block;\n    margin-right: 10px;\n    width: 40%;\n    height: 140px;\n    background: no-repeat center/cover; }\n    ._2lV3o li:last-child {\n      margin: 0; }\n\n._2k-At {\n  position: relative; }\n  ._2k-At:before {\n    content: '';\n    position: absolute;\n    top: 0;\n    left: 0;\n    width: 100%;\n    height: 100%;\n    background: rgba(0, 0, 0, 0.45); }\n  ._2k-At p {\n    position: relative; }\n\n.OHn7N {\n  color: #fff;\n  font-size: 18px; }\n\n._2Kfmk {\n  color: #ddd;\n  font-size: 12px; }\n\n._2jqeS {\n  color: #fff;\n  position: absolute;\n  left: 0;\n  bottom: 0;\n  padding: 10px;\n  width: 100%;\n  text-align: right; }\n\n._3p9y6 {\n  font-size: 10px;\n  margin-left: 5px; }\n\n._ylsI {\n  float: right;\n  padding: 5px;\n  font-size: 10px;\n  background: rgba(0, 0, 0, 0.3);\n  border-radius: 3px; }\n", ""]);

	// exports
	exports.locals = {
		"workout-wrap": "gGG3G",
		"workout-header": "T56YL",
		"header-inner": "_1hEVu",
		"header-title": "_1kXZF",
		"header-desc": "_3n5Ak",
		"header-nav": "YVuU5",
		"header-link": "_1wE0v",
		"link-val": "_1_YaU",
		"header-sp": "_1vG24",
		"sp-desc": "_1j7xa",
		"list-nav": "_2MKks",
		"nav-participation": "_1qiEN",
		"complete-list": "_32OId",
		"pioneer-item": "_2r7mC",
		"show-more": "_3P-i6",
		"training-content": "gEjE-",
		"training-title": "_1hUN3",
		"training-sp": "_2fS-z",
		"line-title": "_1Vgwh",
		"training-line": "_2tzoZ",
		"line-item": "_21hmZ",
		"line-work-item": "LM-oO",
		"work-gap": "_1oREy",
		"work-item-cover": "K8_bp",
		"work-item-title": "_39a3J",
		"work-item-desc": "_3CNEr",
		"button-start-training": "_3HQju",
		"training-dynamic": "_1mcce",
		"dynamic-title": "_2NGue",
		"dynamic-item": "_3ZI5H",
		"item-photo": "_3zpl4",
		"dynamic-content": "_1KBy0",
		"dynamic-desc": "_3FTXV",
		"dynamic-user": "_30yij",
		"item-avatar": "_19wAn",
		"dynamic-time": "_2YtCi",
		"workout-mask": "jJH-4",
		"workout-blur-mask": "_2Sf8g",
		"button-introduce-desc": "_3HnIN",
		"workout-desc-inner": "_3ESct",
		"workout-desc-video": "_1Fdk2",
		"workout-desc-title": "_1QVe8",
		"workout-desc-article": "_16Fkx",
		"workout-exercise-title": "c-93L",
		"workout-desc-figure": "_2BoKE",
		"exercise-figure": "_2fU4a",
		"exercise-item": "_24vS1",
		"exercise-pic": "_1z3Ha",
		"exercise-coordinates": "_15A6x",
		"exercise-tip": "cIiAg",
		"scroll-wrap": "_3aZ9T",
		"scroll-title": "_30KDK",
		"scroll-list": "_2lV3o",
		"training-block": "_2k-At",
		"training-block-title": "OHn7N",
		"training-block-desc": "_2Kfmk",
		"training-block-info": "_2jqeS",
		"block-info-time": "_3p9y6",
		"block-info-tag": "_ylsI"
	};

/***/ },

/***/ 654:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _dec, _class, _desc, _value, _class2;

	var _react = __webpack_require__(122);

	var _react2 = _interopRequireDefault(_react);

	var _reactCssModules = __webpack_require__(354);

	var _reactCssModules2 = _interopRequireDefault(_reactCssModules);

	var _autobindDecorator = __webpack_require__(513);

	var _autobindDecorator2 = _interopRequireDefault(_autobindDecorator);

	var _moment = __webpack_require__(524);

	var _moment2 = _interopRequireDefault(_moment);

	var _Utils = __webpack_require__(521);

	var _Utils2 = _interopRequireDefault(_Utils);

	var _appWorkouts = __webpack_require__(652);

	var _appWorkouts2 = _interopRequireDefault(_appWorkouts);

	var _AppSlideContent = __webpack_require__(655);

	var _AppSlideContent2 = _interopRequireDefault(_AppSlideContent);

	var _WorkoutCoordinates = __webpack_require__(658);

	var _WorkoutCoordinates2 = _interopRequireDefault(_WorkoutCoordinates);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
	    var desc = {};
	    Object['ke' + 'ys'](descriptor).forEach(function (key) {
	        desc[key] = descriptor[key];
	    });
	    desc.enumerable = !!desc.enumerable;
	    desc.configurable = !!desc.configurable;

	    if ('value' in desc || desc.initializer) {
	        desc.writable = true;
	    }

	    desc = decorators.slice().reverse().reduce(function (desc, decorator) {
	        return decorator(target, property, desc) || desc;
	    }, desc);

	    if (context && desc.initializer !== void 0) {
	        desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
	        desc.initializer = undefined;
	    }

	    if (desc.initializer === void 0) {
	        Object['define' + 'Property'](target, property, desc);
	        desc = null;
	    }

	    return desc;
	}

	var WorkoutDescription = (_dec = (0, _reactCssModules2.default)(_appWorkouts2.default), _dec(_class = (_class2 = function (_Component) {
	    _inherits(WorkoutDescription, _Component);

	    function WorkoutDescription(props) {
	        _classCallCheck(this, WorkoutDescription);

	        var _this = _possibleConstructorReturn(this, (WorkoutDescription.__proto__ || Object.getPrototypeOf(WorkoutDescription)).call(this, props));

	        var workouts = new Map(_Utils2.default.storage.get('workouts'));
	        var desc = workouts.has(_this.props.params.plan_id) ? workouts.get(_this.props.params.plan_id) : {};
	        if (desc._id) {
	            desc = desc.workouts[0].steps.filter(function (item) {
	                return item._id == _this.props.params.desc_id;
	            })[0];
	        }

	        _this.state = {
	            workout: desc
	        };
	        return _this;
	    }

	    // 训练描述信息


	    _createClass(WorkoutDescription, [{
	        key: 'getDescriptionContent',
	        value: function getDescriptionContent() {
	            if (this.state.workout.exercise.description) return _react2.default.createElement('article', { className: 'article-wrap', styleName: 'workout-desc-article', dangerouslySetInnerHTML: { __html: this.state.workout.exercise.description } });
	        }
	    }, {
	        key: 'render',
	        value: function render() {
	            return _react2.default.createElement(
	                _AppSlideContent2.default,
	                null,
	                _react2.default.createElement(
	                    'div',
	                    { styleName: 'workout-desc-inner' },
	                    _react2.default.createElement('video', { styleName: 'workout-desc-video', src: this.state.workout.exercise.videos[0].url, muted: true, autoPlay: true, loop: true }),
	                    _react2.default.createElement(
	                        'p',
	                        { styleName: 'workout-desc-title' },
	                        this.state.workout.exercise.name
	                    ),
	                    this.getDescriptionContent(),
	                    _react2.default.createElement(
	                        'h4',
	                        { styleName: 'workout-exercise-title' },
	                        '\u7EC6\u8282\u56FE\u793A'
	                    ),
	                    _react2.default.createElement(
	                        'article',
	                        { styleName: 'workout-desc-figure' },
	                        this.state.workout.exercise.covers.map(function (cover) {
	                            return _react2.default.createElement(_WorkoutCoordinates2.default, { key: cover._id, data: cover });
	                        })
	                    )
	                )
	            );
	        }
	    }]);

	    return WorkoutDescription;
	}(_react.Component), (_applyDecoratedDescriptor(_class2.prototype, 'getDescriptionContent', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'getDescriptionContent'), _class2.prototype)), _class2)) || _class);
	var _default = WorkoutDescription;
	exports.default = _default;
	;

	var _temp = function () {
	    if (typeof __REACT_HOT_LOADER__ === 'undefined') {
	        return;
	    }

	    __REACT_HOT_LOADER__.register(WorkoutDescription, 'WorkoutDescription', '/Users/liucong/Documents/Github/keepForMac/src/components/AppTraining/workouts/WorkoutDescription.js');

	    __REACT_HOT_LOADER__.register(_default, 'default', '/Users/liucong/Documents/Github/keepForMac/src/components/AppTraining/workouts/WorkoutDescription.js');
	}();

	;

	 ;(function register() { /* react-hot-loader/webpack */ if ((undefined) !== 'production') { if (typeof __REACT_HOT_LOADER__ === 'undefined') { return; } if (typeof module.exports === 'function') { __REACT_HOT_LOADER__.register(module.exports, 'module.exports', "/Users/liucong/Documents/Github/keepForMac/src/components/AppTraining/workouts/WorkoutDescription.js"); return; } for (var key in module.exports) { if (!Object.prototype.hasOwnProperty.call(module.exports, key)) { continue; } var namedExport = void 0; try { namedExport = module.exports[key]; } catch (err) { continue; } __REACT_HOT_LOADER__.register(namedExport, key, "/Users/liucong/Documents/Github/keepForMac/src/components/AppTraining/workouts/WorkoutDescription.js"); } } })();

/***/ },

/***/ 655:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _dec, _class, _desc, _value, _class2;

	var _react = __webpack_require__(122);

	var _react2 = _interopRequireDefault(_react);

	var _reactRouter = __webpack_require__(298);

	var _reactCssModules = __webpack_require__(354);

	var _reactCssModules2 = _interopRequireDefault(_reactCssModules);

	var _autobindDecorator = __webpack_require__(513);

	var _autobindDecorator2 = _interopRequireDefault(_autobindDecorator);

	var _moment = __webpack_require__(524);

	var _moment2 = _interopRequireDefault(_moment);

	var _Utils = __webpack_require__(521);

	var _Utils2 = _interopRequireDefault(_Utils);

	var _appSlideContent = __webpack_require__(656);

	var _appSlideContent2 = _interopRequireDefault(_appSlideContent);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
	    var desc = {};
	    Object['ke' + 'ys'](descriptor).forEach(function (key) {
	        desc[key] = descriptor[key];
	    });
	    desc.enumerable = !!desc.enumerable;
	    desc.configurable = !!desc.configurable;

	    if ('value' in desc || desc.initializer) {
	        desc.writable = true;
	    }

	    desc = decorators.slice().reverse().reduce(function (desc, decorator) {
	        return decorator(target, property, desc) || desc;
	    }, desc);

	    if (context && desc.initializer !== void 0) {
	        desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
	        desc.initializer = undefined;
	    }

	    if (desc.initializer === void 0) {
	        Object['define' + 'Property'](target, property, desc);
	        desc = null;
	    }

	    return desc;
	}

	var AppSlideContent = (_dec = (0, _reactCssModules2.default)(_appSlideContent2.default, { allowMultiple: true }), _dec(_class = (_class2 = function (_Component) {
	    _inherits(AppSlideContent, _Component);

	    function AppSlideContent(props) {
	        _classCallCheck(this, AppSlideContent);

	        var _this = _possibleConstructorReturn(this, (AppSlideContent.__proto__ || Object.getPrototypeOf(AppSlideContent)).call(this, props));

	        _this.state = {
	            className: 'slide-content'
	        };
	        return _this;
	    }

	    _createClass(AppSlideContent, [{
	        key: 'componentDidMount',
	        value: function componentDidMount() {
	            var _this2 = this;

	            setTimeout(function () {
	                _this2.timer = _this2.setState({
	                    className: 'slide-content active'
	                });
	            }, 100);
	        }
	    }, {
	        key: 'componentWillUnmount',
	        value: function componentWillUnmount() {
	            this.timer && clearTimeout(this.timer);
	        }
	    }, {
	        key: 'handleGoback',
	        value: function handleGoback() {
	            this.setState({
	                className: 'slide-content'
	            });
	            setTimeout(function () {
	                _reactRouter.hashHistory.goBack();
	            }, 350);
	        }
	    }, {
	        key: 'render',
	        value: function render() {
	            return _react2.default.createElement(
	                'div',
	                { styleName: 'slide-wrap' },
	                _react2.default.createElement('div', { styleName: 'slide-mask' }),
	                _react2.default.createElement(
	                    'div',
	                    { styleName: this.state.className },
	                    _react2.default.createElement(
	                        'button',
	                        { styleName: 'button-slide-goback', onClick: this.handleGoback },
	                        _react2.default.createElement('i', { className: 'iconfont icon-goback fz36' })
	                    ),
	                    _react2.default.createElement(
	                        'div',
	                        null,
	                        this.props.children
	                    )
	                )
	            );
	        }
	    }]);

	    return AppSlideContent;
	}(_react.Component), (_applyDecoratedDescriptor(_class2.prototype, 'componentDidMount', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'componentDidMount'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'componentWillUnmount', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'componentWillUnmount'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'handleGoback', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'handleGoback'), _class2.prototype)), _class2)) || _class);
	var _default = AppSlideContent;
	exports.default = _default;
	;

	var _temp = function () {
	    if (typeof __REACT_HOT_LOADER__ === 'undefined') {
	        return;
	    }

	    __REACT_HOT_LOADER__.register(AppSlideContent, 'AppSlideContent', '/Users/liucong/Documents/Github/keepForMac/src/components/AppSlideContent.js');

	    __REACT_HOT_LOADER__.register(_default, 'default', '/Users/liucong/Documents/Github/keepForMac/src/components/AppSlideContent.js');
	}();

	;

	 ;(function register() { /* react-hot-loader/webpack */ if ((undefined) !== 'production') { if (typeof __REACT_HOT_LOADER__ === 'undefined') { return; } if (typeof module.exports === 'function') { __REACT_HOT_LOADER__.register(module.exports, 'module.exports', "/Users/liucong/Documents/Github/keepForMac/src/components/AppSlideContent.js"); return; } for (var key in module.exports) { if (!Object.prototype.hasOwnProperty.call(module.exports, key)) { continue; } var namedExport = void 0; try { namedExport = module.exports[key]; } catch (err) { continue; } __REACT_HOT_LOADER__.register(namedExport, key, "/Users/liucong/Documents/Github/keepForMac/src/components/AppSlideContent.js"); } } })();

/***/ },

/***/ 656:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(657);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(121)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(true) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept(657, function() {
				var newContent = __webpack_require__(657);
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 657:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(116)();
	// imports


	// module
	exports.push([module.id, "._3h-mm {\n  position: absolute;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  overflow: hidden; }\n\n._QeqJ {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  transition: background .35s;\n  background: rgba(0, 0, 0, 0.45); }\n\n._2uiQd {\n  position: absolute;\n  top: 0;\n  right: -75%;\n  width: 75%;\n  height: 100%;\n  background: #555;\n  transition: right .35s ease-out;\n  box-shadow: -2px 0 15px rgba(0, 0, 0, 0.6); }\n\n._2uiQd.BkEY- {\n  right: 0; }\n  ._2uiQd.BkEY- ._3QeEg {\n    opacity: 1;\n    transform: translateX(0px); }\n\n._3QeEg {\n  transition: opacity .5s .5s, transform .5s .5s;\n  transform: translateX(-10px);\n  opacity: 0;\n  cursor: pointer;\n  border: none;\n  background: none;\n  position: absolute;\n  top: 50%;\n  left: -18%;\n  margin-top: -12px;\n  margin-left: -12px;\n  color: #fff; }\n  ._3QeEg:hover {\n    animation: _2CBwY .5s;\n    animation-fill-mode: forwards; }\n\n@keyframes _2CBwY {\n  0% {\n    transform: translateX(0); }\n  100% {\n    transform: translateX(10px); } }\n", ""]);

	// exports
	exports.locals = {
		"slide-wrap": "_3h-mm",
		"slide-mask": "_QeqJ",
		"slide-content": "_2uiQd",
		"active": "BkEY-",
		"button-slide-goback": "_3QeEg",
		"buttonFloat": "_2CBwY"
	};

/***/ },

/***/ 658:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _dec, _class;

	var _react = __webpack_require__(122);

	var _react2 = _interopRequireDefault(_react);

	var _reactCssModules = __webpack_require__(354);

	var _reactCssModules2 = _interopRequireDefault(_reactCssModules);

	var _appWorkouts = __webpack_require__(652);

	var _appWorkouts2 = _interopRequireDefault(_appWorkouts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var WorkoutCoordinates = (_dec = (0, _reactCssModules2.default)(_appWorkouts2.default), _dec(_class = function (_Component) {
	    _inherits(WorkoutCoordinates, _Component);

	    function WorkoutCoordinates(props) {
	        _classCallCheck(this, WorkoutCoordinates);

	        return _possibleConstructorReturn(this, (WorkoutCoordinates.__proto__ || Object.getPrototypeOf(WorkoutCoordinates)).call(this, props));
	    }

	    _createClass(WorkoutCoordinates, [{
	        key: 'render',
	        value: function render() {
	            var cover = this.props.data;
	            return _react2.default.createElement(
	                'figure',
	                { styleName: 'exercise-figure' },
	                _react2.default.createElement(
	                    'div',
	                    { styleName: 'exercise-item' },
	                    _react2.default.createElement('img', { styleName: 'exercise-pic', width: '500', src: cover.url, alt: '' }),
	                    /* 动作细节位置标识 */
	                    cover.coordinates.map(function (item, index) {
	                        return _react2.default.createElement(
	                            'span',
	                            { key: item._id, style: { top: item.y * 100 + '%', left: item.x * 100 + '%' }, styleName: 'exercise-coordinates' },
	                            index + 1
	                        );
	                    })
	                ),
	                _react2.default.createElement(
	                    'article',
	                    null,
	                    /* 动作细节描述 */
	                    cover.coordinates.map(function (item, index) {
	                        return _react2.default.createElement(
	                            'p',
	                            { key: item._id, styleName: 'exercise-tip' },
	                            index + 1,
	                            '. ',
	                            item.tip
	                        );
	                    })
	                )
	            );
	        }
	    }]);

	    return WorkoutCoordinates;
	}(_react.Component)) || _class);
	var _default = WorkoutCoordinates;
	exports.default = _default;
	;

	var _temp = function () {
	    if (typeof __REACT_HOT_LOADER__ === 'undefined') {
	        return;
	    }

	    __REACT_HOT_LOADER__.register(WorkoutCoordinates, 'WorkoutCoordinates', '/Users/liucong/Documents/Github/keepForMac/src/components/AppTraining/workouts/WorkoutCoordinates.js');

	    __REACT_HOT_LOADER__.register(_default, 'default', '/Users/liucong/Documents/Github/keepForMac/src/components/AppTraining/workouts/WorkoutCoordinates.js');
	}();

	;

	 ;(function register() { /* react-hot-loader/webpack */ if ((undefined) !== 'production') { if (typeof __REACT_HOT_LOADER__ === 'undefined') { return; } if (typeof module.exports === 'function') { __REACT_HOT_LOADER__.register(module.exports, 'module.exports', "/Users/liucong/Documents/Github/keepForMac/src/components/AppTraining/workouts/WorkoutCoordinates.js"); return; } for (var key in module.exports) { if (!Object.prototype.hasOwnProperty.call(module.exports, key)) { continue; } var namedExport = void 0; try { namedExport = module.exports[key]; } catch (err) { continue; } __REACT_HOT_LOADER__.register(namedExport, key, "/Users/liucong/Documents/Github/keepForMac/src/components/AppTraining/workouts/WorkoutCoordinates.js"); } } })();

/***/ },

/***/ 659:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _Utils = __webpack_require__(521);

	var _Utils2 = _interopRequireDefault(_Utils);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _default = function _default(nextState, replace) {
	    if (!_Utils2.default.storage.get('authentication')) {
	        replace({ pathname: '/login' });
	    } else {
	        //replace({ pathname: '/training' })
	    }
	};

	exports.default = _default;
	;

	var _temp = function () {
	    if (typeof __REACT_HOT_LOADER__ === 'undefined') {
	        return;
	    }

	    __REACT_HOT_LOADER__.register(_default, 'default', '/Users/liucong/Documents/Github/keepForMac/src/js/RequireAuth.js');
	}();

	;

	 ;(function register() { /* react-hot-loader/webpack */ if ((undefined) !== 'production') { if (typeof __REACT_HOT_LOADER__ === 'undefined') { return; } if (typeof module.exports === 'function') { __REACT_HOT_LOADER__.register(module.exports, 'module.exports', "/Users/liucong/Documents/Github/keepForMac/src/js/RequireAuth.js"); return; } for (var key in module.exports) { if (!Object.prototype.hasOwnProperty.call(module.exports, key)) { continue; } var namedExport = void 0; try { namedExport = module.exports[key]; } catch (err) { continue; } __REACT_HOT_LOADER__.register(namedExport, key, "/Users/liucong/Documents/Github/keepForMac/src/js/RequireAuth.js"); } } })();

/***/ }

});