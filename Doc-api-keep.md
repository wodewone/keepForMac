### Home

* 用户训练数据 - `https://api.gotokeep.com/v2/home/dashboard/pwData`
	* v2 - `https://api.gotokeep.com/training/v2/home`
* 用户训练统计 - `https://api.gotokeep.com/v1.1/home/dashboard/statistics`
* 用户个人资料 - `https://api.gotokeep.com/v1.1/home/dashboard/user`
* 训练排名 - `https://api.gotokeep.com/social/v2/rankinglist/brief/?date=[YYYYMMDD(20161220)]`


* 地区信息 - `https://api.gotokeep.com/v1.1/home/cities`

* 登录 - `https://api.gotokeep.com/v1.1/users/login`

* 注册 - `https://api.gotokeep.com/v1.1/sms/evil`

* 首页推荐 - `https://api.gotokeep.com/training/v2/recommend`	

### 训练

* spotlight - `https://api.gotokeep.com/v1.1/home/spotlight`

* plan - `https://api.gotokeep.com/v2/plans/[user.id(565bfb0f2f5f272b8a7880eb)]?trainer_gender=M`

* 训练动态 - `https://api.gotokeep.com/v1.1/workouts/54afbef416a510a82194e257/timeline?slimWorkout=true`
* 训练动态精选（包括打卡用户，精选评论，每一名言） - `https://api.gotokeep.com/v1.1/workouts/565bfb0f2f5f272b8a7880eb/dynamic?tLimit=3`
* 训练动态评论 - `https://api.gotokeep.com/v1.1/plans/565bfb0f2f5f272b8a7880eb/dynamic?tLimit=3&tSlimWorkout=true`

* 类动态内容 - `https://api.gotokeep.com/v1.1/workouts/565bfb0f2f5f272b8a7880eb/dynamic?tLimit=3`


#### 开始训练

* 完成一次训练 - `https://api.gotokeep.com/now` 
* 提交训练状态[post] - `https://api.gotokeep.com/v1.1/home/saveTrainingLog`
	> ```json
	{
		"serverEndTime": "2017-01-18T04:36:58.000Z",
		"feel": 0,
		"doneDate": "2017-01-18T04:36:57.000Z",
		"exerciseCount": 1,
		"workoutId": "565bfb0f2f5f272b8a7880eb",
		"secondDuration": 40,
		"calorie": 4,
		"inSchedule": "no",
		"duration": 1,
		"groups": [{
			"name": "右臂后侧拉伸",
			"type": "countdown",
			"actualSec": 20,
			"totalSec": 20,
			"exercise": "55cc42e90f11ec78824999ea"
		}]
	}
	```

* 是否获得新成就[post] - `https://api.gotokeep.com/v1.1/home/achievements/new`

* 完成训练[post] - `https://api.gotokeep.com/v1.1/hashtagModules/recommend`
	> ```json
	{
		"plan": "565bfb0f2f5f272b8a7880eb",
		"type": "plan",
		"workout": "565bfb0f2f5f272b8a7880eb"
	}
	```
	
* 发布上传图片[post][file文件] - `http://180.97.72.164:80/`	
* 发布动态[post] - `https://api.gotokeep.com/social/v2/entries/tweet`

	> ```json
	{
		"photo": "http:\/\/static1.keepcdn.com\/picture\/2017\/01\/18\/13\/03cd7dbf6c3bbf6f495fe86c58b9982fd3a1195b_320x320.jpg",
		"feel": 0,
		"type": "normal",
		"originalMd5": "ca090da3300d60056714874efba04446,70fe02daf50a6390d4126e3a7e302d26",
		"traininglog": "56a39f4abc3f032805db1088_9223370552140558807_tr",
		"content": "我",
		"workoutId": "565bfb0f2f5f272b8a7880eb",
		"public": "true",
		"requestId": "1484716650.487752",
		"contentType": []
	}
	```

#### 排名

* 好友排名列表 - `https://api.gotokeep.com/social/v2/rankinglist?date=[YYYYMMDD(20161220)]&dateUnit=Week&type=Run`
	

	
### User

* 用户数据 - `https://api.gotokeep.com/v2/people/[user.id(565bfb0f2f5f272b8a7880eb)]`
* 成就徽章 - `https://api.gotokeep.com/v1.1/home/achievements`
	

### 发现

* 发现 - `https://show.gotokeep.com/explore/`
	* config - `https://api.gotokeep.com/config/v2/basic`

* 精选 - `https://api.gotokeep.com/social/v2/follow/timeline`
	* 精选推荐 - `https://show.gotokeep.com/explore/latter_v2?source=ios`

* 训练 - `https://api.gotokeep.com/training/v2/course/discover?count=20`
	* banner - `https://api.gotokeep.com/v1.1/ads/banner?type=2`

* 饮食 - `https://api.gotokeep.com/training/v2/diet/home?count=20`
	* banner - `https://api.gotokeep.com/v1.1/ads/banner?type=4`
	
* 商城 - `https://store.gotokeep.com/api/v1.0/subject/recommondAreaList?count=7`
	* category - `https://store.gotokeep.com/api/v2/vcategory?cid=0`
	* banner - `https://store.gotokeep.com/api/v1.0/subject/bannerList`
	* notice - `https://store.gotokeep.com/api/v1.0/subject/noticeList`
	* cart - `https://store.gotokeep.com/api/v1.1/carts`
	* cart[s] - `https://store.gotokeep.com/api/v1.0/carts/num`


### 动态

* 动态列表 - `https://api.gotokeep.com/social/v2/follow/timeline`
	* 动态详情 - `https://api.gotokeep.com/v1.1/entries/[list.id(587e823e19b6fc4fd0087d3b)]?limit=20&reverse=true`
	* 动态详情评论列表 - `https://api.gotokeep.com/v1.1/entries/[list.id(587e823e19b6fc4fd0087d3b)]/comments?limit=20&reverse=true`
	* 动态点赞/取消点赞 [post] - `https://api.gotokeep.com/v1.1/entries/[list.id(587e823e19b6fc4fd0087d3b)]/likes`

* 动态评论[post] - `https://api.gotokeep.com/v1.1/entries/[list.id(587e823e19b6fc4fd0087d3b)]/comments`
	> ```json
	{
		"content": "评论内容",
		"reply": "是否是回复评论 ? 评论ID(587e9c5cf9da930a8b0ea427) : 无此参数",
		"requestId": "1484736116"
	}
	```
	
	* 评论点赞[post]/取消点赞[delete] - `https://api.gotokeep.com/v1.1/comments/587ed3b319b6fc4fd01108fe/likes`

	
* 收藏动态[post]/删除收藏[delete] - `https://api.gotokeep.com/v1.1/favorites/entry/[list.id(587e823e19b6fc4fd0087d3b)]`


#### 小组

* 小组推荐 - `https://api.gotokeep.com/social/v2/group/?limit=20`
* 发现小组 - `https://api.gotokeep.com/social/v2/group/recommend/all/?city=%E5%8C%97%E4%BA%AC%E5%B8%82&country=%E4%B8%AD%E5%9B%BD`
	* `https://api.gotokeep.com/social/v2/group/recommend/all/?city=北京市&country=中国`



### 我

* 我的配置 - `https://api.gotokeep.com/v1.1/home/setting`
* 训练等级 - `https://api.gotokeep.com/v1.1/home/achievement/levels/durationLevel?uid=[user.id(56a39f4abc3f032805db1088)]`
* 跑步等级 - `https://api.gotokeep.com/v1.1/home/achievement/levels/runningDistanceLevel?uid=[user.id(56a39f4abc3f032805db1088)]`
* 我的徽章 - `https://api.gotokeep.com/v1.1/home/achievements?uid=[user.id(56a39f4abc3f032805db1088)]`
* 购物车 - `https://store.gotokeep.com/api/v1.1/carts`
* 我的订单 - `https://store.gotokeep.com/api/v1.2/order/list/?page=1&per_page=10`
* 优惠券 - `https://store.gotokeep.com/api/v1.0/coupon/list?page=1&per_page=10`
	* 兑换优惠券 - `https://store.gotokeep.com/api/v1.0/promotion/getCouponByPwd?pwd=oooookk`
* 收藏
	* 动作收藏  - `https://api.gotokeep.com/v1.1/favoriteExercises?trainer_gender=m`
	* 动态收藏 - `https://api.gotokeep.com/v1.1/favorites`
	* 商品收藏 - `https://store.gotokeep.com/api/v1.0/favorites/list/?page=1&per_page=10`
	* 菜谱收藏 - `https://api.gotokeep.com/training/v2/diet/favorites?count=20`

* 身体数据 - `https://api.gotokeep.com/v1.1/bodyData?size=30&timespan=week&type=all&user=[user.id(56a39f4abc3f032805db1088)]`
* 运动能力 - `https://api.gotokeep.com/training/v2/physical/record/list`


### 修改个人配置

* 我的资料[post] - `https://api.gotokeep.com/v1.1/home/setting`

	> ```json
	{
		"username": "昵称",
		"bio": "个人简介",
		"citycode": "地区编码",
		"birthday": "生日年月(1992-03)"
	}
	```


### 好友

* 好友信息 - `https://api.gotokeep.com/v2/people/[user.id(58518a02493303397b87862a)]/timeline?type=all%2Cphoto(all,photo)`
* 好友推荐 - `https://api.gotokeep.com/friends/v2/rec/profile/follow?fid=[user.id(58518a02493303397b87862a)]&pageCount=10`


### Other

* `https://store.gotokeep.com/api/v1.0/userProfiles`
* `https://api.gotokeep.com/messenger/v2/conversations/unread`
* 检查更新 - `https://api.gotokeep.com/v1.1/upgrade/check`
* keep通知 - `https://api.gotokeep.com/config/v2/push`


icon loading -  `https://staticssl.gotokeep.com/show/images/loading-19a448dd0e.gif`



### Token

Request - `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NmEzOWY0YWJjM2YwMzI4MDVkYjEwODgiLCJ1c2VybmFtZSI6IuaBr-mcsumcsiIsImF2YXRhciI6Imh0dHA6Ly9zdGF0aWMxLmdvdG9rZWVwLmNvbS9hdmF0YXIvMjAxNi8wMy8wMi8yMi8zNGIyMjEwZDY5YWVkYjFmNzk2MmU2NGQ3ODEzYWE5MWZiYzIxMzA5LmpwZyIsImdlbmRlciI6Ik0iLCJ pc3MiOiJodHRwOi8vd3d3LmdvdG9rZWVwLmNvbS8iLCJleHAiOjE0OTAyODIyNTMsImlhdCI6MTQ4MTY0MjI1M30.TMbdxPsCxvabpfyNUyf6JvW_tl4QdmCKmAuSuRJaahg`

Response - `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NmEzOWY0YWJjM2YwMzI4MDVkYjEwODgiLCJ1c2VybmFtZSI6IuaBr-mcsumcsiIsImF2YXRhciI6Imh0dHA6Ly9zdGF0aWMxLmdvdG9rZWVwLmNvbS9hdmF0YXIvMjAxNi8wMy8wMi8yMi8zNGIyMjEwZDY5YWVkYjFmNzk2MmU2NGQ3ODEzYWE5MWZiYzIxMzA5LmpwZyIsImdlbmRlciI6Ik0iLCJ kZXZpY2VJZCI6Ijg2NzA2ODAyNTEwOTIxNWZjNjRiYTA5ODVlMTExMTExZWFjNTI5YmIiLCJpc3MiOiJodHRwOi8vd3d3LmdvdG9rZWVwLmNvbS8iLCJleHAiOjE0OTAyODA0MzksImlhdCI6MTQ4MTY0MDQzOX0.iST6uXpJOeYgFzO99yVCh-X4WpnABsXFMQ7q4WyFdCY`

---

`eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9`
`{"typ":"JWT","alg":"HS256"}`

``