(function (doc, win) {
			var docEl = doc.documentElement;
			var isIOS = navigator.userAgent.match(/iphone|ipod|ipad/gi);
			var dpr = isIOS? Math.min(win.devicePixelRatio, 3) : 1;	//设备像素比
			dpr = window.top === window.self? dpr : 1; //被iframe引用时，禁止缩放			
			var scale = 1 / dpr;
			var resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize';
			docEl.dataset.dpr = win.devicePixelRatio;
			if(navigator.userAgent.match(/iphone/gi) && screen.width == 375 && win.devicePixelRatio == 2){
				docEl.classList.add('iphone6');
			}
			if(navigator.userAgent.match(/iphone/gi) && screen.width == 414 && win.devicePixelRatio == 3){
				docEl.classList.add('iphone6p');
			}
			//添加一条元数据标签
			var metaEl = doc.createElement('meta');
			metaEl.name = 'viewport';
			metaEl.content = 'initial-scale=' + scale + ',maximum-scale=' + scale + ', minimum-scale=' + scale;
			docEl.firstElementChild.appendChild(metaEl);
			var recalc = function () {
				var width = docEl.clientWidth;
				if (width / dpr > 750) {
					width = 750 * dpr;
				}
				docEl.style.fontSize = 100 * (width / 750) + 'px';
			};
			recalc();
			if (!doc.addEventListener) return;
			win.addEventListener(resizeEvt, recalc, false);
		})(document, window);