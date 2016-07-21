// 在自执行函数前加；用来规避前一个JS脚本可能带来的语法错误。

;(function($){
	
	var Carousel = function(poster){
		var self = this;
		
		this.poster = poster;   // 保存单个poster对象
		this.posterItemMain = poster.find("ul.poster-list");
		this.prevBtn = poster.find("div.poster-prev-btn");
		this.nextBtn = poster.find("div.poster-next-btn");

		this.posterItems = poster.find("li.poster-item");
		if(this.posterItems.length%2 == 0){
			this.posterItemMain.append(this.posterItems.eq(0).clone());
			this.posterItems = this.posterItemMain.children();
		};

		this.posterFirstItem = this.posterItems.first();
		this.posterLastItem  = this.posterItems.last();
		this.rotating = true;
		// 默认配置参数
		
		this.setting = {
						"width":1000,             //图片宽度
			 			"height":400,             
			 			"posterWidth":640,       //第一帧宽度
			 			"posterHeight":400,
			 			"scale":0.9,		     //记录显示比例关系
						"speed":500,
						"autoPlay":true,
						"delay":5000,
			 			"verticalAlign":"middle"
												};
		// jQuery的extend方法，有的话就替换，没有的话就追加										
		$.extend(this.setting,this.getSetting());
											
		// 设置配置参数值									
		this.setSettingValue();	
		this.setPosterPos();

		this.nextBtn.click(function(){
			if(self.rotating){
				self.rotating = false;
				self.carouselRotate("left");
			}
		});	

		this.prevBtn.click(function(){
			if(self.rotating){
				self.rotating = false;
				self.carouselRotate("right");
			}
		});

		// 是否执行自动播放
		if(this.setting.autoPlay){
			this.autoPlay();
			this.poster.hover(function(){
				window.clearInterval(self.timer);
			},function(){
				self.autoPlay();
			});
		};

	};
	Carousel.prototype = {
		// 自动播放
		autoPlay:function(){
			var self = this;
			this.timer = window.setInterval(function(){
				self.nextBtn.click();
			},self.setting.delay);


		},

		// 旋转
		carouselRotate:function(direction){
			var self = this;
			var zIndexArr = [];


			if(direction === "left"){
				this.posterItems.each(function(){
					var _this_ = $(this),
						prev   = _this_.prev().get(0)?_this_.prev():self.posterLastItem,
						width  = prev.css("width"),
						height = prev.css("height"),
						zIndex = prev.css("zIndex"),
						opacity= prev.css("opacity"),
						left   = prev.css("left"),
						top    = prev.css("top");
						zIndexArr.push(zIndex);

					_this_.animate({
						width:width,
						height:height,
						// zIndex:zIndex,    zIndex在animate直接设置会让用户感到很突兀，应该点击的那瞬间先把下一张图片置顶。
						opacity:opacity,
						left:left,
						top:top
					}, self.setting.speed,function(){
						self.rotating = true;
					});	

				});

				this.posterItems.each(function(i){
					$(this).css("zIndex",zIndexArr[i]);

				});



			}else if(direction === "right"){
				this.posterItems.each(function(){
					var _this_ = $(this),
						next   = _this_.next().get(0)?_this_.next():self.posterFirstItem,
						width  = next.css("width"),
						height = next.css("height"),
						zIndex = next.css("zIndex"),
						opacity= next.css("opacity"),
						left   = next.css("left"),
						top    = next.css("top");
						zIndexArr.push(zIndex);

					_this_.animate({
						width:width,
						height:height,
						zIndex:zIndex,
						opacity:opacity,
						left:left,
						top:top
					},self.setting.speed,function(){
						self.rotating = true;
					});	

				});

				this.posterItems.each(function(i){
					$(this).css("zIndex",zIndexArr[i]);

				});
			}



		},



		// 设置剩余的图片的位置关系
		setPosterPos:function(){

			var self       = this;
			var sliceItems = this.posterItems.slice(1),
				sliceSize  = sliceItems.length/2,
				rightSlice = sliceItems.slice(0,sliceSize),
				leftSlice  = sliceItems.slice(sliceSize),
				rightLevel = Math.floor(this.posterItems.length/2),
		    	gap        = ((this.setting.width - this.setting.posterWidth)/2)/rightLevel;

			// 设置右边图片的位置关系属性
			var rightWidth = this.setting.posterWidth,
		    	rightHeight= this.setting.posterHeight;
		    	


			var firstLeft = (this.setting.width - this.setting.posterWidth)/2;
			var fixOffsetLeft = firstLeft + this.setting.posterWidth;             //左边的距离加上第一张图片的宽

			rightSlice.each(function(index){

				rightLevel--;
				rightWidth = rightWidth *self.setting.scale;
				rightHeight= rightHeight*self.setting.scale;
				var j = index;
			
				++j;

				$(this).css({
					zIndex:rightLevel,
					width:rightWidth,
					height:rightHeight,
					opacity:1/j,             // 相当于1除以图片的索引值（从1开始，所以要先加后取值）
					left:fixOffsetLeft + (++index)*gap - rightWidth,
					top:self.setVerticalAlign(rightHeight)
				})
			})			
 		
		// 设置左边图片的位置关系属性
			var leftWidth = rightSlice.last().width(),
				leftHeight= rightSlice.last().height(),
				leftLevel = Math.floor(this.posterItems.length/2);
		

			leftSlice.each(function(index) {
				$(this).css({
					zIndex:index,
					width:leftWidth,
					height:leftHeight,
					opacity:1/leftLevel,               // 左边的第一张图的opacity相当于1除以左边图片的数目，然后每次循环除以的图片数目递减。
					left:index*gap,
					top:self.setVerticalAlign(leftHeight)
				
				})
				leftWidth = leftWidth/self.setting.scale;
				leftHeight= leftHeight/self.setting.scale;
				leftLevel--;
			}); 


		},

		// 设置垂直排列对齐
		setVerticalAlign:function(height){
			var verticalType = this.setting.verticalAlign,
				top = 0;
			if(verticalType === "middle"){
				top = (this.setting.height-height)/2;
			}else if(verticalType ==="top"){
				top = 0;
			}else if(verticalType === "bottom"){
				top = this.setting.height-height;
			}else{
				top = (this.setting.height-height)/2;
			};	
			return top;



		},
		// 设置配置参数值去控制基本的宽度高度。。。
		setSettingValue:function(){

			this.poster.css({
				width: this.setting.width,
				height:this.setting.height
			});

			this.posterItemMain.css({
				width: this.setting.width,
				height:this.setting.height
			});

		// 获取左右切换按钮的宽度
			
			var w = (this.setting.width - this.setting.posterWidth) / 2;
			
			this.nextBtn.css({
				width:w,
				height:this.setting.height,
				zIndex:Math.ceil(this.posterItems.length/2)    // zIndex不可能为负数，所以运用Math.ceil()方法向上取整。
			})

			this.prevBtn.css({
				width:w,
				height:this.setting.height,
				zIndex:Math.ceil(this.posterItems.length/2)
			})

			this.posterFirstItem.css({
				width :this.setting.posterWidth,
				height:this.setting.posterHeight,
				top:0,
				zIndex:Math.floor(this.posterItems.length/2),
				left:w
			})

		},

		// 获取人工配置参数
		getSetting:function(){

			var setting = this.poster.attr("data-setting");
			if(setting&&setting!=""){
				return $.parseJSON(setting);
			}else{
				return {};
			}
			



		}
		
	};
	Carousel.init = function(posters){
		// _this_等价于Carousel
		var _this_ = this;

		posters.each(function() {
			
		// 相当于new了一个Carousel，下面的$(this)等价于posters(每一张要展示的图片)	
			new _this_($(this));
		});

	}
	window.Carousel = Carousel;
	
})($);
