webpackJsonp([3],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _dec, _class, _desc, _value, _class2;

	var _react = __webpack_require__(122);

	var _react2 = _interopRequireDefault(_react);

	var _reactDom = __webpack_require__(152);

	var _reactDom2 = _interopRequireDefault(_reactDom);

	var _reactRouter = __webpack_require__(298);

	var _reactCssModules = __webpack_require__(355);

	var _reactCssModules2 = _interopRequireDefault(_reactCssModules);

	var _autobindDecorator = __webpack_require__(515);

	var _autobindDecorator2 = _interopRequireDefault(_autobindDecorator);

	var _moment = __webpack_require__(522);

	var _moment2 = _interopRequireDefault(_moment);

	var _Utils = __webpack_require__(521);

	var _Utils2 = _interopRequireDefault(_Utils);

	var _HttpRequest = __webpack_require__(520);

	var _HttpRequest2 = _interopRequireDefault(_HttpRequest);

	__webpack_require__(114);

	var _userContent = __webpack_require__(688);

	var _userContent2 = _interopRequireDefault(_userContent);

	var _electron = __webpack_require__(641);

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

	var UserContent = (_dec = (0, _reactCssModules2.default)(_userContent2.default, { allowMultiple: true }), _dec(_class = (_class2 = function (_Component) {
	    _inherits(UserContent, _Component);

	    function UserContent(props) {
	        _classCallCheck(this, UserContent);

	        var _this = _possibleConstructorReturn(this, (UserContent.__proto__ || Object.getPrototypeOf(UserContent)).call(this, props));

	        var userInfo = _Utils2.default.storage.has('userInfo') ? _Utils2.default.storage.get('userInfo') : {};

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

	            console.info(this.state);

	            //remote.getCurrentWindow().removeAllListeners()
	            console.info(_electron.remote.getCurrentWindow());
	            // 每次获得焦点时判断数据是否有更新
	            _electron.remote.getCurrentWindow().on('focus', function (e) {
	                var userInfo = _Utils2.default.storage.get('userInfo') || {};
	                if (userInfo.user && userInfo.user._id !== _this2.state.user._id) {
	                    _this2.setState({
	                        statistics: userInfo.statistics,
	                        trainings: userInfo.trainings,
	                        user: userInfo.user
	                    });
	                    //remote.getCurrentWindow().setTitle('keeper - '+ userInfo.user.username)
	                }
	            });
	        }
	    }, {
	        key: 'componentWillUnmount',
	        value: function componentWillUnmount() {
	            this.state = null;
	            _Utils2.default.storage.remove('userInfo');
	        }
	    }, {
	        key: 'getCityAddress',
	        value: function getCityAddress(cityCode) {
	            var city = _Utils2.default.storage.get('cityJson').filter(function (item) {
	                return cityCode == item.cityCode;
	            })[0];
	            return city ? city : { cityName: '银河,地球' };
	        }
	    }, {
	        key: 'handleFriend',
	        value: function handleFriend() {
	            var _this3 = this;

	            var updateState = _HttpRequest2.default.getUserData(this.state.user._id).then(function (res) {
	                if (res.ok) {
	                    _this3.setState({
	                        statistics: res.data.statistics,
	                        trainings: res.data.trainings,
	                        user: res.data.user
	                    });
	                }
	            });
	            if (this.state.user.relation) {
	                _HttpRequest2.default.removeUserFollow(this.state.user._id).then(updateState());
	            } else {
	                _HttpRequest2.default.addUserFollow(this.state.user._id).then(updateState());
	            }
	        }
	    }, {
	        key: 'render',
	        value: function render() {
	            var USER = this.state.user;
	            return _react2.default.createElement(
	                'div',
	                { styleName: 'user-container' },
	                _react2.default.createElement(
	                    'section',
	                    { styleName: 'user-back' },
	                    _react2.default.createElement('div', { styleName: USER.backgroundAvatar ? 'back-cover' : 'back-cover blur', style: { backgroundImage: 'url(' + (USER.backgroundAvatar ? USER.backgroundAvatar : USER.avatar) + '?imageMogr2/thumbnail/!300x300r)' } }),
	                    _react2.default.createElement(
	                        'div',
	                        { styleName: 'user-avatar' },
	                        _react2.default.createElement('img', { src: USER.avatar ? USER.avatar + '?imageMogr2/thumbnail/!200x200r' : '', alt: '' })
	                    ),
	                    _react2.default.createElement(
	                        'div',
	                        { styleName: 'user-info-content' },
	                        _react2.default.createElement(
	                            'p',
	                            { styleName: 'user-info-name' },
	                            _react2.default.createElement(
	                                'span',
	                                null,
	                                USER.username
	                            )
	                        ),
	                        _react2.default.createElement(
	                            'p',
	                            { styleName: 'user-info-desc' },
	                            _react2.default.createElement(
	                                'span',
	                                null,
	                                USER.bio || '这个人很懒，啥都没写~'
	                            )
	                        ),
	                        _react2.default.createElement(
	                            'p',
	                            { styleName: 'user-info-other' },
	                            _react2.default.createElement(
	                                'span',
	                                null,
	                                USER.birthday ? (0, _moment2.default)(new Date(USER.birthday)).format('YYYY-MM-DD') : '宇宙大爆炸时间'
	                            ),
	                            ' | ',
	                            _react2.default.createElement(
	                                'span',
	                                null,
	                                this.getCityAddress(USER.citycode || '').cityName
	                            )
	                        ),
	                        _react2.default.createElement(
	                            'p',
	                            { styleName: 'user-info-config' },
	                            this.state.statistics.follow + '\u5173\u6CE8',
	                            ' - ',
	                            this.state.statistics.followed + '\u7C89\u4E1D',
	                            ' - ',
	                            this.state.statistics.totalEntries + '\u4E2A\u52A8\u6001',
	                            ' - ',
	                            this.state.statistics.liked + '\u4EBA\u52A0\u6CB9'
	                        )
	                    )
	                ),
	                _react2.default.createElement(
	                    'section',
	                    { styleName: 'user-training' },
	                    _react2.default.createElement(
	                        'div',
	                        { styleName: 'user-training-line' },
	                        '\u7D2F\u8BA1\u8BAD\u7EC3 ',
	                        _react2.default.createElement(
	                            'div',
	                            { styleName: 'user-training-data' },
	                            this.state.trainings.totalDuration,
	                            ' \u5206\u949F'
	                        )
	                    ),
	                    _react2.default.createElement(
	                        'div',
	                        { styleName: 'user-training-line' },
	                        '\u8BAD\u7EC3\u6B21\u6570 ',
	                        _react2.default.createElement(
	                            'div',
	                            { styleName: 'user-training-data' },
	                            this.state.trainings.totalTraining,
	                            ' \u6B21'
	                        )
	                    ),
	                    _react2.default.createElement(
	                        'div',
	                        { styleName: 'user-training-line' },
	                        '\u8BAD\u7EC3\u5929\u6570 ',
	                        _react2.default.createElement(
	                            'div',
	                            { styleName: 'user-training-data' },
	                            this.state.trainings.totalTrainingDay,
	                            ' \u5929'
	                        )
	                    ),
	                    _react2.default.createElement(
	                        'div',
	                        { styleName: 'user-training-line' },
	                        '\u6700\u957F\u8FDE\u7EED ',
	                        _react2.default.createElement(
	                            'div',
	                            { styleName: 'user-training-data' },
	                            this.state.trainings.maxCombo,
	                            ' \u5929'
	                        )
	                    ),
	                    _react2.default.createElement(
	                        'div',
	                        { styleName: 'user-training-line' },
	                        '\u8FDE\u7EED\u8BAD\u7EC3 ',
	                        _react2.default.createElement(
	                            'div',
	                            { styleName: 'user-training-data' },
	                            this.state.trainings.currentCombo,
	                            ' \u5929'
	                        )
	                    ),
	                    _react2.default.createElement(
	                        'div',
	                        { styleName: 'user-training-line' },
	                        '\u7D2F\u8BA1\u6D88\u8017 ',
	                        _react2.default.createElement(
	                            'div',
	                            { styleName: 'user-training-data' },
	                            this.state.trainings.totalCalorie,
	                            ' \u5343\u5361'
	                        )
	                    ),
	                    _react2.default.createElement(
	                        'div',
	                        { styleName: 'both-line' },
	                        _react2.default.createElement(
	                            _reactRouter.Link,
	                            { to: '', styleName: 'line-btn' },
	                            '\u53BBTa\u4E3B\u9875(\u6682\u672A\u5F00\u53D1)'
	                        ),
	                        _react2.default.createElement(
	                            'button',
	                            { styleName: USER.relation ? 'follow-btn active' : 'follow-btn', onClick: this.handleFriend },
	                            _react2.default.createElement(
	                                'span',
	                                { styleName: 'sp-default' },
	                                !USER.relation ? '关注Ta' : USER.relation == 2 ? '已关注' : '相互关注'
	                            ),
	                            _react2.default.createElement(
	                                'span',
	                                { styleName: 'sp-hover' },
	                                !USER.relation ? '关注Ta' : '取消关注'
	                            )
	                        )
	                    )
	                )
	            );
	        }
	    }]);

	    return UserContent;
	}(_react.Component), (_applyDecoratedDescriptor(_class2.prototype, 'componentWillMount', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'componentWillMount'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'componentWillUnmount', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'componentWillUnmount'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'getCityAddress', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'getCityAddress'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'handleFriend', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'handleFriend'), _class2.prototype)), _class2)) || _class);


	var container = document.createElement('div');
	container.id = 'container';
	container.className = 'container';
	document.querySelector('body').appendChild(container);

	_reactDom2.default.render(_react2.default.createElement(UserContent, null), document.getElementById('container'));
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

/***/ 688:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(689);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(121)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(true) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept(689, function() {
				var newContent = __webpack_require__(689);
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 689:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(116)();
	// imports


	// module
	exports.push([module.id, "._2iSfP {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  display: flex;\n  flex-direction: column; }\n\n._2fJro {\n  width: 100%;\n  height: 260px;\n  background: #000;\n  padding: 20px 10px 0;\n  text-align: center;\n  position: relative;\n  -webkit-app-region: drag;\n  overflow: hidden; }\n\n._25K5c,\n.xR6HH {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  background: center/cover no-repeat;\n  transform: scale(1.01);\n  overflow: hidden; }\n\n._25K5c._1RPRB {\n  filter: blur(30px); }\n\n.xR6HH {\n  opacity: .45; }\n\n.a0fr5 {\n  position: relative;\n  margin: auto;\n  width: 78px;\n  height: 78px;\n  border: 1px solid #fff;\n  border-radius: 50%;\n  background: #584f5f;\n  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.8);\n  transition: all .35s;\n  overflow: hidden; }\n  .a0fr5:hover {\n    transform: scale(1.2);\n    border-color: #23A570; }\n  .a0fr5 img {\n    width: 100%;\n    height: 100%; }\n\n.Fpgzu {\n  padding: 15px 0;\n  text-align: center;\n  position: relative;\n  color: #fff; }\n  .Fpgzu p span {\n    padding: 0 6px;\n    -webkit-app-region: no-drag;\n    -webkit-user-select: auto; }\n\n._3seF1 {\n  font-size: 18px;\n  margin-bottom: 5px;\n  text-shadow: 0 0 2px rgba(0, 0, 0, 0.6), 0 0 2px rgba(0, 0, 0, 0.6); }\n\n._2iUvc {\n  font-size: 12px;\n  margin-bottom: 10px;\n  line-height: 15px;\n  max-height: 66px;\n  overflow: hidden;\n  text-shadow: 0 0 2px rgba(0, 0, 0, 0.6), 0 0 2px rgba(0, 0, 0, 0.6); }\n\n._2ES3L {\n  font-size: 12px;\n  margin-bottom: 10px;\n  color: #fff; }\n\n._3QjzQ {\n  font-size: 12px;\n  color: #23A570;\n  opacity: .6;\n  transition: opacity .35s;\n  text-shadow: 0 0 1px rgba(0, 0, 0, 0.8); }\n  ._3QjzQ:hover {\n    opacity: 1; }\n\n._1oAqh {\n  background: #fff;\n  padding: 15px; }\n\n._1gvj1 {\n  font-size: 14px;\n  color: #584f5f;\n  display: flex;\n  margin-bottom: 12px; }\n\n._10GQ5 {\n  flex: 1;\n  text-align: right; }\n\n._3nixU {\n  position: absolute;\n  bottom: 0;\n  left: 0;\n  width: 100%;\n  display: flex;\n  box-shadow: 0 -1px 5px rgba(0, 0, 0, 0.8); }\n\n._2ylNR\n, ._137HH {\n  flex: 1;\n  background: #584f5f;\n  color: #fff;\n  font-size: 14px;\n  text-align: center;\n  border: none;\n  outline: none;\n  padding: 10px 0; }\n  ._2ylNR:hover\n, ._137HH:hover {\n    color: #23A570;\n    transition: color .25s, background .25s; }\n  ._2ylNR:first-child\n, ._137HH:first-child {\n    border-right: 1px solid #eee; }\n\n._137HH._3T7wZ {\n  color: #fff;\n  background: #23A570; }\n  ._137HH._3T7wZ:hover {\n    background: #ff5065; }\n\n._137HH ._34SIr {\n  display: none; }\n\n._137HH:hover ._2u-3R {\n  display: none; }\n\n._137HH:hover ._34SIr {\n  display: inline; }\n", ""]);

	// exports
	exports.locals = {
		"user-container": "_2iSfP",
		"user-back": "_2fJro",
		"back-cover": "_25K5c",
		"back-avatar": "xR6HH",
		"blur": "_1RPRB",
		"user-avatar": "a0fr5",
		"user-info-content": "Fpgzu",
		"user-info-name": "_3seF1",
		"user-info-desc": "_2iUvc",
		"user-info-other": "_2ES3L",
		"user-info-config": "_3QjzQ",
		"user-training": "_1oAqh",
		"user-training-line": "_1gvj1",
		"user-training-data": "_10GQ5",
		"both-line": "_3nixU",
		"line-btn": "_2ylNR",
		"follow-btn": "_137HH",
		"active": "_3T7wZ",
		"sp-hover": "_34SIr",
		"sp-default": "_2u-3R"
	};

/***/ }

});