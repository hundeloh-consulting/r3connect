module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 29);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.promisify = promisify;
exports.pad = pad;
exports.makeLoggable = makeLoggable;
exports.isFunction = isFunction;
exports.findByPath = findByPath;
exports.removeUndefinedValues = removeUndefinedValues;
exports.isListed = isListed;
/*
    r3connect
    Copyright (C) 2017 Julian Hundeloh

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

function promisify(func, boundObject) {
  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return new Promise(function (resolve, reject) {
      // Workaround because reject/resolve does not work in node-rfc environment
      var rejectError = null;
      var resolveValues = null;
      var checkReturn = function checkReturn() {
        // Anything returned so far?
        var handled = false;
        if (rejectError) {
          reject(rejectError);
          handled = true;
        } else if (resolveValues) {
          resolve(resolveValues);
          handled = true;
        }

        // Recheck in the future?
        if (!handled) {
          setTimeout(checkReturn, 10);
        }
      };
      setTimeout(checkReturn, 10);

      // Create the last argument: the generic callback function
      var callback = function callback(error) {
        for (var _len2 = arguments.length, values = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          values[_key2 - 1] = arguments[_key2];
        }

        if (error) {
          rejectError = error;
          // reject(error)
        } else {
          resolveValues = values;
          // resolve(values)
        }
      };
      args.push(callback);

      // Call function
      setTimeout(function () {
        try {
          if (boundObject) {
            func.bind(boundObject).apply(undefined, args);
          } else {
            func.apply(undefined, args);
          }
        } catch (error) {
          rejectError = error;
        }
      }, 0);
    });
  };
}

function pad(input, length) {
  var character = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ' ';

  return (Array(length).join(character) + input.toString()).slice(-1 * length);
}

function makeLoggable(object) {
  var log = function log(tag, data, details) {
    if (this.logger) {
      var scope = this.name || this.constructor.name;
      var tags = Array.isArray(tag) ? [scope].concat(tag) : [scope, tag];
      this.logger(tags, data);

      if (details) {
        this.logger(tags, details);
      }
    }
  };

  // Add log function to class and prototype
  Object.assign(object, {
    log: log
  });
  Object.assign(object.prototype, {
    log: log
  });

  return object;
}

function isFunction(object) {
  return !!(object && object.constructor && object.call && object.apply);
}

function findByPath(object, path) {
  var parts = path.trim() === '' ? [] : path.split('.');
  var value = object;
  while (value && parts.length > 0) {
    value = value[parts.shift()];
  }
  return value;
}

function removeUndefinedValues(object) {
  var copy = Object.assign({}, object);
  Object.keys(copy).forEach(function (key) {
    if (copy[key] === undefined) {
      delete copy[key];
    }
  });

  return copy;
}

function isListed(list, searchValue) {
  return list.some(function (value) {
    return !!searchValue.match(new RegExp('^' + value.split('*').join('(.*)') + '$'));
  });
}

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TimeoutException = exports.LogonException = exports.RFCException = exports.HttpException = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _errorSubclass = __webpack_require__(13);

var _errorSubclass2 = _interopRequireDefault(_errorSubclass);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   r3connect
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   Copyright (C) 2017 Julian Hundeloh
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   This program is free software: you can redistribute it and/or modify
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   it under the terms of the GNU Affero General Public License as published
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   by the Free Software Foundation, either version 3 of the License, or
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   (at your option) any later version.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   This program is distributed in the hope that it will be useful,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   but WITHOUT ANY WARRANTY; without even the implied warranty of
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   GNU Affero General Public License for more details.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   You should have received a copy of the GNU Affero General Public License
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   along with this program.  If not, see <http://www.gnu.org/licenses/>.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               */

var HttpException = exports.HttpException = function (_ErrorSubclass) {
  _inherits(HttpException, _ErrorSubclass);

  function HttpException(message) {
    var statusCode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 400;
    var code = arguments[2];
    var context = arguments[3];

    _classCallCheck(this, HttpException);

    var _this = _possibleConstructorReturn(this, (HttpException.__proto__ || Object.getPrototypeOf(HttpException)).call(this, message));

    _this.context = null;

    _this.statusCode = statusCode;
    _this.code = code;
    _this.context = context;
    return _this;
  }

  return HttpException;
}(_errorSubclass2.default);

var RFCException = exports.RFCException = function (_HttpException) {
  _inherits(RFCException, _HttpException);

  function RFCException(message, statusCode, code, context, client) {
    _classCallCheck(this, RFCException);

    var _this2 = _possibleConstructorReturn(this, (RFCException.__proto__ || Object.getPrototypeOf(RFCException)).call(this, message, statusCode, code, context));

    _this2.client = null;

    _this2.client = client;
    return _this2;
  }

  _createClass(RFCException, null, [{
    key: 'parse',
    value: function parse(error, context, client) {
      var key = error.key;
      var message = null;

      // Translate code to message
      var code = parseInt(error.code, 10);
      switch (code) {
        case 1:
          {
            var parsedMessage = this.parseMessage(error.message);
            var prefix = parsedMessage['ERRNO TEXT'] ? parsedMessage['ERRNO TEXT'] + ': ' : '';
            message = '' + prefix + parsedMessage.ERROR;
            break;
          }

        default:
          {
            message = error.message;
          }
      }

      // Return result
      var result = null;
      if (this === RFCException) {
        result = new this(message, 502, key, context, client);
      } else {
        result = new this(message, context, client);
      }
      return result;
    }
  }, {
    key: 'parseMessage',
    value: function parseMessage() {
      var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

      var result = {};
      message.split('\n').map(function (line) {
        return line.trim();
      }).forEach(function (line) {
        var key = line.substring(0, 12).trim();
        var value = line.substring(12).trim();
        if (key) {
          result[key] = value;
        }
      });
      return result;
    }
  }]);

  return RFCException;
}(HttpException);

var LogonException = exports.LogonException = function (_RFCException) {
  _inherits(LogonException, _RFCException);

  function LogonException(message, context) {
    _classCallCheck(this, LogonException);

    return _possibleConstructorReturn(this, (LogonException.__proto__ || Object.getPrototypeOf(LogonException)).call(this, message, 403, 'RFC_LOGON_FAILURE', context));
  }

  return LogonException;
}(RFCException);

var TimeoutException = exports.TimeoutException = function (_HttpException2) {
  _inherits(TimeoutException, _HttpException2);

  function TimeoutException(message, context, client) {
    _classCallCheck(this, TimeoutException);

    var _this4 = _possibleConstructorReturn(this, (TimeoutException.__proto__ || Object.getPrototypeOf(TimeoutException)).call(this, message, 504, 'RFC_TIMEOUT', context));

    _this4.client = null;

    _this4.client = client;
    return _this4;
  }

  return TimeoutException;
}(HttpException);

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp; /*
                       r3connect
                       Copyright (C) 2017 Julian Hundeloh
                   
                       This program is free software: you can redistribute it and/or modify
                       it under the terms of the GNU Affero General Public License as published
                       by the Free Software Foundation, either version 3 of the License, or
                       (at your option) any later version.
                   
                       This program is distributed in the hope that it will be useful,
                       but WITHOUT ANY WARRANTY; without even the implied warranty of
                       MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
                       GNU Affero General Public License for more details.
                   
                       You should have received a copy of the GNU Affero General Public License
                       along with this program.  If not, see <http://www.gnu.org/licenses/>.
                   */

var _pool = __webpack_require__(21);

var _pool2 = _interopRequireDefault(_pool);

var _objectHash = __webpack_require__(20);

var _objectHash2 = _interopRequireDefault(_objectHash);

var _Client = __webpack_require__(3);

var _Client2 = _interopRequireDefault(_Client);

var _Exceptions = __webpack_require__(1);

var _utils = __webpack_require__(0);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

exports.default = (0, _utils.makeLoggable)((_temp = _class = function () {
  function Pool() {
    _classCallCheck(this, Pool);
  }

  _createClass(Pool, null, [{
    key: 'generateHash',
    value: function generateHash(configuration) {
      return (0, _objectHash2.default)(configuration);
    }

    // Each destination has its own pool

  }, {
    key: 'remove',
    value: function remove(configuration) {
      var hash = this.generateHash(configuration);
      var pool = this.pools[hash];

      if (pool) {
        pool.end();
        this.pools[hash] = undefined;
        this.log('debug', 'Removed connection pool "' + hash + '" for host "' + configuration.applicationServer + '".');
      }
    }
  }, {
    key: 'create',
    value: function create(configuration, logger) {
      var _this = this;

      var lastError = null;
      var pool = new _pool2.default(Object.assign({
        acquire: function acquire(callback) {
          _this.log('debug', 'Start acquiring connection for "' + configuration.applicationServer + '".');

          try {
            var boundRelease = pool.release.bind(pool);
            _this.Client.connect(configuration, boundRelease, logger).then(function (client) {
              callback(null, client);
            }).catch(function (error) {
              // Check if error occurred in a client
              if (error.client) {
                // Release client from pool so it doesn't block future requests
                if (error.code && error.code.startsWith('RFC_')) {
                  pool.destroy(error.client);
                } else {
                  pool.remove(error.client);
                }
              } else {
                // If no connection could be established, remove the pool after some time
                // Any requests before are served with a cached error
                lastError = error;
                setTimeout(function () {
                  return Pool.remove(configuration);
                }, _this.options.bailTimeout);
              }

              callback(error);
            });
          } catch (error) {
            callback(error);
          }
        },

        dispose: function dispose(client, callback) {
          _this.log('debug', 'Disposing connection for "' + configuration.applicationServer + '".');
          client.close();
          callback();
        },

        destroy: function destroy(client, callback) {
          _this.log('debug', 'Destroying connection for "' + configuration.applicationServer + '".');
          callback();
        },

        ping: function ping(client, callback) {
          // Asynchronously ping
          setTimeout(function () {
            if (client.ping()) {
              callback();
            } else {
              callback(new _Exceptions.TimeoutException('Ping to "' + configuration.applicationServer + '" failed.'));
            }
          }, 0);
        }
      }, this.options));

      // Promisify acquire and return last error if present
      // Otherwise a generic error from pool2 would be thrown
      var originalAcquire = pool.acquire.bind(pool);
      pool.acquire = function acquire() {
        return (0, _utils.promisify)(originalAcquire, pool)().then(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 1),
              client = _ref2[0];

          return client;
        }).catch(function (error) {
          throw lastError || error;
        });
      };

      // Catch all generic errors
      pool.on('error', function (error) {
        if (!error.code) {
          _this.log('error', 'An error occured in pool "' + configuration.applicationServer + '".', error);
        }
      });

      return pool;
    }
  }, {
    key: 'get',
    value: function get(configuration, logger) {
      var hash = this.generateHash(configuration);
      var connection = null;

      // Reuse pool once it was created for a specific configuration
      if (this.pools[hash]) {
        connection = this.pools[hash];
        this.log('debug', 'Reuse connection pool "' + hash + '" of host "' + configuration.applicationServer + '".');
      } else {
        connection = this.create(configuration, logger);
        this.pools[hash] = connection;
        this.log('debug', 'Added connection pool "' + hash + '" for host "' + configuration.applicationServer + '".');
      }

      return connection;
    }
  }]);

  return Pool;
}(), _class.logger = null, _class.pools = {}, _class.options = {
  acquireTimeout: 24 * 60 * 60 * 1000,
  disposeTimeout: 30 * 1000,
  pingTimeout: 2 * 1000,
  idleTimeout: 120 * 1000,
  requestTimeout: Infinity,

  max: 1,
  min: 0,
  testOnBorrow: true,
  evictionRunIntervalMillis: 5 * 60 * 1000,
  maxRequests: Infinity,
  backoff: {
    min: 1 * 1000,
    max: 60 * 1000,
    jitter: 0
  },
  bailAfter: 1,
  bailTimeout: 30 * 1000
}, _class.Client = _Client2.default, _temp));

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp; /*
                       r3connect
                       Copyright (C) 2017 Julian Hundeloh
                   
                       This program is free software: you can redistribute it and/or modify
                       it under the terms of the GNU Affero General Public License as published
                       by the Free Software Foundation, either version 3 of the License, or
                       (at your option) any later version.
                   
                       This program is distributed in the hope that it will be useful,
                       but WITHOUT ANY WARRANTY; without even the implied warranty of
                       MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
                       GNU Affero General Public License for more details.
                   
                       You should have received a copy of the GNU Affero General Public License
                       along with this program.  If not, see <http://www.gnu.org/licenses/>.
                   */

var _Exceptions = __webpack_require__(1);

var _utils = __webpack_require__(0);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

exports.default = (0, _utils.makeLoggable)((_temp = _class = function () {
  _createClass(Client, null, [{
    key: 'NodeRFC',


    // Needs to be required as it could throw an exception if it was not built correctly
    get: function get() {
      // eslint-disable-next-line global-require, import/no-unresolved
      return __webpack_require__(19).Client;
    }
  }]);

  function Client(nodeRFC, release) {
    _classCallCheck(this, Client);

    this.nodeRFC = null;
    this.release = null;
    this.logger = null;
    this.connectTime = null;
    this.numberOfInvokes = 0;

    this.nodeRFC = nodeRFC;
    this.release = release;
  }

  _createClass(Client, [{
    key: 'close',
    value: function close() {
      return this.nodeRFC.close.apply(this.nodeRFC);
    }
  }, {
    key: 'ping',
    value: function ping() {
      return this.nodeRFC.ping.apply(this.nodeRFC);
    }
  }, {
    key: 'invoke',
    value: function invoke(functionModule, parameters) {
      var _this = this;

      var invoke = this.nodeRFC.invoke;
      var startTime = new Date();

      // Keep track of invokes
      this.numberOfInvokes = this.numberOfInvokes + 1;

      // Call system
      var args = [functionModule, parameters];
      var invokePromise = (0, _utils.promisify)(invoke, this.nodeRFC).apply(this.nodeRFC, args).catch(function (error) {
        throw _Exceptions.RFCException.parse(error, _this);
      });

      // Prevent that a RFC runs forever
      var timeoutPromise = new Promise(function (resolve, reject) {
        setTimeout(function () {
          reject(new _Exceptions.TimeoutException('The function call took too long to respond (more than ' + _this.constructor.options.invokeTimeout / 1000 + ' seconds).', {
            functionModule: functionModule
          }, _this));
        }, _this.constructor.options.invokeTimeout);
      });

      // Whoever finishes first wins the race
      return Promise.race([invokePromise, timeoutPromise]).then(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 1),
            result = _ref2[0];

        // Release resource
        _this.release(_this);

        // Add performance information
        return Promise.all([result, {
          invokeTime: new Date() - startTime,
          connectTime: _this.numberOfInvokes === 1 ? _this.connectTime : 0
        }]);
      }).catch(function (error) {
        // Release resource
        _this.release(_this);

        // Pass on error
        throw error;
      });
    }
  }], [{
    key: 'connect',
    value: function connect(configuration, release, logger) {
      var _this2 = this;

      var nodeRFC = new this.NodeRFC((0, _utils.removeUndefinedValues)({
        ashost: configuration.applicationServer,
        sysnr: (0, _utils.pad)(configuration.instanceNumber, 2, '0'),
        client: (0, _utils.pad)(configuration.client, 3, '0'),
        saprouter: configuration.router,
        user: configuration.username,
        passwd: configuration.password,
        MYSAPSSO2: configuration.mysapsso2,
        trace: '0'
      }));
      var connect = nodeRFC.connect;
      var startTime = new Date();

      // Connect to system
      var connectPromise = (0, _utils.promisify)(connect, nodeRFC).apply(nodeRFC).then(function () {
        // Create client
        var client = new Client(nodeRFC, release);
        client.logger = logger;
        client.connectTime = new Date() - startTime;
        return client;
      }).catch(function (error) {
        throw _Exceptions.LogonException.parse(error, Object.assign({}, configuration, { password: '********' }));
      });

      // Prevent that a RFC runs forever
      var timeoutPromise = new Promise(function (resolve, reject) {
        setTimeout(function () {
          reject(new _Exceptions.TimeoutException('The system took too long to respond (more than ' + _this2.options.connectTimeout / 1000 + ' seconds).', Object.assign({}, configuration, { password: '********' })));
        }, _this2.options.connectTimeout);
      });

      // Whoever finishes first wins the race
      return Promise.race([connectPromise, timeoutPromise]);
    }
  }]);

  return Client;
}(), _class.options = {
  connectTimeout: 5 * 1000,
  invokeTimeout: 30 * 1000 }, _temp));

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("joi");

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Pool = exports.Server = exports.Configuration = exports.Client = undefined;

var _Client2 = __webpack_require__(3);

var _Client3 = _interopRequireDefault(_Client2);

var _Configuration2 = __webpack_require__(7);

var _Configuration3 = _interopRequireDefault(_Configuration2);

var _Pool2 = __webpack_require__(2);

var _Pool3 = _interopRequireDefault(_Pool2);

var _Server2 = __webpack_require__(8);

var _Server3 = _interopRequireDefault(_Server2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var r3connect = {
  Client: _Client3.default,
  Configuration: _Configuration3.default,
  Pool: _Pool3.default,
  Server: _Server3.default
};

exports.default = r3connect;
var Client = exports.Client = _Client3.default;
var Configuration = exports.Configuration = _Configuration3.default;
var Server = exports.Server = _Server3.default;
var Pool = exports.Pool = _Pool3.default;
module.exports = r3connect;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _joi = __webpack_require__(4);

var _joi2 = _interopRequireDefault(_joi);

var _utils = __webpack_require__(0);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

exports.default = (0, _utils.makeLoggable)(function () {
  function Configuration(config, fallbackConfig) {
    _classCallCheck(this, Configuration);

    this.config = null;
    this.fallbackConfig = null;

    this.fallbackConfig = fallbackConfig;
    this.set(config);
  }

  _createClass(Configuration, [{
    key: 'set',
    value: function set(content) {
      if (!content) {
        this.log('error', 'The configuration provided is empty and hence the standard configuration file will be used.');
        this.config = this.fallbackConfig;
      } else {
        var config = null;

        // Content could be an extension or a config
        if (typeof content === 'function') {
          config = content(this.fallbackConfig);
        } else {
          config = content;
        }

        // Validate configuration against the defined schema
        try {
          Configuration.validate(config);
          this.log('debug', 'Successfully reloaded configuration.');
          this.config = config;
        } catch (error) {
          this.log('error', 'Unfortunately the new configuration does not follow the allowed schema and thus the old configuration wil be kept. The error was: ' + error.message);
          this.config = this.config || this.fallbackConfig;
        }
      }
    }
  }, {
    key: 'get',
    value: function get(path) {
      var value = (0, _utils.findByPath)(this.config, path);

      // Take value from fallback configuration if it was not found
      if (value === undefined) {
        value = (0, _utils.findByPath)(this.fallbackConfig, path);
      } else if ((0, _utils.isFunction)(value)) {
        // Allow extensibility by calling the function with the fallback value
        var fallbackValue = (0, _utils.findByPath)(this.fallbackConfig, path);
        value = value(fallbackValue);
      }

      if (value === undefined) {
        this.log('error', 'The requested configuration for path "' + path + '" does not exist.');
      }

      return value;
    }
  }], [{
    key: 'validate',
    value: function validate(config) {
      var schema = _joi2.default.object().keys({
        server: _joi2.default.object().keys({
          host: _joi2.default.string(),
          port: _joi2.default.number().min(1),
          routes: _joi2.default.object().keys({
            cors: _joi2.default.boolean()
          }),
          tls: _joi2.default.object().keys({
            key: _joi2.default.binary(),
            cert: _joi2.default.binary()
          })
        }),
        logs: _joi2.default.object().keys({
          tags: _joi2.default.array().items(_joi2.default.string())
        }),
        connections: _joi2.default.object().pattern(/\w+/, _joi2.default.object().keys({
          username: _joi2.default.string().token().max(12).allow('').allow(null),
          password: _joi2.default.string().max(40).allow('').allow(null),
          applicationServer: _joi2.default.string().allow('').allow(null),
          instanceNumber: _joi2.default.number().integer().min(0).max(99),
          client: _joi2.default.number().integer().min(0).max(999),
          router: _joi2.default.string().allow('').allow(null),
          functionModules: _joi2.default.object().keys({
            whitelist: _joi2.default.array().items(_joi2.default.string()),
            blacklist: _joi2.default.array().items(_joi2.default.string())
          })
        }))
      });
      var result = _joi2.default.validate(config, schema);

      // Provide details about the failed validation
      if (result.error) {
        throw result.error;
      }

      return true;
    }
  }]);

  return Configuration;
}());

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         r3connect
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         Copyright (C) 2017 Julian Hundeloh
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         This program is free software: you can redistribute it and/or modify
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         it under the terms of the GNU Affero General Public License as published
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         by the Free Software Foundation, either version 3 of the License, or
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         (at your option) any later version.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         This program is distributed in the hope that it will be useful,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         but WITHOUT ANY WARRANTY; without even the implied warranty of
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         GNU Affero General Public License for more details.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         You should have received a copy of the GNU Affero General Public License
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         along with this program.  If not, see <http://www.gnu.org/licenses/>.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     */

__webpack_require__(11);

var _hapi = __webpack_require__(16);

var _hapi2 = _interopRequireDefault(_hapi);

var _good = __webpack_require__(15);

var _good2 = _interopRequireDefault(_good);

var _hapiBoomDecorators = __webpack_require__(17);

var _hapiBoomDecorators2 = _interopRequireDefault(_hapiBoomDecorators);

var _Exceptions = __webpack_require__(1);

var _Pool = __webpack_require__(2);

var _Pool2 = _interopRequireDefault(_Pool);

var _routes = __webpack_require__(9);

var _routes2 = _interopRequireDefault(_routes);

var _utils = __webpack_require__(0);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Server = function () {
  function Server(config) {
    _classCallCheck(this, Server);

    this.server = null;
    this.config = null;

    this.config = config;
    this.server = this.createServer();
  }

  _createClass(Server, [{
    key: 'createServer',
    value: function createServer() {
      // Create server
      var server = new _hapi2.default.Server({
        debug: {
          request: ['error',  false ? 'debug' : null].filter(Boolean)
        }
      });
      server.connection(this.config.get('server'));

      // Add routes
      _routes2.default.forEach(function (route) {
        return server.route(route);
      });

      return server;
    }
  }, {
    key: 'start',
    value: function start() {
      var _this = this;

      // Register plugins and start the server
      return (0, _utils.promisify)(this.server.register, this.server)([{
        register: _good2.default,
        options: {
          ops: {
            interval: 30000
          },
          reporters: {
            console: [{
              module: 'good-squeeze',
              name: 'Squeeze',
              args: [{
                request: this.config.get('logs.tags'),
                log: this.config.get('logs.tags'),
                ops: '*'
              }]
            }, {
              module: 'good-console'
            }, 'stdout'],
            file: [{
              module: 'good-squeeze',
              name: 'Squeeze',
              args: [{
                log: this.config.get('logs.tags'),
                ops: '*'
              }]
            }, {
              module: 'good-squeeze',
              name: 'SafeJson'
            }, {
              module: 'good-file',
              args: ['./logs/log']
            }]
          }
        }
      }, {
        register: _hapiBoomDecorators2.default
      }]).then(function () {
        // Error handling
        _this.server.decorate('reply', 'error', function replyWithError(error) {
          if (error instanceof _Exceptions.HttpException) {
            var data = Object.assign({
              code: error.code
            }, error.context);
            this.boom(error.statusCode, error.message, data);
          } else {
            this(error);
          }
        });
        _this.server.ext('onPreResponse', function (request, reply) {
          var response = request.response;

          if (!response.isBoom) {
            reply.continue();
          } else {
            // Output details of errors
            response.output.payload.data = response.data ? response.data : undefined;
            request.log(['error'], response);
            reply(response);
          }
        });

        // Provide configuration in requests
        _this.server.decorate('request', 'config', _this.config);

        // Start server
        return (0, _utils.promisify)(_this.server.start, _this.server)();
      }).then(function () {
        // Set loggers
        _this.config.logger = _this.server.log.bind(_this.server);
        _Pool2.default.logger = _this.server.log.bind(_this.server);

        // Let's go
        _this.server.log(['debug'], 'Server running at: ' + _this.server.info.uri);
      });
    }
  }]);

  return Server;
}();

exports.default = Server;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _rfc = __webpack_require__(10);

var _rfc2 = _interopRequireDefault(_rfc);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _rfc2.default; /*
                                     r3connect
                                     Copyright (C) 2017 Julian Hundeloh
                                 
                                     This program is free software: you can redistribute it and/or modify
                                     it under the terms of the GNU Affero General Public License as published
                                     by the Free Software Foundation, either version 3 of the License, or
                                     (at your option) any later version.
                                 
                                     This program is distributed in the hope that it will be useful,
                                     but WITHOUT ANY WARRANTY; without even the implied warranty of
                                     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
                                     GNU Affero General Public License for more details.
                                 
                                     You should have received a copy of the GNU Affero General Public License
                                     along with this program.  If not, see <http://www.gnu.org/licenses/>.
                                 */

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             r3connect
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             Copyright (C) 2017 Julian Hundeloh
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             This program is free software: you can redistribute it and/or modify
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             it under the terms of the GNU Affero General Public License as published
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             by the Free Software Foundation, either version 3 of the License, or
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             (at your option) any later version.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             This program is distributed in the hope that it will be useful,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             but WITHOUT ANY WARRANTY; without even the implied warranty of
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             GNU Affero General Public License for more details.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             You should have received a copy of the GNU Affero General Public License
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             along with this program.  If not, see <http://www.gnu.org/licenses/>.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         */

var _joi = __webpack_require__(4);

var _joi2 = _interopRequireDefault(_joi);

var _Pool = __webpack_require__(2);

var _Pool2 = _interopRequireDefault(_Pool);

var _Exceptions = __webpack_require__(1);

var _utils = __webpack_require__(0);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = [
// Invoke RFC
{
  method: 'POST',
  path: '/rfc/{functionModule}',
  config: {
    description: 'Invoke RFC',
    notes: 'Invokes a function module in the back-end',
    tags: ['api'],
    validate: {
      params: {
        functionModule: _joi2.default.string().regex(/^[0-9a-zA-Z/_]+$/)
      },

      payload: {
        connection: _joi2.default.string().token().optional().example('XYZ'),
        username: _joi2.default.string().token().max(12).optional().example('DDIC'),
        password: _joi2.default.string().max(40).optional().example('11920706'),
        applicationServer: _joi2.default.string().required().example('gateway.example.corp'),
        instanceNumber: _joi2.default.number().integer().min(0).max(99).required().example(1),
        client: _joi2.default.number().integer().min(0).max(999).required().example(100),
        router: _joi2.default.string().default('').allow(''),
        mysapsso2: _joi2.default.string().default('').allow(''),
        parameters: _joi2.default.object().default({}).example(JSON.stringify({
          iv_input: 'example'
        }))
      }
    }
  },
  handler: function handler(request, reply) {
    var functionModule = request.params.functionModule;

    // Get configuration for connection (also if the passed connection is undefined)
    var connections = request.config.get('connections');
    var connection = connections[request.payload.connection];

    // Proceed only if the provided connection exists
    if (request.payload.connection && !connection) {
      return reply.error(new _Exceptions.HttpException('The connection you provided is invalid.'));
    }

    // Check if the function module is black/white listed
    var whitelisted = (0, _utils.isListed)(connection.functionModules.whitelist, functionModule);
    if (!whitelisted) {
      var blacklisted = (0, _utils.isListed)(connection.functionModules.blacklist, functionModule);
      if (blacklisted) {
        return reply.error(new _Exceptions.HttpException('The function module "' + functionModule + '" is blacklisted.'));
      }
    }

    // Create configuration
    var configuration = {
      applicationServer: connection.applicationServer || request.payload.applicationServer,
      instanceNumber: connection.instanceNumber || request.payload.instanceNumber,
      client: connection.client || request.payload.client,
      router: connection.router || request.payload.router

      // Add credentials (either SSO2 cookie or user/password)
    };if (request.payload.mysapsso2 || request.state.MYSAPSSO2) {
      // Use connection.MYSAPSSO2 because it will allow to disable cookies via configuration (via mysapsso2 = null)
      configuration.mysapsso2 = connection.mysapsso2 || request.payload.mysapsso2 || request.state.MYSAPSSO2;
    } else {
      configuration.username = connection.username || request.payload.username;
      configuration.password = connection.password || request.payload.password;
    }

    // Acquire connection from pool and invoke RFC
    var parameters = request.payload.parameters;
    _Pool2.default.get(configuration, request.log.bind(request)).acquire().then(function (client) {
      return client.invoke(functionModule, parameters);
    }).then(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          result = _ref2[0],
          meta = _ref2[1];

      // Reply with result but as well metadata that was gathered
      reply({
        result: result,
        meta: meta
      });
    }).catch(function (error) {
      reply.error(error);
    });

    return null;
  }
}];

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(12).install();


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

var SourceMapConsumer = __webpack_require__(22).SourceMapConsumer;
var path = __webpack_require__(5);

var fs;
try {
  fs = __webpack_require__(14);
  if (!fs.existsSync || !fs.readFileSync) {
    // fs doesn't have all methods we need
    fs = null;
  }
} catch (err) {
  /* nop */
}

// Only install once if called multiple times
var errorFormatterInstalled = false;
var uncaughtShimInstalled = false;

// If true, the caches are reset before a stack trace formatting operation
var emptyCacheBetweenOperations = false;

// Supports {browser, node, auto}
var environment = "auto";

// Maps a file path to a string containing the file contents
var fileContentsCache = {};

// Maps a file path to a source map for that file
var sourceMapCache = {};

// Regex for detecting source maps
var reSourceMap = /^data:application\/json[^,]+base64,/;

// Priority list of retrieve handlers
var retrieveFileHandlers = [];
var retrieveMapHandlers = [];

function isInBrowser() {
  if (environment === "browser")
    return true;
  if (environment === "node")
    return false;
  return ((typeof window !== 'undefined') && (typeof XMLHttpRequest === 'function') && !(window.require && window.module && window.process && window.process.type === "renderer"));
}

function hasGlobalProcessEventEmitter() {
  return ((typeof process === 'object') && (process !== null) && (typeof process.on === 'function'));
}

function handlerExec(list) {
  return function(arg) {
    for (var i = 0; i < list.length; i++) {
      var ret = list[i](arg);
      if (ret) {
        return ret;
      }
    }
    return null;
  };
}

var retrieveFile = handlerExec(retrieveFileHandlers);

retrieveFileHandlers.push(function(path) {
  // Trim the path to make sure there is no extra whitespace.
  path = path.trim();
  if (path in fileContentsCache) {
    return fileContentsCache[path];
  }

  var contents = null;
  if (!fs) {
    // Use SJAX if we are in the browser
    var xhr = new XMLHttpRequest();
    xhr.open('GET', path, false);
    xhr.send(null);
    var contents = null
    if (xhr.readyState === 4 && xhr.status === 200) {
      contents = xhr.responseText
    }
  } else if (fs.existsSync(path)) {
    // Otherwise, use the filesystem
    contents = fs.readFileSync(path, 'utf8');
  }

  return fileContentsCache[path] = contents;
});

// Support URLs relative to a directory, but be careful about a protocol prefix
// in case we are in the browser (i.e. directories may start with "http://")
function supportRelativeURL(file, url) {
  if (!file) return url;
  var dir = path.dirname(file);
  var match = /^\w+:\/\/[^\/]*/.exec(dir);
  var protocol = match ? match[0] : '';
  return protocol + path.resolve(dir.slice(protocol.length), url);
}

function retrieveSourceMapURL(source) {
  var fileData;

  if (isInBrowser()) {
     try {
       var xhr = new XMLHttpRequest();
       xhr.open('GET', source, false);
       xhr.send(null);
       fileData = xhr.readyState === 4 ? xhr.responseText : null;

       // Support providing a sourceMappingURL via the SourceMap header
       var sourceMapHeader = xhr.getResponseHeader("SourceMap") ||
                             xhr.getResponseHeader("X-SourceMap");
       if (sourceMapHeader) {
         return sourceMapHeader;
       }
     } catch (e) {
     }
  }

  // Get the URL of the source map
  fileData = retrieveFile(source);
  var re = /(?:\/\/[@#][ \t]+sourceMappingURL=([^\s'"]+?)[ \t]*$)|(?:\/\*[@#][ \t]+sourceMappingURL=([^\*]+?)[ \t]*(?:\*\/)[ \t]*$)/mg;
  // Keep executing the search to find the *last* sourceMappingURL to avoid
  // picking up sourceMappingURLs from comments, strings, etc.
  var lastMatch, match;
  while (match = re.exec(fileData)) lastMatch = match;
  if (!lastMatch) return null;
  return lastMatch[1];
};

// Can be overridden by the retrieveSourceMap option to install. Takes a
// generated source filename; returns a {map, optional url} object, or null if
// there is no source map.  The map field may be either a string or the parsed
// JSON object (ie, it must be a valid argument to the SourceMapConsumer
// constructor).
var retrieveSourceMap = handlerExec(retrieveMapHandlers);
retrieveMapHandlers.push(function(source) {
  var sourceMappingURL = retrieveSourceMapURL(source);
  if (!sourceMappingURL) return null;

  // Read the contents of the source map
  var sourceMapData;
  if (reSourceMap.test(sourceMappingURL)) {
    // Support source map URL as a data url
    var rawData = sourceMappingURL.slice(sourceMappingURL.indexOf(',') + 1);
    sourceMapData = new Buffer(rawData, "base64").toString();
    sourceMappingURL = source;
  } else {
    // Support source map URLs relative to the source URL
    sourceMappingURL = supportRelativeURL(source, sourceMappingURL);
    sourceMapData = retrieveFile(sourceMappingURL);
  }

  if (!sourceMapData) {
    return null;
  }

  return {
    url: sourceMappingURL,
    map: sourceMapData
  };
});

function mapSourcePosition(position) {
  var sourceMap = sourceMapCache[position.source];
  if (!sourceMap) {
    // Call the (overrideable) retrieveSourceMap function to get the source map.
    var urlAndMap = retrieveSourceMap(position.source);
    if (urlAndMap) {
      sourceMap = sourceMapCache[position.source] = {
        url: urlAndMap.url,
        map: new SourceMapConsumer(urlAndMap.map)
      };

      // Load all sources stored inline with the source map into the file cache
      // to pretend like they are already loaded. They may not exist on disk.
      if (sourceMap.map.sourcesContent) {
        sourceMap.map.sources.forEach(function(source, i) {
          var contents = sourceMap.map.sourcesContent[i];
          if (contents) {
            var url = supportRelativeURL(sourceMap.url, source);
            fileContentsCache[url] = contents;
          }
        });
      }
    } else {
      sourceMap = sourceMapCache[position.source] = {
        url: null,
        map: null
      };
    }
  }

  // Resolve the source URL relative to the URL of the source map
  if (sourceMap && sourceMap.map) {
    var originalPosition = sourceMap.map.originalPositionFor(position);

    // Only return the original position if a matching line was found. If no
    // matching line is found then we return position instead, which will cause
    // the stack trace to print the path and line for the compiled file. It is
    // better to give a precise location in the compiled file than a vague
    // location in the original file.
    if (originalPosition.source !== null) {
      originalPosition.source = supportRelativeURL(
        sourceMap.url, originalPosition.source);
      return originalPosition;
    }
  }

  return position;
}

// Parses code generated by FormatEvalOrigin(), a function inside V8:
// https://code.google.com/p/v8/source/browse/trunk/src/messages.js
function mapEvalOrigin(origin) {
  // Most eval() calls are in this format
  var match = /^eval at ([^(]+) \((.+):(\d+):(\d+)\)$/.exec(origin);
  if (match) {
    var position = mapSourcePosition({
      source: match[2],
      line: +match[3],
      column: match[4] - 1
    });
    return 'eval at ' + match[1] + ' (' + position.source + ':' +
      position.line + ':' + (position.column + 1) + ')';
  }

  // Parse nested eval() calls using recursion
  match = /^eval at ([^(]+) \((.+)\)$/.exec(origin);
  if (match) {
    return 'eval at ' + match[1] + ' (' + mapEvalOrigin(match[2]) + ')';
  }

  // Make sure we still return useful information if we didn't find anything
  return origin;
}

// This is copied almost verbatim from the V8 source code at
// https://code.google.com/p/v8/source/browse/trunk/src/messages.js. The
// implementation of wrapCallSite() used to just forward to the actual source
// code of CallSite.prototype.toString but unfortunately a new release of V8
// did something to the prototype chain and broke the shim. The only fix I
// could find was copy/paste.
function CallSiteToString() {
  var fileName;
  var fileLocation = "";
  if (this.isNative()) {
    fileLocation = "native";
  } else {
    fileName = this.getScriptNameOrSourceURL();
    if (!fileName && this.isEval()) {
      fileLocation = this.getEvalOrigin();
      fileLocation += ", ";  // Expecting source position to follow.
    }

    if (fileName) {
      fileLocation += fileName;
    } else {
      // Source code does not originate from a file and is not native, but we
      // can still get the source position inside the source string, e.g. in
      // an eval string.
      fileLocation += "<anonymous>";
    }
    var lineNumber = this.getLineNumber();
    if (lineNumber != null) {
      fileLocation += ":" + lineNumber;
      var columnNumber = this.getColumnNumber();
      if (columnNumber) {
        fileLocation += ":" + columnNumber;
      }
    }
  }

  var line = "";
  var functionName = this.getFunctionName();
  var addSuffix = true;
  var isConstructor = this.isConstructor();
  var isMethodCall = !(this.isToplevel() || isConstructor);
  if (isMethodCall) {
    var typeName = this.getTypeName();
    // Fixes shim to be backward compatable with Node v0 to v4
    if (typeName === "[object Object]") {
      typeName = "null";
    }
    var methodName = this.getMethodName();
    if (functionName) {
      if (typeName && functionName.indexOf(typeName) != 0) {
        line += typeName + ".";
      }
      line += functionName;
      if (methodName && functionName.indexOf("." + methodName) != functionName.length - methodName.length - 1) {
        line += " [as " + methodName + "]";
      }
    } else {
      line += typeName + "." + (methodName || "<anonymous>");
    }
  } else if (isConstructor) {
    line += "new " + (functionName || "<anonymous>");
  } else if (functionName) {
    line += functionName;
  } else {
    line += fileLocation;
    addSuffix = false;
  }
  if (addSuffix) {
    line += " (" + fileLocation + ")";
  }
  return line;
}

function cloneCallSite(frame) {
  var object = {};
  Object.getOwnPropertyNames(Object.getPrototypeOf(frame)).forEach(function(name) {
    object[name] = /^(?:is|get)/.test(name) ? function() { return frame[name].call(frame); } : frame[name];
  });
  object.toString = CallSiteToString;
  return object;
}

function wrapCallSite(frame) {
  if(frame.isNative()) {
    return frame;
  }

  // Most call sites will return the source file from getFileName(), but code
  // passed to eval() ending in "//# sourceURL=..." will return the source file
  // from getScriptNameOrSourceURL() instead
  var source = frame.getFileName() || frame.getScriptNameOrSourceURL();
  if (source) {
    var line = frame.getLineNumber();
    var column = frame.getColumnNumber() - 1;

    // Fix position in Node where some (internal) code is prepended.
    // See https://github.com/evanw/node-source-map-support/issues/36
    if (line === 1 && !isInBrowser() && !frame.isEval()) {
      column -= 62;
    }

    var position = mapSourcePosition({
      source: source,
      line: line,
      column: column
    });
    frame = cloneCallSite(frame);
    frame.getFileName = function() { return position.source; };
    frame.getLineNumber = function() { return position.line; };
    frame.getColumnNumber = function() { return position.column + 1; };
    frame.getScriptNameOrSourceURL = function() { return position.source; };
    return frame;
  }

  // Code called using eval() needs special handling
  var origin = frame.isEval() && frame.getEvalOrigin();
  if (origin) {
    origin = mapEvalOrigin(origin);
    frame = cloneCallSite(frame);
    frame.getEvalOrigin = function() { return origin; };
    return frame;
  }

  // If we get here then we were unable to change the source position
  return frame;
}

// This function is part of the V8 stack trace API, for more info see:
// http://code.google.com/p/v8/wiki/JavaScriptStackTraceApi
function prepareStackTrace(error, stack) {
  if (emptyCacheBetweenOperations) {
    fileContentsCache = {};
    sourceMapCache = {};
  }

  return error + stack.map(function(frame) {
    return '\n    at ' + wrapCallSite(frame);
  }).join('');
}

// Generate position and snippet of original source with pointer
function getErrorSource(error) {
  var match = /\n    at [^(]+ \((.*):(\d+):(\d+)\)/.exec(error.stack);
  if (match) {
    var source = match[1];
    var line = +match[2];
    var column = +match[3];

    // Support the inline sourceContents inside the source map
    var contents = fileContentsCache[source];

    // Support files on disk
    if (!contents && fs && fs.existsSync(source)) {
      contents = fs.readFileSync(source, 'utf8');
    }

    // Format the line from the original source code like node does
    if (contents) {
      var code = contents.split(/(?:\r\n|\r|\n)/)[line - 1];
      if (code) {
        return source + ':' + line + '\n' + code + '\n' +
          new Array(column).join(' ') + '^';
      }
    }
  }
  return null;
}

function printErrorAndExit (error) {
  var source = getErrorSource(error);

  if (source) {
    console.error();
    console.error(source);
  }

  console.error(error.stack);
  process.exit(1);
}

function shimEmitUncaughtException () {
  var origEmit = process.emit;

  process.emit = function (type) {
    if (type === 'uncaughtException') {
      var hasStack = (arguments[1] && arguments[1].stack);
      var hasListeners = (this.listeners(type).length > 0);

      if (hasStack && !hasListeners) {
        return printErrorAndExit(arguments[1]);
      }
    }

    return origEmit.apply(this, arguments);
  };
}

exports.wrapCallSite = wrapCallSite;
exports.getErrorSource = getErrorSource;
exports.mapSourcePosition = mapSourcePosition;
exports.retrieveSourceMap = retrieveSourceMap;

exports.install = function(options) {
  options = options || {};

  if (options.environment) {
    environment = options.environment;
    if (["node", "browser", "auto"].indexOf(environment) === -1) {
      throw new Error("environment " + environment + " was unknown. Available options are {auto, browser, node}")
    }
  }

  // Allow sources to be found by methods other than reading the files
  // directly from disk.
  if (options.retrieveFile) {
    if (options.overrideRetrieveFile) {
      retrieveFileHandlers.length = 0;
    }

    retrieveFileHandlers.unshift(options.retrieveFile);
  }

  // Allow source maps to be found by methods other than reading the files
  // directly from disk.
  if (options.retrieveSourceMap) {
    if (options.overrideRetrieveSourceMap) {
      retrieveMapHandlers.length = 0;
    }

    retrieveMapHandlers.unshift(options.retrieveSourceMap);
  }

  // Support runtime transpilers that include inline source maps
  if (options.hookRequire && !isInBrowser()) {
    var Module;
    try {
      Module = __webpack_require__(18);
    } catch (err) {
      // NOP: Loading in catch block to convert webpack error to warning.
    }
    var $compile = Module.prototype._compile;

    if (!$compile.__sourceMapSupport) {
      Module.prototype._compile = function(content, filename) {
        fileContentsCache[filename] = content;
        sourceMapCache[filename] = undefined;
        return $compile.call(this, content, filename);
      };

      Module.prototype._compile.__sourceMapSupport = true;
    }
  }

  // Configure options
  if (!emptyCacheBetweenOperations) {
    emptyCacheBetweenOperations = 'emptyCacheBetweenOperations' in options ?
      options.emptyCacheBetweenOperations : false;
  }

  // Install the error reformatter
  if (!errorFormatterInstalled) {
    errorFormatterInstalled = true;
    Error.prepareStackTrace = prepareStackTrace;
  }

  if (!uncaughtShimInstalled) {
    var installHandler = 'handleUncaughtExceptions' in options ?
      options.handleUncaughtExceptions : true;

    // Provide the option to not install the uncaught exception handler. This is
    // to support other uncaught exception handlers (in test frameworks, for
    // example). If this handler is not installed and there are no other uncaught
    // exception handlers, uncaught exceptions will be caught by node's built-in
    // exception handler and the process will still be terminated. However, the
    // generated JavaScript code will be shown above the stack trace instead of
    // the original source code.
    if (installHandler && hasGlobalProcessEventEmitter()) {
      uncaughtShimInstalled = true;
      shimEmitUncaughtException();
    }
  }
};


/***/ }),
/* 13 */
/***/ (function(module, exports) {

module.exports = require("error-subclass");

/***/ }),
/* 14 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),
/* 15 */
/***/ (function(module, exports) {

module.exports = require("good");

/***/ }),
/* 16 */
/***/ (function(module, exports) {

module.exports = require("hapi");

/***/ }),
/* 17 */
/***/ (function(module, exports) {

module.exports = require("hapi-boom-decorators");

/***/ }),
/* 18 */
/***/ (function(module, exports) {

module.exports = require("module");

/***/ }),
/* 19 */
/***/ (function(module, exports) {

module.exports = require("node-rfc");

/***/ }),
/* 20 */
/***/ (function(module, exports) {

module.exports = require("object-hash");

/***/ }),
/* 21 */
/***/ (function(module, exports) {

module.exports = require("pool2");

/***/ }),
/* 22 */
/***/ (function(module, exports) {

module.exports = require("source-map");

/***/ }),
/* 23 */
/***/ (function(module, exports) {

module.exports = {"name":"r3connect","version":"1.1.0","author":"Julian Hundeloh","email":"julian@hundeloh-consulting.ch","license":"AGPL-3.0+","description":"r3connect is a lean wrapper of node-rfc that provides comfortable access to SAP back-ends via a simple REST API.","engines":{"node":">=6.0.0"},"main":"./build/index.js","bin":{"r3connect":"./cli.js"},"scripts":{"cli":"better-npm-run cli","build":"better-npm-run build","dev":"better-npm-run dev","test":"better-npm-run test","format":"better-npm-run format","lint":"better-npm-run lint","precommit":"npm run test && npm run format && npm run lint && npm run build && git add build","commitmsg":"validate-commit-msg","postmerge":"npm install","postrewrite":"npm install"},"betterScripts":{"cli":{"command":"node ./build/cli.js"},"build":{"command":"rimraf ./build && webpack --progress --colors","env":{"NODE_ENV":"production"}},"dev":{"command":"babel-watch ./src/cli.js --inspect --source-maps","env":{"NODE_ENV":"development"}},"test":{"command":"mocha --compilers js:babel-register --require babel-polyfill ./src/**/*.spec.js","env":{"NODE_ENV":"development"}},"format":{"command":"prettier src/**/*.js --single-quote --trailing-comma all --no-semi --write","env":{"NODE_ENV":"production"}},"lint":{"command":"eslint src/**/*.js","env":{"NODE_ENV":"production"}}},"lint-staged":{"*.js":["prettier","standard","git add"]},"config":{"validate-commit-msg":{"types":["feat","fix","docs","style","refactor","perf","test","chore","revert"],"helpMessage":"Types: feat, fix, docs, style, refactor, perf, test, chore, revert"}},"dependencies":{"better-npm-run":"0.0.15","chalk":"^2.0.1","colors.js":"^1.2.4","error-subclass":"^2.2.0","fs-extra":"^4.0.0","good":"^7.2.0","good-console":"^6.2.0","good-file":"^6.0.1","good-squeeze":"^5.0.1","hapi":"^16.4.3","hapi-boom-decorators":"^3.0.0","joi":"^10.5.2","object-hash":"^1.1.8","pool2":"^1.4.1","source-map-support":"^0.4.15","update-notifier":"^2.2.0"},"peerDependencies":{"node-rfc":"^0.1.11"},"devDependencies":{"babel-core":"^6.25.0","babel-eslint":"^7.2.3","babel-loader":"^7.0.0","babel-plugin-syntax-flow":"^6.18.0","babel-plugin-transform-class-properties":"^6.24.1","babel-plugin-transform-flow-strip-types":"^6.18.0","babel-plugin-typecheck":"^3.9.0","babel-polyfill":"^6.23.0","babel-preset-env":"^1.6.0","babel-register":"^6.24.1","babel-watch":"^2.0.7","chai":"^4.0.2","eslint":"^4.3.0","eslint-plugin-flowtype":"^2.35.0","eslint-plugin-prettier":"^2.1.2","husky":"^0.13.4","json-loader":"^0.5.4","lint-staged":"^3.6.1","mocha":"^3.4.2","prettier":"^1.5.3","rimraf":"^2.5.4","validate-commit-msg":"^2.12.2","webpack":"^2.6.1"}}

/***/ }),
/* 24 */
/***/ (function(module, exports) {

module.exports = require("chalk");

/***/ }),
/* 25 */
/***/ (function(module, exports) {

module.exports = require("child_process");

/***/ }),
/* 26 */
/***/ (function(module, exports) {

module.exports = require("fs-extra");

/***/ }),
/* 27 */
/***/ (function(module, exports) {

module.exports = require("os");

/***/ }),
/* 28 */
/***/ (function(module, exports) {

module.exports = require("update-notifier");

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _os = __webpack_require__(27);

var _os2 = _interopRequireDefault(_os);

var _path = __webpack_require__(5);

var _path2 = _interopRequireDefault(_path);

var _child_process = __webpack_require__(25);

var _child_process2 = _interopRequireDefault(_child_process);

var _chalk = __webpack_require__(24);

var _chalk2 = _interopRequireDefault(_chalk);

var _fsExtra = __webpack_require__(26);

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _updateNotifier = __webpack_require__(28);

var _updateNotifier2 = _interopRequireDefault(_updateNotifier);

var _package = __webpack_require__(23);

var _package2 = _interopRequireDefault(_package);

var _index = __webpack_require__(6);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
    r3connect
    Copyright (C) 2017 Julian Hundeloh

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

exports.default = function (requirex) {
  // Set color theme
  var logger = {
    log: console.log,
    success: function success(text) {
      return logger.log(_chalk2.default.bold.green(text));
    },
    info: function info(text) {
      return logger.log(_chalk2.default.blue(text));
    },
    error: function error(text) {
      return logger.log(_chalk2.default.bold.red(text));
    },
    warn: function warn(text) {
      return logger.log(_chalk2.default.yellow(text));
    }

    // Helper function to load configuration from project folder
  };var pathToFallbackConfig = _path2.default.join(__dirname, '..', 'config.js');
  var pathToConfig = _path2.default.join(process.cwd(), 'config.js');
  var config = null;
  function loadConfig(file) {
    var loadedConfig = null;
    try {
      var content = _fsExtra2.default.readFileSync(file, 'utf8');
      loadedConfig = eval(content);
    } catch (error) {
      loadedConfig = null;
    }
    return loadedConfig;
  }

  // Welcome
  logger.log('\n      ____                                  _   \n      |___                                 | |  \n  _ __ __) | ___ ___  _ __  _ __   ___  ___| |_ \n  | \'__|__ < / __/ _ | \'_ | \'_  / _ / __| __|\n  | |  ___) | (_| (_) | | | | | | |  __/ (__| |_ \n  |_| |____/ ______/|_| |_|_| |_|___|___|__|\n  ');

  // Check for updates
  (0, _updateNotifier2.default)({ pkg: _package2.default }).notify();

  // Get package
  var project = null;
  try {
    project = JSON.parse(_fsExtra2.default.readFileSync(_path2.default.join(process.cwd(), 'package.json')));
  } catch (error) {
    logger.error('Please initiate this project as an npm package first by running "npm init".');
    process.exit(0);
  }

  // Handle different commands
  var command = process.argv[2];
  switch (command) {
    case 'welcome':
      {
        logger.success('r3connect was successfully installed. Congratulations!');

        break;
      }

    case 'init':
      {
        // Ensure that we do not override an existing configuration
        var configAlreadyExists = null;
        try {
          _fsExtra2.default.statSync(pathToConfig);
          configAlreadyExists = true;
        } catch (error) {
          configAlreadyExists = false;
        }

        if (configAlreadyExists) {
          logger.error('It seems that there is already a configuration present ("' + pathToConfig + '"). Delete it before you try to initialize the project.');
          process.exit(0);
        } else {
          // Copy skeleton to project folder
          Promise.all([_fsExtra2.default.copy(_path2.default.join(__dirname, '..', 'vendor'), _path2.default.join(process.cwd(), 'vendor')), _fsExtra2.default.copy(_path2.default.join(__dirname, '..', 'tls'), _path2.default.join(process.cwd(), 'tls')), _fsExtra2.default.copy(_path2.default.join(__dirname, '..', 'Dockerfile'), _path2.default.join(process.cwd(), 'Dockerfile')), _fsExtra2.default.copy(_path2.default.join(__dirname, '..', 'config.js'), _path2.default.join(process.cwd(), 'config.js'))]).then(function () {
            logger.success('We initialized your project folder and you can start changing the configuration. Once you think you are ready, run "r3connect server" or "r3connect docker".');
          }).catch(function () {
            logger.error('We tried to initialize your project folder but for some reason it failed. Please check the permissions of the folder.');
          });
        }

        break;
      }

    case 'server':
    case 'docker':
      {
        // Configuration must be loaded both for Server and for Docker
        try {
          _fsExtra2.default.statSync(pathToConfig);
        } catch (error) {
          logger.error('We could not find a "config.js" file. Please ensure that you run "r3connect init" before you go on.');
          process.exit(0);
        }
        config = new _index.Configuration(loadConfig(pathToConfig), loadConfig(pathToFallbackConfig));

        // Now differentiate between Server and Docker
        switch (command) {
          case 'server':
            {
              // Check if node-rfc is installed and assign to client for later usage
              try {
                var NodeRFC = requirex(_path2.default.join(process.cwd(), 'node_modules', 'node-rfc'));
                Object.defineProperty(_index.Client, 'NodeRFC', {
                  get: function get() {
                    return NodeRFC.Client;
                  }
                });
              } catch (error) {
                var target = _path2.default.join(process.cwd(), 'vendor', 'nwrfcsdk');
                var targetLib = _path2.default.join(target, 'lib');

                logger.error('For some reason "node-rfc" could not be loaded.');
                logger.info('Please make sure that you download the SAP NW RFC Library from the SAP Service Marketplace and follow these steps:');
                logger.log('1. Unpack the downloaded archive to "' + target + '".');
                logger.log('2. Make sure that the directory "' + targetLib + '" exists.');
                switch (_os2.default.platform()) {
                  case 'win32':
                    {
                      logger.log('3. Add "' + targetLib + '" to the PATH environment variable via the following command:');
                      logger.log('   SET PATH=%PATH%;' + targetLib + ';');
                      logger.log('4. Run "npm install node-rfc --save" in the current project folder.');

                      break;
                    }

                  case 'darwin':
                  case 'linux':
                    {
                      logger.log('3. As root, create a file "/etc/ld.so.conf.d/nwrfcsdk.conf" and add the following content:');
                      logger.log('   # include nwrfcsdk');
                      logger.log('   ' + targetLib);
                      logger.log('4. As root, run the command "ldconfig".');
                      logger.log('5. Run "npm install node-rfc --save" in the current project folder.');

                      break;
                    }

                  default:
                    {
                      // Should not be reached
                    }
                }

                process.exit(0);
              }

              // Start server with configuration
              var server = new _index.Server(config);
              server.start();

              // Update configuration in server if the file changes
              _fsExtra2.default.watch(pathToConfig, function () {
                return config.set(loadConfig(pathToConfig));
              });

              break;
            }

          case 'docker':
            {
              var port = config.get('server.port');

              // Build docker container
              var spawn = _child_process2.default.spawn;
              var docker = spawn('docker', ['build', '--build-arg R3CONNECT_PORT=' + port, '-t', project.name, '.']);

              // Once it is ready
              docker.on('close', function (code) {
                if (code === 0) {
                  logger.success('The Docker container was successfully built. Start the container by running "docker run -it -p ' + port + ':' + port + ' ' + project.name + '".');
                }
              });

              // Or it failed?
              docker.on('error', function () {
                logger.error('There was an issue while building the Docker container. Please install Docker first and check the Docker logs in order to solve the issue.');
              });

              break;
            }

          default:
            {
              // Should not be reached
            }
        }

        break;
      }

    default:
      {
        logger.info('Please use any of the following commands:');
        logger.log('r3connect init');
        logger.log('r3connect server');
        logger.log('r3connect docker');
      }
  }
};

/***/ })
/******/ ]);
//# sourceMappingURL=cli.js.map