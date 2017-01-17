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

#### 训练

* spotlight - `https://api.gotokeep.com/v1.1/home/spotlight`

* plan - `https://api.gotokeep.com/v2/plans/[user.id(565bfb0f2f5f272b8a7880eb)]?trainer_gender=M`

* 训练动态 - `https://api.gotokeep.com/v1.1/workouts/54afbef416a510a82194e257/timeline?slimWorkout=true`
* 训练动态精选（包括打卡用户，精选评论，每一名言） - `https://api.gotokeep.com/v1.1/workouts/565bfb0f2f5f272b8a7880eb/dynamic?tLimit=3`
* 训练动态评论 - `https://api.gotokeep.com/v1.1/plans/565bfb0f2f5f272b8a7880eb/dynamic?tLimit=3&tSlimWorkout=true`
* 
* 类动态内容 - `https://api.gotokeep.com/v1.1/workouts/565bfb0f2f5f272b8a7880eb/dynamic?tLimit=3`

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