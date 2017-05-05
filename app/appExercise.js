webpackJsonp([1],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _dec, _class, _desc, _value, _class2;

	__webpack_require__(114);

	var _react = __webpack_require__(122);

	var _react2 = _interopRequireDefault(_react);

	var _reactDom = __webpack_require__(152);

	var _reactDom2 = _interopRequireDefault(_reactDom);

	var _autobindDecorator = __webpack_require__(515);

	var _autobindDecorator2 = _interopRequireDefault(_autobindDecorator);

	var _reactCssModules = __webpack_require__(355);

	var _reactCssModules2 = _interopRequireDefault(_reactCssModules);

	var _Utils = __webpack_require__(521);

	var _Utils2 = _interopRequireDefault(_Utils);

	var _moment = __webpack_require__(522);

	var _moment2 = _interopRequireDefault(_moment);

	var _HttpRequest = __webpack_require__(520);

	var _HttpRequest2 = _interopRequireDefault(_HttpRequest);

	var _moduleExercise = __webpack_require__(685);

	var _moduleExercise2 = _interopRequireDefault(_moduleExercise);

	var _WorkoutCoordinates = __webpack_require__(683);

	var _WorkoutCoordinates2 = _interopRequireDefault(_WorkoutCoordinates);

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

	var ModuleExercise = (_dec = (0, _reactCssModules2.default)(_moduleExercise2.default, { allowMultiple: true }), _dec(_class = (_class2 = function (_Component) {
	    _inherits(ModuleExercise, _Component);

	    function ModuleExercise(props) {
	        _classCallCheck(this, ModuleExercise);

	        var _this = _possibleConstructorReturn(this, (ModuleExercise.__proto__ || Object.getPrototypeOf(ModuleExercise)).call(this, props));

	        var workouts = _Utils2.default.storage.get('workouts') || [];
	        var planId = location.search.substring(location.search.indexOf('=') + 1);

	        _this.state = {
	            classTimeout: '',
	            classToggle: '',

	            user: _Utils2.default.storage.get('userData') || {},
	            workout: !workouts.length ? {} : !new Map(workouts).has(planId) ? {} : new Map(workouts).get(planId),
	            exercises: [],
	            currentProceed: 0,
	            countdown: 0,
	            currentGroupTime: 0,
	            currentGroupDuration: 0,
	            timeoutTip: _Utils2.default.storage.get('timeoutTip'),
	            timeoutGap: 0,
	            totalDuration: 0,
	            statisticDuration: 0, // 总时长（包括休息时间和报读时间以及训练时间）
	            isEnd: ''
	        };

	        _this.totalStart = false;
	        _this.vStart = false;
	        _this.statisticGroup = [];
	        _this.groupAudio = [];
	        _this.toNextCallback = null, // 主音频播放回调

	        // setTimeout Or setInterval
	        _this.timeoutGapId = 0, // 休息时间
	        _this.timeoutCountdownId = 0, // 开始倒计时
	        _this.recordId = 0, // 统计单项运行状态
	        _this.commentaryId = 0; // 提示语
	        return _this;
	    }

	    _createClass(ModuleExercise, [{
	        key: 'componentDidMount',
	        value: function componentDidMount() {
	            var _this2 = this;

	            console.info(this.state.workout);

	            _electron.remote.getCurrentWindow().removeAllListeners();
	            _electron.remote.getCurrentWindow().on('blur', function (e) {
	                _this2.handleMainPause();
	            }).on('focus', function (e) {
	                _this2.handleMainPlay();
	            });

	            var exercise = this.state.workout.workouts[0];
	            var videos = exercise.steps;

	            var totalDuration = 0;
	            var list = videos.map(function (item) {
	                var single = {};
	                single.name = item.exercise.name;
	                single.gap = item.gap;
	                single.video = item.exercise.videos[0];
	                single.videoName = single.video.url.substring(single.video.url.lastIndexOf('/') + 1, single.video.url.indexOf('.mp4'));
	                single.audio = item.exercise.audio;
	                single.audioName = single.audio.substring(single.audio.lastIndexOf('/') + 1, single.audio.indexOf('.mp3'));
	                single.type = item.type;
	                single.description = item.exercise.description;
	                single.covers = item.exercise.covers;
	                single.exerciseId = item.exercise._id;

	                // 根据性别划分锻炼难度
	                if (_this2.state.user.gender.toLowerCase() === 'm') {
	                    single.group = item.mgroup;
	                    single.groupTime = item.mpergroup;
	                    single.groupDuration = item.mduration;
	                } else {
	                    single.group = item.fgroup;
	                    single.groupTime = item.fpergroup;
	                    single.groupDuration = item.fduration;
	                }

	                // 训练时提醒
	                if (item.commentaryTraining.length) {
	                    if (item.commentaryTraining[0].gender === _this2.state.user.gender) single.commentary = item.commentaryTraining[0].sets;else single.commentary = item.commentaryTraining[1].sets;
	                } else {
	                    single.commentary = null;
	                }

	                totalDuration += single.groupDuration;

	                return single;
	            });

	            // 统计项目总时间
	            this.setState({
	                statisticDuration: totalDuration
	            });

	            this.setState({
	                exercises: list
	            }, this.startExercise);
	        }
	    }, {
	        key: 'componentWillUnmount',
	        value: function componentWillUnmount() {
	            clearTimeout(this.timeId);
	        }
	    }, {
	        key: 'startExercise',
	        value: function startExercise() {
	            var curAction = this.state.exercises[this.state.currentProceed];

	            console.info(curAction);

	            this.setState({
	                countdown: 4
	            });

	            // 判断是否第一组
	            if (this.state.currentProceed === 0) this.groupAudio.push(ModuleExercise.getSoundTips('g_2_first_motion.mp3'));
	            // 是否是最后一组
	            else if (this.state.currentProceed === this.state.exercises.length - 1) this.groupAudio.push(ModuleExercise.getSoundTips('g_14_last_motion.mp3'));else this.groupAudio.push(ModuleExercise.getSoundTips('g_13_next_motion.mp3'));

	            // 项目名
	            this.groupAudio.push(curAction.audio);

	            // 组
	            this.groupAudio.push(ModuleExercise.getSoundTips('one_group.mp3'));

	            if (this.state.exercises.group > 1) this.groupAudio.push(ModuleExercise.getSoundTips('g_4_group.mp3'));

	            // 单组次数/时间
	            if (curAction.type === 'times') {
	                this.groupAudio.push(ModuleExercise.getSoundNumber(ModuleExercise.makeNumOrder(curAction.groupTime)));
	                this.groupAudio.push(ModuleExercise.getSoundTips('g_6_time.mp3'));
	            } else {
	                this.groupAudio.push(ModuleExercise.getSoundNumber(ModuleExercise.makeNumOrder(curAction.groupDuration)));
	                this.groupAudio.push(ModuleExercise.getSoundTips('seconds.mp3'));
	            }

	            this.totalStart = true;
	            this.initTimerAuthor().play();
	            this.componentAudio().setSrc(this.groupAudio.shift()).play();
	        }

	        // 项目开始倒计时

	    }, {
	        key: 'beginCountdown',
	        value: function beginCountdown() {
	            var _this3 = this;

	            return {
	                play: function play() {
	                    if (_this3.totalStart) {
	                        if (_this3.state.countdown > 0) {
	                            _this3.timeoutCountdownId = setTimeout(function () {
	                                _this3.setState({
	                                    countdown: _this3.state.countdown - 1
	                                }, function () {
	                                    _this3.componentAudio().setSrc(ModuleExercise.getSoundNumber('00' + _this3.state.countdown)).play();
	                                    _this3.beginCountdown().stop().play();
	                                });
	                            }, 1000);
	                        } else {
	                            _this3.timeoutCountdownId && clearTimeout(_this3.timeoutCountdownId);
	                            _this3.timeoutCountdownId = 0;
	                            _this3.componentAudio().pause().setSrc(ModuleExercise.getSoundTips('g_9_go.mp3')).play();
	                            _this3.timeoutCountdownId = setTimeout(function () {
	                                _this3.vStart = true;
	                                _this3.recordExerciseConfig().play();
	                                _this3.componentVideo().reset();

	                                clearTimeout(_this3.timeoutCountdownId);
	                                _this3.timeoutCountdownId = 0;
	                            }, 1000);
	                        }
	                    } else {
	                        _this3.timeoutCountdownId && clearTimeout(_this3.timeoutCountdownId);
	                        _this3.timeoutCountdownId = 0;
	                    }
	                },
	                stop: function stop() {
	                    _this3.timeoutCountdownId && clearTimeout(_this3.timeoutCountdownId);
	                    _this3.timeoutCountdownId = 0;

	                    return _this3.beginCountdown();
	                }
	            };
	        }
	    }, {
	        key: 'initTimerAuthor',
	        value: function initTimerAuthor() {
	            var _this4 = this;

	            return {
	                play: function play() {
	                    _this4.timerId = setTimeout(function () {
	                        if (_this4.totalStart) {
	                            _this4.setState({
	                                totalDuration: _this4.state.totalDuration + 1
	                            });
	                            if (_this4.vStart) {
	                                // 统计单项运动时间
	                                _this4.setState({
	                                    currentGroupDuration: _this4.state.currentGroupDuration + 1
	                                });
	                                // 如果类型不是报次,则读秒
	                                if (_this4.state.exercises[_this4.state.currentProceed].type !== 'times') _this4.componentAudio().setSrc(ModuleExercise.getSoundTips('timer.mp3')).play();
	                            }
	                            _this4.initTimerAuthor().play();
	                        } else {
	                            _this4.initTimerAuthor().stop();
	                        }
	                    }, 1000);
	                },
	                stop: function stop() {
	                    _this4.timerId && clearTimeout(_this4.timerId);
	                    _this4.timerId = 0;
	                }
	            };
	        }

	        // 统计单项目运行时间

	    }, {
	        key: 'recordExerciseConfig',
	        value: function recordExerciseConfig() {
	            var _this5 = this;

	            return {
	                play: function play() {
	                    var timeSpeed = 1000;
	                    if (_this5.state.exercises[_this5.state.currentProceed].groupTime > 0) timeSpeed = _this5.state.exercises[_this5.state.currentProceed].groupDuration / _this5.state.exercises[_this5.state.currentProceed].groupTime * 1000;
	                    _this5.setState({
	                        currentGroupTime: _this5.state.currentGroupTime + 1
	                    }, function () {
	                        if (_this5.state.exercises[_this5.state.currentProceed].type === 'times') _this5.componentAudio().setSrc(ModuleExercise.getSoundNumber(ModuleExercise.makeNumOrder(_this5.state.currentGroupTime))).play();

	                        _this5.recordId = setTimeout(function () {
	                            if (_this5.state.exercises[_this5.state.currentProceed].type === 'times') {
	                                if (_this5.state.currentGroupTime < _this5.state.exercises[_this5.state.currentProceed].groupTime) {
	                                    _this5.recordExerciseConfig().play();
	                                } else {
	                                    if (_this5.state.exercises[_this5.state.currentProceed].gap) {
	                                        _this5.resetAllState();
	                                        _this5.componentTimeout().rest(_this5.state.exercises[_this5.state.currentProceed].gap);
	                                    } else _this5.handleJumpNext();
	                                }
	                            } else if (_this5.state.currentGroupDuration < _this5.state.exercises[_this5.state.currentProceed].groupDuration) {
	                                _this5.recordExerciseConfig().play();
	                            } else {
	                                if (_this5.state.exercises[_this5.state.currentProceed].gap) {
	                                    _this5.resetAllState();
	                                    _this5.componentTimeout().rest(_this5.state.exercises[_this5.state.currentProceed].gap);
	                                } else _this5.handleJumpNext();
	                            }
	                        }, timeSpeed);
	                    });
	                },
	                stop: function stop() {
	                    _this5.recordId && clearTimeout(_this5.recordId);
	                    _this5.recordId = 0;
	                },
	                over: function over() {
	                    _this5.recordExerciseConfig().stop();

	                    if (_this5.vStart) _this5.statisticGroup.push({
	                        name: _this5.state.exercises[_this5.state.currentProceed].name,
	                        type: _this5.state.exercises[_this5.state.currentProceed].type,
	                        exercise: _this5.state.exercises[_this5.state.currentProceed].exerciseId,
	                        actualSec: 20,
	                        totalSec: 20
	                    });
	                    return true;
	                }
	            };
	        }

	        // 主视频对象操作

	    }, {
	        key: 'componentVideo',
	        value: function componentVideo() {
	            var _this6 = this;

	            var masterVideo = this.refs.masterVideo;

	            return {
	                pause: function pause() {
	                    masterVideo.pause();
	                    return _this6.componentVideo();
	                },
	                play: function play() {
	                    masterVideo.play();
	                    return _this6.componentVideo();
	                },
	                reset: function reset() {
	                    masterVideo.load();
	                    return _this6.componentVideo();
	                },
	                setSrc: function setSrc(src) {
	                    masterVideo.src = src;
	                    return _this6.componentVideo();
	                },
	                stop: function stop() {
	                    masterVideo.loop = false;
	                },
	                goPlay: function goPlay() {
	                    // 项目开始
	                    if (_this6.vStart) {
	                        // 循环播放
	                        masterVideo.play();
	                    }
	                    //else if(this.state.countdown > -1){
	                    //    this.refs.masterVideo.play()
	                    //}
	                    return true;
	                }
	            };
	        }

	        // 主音频对象操作

	    }, {
	        key: 'componentAudio',
	        value: function componentAudio() {
	            var _this7 = this;

	            var masterAudio = this.refs.masterAudio;

	            return {
	                togglePlay: function togglePlay() {
	                    if (masterAudio.volume) masterAudio.volume = 0;else masterAudio.volume = 1;
	                },
	                pause: function pause() {
	                    masterAudio.pause();
	                    return _this7.componentAudio();
	                },
	                play: function play() {
	                    if (masterAudio.src) masterAudio.play();else _this7.componentAudio().toNext();
	                    return _this7.componentAudio();
	                },
	                replay: function replay() {
	                    masterAudio.load();
	                    return _this7.componentAudio();
	                },
	                stop: function stop() {
	                    // 避免重复报读
	                    //masterAudio.currentTime = masterAudio.duration * 0.99
	                    masterAudio.src = '';
	                    _this7.timeoutCountdownId && clearTimeout(_this7.timeoutCountdownId);
	                    //masterAudio.pause()

	                    return _this7.componentAudio();
	                },
	                setSrc: function setSrc(src) {
	                    //console.info('this.refs.masterAudio', this.refs.masterAudio)
	                    masterAudio.src = src;
	                    return _this7.componentAudio();
	                },
	                toNext: function toNext() {
	                    if (_this7.toNextCallback && typeof _this7.toNextCallback === 'function') {
	                        _this7.toNextCallback();
	                        _this7.toNextCallback = null;
	                        return true;
	                    }
	                    if (_this7.totalStart) {
	                        if (_this7.groupAudio.length) {
	                            // 开始读秒
	                            //if(this.groupAudio.length <= 4 && !this.vStart){
	                            //    // 延迟读秒时间
	                            //    this.timeoutCountdownId = setTimeout(() => {
	                            //        masterAudio.src = this.groupAudio.shift()
	                            //        masterAudio.play()
	                            //        this.beginCountdown()
	                            //    }, 660)
	                            //    return true
	                            //}
	                            masterAudio.src = _this7.groupAudio.shift();
	                            masterAudio.play();
	                            return true;
	                        } else {
	                            if (_this7.state.countdown > 3) _this7.beginCountdown().play();
	                        }
	                    }
	                }
	            };
	        }

	        // 锻炼时提示语 (*未完* | 本地缓存、解压、目录存放)

	    }, {
	        key: 'commentaryTrainingAudio',
	        value: function commentaryTrainingAudio() {
	            var _this8 = this;

	            var branchAudio = this.refs.branchAudio;
	            return {
	                start: function start() {
	                    var commentary = _this8.state.exercises[_this8.state.currentProceed].commentary;
	                    if (commentary) {
	                        commentary.forEach(function (item) {
	                            _this8.commentaryId = setTimeout(function () {
	                                _this8.commentaryTrainingAudio().play(item.id);
	                            }, item.time * 1000);
	                        });
	                    }
	                },
	                play: function play(src) {
	                    branchAudio.src = src;
	                    return _this8.commentaryTrainingAudio();
	                },
	                pause: function pause() {
	                    branchAudio.pause();
	                    return _this8.commentaryTrainingAudio();
	                }
	            };
	        }

	        // 视频音频开关

	    }, {
	        key: 'componentMaster',
	        value: function componentMaster() {
	            var _this9 = this;

	            return {
	                pause: function pause() {
	                    _this9.setState({
	                        totalStart: false
	                    }, function () {
	                        if (_this9.state.countdown > 0) _this9.beginCountdown().stop();
	                        _this9.componentVideo().pause();
	                        _this9.componentAudio().pause();
	                    });
	                },
	                play: function play() {
	                    _this9.setState({
	                        totalStart: true
	                    }, function () {
	                        _this9.componentVideo().play();
	                        _this9.componentAudio().play();
	                        if (!_this9.groupAudio.length && _this9.state.countdown > 0) _this9.beginCountdown().play();
	                    });
	                }
	            };
	        }

	        //休息时间

	    }, {
	        key: 'componentTimeout',
	        value: function componentTimeout() {
	            var _this10 = this;

	            return {
	                show: function show() {
	                    _this10.setState({
	                        classTimeout: 'show'
	                    });
	                    return true;
	                },
	                hide: function hide() {
	                    _this10.setState({
	                        classTimeout: ''
	                    });
	                    return true;
	                },
	                rest: function rest(time) {
	                    _this10.setState({
	                        timeoutGap: time,
	                        classTimeout: 'show'
	                    }, function () {
	                        console.info(_this10.timeoutGapId);
	                        if (_this10.timeoutGapId) return;
	                        _this10.componentAudio().pause().setSrc(ModuleExercise.getSoundTips('g_10_take_a_rest.mp3')).play();
	                        _this10.timeoutGapId = setInterval(function () {
	                            if (_this10.state.timeoutGap > 0) {
	                                _this10.setState({
	                                    timeoutGap: _this10.state.timeoutGap - 1
	                                });
	                            } else {
	                                clearInterval(_this10.timeoutGapId);
	                                _this10.timeoutGapId = 0;
	                                _this10.componentAudio().pause().setSrc(ModuleExercise.getSoundTips('g_11_rest_end.mp3')).play();
	                                _this10.toNextCallback = _this10.handleJumpNext;
	                            }
	                        }, 1000);
	                    });
	                    return true;
	                },
	                stop: function stop() {
	                    _this10.timeoutGapId && clearInterval(_this10.timeoutGapId);
	                    _this10.componentTimeout().hide();
	                    return true;
	                }
	            };
	        }
	    }, {
	        key: 'resetAllState',
	        value: function resetAllState() {
	            this.recordExerciseConfig().over(); // 保存当前项目值并重置
	            this.totalStart = false;
	            this.vStart = false;
	            this.groupAudio = []; // 声音重置

	            this.initTimerAuthor().stop(); // 停止时间统计
	            this.componentMaster().pause(); // 终止所有视频、音频播放
	            this.componentTimeout().stop(); // 销毁休息状态
	        }
	    }, {
	        key: 'handleSounds',
	        value: function handleSounds() {
	            this.componentAudio().togglePlay();
	        }
	    }, {
	        key: 'handleMainPause',
	        value: function handleMainPause() {
	            this.initTimerAuthor().stop();
	            if (this.vStart) this.recordExerciseConfig().stop();
	            this.componentTimeout().show();
	            this.componentMaster().pause();
	            this.setState({
	                classToggle: 'gather'
	            });
	        }
	    }, {
	        key: 'handleMainPlay',
	        value: function handleMainPlay() {
	            this.setState({
	                classToggle: ''
	            });
	            this.componentTimeout().hide();
	            this.componentMaster().play();
	            this.initTimerAuthor().play();
	            if (this.vStart) this.recordExerciseConfig().play();
	        }

	        // 总开关事件

	    }, {
	        key: 'handleVideoToggle',
	        value: function handleVideoToggle() {
	            if (this.state.classToggle) {
	                // play
	                this.handleMainPlay();
	            } else {
	                // pause
	                this.handleMainPause();
	            }
	        }

	        // 上一个！

	    }, {
	        key: 'handleJumpPrev',
	        value: function handleJumpPrev() {
	            this.resetAllState();
	            this.setState({ // 重置组数据，回调进行上一次
	                currentProceed: this.state.currentProceed > 1 ? this.state.currentProceed - 1 : 0,
	                currentGroupTime: 0,
	                currentGroupDuration: 0,
	                timeoutGap: 0
	            }, this.startExercise);
	        }

	        // 下一个！！

	    }, {
	        key: 'handleJumpNext',
	        value: function handleJumpNext() {
	            var _this11 = this;

	            this.resetAllState();
	            if (this.state.currentProceed < this.state.exercises.length - 1) {
	                this.setState({ // 重置组数据，回调开始下一次
	                    currentProceed: this.state.currentProceed + 1,
	                    currentGroupTime: 0,
	                    currentGroupDuration: 0,
	                    timeoutGap: 0
	                }, this.startExercise);
	            } else {
	                this.componentVideo().stop();
	                this.componentAudio().pause().setSrc(ModuleExercise.getSoundTips('countdownend.mp3')).play();
	                this.toNextCallback = function () {
	                    return _this11.componentAudio().pause().setSrc(ModuleExercise.getSoundTips('g_16_well_done.mp3')).play();
	                };
	                _HttpRequest2.default.completeExercise();
	                this.setState({
	                    isEnd: 'active'
	                });
	            }
	        }
	    }, {
	        key: 'getVideoContent',
	        value: function getVideoContent() {
	            if (this.state.exercises.length) return _react2.default.createElement(
	                'section',
	                { styleName: 'exercise-video' },
	                _react2.default.createElement(
	                    'div',
	                    { styleName: 'exercise-inner' },
	                    _react2.default.createElement(
	                        'div',
	                        { styleName: 'video-wrap ' + this.state.classTimeout },
	                        _react2.default.createElement('video', { ref: 'masterVideo', onEnded: this.componentVideo().goPlay, muted: true, autoPlay: true, loop: true, src: this.state.exercises[this.state.currentProceed].video.url })
	                    ),
	                    _react2.default.createElement('aside', { styleName: 'command-layer' }),
	                    _react2.default.createElement(
	                        'aside',
	                        { styleName: 'info-layer' },
	                        _react2.default.createElement(
	                            'div',
	                            { styleName: 'countdown-times', disabled: this.state.countdown > 3 },
	                            _react2.default.createElement(
	                                'div',
	                                { className: 'fz18', hidden: this.state.countdown <= 0 },
	                                this.state.countdown > 3 ? 3 : this.state.countdown
	                            ),
	                            _react2.default.createElement(
	                                'div',
	                                { className: 'fz18', hidden: this.state.countdown > 0 || this.state.currentGroupTime },
	                                'GO!'
	                            ),
	                            _react2.default.createElement(
	                                'div',
	                                { className: 'fz14', hidden: this.state.exercises[this.state.currentProceed].type !== 'times' && this.state.currentGroupTime },
	                                this.state.currentGroupTime,
	                                '/',
	                                this.state.exercises[this.state.currentProceed].groupTime
	                            ),
	                            _react2.default.createElement(
	                                'div',
	                                { className: 'fz14', hidden: this.state.exercises[this.state.currentProceed].type === 'times' && this.state.currentGroupDuration },
	                                this.state.currentGroupDuration,
	                                '/',
	                                this.state.exercises[this.state.currentProceed].groupDuration,
	                                '"'
	                            )
	                        ),
	                        _react2.default.createElement(
	                            'span',
	                            { styleName: 'timeout-total-time' },
	                            (0, _moment2.default)(new Date(this.state.totalDuration * 1000)).format('mm:ss')
	                        )
	                    ),
	                    _react2.default.createElement(
	                        'aside',
	                        { styleName: 'timeout-layer ' + this.state.classTimeout },
	                        _react2.default.createElement(
	                            'div',
	                            { styleName: 'timeout-tips' },
	                            _react2.default.createElement(
	                                'div',
	                                null,
	                                _react2.default.createElement('i', { className: 'iconfont icon-symbol fz24' })
	                            ),
	                            _react2.default.createElement(
	                                'p',
	                                { styleName: 'timeout-title' },
	                                this.state.timeoutTip.content
	                            ),
	                            _react2.default.createElement(
	                                'p',
	                                { styleName: 'timeout-author' },
	                                '\u2014\u2014',
	                                this.state.timeoutTip.author
	                            )
	                        ),
	                        _react2.default.createElement(
	                            'button',
	                            { hidden: !this.state.timeoutGap, onClick: this.handleJumpNext, styleName: 'button-timeout' },
	                            this.state.timeoutGap
	                        )
	                    ),
	                    _react2.default.createElement(
	                        'button',
	                        { hidden: this.state.timeoutGap, styleName: 'button-toggle ' + this.state.classToggle, onClick: this.handleVideoToggle },
	                        _react2.default.createElement('i', { className: 'iconfont ' + (this.state.classToggle ? 'icon-play' : 'icon-pause') })
	                    ),
	                    _react2.default.createElement(
	                        'div',
	                        null,
	                        _react2.default.createElement('span', { styleName: 'arrow-top ' + this.state.classToggle }),
	                        _react2.default.createElement('span', { styleName: 'arrow-right ' + this.state.classToggle }),
	                        _react2.default.createElement('span', { styleName: 'arrow-bottom ' + this.state.classToggle }),
	                        _react2.default.createElement('span', { styleName: 'arrow-left ' + this.state.classToggle })
	                    )
	                )
	            );
	        }
	    }, {
	        key: 'getFinishContent',
	        value: function getFinishContent() {
	            return _react2.default.createElement(
	                'div',
	                { styleName: 'finish-page ' + this.state.isEnd },
	                _react2.default.createElement(
	                    'div',
	                    { styleName: 'finish-inner' },
	                    _react2.default.createElement(
	                        'div',
	                        { styleName: 'finish-title' },
	                        _react2.default.createElement('img', { src: __webpack_require__(687), alt: '' }),
	                        _react2.default.createElement(
	                            'p',
	                            { className: 'padding' },
	                            '\u606D\u559C\u4F60\u5B8C\u6210\u8BAD\u7EC3'
	                        )
	                    ),
	                    _react2.default.createElement(
	                        'div',
	                        { styleName: 'finish-detail' },
	                        _react2.default.createElement(
	                            'div',
	                            { className: 'text-left', styleName: 'col' },
	                            '\u65F6\u957F ',
	                            _react2.default.createElement('br', null),
	                            ' ',
	                            _react2.default.createElement(
	                                'span',
	                                { className: 'fz24' },
	                                this.state.totalDuration > 60 ? Math.floor(this.state.totalDuration / 60) : '<1'
	                            ),
	                            '\u5206'
	                        ),
	                        _react2.default.createElement(
	                            'div',
	                            { className: 'text-center', styleName: 'col' },
	                            '\u52A8\u4F5C ',
	                            _react2.default.createElement('br', null),
	                            ' ',
	                            _react2.default.createElement(
	                                'span',
	                                { className: 'fz24' },
	                                this.statisticGroup.length
	                            ),
	                            '\u7EC4'
	                        ),
	                        _react2.default.createElement(
	                            'div',
	                            { className: 'text-right', styleName: 'col' },
	                            '\u6D88\u8017 ',
	                            _react2.default.createElement('br', null),
	                            ' ',
	                            _react2.default.createElement(
	                                'span',
	                                { className: 'fz24' },
	                                this.state.totalDuration
	                            ),
	                            '\u5343\u5361'
	                        )
	                    ),
	                    _react2.default.createElement(
	                        'ul',
	                        { styleName: 'finish-actions' },
	                        this.statisticGroup.length && this.statisticGroup.map(function (item, index) {
	                            return _react2.default.createElement(
	                                'li',
	                                { key: index },
	                                _react2.default.createElement(
	                                    'div',
	                                    { className: 'text-left', styleName: 'col' },
	                                    item.name
	                                ),
	                                _react2.default.createElement(
	                                    'div',
	                                    { className: 'text-right', styleName: 'col' },
	                                    (0, _moment2.default)(new Date(item.totalSec * 1000)).format('mm:ss')
	                                )
	                            );
	                        })
	                    ),
	                    _react2.default.createElement(
	                        'div',
	                        { styleName: 'finish-feel' },
	                        _react2.default.createElement('textarea', { styleName: 'feel-content', placeholder: '\u8BB0\u4E0B\u672C\u6B21\u8BAD\u7EC3\u7684\u611F\u53D7\u548C\u5FC3\u5F97' })
	                    )
	                )
	            );
	        }
	    }, {
	        key: 'render',
	        value: function render() {
	            var _this12 = this;

	            return _react2.default.createElement(
	                'div',
	                { styleName: 'exercise-container' },
	                _react2.default.createElement(
	                    'div',
	                    { styleName: 'exercise-page ' + this.state.isEnd },
	                    _react2.default.createElement(
	                        'div',
	                        { styleName: 'exercise-header' },
	                        _react2.default.createElement(
	                            'p',
	                            { styleName: 'exercise-title' },
	                            this.state.currentProceed + 1,
	                            '/',
	                            this.state.exercises.length,
	                            ' ',
	                            this.state.exercises.length && this.state.exercises[this.state.currentProceed].name
	                        ),
	                        _react2.default.createElement(
	                            'div',
	                            { styleName: 'title-progress-wrap' },
	                            this.state.exercises.length && this.state.exercises.map(function (item, index) {
	                                return _react2.default.createElement('div', { key: index, styleName: 'progress-item', style: { width: item.groupDuration * item.group / _this12.state.statisticDuration * 100 + '%' } });
	                            })
	                        ),
	                        _react2.default.createElement(
	                            'button',
	                            { disabled: this.state.currentProceed <= 0, onClick: this.handleJumpPrev, styleName: 'button-header button-header-prev' },
	                            _react2.default.createElement('i', { className: 'iconfont fz24 icon-forward' })
	                        ),
	                        _react2.default.createElement(
	                            'button',
	                            { disabled: this.state.currentProceed >= this.state.exercises.length - 1, onClick: this.handleJumpNext, styleName: 'button-header button-header-next' },
	                            _react2.default.createElement('i', { className: 'iconfont fz24 icon-goback' })
	                        )
	                    ),
	                    _react2.default.createElement(
	                        'section',
	                        { styleName: 'content-left', ref: 'contentLeft' },
	                        _react2.default.createElement(
	                            'div',
	                            { styleName: 'content-inner-flex' },
	                            _react2.default.createElement(
	                                'div',
	                                { className: 'padding' },
	                                this.getVideoContent()
	                            ),
	                            _react2.default.createElement(
	                                'div',
	                                { styleName: 'coordinates-flex' },
	                                _react2.default.createElement(
	                                    'div',
	                                    { styleName: 'content-coordinates' },
	                                    this.state.exercises.length && this.state.exercises[this.state.currentProceed].covers.map(function (cover) {
	                                        return _react2.default.createElement(_WorkoutCoordinates2.default, { key: cover._id, data: cover });
	                                    })
	                                )
	                            )
	                        )
	                    ),
	                    _react2.default.createElement(
	                        'section',
	                        { styleName: 'content-right', ref: 'contentRight' },
	                        _react2.default.createElement(
	                            'div',
	                            { styleName: 'content-scroll' },
	                            this.state.exercises.length && _react2.default.createElement('article', { className: 'article-wrap', dangerouslySetInnerHTML: { __html: this.state.exercises[this.state.currentProceed].description } })
	                        )
	                    ),
	                    _react2.default.createElement(
	                        'button',
	                        { styleName: 'button-toggle-sound', onClick: this.handleSounds },
	                        '\u58F0\u97F3'
	                    ),
	                    _react2.default.createElement(
	                        'figure',
	                        { styleName: 'other-res' },
	                        _react2.default.createElement('audio', { ref: 'masterAudio', onEnded: this.componentAudio().toNext, src: '' }),
	                        _react2.default.createElement('audio', { ref: 'branchAudio', src: '' })
	                    )
	                ),
	                this.state.isEnd && this.getFinishContent()
	            );
	        }
	    }], [{
	        key: 'getSoundTips',
	        value: function getSoundTips(name) {
	            return 'file://' + (__dirname) + '/sounds/' + name;
	        }
	    }, {
	        key: 'getSoundNumber',
	        value: function getSoundNumber(name) {
	            return 'file://' + (__dirname) + '/number/N' + name + '.mp3';
	        }
	    }, {
	        key: 'makeNumOrder',
	        value: function makeNumOrder(index) {
	            return index < 1000 ? index < 100 ? index < 10 ? '00' + index : '0' + index : '0' + index : index;
	        }
	    }]);

	    return ModuleExercise;
	}(_react.Component), (_applyDecoratedDescriptor(_class2.prototype, 'componentDidMount', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'componentDidMount'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'componentWillUnmount', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'componentWillUnmount'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'startExercise', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'startExercise'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'beginCountdown', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'beginCountdown'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'initTimerAuthor', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'initTimerAuthor'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'recordExerciseConfig', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'recordExerciseConfig'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'componentVideo', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'componentVideo'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'componentAudio', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'componentAudio'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'commentaryTrainingAudio', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'commentaryTrainingAudio'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'componentMaster', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'componentMaster'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'componentTimeout', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'componentTimeout'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'resetAllState', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'resetAllState'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'handleSounds', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'handleSounds'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'handleMainPause', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'handleMainPause'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'handleMainPlay', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'handleMainPlay'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'handleVideoToggle', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'handleVideoToggle'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'handleJumpPrev', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'handleJumpPrev'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'handleJumpNext', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'handleJumpNext'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'getVideoContent', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'getVideoContent'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'getFinishContent', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, 'getFinishContent'), _class2.prototype)), _class2)) || _class);


	var container = document.createElement('div');
	container.id = 'container';
	container.className = 'container';
	document.querySelector('body').appendChild(container);

	_reactDom2.default.render(_react2.default.createElement(ModuleExercise, null), document.getElementById('container'));
	;

	var _temp = function () {
	    if (typeof __REACT_HOT_LOADER__ === 'undefined') {
	        return;
	    }

	    __REACT_HOT_LOADER__.register(ModuleExercise, 'ModuleExercise', '/Users/liucong/Documents/Github/keepForMac/src/js/ModuleExercise.js');

	    __REACT_HOT_LOADER__.register(container, 'container', '/Users/liucong/Documents/Github/keepForMac/src/js/ModuleExercise.js');
	}();

	;

	 ;(function register() { /* react-hot-loader/webpack */ if ((undefined) !== 'production') { if (typeof __REACT_HOT_LOADER__ === 'undefined') { return; } if (typeof module.exports === 'function') { __REACT_HOT_LOADER__.register(module.exports, 'module.exports', "/Users/liucong/Documents/Github/keepForMac/src/js/ModuleExercise.js"); return; } for (var key in module.exports) { if (!Object.prototype.hasOwnProperty.call(module.exports, key)) { continue; } var namedExport = void 0; try { namedExport = module.exports[key]; } catch (err) { continue; } __REACT_HOT_LOADER__.register(namedExport, key, "/Users/liucong/Documents/Github/keepForMac/src/js/ModuleExercise.js"); } } })();

/***/ },

/***/ 672:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(673);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(121)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(true) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept(673, function() {
				var newContent = __webpack_require__(673);
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 673:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(116)();
	// imports


	// module
	exports.push([module.id, ".gGG3G {\n  position: relative; }\n\n.T56YL {\n  background: #584f5f no-repeat center/cover;\n  position: relative;\n  box-shadow: 0 0 10px rgba(0, 0, 0, 0.6); }\n  .T56YL:before {\n    content: '';\n    position: absolute;\n    top: 0;\n    left: 0;\n    width: 100%;\n    height: 100%;\n    background: rgba(0, 0, 0, 0.5); }\n\n._1hEVu {\n  position: relative;\n  padding: 10px;\n  height: 180px; }\n\n._1kXZF {\n  font-size: 24px;\n  color: #fff;\n  margin-top: 10px; }\n\n._3n5Ak {\n  color: #ddd;\n  font-size: 12px; }\n\n.YVuU5 {\n  position: absolute;\n  bottom: 10px;\n  left: 0;\n  width: 100%;\n  margin: 0;\n  padding: 0 10px;\n  overflow: hidden;\n  text-align: right;\n  white-space: nowrap; }\n  .YVuU5 li {\n    display: inline-block; }\n\n._1wE0v {\n  text-align: left;\n  display: block;\n  font-size: 14px;\n  color: #fff;\n  padding: 12px 0 0; }\n\n._1_YaU {\n  padding: 5px 0;\n  border-top: 1px solid #fff;\n  border-bottom: 1px solid #fff; }\n\n._1vG24 {\n  color: #fff;\n  font-size: 10px;\n  display: block;\n  padding-left: 50px;\n  padding-right: 10px; }\n\n._1j7xa {\n  color: #ddd; }\n\n._2MKks {\n  padding: 10px;\n  display: flex;\n  border-bottom: 1px solid #eee; }\n\n._1qiEN {\n  text-align: center;\n  margin-right: 10px; }\n\n.gEjE- {\n  background: #fff;\n  border-bottom: 1px solid #eee; }\n\n._1hUN3 {\n  padding: 10px;\n  overflow: hidden; }\n\n._2fS-z {\n  float: right;\n  color: #999;\n  font-size: 12px; }\n\n._1Vgwh {\n  border-left: 2px solid #23A570;\n  padding-left: 5px;\n  line-height: 1; }\n\n._2tzoZ {\n  display: block;\n  margin: 0;\n  padding: 0;\n  overflow: hidden; }\n\n._21hmZ {\n  float: left;\n  width: 33.33%;\n  padding: 10px;\n  position: relative; }\n\n.LM-oO {\n  margin-right: 15px; }\n\n._1oREy {\n  width: 15px;\n  text-align: center;\n  font-size: 12px;\n  position: absolute;\n  top: 26%;\n  right: 5px;\n  color: #999; }\n\n.K8_bp {\n  width: 100%;\n  padding-bottom: 64%;\n  margin-bottom: 10px;\n  background: #999 center/cover; }\n\n._39a3J {\n  margin-bottom: 5px; }\n\n._3CNEr {\n  color: #999; }\n\n._3HQju {\n  cursor: pointer;\n  position: fixed;\n  bottom: 50px;\n  right: 50px;\n  width: 60px;\n  padding: 0 10px;\n  height: 60px;\n  border-radius: 50%;\n  background: rgba(35, 165, 112, 0.8);\n  border: 2px solid rgba(88, 79, 95, 0.2);\n  color: #fff;\n  box-shadow: 0 0 5px rgba(85, 85, 85, 0.8);\n  transition: all .35s; }\n  ._3HQju:hover {\n    background: #23a570;\n    border: 2px solid rgba(88, 79, 95, 0.6); }\n\n._1mcce {\n  background: #fff;\n  padding: 0 10px; }\n\n._2NGue {\n  padding: 10px 0; }\n\n._3ZI5H {\n  display: flex;\n  border-bottom: 1px solid #eee;\n  padding: 10px 0; }\n  ._3ZI5H:first-child {\n    padding-top: 0; }\n\n._3zpl4 {\n  width: 100px;\n  height: 100px;\n  margin-right: 10px;\n  background: #999 no-repeat center/cover; }\n\n._1KBy0 {\n  flex: 1;\n  display: flex;\n  flex-direction: column; }\n\n._3FTXV {\n  flex: 1; }\n  ._3FTXV p {\n    overflow: hidden;\n    display: -webkit-box;\n    -webkit-line-clamp: 3;\n    -webkit-box-orient: vertical; }\n\n._30yij {\n  overflow: hidden;\n  display: flex;\n  align-items: center; }\n\n._19wAn {\n  width: 30px;\n  height: 30px;\n  border-radius: 50%;\n  margin-right: 10px;\n  border: 1px solid #eee; }\n\n._2YtCi {\n  font-size: 12px;\n  color: #ddd; }\n\n.jJH-4 {\n  transition: transform .5s .2s; }\n\n._2Sf8g {\n  display: block;\n  filter: blur(5px);\n  position: relative;\n  transform: scale(1.01); }\n\n.workout-introduce {\n  opacity: 0;\n  position: fixed;\n  top: 60px;\n  right: 0;\n  bottom: 0;\n  left: 150px;\n  padding: 20px 30px 80px;\n  background: rgba(0, 0, 0, 0.8);\n  transition: opacity .5s .2s; }\n\n.workout-introduce.show {\n  opacity: 1;\n  transition: opacity .5s; }\n\n.workout-introduce.show .workout-introduce-inner {\n  opacity: 1;\n  margin-top: 0;\n  transition: all .5s .2s; }\n\n.workout-introduce-inner {\n  transition: all .5s;\n  opacity: 0;\n  margin-top: 10px;\n  height: 100%;\n  padding-right: 10px;\n  margin-right: -10px;\n  overflow-x: hidden;\n  overflow-y: auto;\n  color: #fff; }\n\n._3HnIN {\n  position: absolute;\n  bottom: 20px;\n  left: 50%;\n  padding: 0;\n  width: 30px;\n  height: 30px;\n  line-height: 30px;\n  overflow: hidden;\n  margin-left: -15px;\n  border: none;\n  background: none;\n  color: #fff;\n  cursor: pointer;\n  transition: transform .35s; }\n  ._3HnIN:hover {\n    transform: scale(1.3); }\n  ._3HnIN i {\n    font-size: 30px;\n    margin: 0; }\n\n._1Fdk2 {\n  width: 100%; }\n\n._1QVe8 {\n  padding: 5px;\n  margin: 10px;\n  font-size: 24px;\n  color: #fff;\n  border-bottom: 1px solid #23A570; }\n\n._16Fkx {\n  padding: 10px 20px;\n  color: #fff; }\n\n.c-93L {\n  color: #fff;\n  margin-top: 10px;\n  margin-bottom: 0;\n  margin-left: 20px; }\n\n._2BoKE {\n  width: 100%;\n  overflow-x: auto;\n  overflow-y: hidden;\n  white-space: nowrap;\n  padding: 10px; }\n\n._2fU4a {\n  padding: 10px;\n  vertical-align: top;\n  display: inline-block; }\n\n._24vS1 {\n  position: relative; }\n\n._1z3Ha {\n  border-radius: 10px;\n  border: 1px solid #999;\n  height: 500px; }\n\n._15A6x {\n  position: absolute;\n  color: #fff;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 30px;\n  height: 30px;\n  max-width: 10%;\n  max-height: 10%;\n  transform: translate(-50%, -50%);\n  line-height: 30px;\n  text-align: center;\n  border-radius: 50%;\n  font-size: 14px;\n  background: rgba(35, 165, 112, 0.66); }\n\n.cIiAg {\n  margin-top: 10px;\n  font-size: 14px;\n  color: #fff; }\n\n._3aZ9T {\n  padding: 0 10px 10px; }\n\n._30KDK {\n  padding-top: 10px; }\n\n._2lV3o {\n  margin: 0;\n  padding: 0;\n  overflow-x: scroll;\n  overflow-y: hidden;\n  white-space: nowrap; }\n  ._2lV3o li {\n    position: relative;\n    overflow: hidden;\n    display: inline-block;\n    margin-right: 10px;\n    width: 40%;\n    height: 140px;\n    background: no-repeat center/cover; }\n    ._2lV3o li:last-child {\n      margin: 0; }\n\n._2k-At {\n  position: relative; }\n  ._2k-At:before {\n    content: '';\n    position: absolute;\n    top: 0;\n    left: 0;\n    width: 100%;\n    height: 100%;\n    background: rgba(0, 0, 0, 0.45); }\n  ._2k-At p {\n    position: relative; }\n\n.OHn7N {\n  color: #fff;\n  font-size: 18px; }\n\n._2Kfmk {\n  color: #ddd;\n  font-size: 12px; }\n\n._2jqeS {\n  color: #fff;\n  position: absolute;\n  left: 0;\n  bottom: 0;\n  padding: 10px;\n  width: 100%;\n  text-align: right; }\n\n._3p9y6 {\n  font-size: 10px;\n  margin-left: 5px; }\n\n._ylsI {\n  float: right;\n  padding: 5px;\n  font-size: 10px;\n  background: rgba(0, 0, 0, 0.3);\n  border-radius: 3px; }\n", ""]);

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

/***/ 683:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _dec, _class;

	var _react = __webpack_require__(122);

	var _react2 = _interopRequireDefault(_react);

	var _reactCssModules = __webpack_require__(355);

	var _reactCssModules2 = _interopRequireDefault(_reactCssModules);

	var _appWorkouts = __webpack_require__(672);

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

/***/ 685:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(686);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(121)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(true) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept(686, function() {
				var newContent = __webpack_require__(686);
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 686:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(116)();
	// imports


	// module
	exports.push([module.id, "._3n1-C {\n  position: relative;\n  overflow: hidden;\n  width: 100%;\n  height: 100%;\n  background: #555;\n  color: #fff; }\n\n.Jy8Ax {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 55px;\n  overflow: hidden; }\n\n.UxslB {\n  font-size: 24px;\n  text-shadow: 0 0 10px black;\n  margin: 0;\n  height: 55px;\n  line-height: 55px;\n  text-align: center;\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  z-index: 10; }\n\n.FUSDk {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 3px;\n  overflow: hidden; }\n\n._17JXW {\n  display: block;\n  float: left;\n  height: 100%;\n  border-right: 1px solid #fff;\n  opacity: .5; }\n  ._17JXW:last-child {\n    border: none; }\n\n._3FwO6 {\n  position: absolute;\n  top: 50%;\n  background: none;\n  border: none;\n  color: #fff;\n  transform: translateY(-50%);\n  z-index: 11; }\n  ._3FwO6[disabled] {\n    cursor: default;\n    color: #999; }\n\n._3RBKe {\n  left: 10px; }\n\n._7TcRO {\n  right: 10px; }\n\n._1VSHW {\n  height: 100%;\n  overflow-y: auto; }\n\n.tIKUE {\n  padding: 10px;\n  padding-top: 55px;\n  height: 100%;\n  margin-right: 520px; }\n\n._6qWUq {\n  padding: 10px;\n  padding-top: 55px;\n  height: 100%;\n  width: 520px;\n  position: absolute;\n  top: 0;\n  right: 0; }\n\n.EMqBv, .mYDob, ._38BmA, ._1MEMb, ._3L2WM {\n  position: absolute;\n  z-index: 10;\n  width: 20px;\n  height: 20px;\n  transform: rotate(-45deg);\n  border: 1px solid transparent;\n  transition: all 1s; }\n\n.mYDob {\n  top: -3px;\n  left: -2px;\n  border-top-color: #23A570; }\n\n._38BmA {\n  top: -3px;\n  right: -2px;\n  border-right-color: #23A570; }\n\n._1MEMb {\n  bottom: -3px;\n  right: -2px;\n  border-bottom-color: #23A570; }\n\n._3L2WM {\n  bottom: -3px;\n  left: -2px;\n  border-left-color: #23A570; }\n\n.mYDob._30hRM,\n._38BmA._30hRM,\n._1MEMb._30hRM,\n._3L2WM._30hRM {\n  width: 100px;\n  height: 100px;\n  border-radius: 50%;\n  border-width: 2px;\n  pointer-events: none;\n  position: absolute;\n  z-index: 12; }\n\n.mYDob._30hRM {\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%) rotate(45deg); }\n\n._38BmA._30hRM {\n  top: 50%;\n  right: 50%;\n  transform: translate(50%, -50%) rotate(45deg); }\n\n._1MEMb._30hRM {\n  bottom: 50%;\n  right: 50%;\n  transform: translate(50%, 50%) rotate(45deg); }\n\n._3L2WM._30hRM {\n  bottom: 50%;\n  left: 50%;\n  transform: translate(-50%, 50%) rotate(45deg); }\n\n._37QEa {\n  transform: translate(-50%, -50%);\n  visibility: visible;\n  position: absolute;\n  border-radius: 50%;\n  width: 100px;\n  height: 100px;\n  top: 50%;\n  left: 50%;\n  opacity: 0;\n  border: none;\n  background: rgba(88, 79, 95, 0.9);\n  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);\n  transition: opacity .5s; }\n  ._37QEa i {\n    margin-left: 5px;\n    margin-right: 0;\n    color: #23A570;\n    font-size: 30px; }\n  ._37QEa._30hRM {\n    visibility: visible;\n    opacity: 1; }\n\n._2ExBK {\n  padding-top: 56%;\n  width: 100%;\n  position: relative; }\n  ._2ExBK:hover ._37QEa {\n    visibility: visible;\n    opacity: 1; }\n\n._2dgxk {\n  position: absolute;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0; }\n  ._2dgxk aside {\n    position: absolute;\n    top: 0;\n    right: 0;\n    bottom: 0;\n    left: 0;\n    padding: 10px; }\n\n._1GnKZ {\n  width: 100%;\n  height: 100%;\n  overflow: hidden; }\n  ._1GnKZ video {\n    max-width: 100%;\n    max-height: 100%;\n    width: 100%;\n    height: 100%;\n    transition: filter 1s, transform 1s; }\n  ._1GnKZ._2i5wf video {\n    filter: blur(5px);\n    transform: scale(1.2); }\n\n._1eiIf {\n  display: block; }\n\n.Q47CE {\n  position: relative;\n  width: 100%;\n  height: 100%;\n  transition: visibility .35s; }\n\n._3HGkX {\n  position: absolute;\n  right: 10px;\n  bottom: 10px;\n  font-size: 12px;\n  color: #fff; }\n\n.jRP47 {\n  position: absolute;\n  bottom: 5%;\n  left: 3%;\n  width: 60px;\n  height: 60px;\n  line-height: 60px;\n  overflow: hidden;\n  text-align: center;\n  border-radius: 50%;\n  background: rgba(88, 79, 95, 0.8);\n  box-shadow: 0 0 10px rgba(88, 79, 95, 0.8); }\n  .jRP47[disabled] {\n    color: #999; }\n\n._2Av6f {\n  margin-top: 5%;\n  margin-left: 5%;\n  width: 90%;\n  height: 90%;\n  visibility: hidden;\n  opacity: 0;\n  transition: opacity .35s;\n  background: rgba(88, 79, 95, 0.85);\n  padding: 20px;\n  position: relative; }\n  ._2Av6f._2i5wf {\n    margin: 0;\n    width: 100%;\n    height: 100%;\n    visibility: visible;\n    opacity: 1; }\n\n._2T_w2 {\n  width: 320px;\n  display: block;\n  margin: auto; }\n\n._2AJAG {\n  font-size: 18px; }\n\n._2ax7i {\n  text-align: right;\n  font-size: 12px; }\n\n.BNdkY {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  border: none;\n  border-radius: 50%;\n  width: 100px;\n  height: 100px;\n  display: block;\n  margin: auto;\n  color: #584f5f;\n  font-size: 24px;\n  background: rgba(255, 255, 255, 0.9);\n  box-shadow: 0 0 10px rgba(0, 0, 0, 0.8); }\n\n._1nK_J {\n  display: flex;\n  height: 100%;\n  flex-direction: column; }\n\n._1V8mG {\n  display: flex;\n  align-items: center;\n  flex: 1; }\n\n.-Kejv {\n  overflow-x: auto;\n  overflow-y: hidden;\n  white-space: nowrap; }\n  .-Kejv figure {\n    max-width: 30vh;\n    height: 100%;\n    position: relative;\n    margin-right: 200px; }\n    .-Kejv figure div {\n      height: 70%; }\n  .-Kejv article {\n    position: absolute;\n    top: 5px;\n    right: -180px;\n    width: 180px; }\n  .-Kejv ._3MtSS {\n    height: 100%; }\n  .-Kejv img {\n    width: 100%;\n    height: auto;\n    max-width: 100%; }\n\n._1aNqI {\n  display: none; }\n\n._3oWTp {\n  position: absolute;\n  bottom: 30px;\n  right: 20px;\n  width: 50px;\n  height: 50px;\n  border-radius: 50%;\n  background: #23A570;\n  color: #fff;\n  border: 2px solid #999;\n  box-shadow: 0 0 10px rgba(0, 0, 0, 0.85); }\n\n._2XsM2 {\n  width: 100%;\n  height: 100%; }\n  ._2XsM2._2rR5P {\n    filter: blur(8px); }\n\n.kzcUT {\n  position: fixed;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  background: rgba(88, 79, 95, 0.8);\n  visibility: hidden;\n  opacity: 0; }\n  .kzcUT._2rR5P {\n    visibility: visible;\n    opacity: 1; }\n\n._3sC-F {\n  width: 600px;\n  height: 100%;\n  margin: auto;\n  padding: 50px 0; }\n\n._3XS2U {\n  text-align: center;\n  font-size: 18px;\n  color: #fff;\n  border-bottom: 1px solid rgba(238, 238, 238, 0.2);\n  margin-bottom: 20px; }\n\n._3D-cJ {\n  margin-bottom: 15px;\n  display: flex;\n  font-size: 12px; }\n  ._3D-cJ .ljpHo {\n    flex: 1; }\n\n._3CGer {\n  height: 35vh;\n  overflow: auto;\n  margin: 0 0 15px;\n  padding: 0 10px; }\n  ._3CGer li {\n    display: flex;\n    margin-bottom: 10px; }\n  ._3CGer .ljpHo {\n    flex: 1; }\n\n._3E8D9 {\n  width: 100%; }\n\n.C8pgC {\n  width: 100%;\n  color: #fff;\n  min-height: 100px;\n  padding: 5px;\n  border: 1px solid rgba(238, 238, 238, 0.2);\n  border-radius: 5px;\n  background: none; }\n", ""]);

	// exports
	exports.locals = {
		"exercise-container": "_3n1-C",
		"exercise-header": "Jy8Ax",
		"exercise-title": "UxslB",
		"title-progress-wrap": "FUSDk",
		"progress-item": "_17JXW",
		"button-header": "_3FwO6",
		"button-header-prev": "_3RBKe",
		"button-header-next": "_7TcRO",
		"content-scroll": "_1VSHW",
		"content-left": "tIKUE",
		"content-right": "_6qWUq",
		"arrow-center": "EMqBv",
		"arrow-top": "mYDob",
		"arrow-right": "_38BmA",
		"arrow-bottom": "_1MEMb",
		"arrow-left": "_3L2WM",
		"gather": "_30hRM",
		"button-toggle": "_37QEa",
		"exercise-video": "_2ExBK",
		"exercise-inner": "_2dgxk",
		"video-wrap": "_1GnKZ",
		"show": "_2i5wf",
		"command-layer": "_1eiIf",
		"info-layer": "Q47CE",
		"timeout-total-time": "_3HGkX",
		"countdown-times": "jRP47",
		"timeout-layer": "_2Av6f",
		"timeout-tips": "_2T_w2",
		"timeout-title": "_2AJAG",
		"timeout-author": "_2ax7i",
		"button-timeout": "BNdkY",
		"content-inner-flex": "_1nK_J",
		"coordinates-flex": "_1V8mG",
		"content-coordinates": "-Kejv",
		"exercise-figure": "_3MtSS",
		"other-res": "_1aNqI",
		"button-toggle-sound": "_3oWTp",
		"exercise-page": "_2XsM2",
		"active": "_2rR5P",
		"finish-page": "kzcUT",
		"finish-inner": "_3sC-F",
		"finish-title": "_3XS2U",
		"finish-detail": "_3D-cJ",
		"col": "ljpHo",
		"finish-actions": "_3CGer",
		"finish-feel": "_3E8D9",
		"feel-content": "C8pgC"
	};

/***/ },

/***/ 687:
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFsAAACGCAQAAAAYnz7jAAAE9klEQVR4Ae3ZA5TkWBxG8a8x5tq2bdu2bXNs27Ztr23bNtpG3UVtb/KKrUrenJPf/7iQGxeUCrzgjNYfuATZqRFkB9lBdpDNidxvczb3c6JMHMRjQBk72JrNDpQBj3GQwtiV+YQIm2lt9kzCQsxnV0lMxlHJvjZmsy+VOCZJYltKcKy0MnsljhK21T8YjNvRtmVzNG6DFcbG5OF4wbrsF3DksbGq0Bm3s23K5mzcOstBc37D8R7ptmSTzns4fqO53LgXt6utyb4at3tloiHf4PiKhjZk05CvcHwTo4prcbtHdcBDzqgOuAe3axWNdD7A8QvN5DOa8SuOD0hXLJyLWyf5jE64nat4eAlHLhvJR2xELo6XFB/H4jZIPmIQbscqEVbjKGYb+YRtKMaxWomxHyEck+QTJuEIsZ+SYTZVPuYC+YQL+Jgqs5QcO1EGfM9NZMhHZHAT3wNl7KTqoBcP0VgWoDEP0VO1FAgEAoFAIBAIBAIcSgce5wsKKeZnXmc6l9NcHuAQevIM35BPNt/yImO4hOZKjst4i1hy6EcLpRCn8Sqx5DKYTRQf2/IkiXzFsUoJmjGWRLK4QbGxM9+STCWDOb/e5yo+J7lOisbu/Ijt+srEdvyK/aC33FjG+qGCA1SFc4ilgFd4hyy8V8qrPMEPxPIyaQrjEyK9x5mkSxJpHMezeOd77qS1/sVOTKeSSBfpHxxMpJU0lIEcvPEYG8rAFZRjWqh/MBDTuzRUBLLxxp2Kwt2YimgW6xA5QbIqO533MZ0tMijD7UvJjmwHD2K6X2yPaayF2ftgGiqOxvSghdmNCeE2XxyC6W4Ls9MwTRd7YOpgYXZrTKPEFpiWWph9EqZekvgNtywaWZfdB9MlkliB6Sq7ssngR0zbSqItpndJtyr7Wkzf6x9sTwjTTfZk05hvMfVXGE9jymIra7IHEWkv59t6pCfJlAs/4o3rZOA0QpieUxXSeIdIk+TC+3jjTLmwP3lEOlYOziJaH/2PZ/HGoca//z8RabVMLCTa5KpDhcV4Ywf9hyP4jUgF7CQTG/Mr0Z4NP5GeeKGYBvoX11BMtDsUjVOpIFohD5LOhXjhRUliExYQy0LFxl3E9gpn44VBZHATvxHL6zRVPAwhtjK8MJEPiO0btlAiDMY+n7OtkqEHdvmAzVUdnMMf2GIxLVVdbM2z+K+ctqSpJsigKxX46S0OVG1wOE/hjz94hEzVHsfzHN76hUdorrrjFF7CG99xN41Vf9ibXnxB6hSwgMtpqFTgEAbxE/Uri6mcR2OlFi1YSP3pQqa8wiNUUHch7pe3OIFfqZsszpP32IoZVFBbz7Cd/MJuzKKSmvqOy+U39mA2pVTX+9xAI9mB1tzACnJI5AsGcJjsQzr7cxP9WMILvM/XfMq7PMs0unEBW+gfgQCncR+nsj0t9B9asR/n0UA2YyVVysmlmBBhR8teZJJHbJ1kL44gnqdlL4YQTymbyE40IYv42shOXE8iX5Im+5DGWyR2luzDxSTzBmmyCxl8THIXyy7cTHV8QqbswUb8TiT7rydMprqK2EF24ARqYp1sQCu+pWbukf+YRU0Vs5f8xY3Uxoc0l3/YjyJqZ578wsZ8Te11lD+4kP51mL5sIksEAmzMC1QSqvfJ5UGlDm1JlXKaKlUYQOpsEWQH2UF2kB1kB9nr9V1yY14kRP3L4yHVyF9QVS1HNsGowgAAAABJRU5ErkJggg=="

/***/ }

});