webpackJsonp([3],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _dec, _class, _desc, _value, _class2;

	var _react = __webpack_require__(122);

	var _react2 = _interopRequireDefault(_react);

	var _reactRouter = __webpack_require__(298);

	var _reactCssModules = __webpack_require__(354);

	var _reactCssModules2 = _interopRequireDefault(_reactCssModules);

	var _autobindDecorator = __webpack_require__(513);

	var _autobindDecorator2 = _interopRequireDefault(_autobindDecorator);

	var _moment = __webpack_require__(525);

	var _moment2 = _interopRequireDefault(_moment);

	var _Utils = __webpack_require__(520);

	var _Utils2 = _interopRequireDefault(_Utils);

	__webpack_require__(114);

	var _userContent = __webpack_require__(661);

	var _userContent2 = _interopRequireDefault(_userContent);

	var _electron = __webpack_require__(648);

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

	var UserContent = (_dec = (0, _reactCssModules2.default)(_userContent2.default), _dec(_class = (_class2 = function (_Component) {
	    _inherits(UserContent, _Component);

	    function UserContent(props) {
	        _classCallCheck(this, UserContent);

	        var _this = _possibleConstructorReturn(this, (UserContent.__proto__ || Object.getPrototypeOf(UserContent)).call(this, props));

	        var userInfo = _Utils2.default.session.has('userInfo') ? _Utils2.default.session.get('userInfo') : {};

	        _this.state = {
	            statistics: userInfo.statistics || {},
	            trainings: userInfo.trainings || {},
	            user: userInfo.user || {}
	        };
	        return _this;
	    }

	    _createClass(UserContent, [{
	        key: 'componentWillMount',
	        value: function componentWillMount() {
	            var _this2 = this;

	            // 每次获得焦点时判断数据是否有更新
	            _electron.remote.getCurrentWindow().on('focus', function (e) {
	                var userInfo = _Utils2.default.session.get('userInfo') || {};
	                if (userInfo.user && userInfo.user._id !== _this2.state.user._id) {
	                    _this2.setState({
	                        statistics: userInfo.statistics,
	                        trainings: userInfo.trainings,
	                        user: userInfo.user
	                    });
	                }
	            });
	        }
	    }, {
	        key: 'render',
	        value: function render() {
	            return _react2.default.createElement(
	                'div',
	                { styleName: 'user-container' },
	                _react2.default.createElement(
	                    'section',
	                    { styleName: 'user-back' },
	                    _react2.default.createElement('div', { styleName: 'back-cover', style: { backgroundImage: 'url(' + this.state.user.avatar + ')' } }),
	                    _react2.default.createElement('img', { styleName: 'user-avatar', src: this.state.user.avatar, alt: '' })
	                )
	            );
	        }
	    }]);

	    return UserContent;
	}(_react.Component), (_applyDecoratedDescriptor(_class2.prototype, 'componentWillMount', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'componentWillMount'), _class2.prototype)), _class2)) || _class);


	var container = document.createElement('div');
	container.id = 'container';
	container.className = 'container';
	document.querySelector('body').appendChild(container);

	ReactDOM.render(_react2.default.createElement(UserContent, null), document.getElementById('container'));
	;

	var _temp = function () {
	    if (typeof __REACT_HOT_LOADER__ === 'undefined') {
	        return;
	    }

	    __REACT_HOT_LOADER__.register(UserContent, 'UserContent', '/Users/liucong/Documents/Github/keepForMac/src/components/common/UserContent.js');

	    __REACT_HOT_LOADER__.register(container, 'container', '/Users/liucong/Documents/Github/keepForMac/src/components/common/UserContent.js');
	}();

	;

	 ;(function register() { /* react-hot-loader/webpack */ if ((undefined) !== 'production') { if (typeof __REACT_HOT_LOADER__ === 'undefined') { return; } if (typeof module.exports === 'function') { __REACT_HOT_LOADER__.register(module.exports, 'module.exports', "/Users/liucong/Documents/Github/keepForMac/src/components/common/UserContent.js"); return; } for (var key in module.exports) { if (!Object.prototype.hasOwnProperty.call(module.exports, key)) { continue; } var namedExport = void 0; try { namedExport = module.exports[key]; } catch (err) { continue; } __REACT_HOT_LOADER__.register(namedExport, key, "/Users/liucong/Documents/Github/keepForMac/src/components/common/UserContent.js"); } } })();

/***/ },

/***/ 661:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(662);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(121)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(true) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept(662, function() {
				var newContent = __webpack_require__(662);
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 662:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(116)();
	// imports


	// module
	exports.push([module.id, "._2iSfP {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%; }\n\n._2fJro {\n  width: 100%;\n  height: 120px;\n  background: #584f5f; }\n\n._25K5c {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  background: center/cover no-repeat;\n  transform: scale(1.01);\n  overflow: hidden;\n  filter: blur(5px); }\n\n.a0fr5 {\n  position: absolute;\n  top: -10px;\n  left: 50%;\n  width: 78px;\n  height: 78px;\n  margin-left: -39px;\n  border: 1px solid #fff;\n  box-shadow: 0 5px 8px rgba(0, 0, 0, 0.8); }\n", ""]);

	// exports
	exports.locals = {
		"user-container": "_2iSfP",
		"user-back": "_2fJro",
		"back-cover": "_25K5c",
		"user-avatar": "a0fr5"
	};

/***/ }

});