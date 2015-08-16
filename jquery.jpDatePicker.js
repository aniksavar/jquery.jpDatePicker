// vim:set ts=4 noexpandtab:vim modeline
(function($){
	'use strict';
	// 日付から元号
	var GENGO = [
		 { name:'明治' ,begin:{ Y:1868 ,M:1  ,D:25 } }
		,{ name:'大正' ,begin:{ Y:1912 ,M:7  ,D:30 } }
		,{ name:'昭和' ,begin:{ Y:1926 ,M:12 ,D:25 } }
		,{ name:'平成' ,begin:{ Y:1989 ,M:1  ,D:8 } }
	];
	function toGENGO( Y ,M ,D ){
		for( var i=GENGO.length; i--; ){
			var G = GENGO[i];
			var dY = Y - G.begin.Y;
			if( dY >0 ){
				return [{ name:G.name ,Y:dY + 1 }];
			}
			else if( dY==0 ){
				if( M ){
					var dM = M - G.begin.M;
					if( dM >0 ){
						return [{ name:G.name ,Y:'元' }];
					}
					else if( dM==0 ){
						if( D ){
							if( G.begin.D <= D ) return [{ name:G.name ,Y:'元' }];
							else{
								if( i > 0 ){
									var pG = GENGO[i-1];
									return [{ name:pG.name ,Y:G.begin.Y - pG.begin.Y + 1 }];
								}
							}
						}
						else{
							var pG = GENGO[i-1];
							return [
								 { name:pG.name ,Y:G.begin.Y - pG.begin.Y + 1 }
								,{ name:G.name ,Y:'元' }
							];
						}
					}
				}
				else{
					if( i > 0 ){
						var pG = GENGO[i-1];
						return [
							 { name:pG.name ,Y:G.begin.Y - pG.begin.Y + 1 }
							,{ name:G.name ,Y:'元' }
						];
					}
					else return [{ name:G.name ,Y:'元' }];
				}
			}
		}
		// 明治より前
		return [];
	}
	// 文字列から年月日取得
	function parseYMD( s ){
		if( /(\d+)\D+(\d+)\D+(\d+)/.test(s) ){
			return { Y:parseInt(RegExp.$1) ,M:parseInt(RegExp.$2) ,D:parseInt(RegExp.$3) };
		}
		var d = new Date();
		return { Y:d.getFullYear() ,M:d.getMonth() + 1 ,D:d.getDate() };
	}
	$.fn.jpDatePicker = function( arg ){
		var plugName = 'jpDatePicker';
		var opt = $.extend(true,{
			 mondayStart: false
			,yearSuffix :'年'
			,monthSuffix:'月'
			,format     :'YYYY年MM月DD日(WW)'
			,weekTitles :['日','月','火','水','木','金','土']
			,weekClasses:['sun','mon','tue','wed','thu','fri','sat']
			,isSmartPhone:function(){
				var ua = navigator.userAgent;
				if( ua.indexOf('iPhone') >0 ) return true;
				if( ua.indexOf('iPod') >0 ) return true;
				if( ua.indexOf('Android') >0 ) return true;
				return false;
			}
		},arg);
		if( opt.mondayStart ){
		    opt.weekTitles.push( opt.weekTitles.splice(0,1)[0] );
		    opt.weekClasses.push( opt.weekClasses.splice(0,1)[0] );
		}
		var Picker = function( target ){
			var self = this;

			this.target = target;
			this.old = parseYMD( target.value );
			this.viewY = this.old.Y;
			this.viewM = this.old.M;

			var $prev = $('<a class=prev></a>').css({
				 display :'block'
				,position:'absolute'
				,left    : 0
				,top     : 0
			})
			.click(function(){ self.prevClick(); });

			var $next =$('<a class=next></a>').css({
				 display :'block'
				,position:'absolute'
				,right   : 0
				,top     : 0
			})
			.click(function(){ self.nextClick(); });

			var pos = $(target).offset();//position();
			var mode = opt.isSmartPhone() ? 'sp' : 'pc';
			switch( mode ){
			case 'pc':
				var width = 360;
				var height = 280;
				var left = pos.left;
				var top = pos.top + $(target).outerHeight();
				$prev.height( height );
				$next.height( height );
				break;
			case 'sp':
				var width = Math.min( $(window).width() ,$(window).height() );
				var height = width;
				var left = ($(window).width() - width) / 2;
				var top = ($(window).height() - height) / 2;
				this.calendarLeft = 0;
				this.calendarWidth = width;
				break;
			}

			this.$picker = $('<div></div>').css({
				 position:'absolute'
				,left    : left
				,top     : top
				,width   : width
				,height  : height
			})
			.addClass( plugName ).addClass( mode ).append( $prev ).append( $next )
			.appendTo( document.body );

			switch( mode ){
			case 'pc':
				this.calendarLeft = $prev.width();
				this.calendarWidth = width - $prev.width() - $next.width();
				break;
			}

			setTimeout(function(){ self.initCalendar(); },0);
		};
		var pp = Picker.prototype;
		pp.initCalendar = function(){
			this.$calendar = this.newCalendar().css({
				 position:'absolute'
				,left    : this.calendarLeft
				,top     : 0
				,width   : this.calendarWidth
			})
			.prependTo( this.$picker );

			this.$calendar.children('.dates').height(
				this.$picker.height() - this.$calendar.children('.title').outerHeight()
			);

			var self = this;
			$(document)
				.on('click.'+ plugName ,function(ev){
					var off = self.$picker.offset();
					off.right = off.left + self.$picker.outerWidth();
					off.bottom = off.top + self.$picker.outerHeight();
					if( ev.pageX < off.left || off.right < ev.pageX ||
						ev.pageY < off.top || off.bottom < ev.pageY
					){
						self.destroy();
					}
				})
				.on('click.'+ plugName ,'.'+ plugName +' .title .year',function(ev){
					self.years();
				})
				.on('click.'+ plugName ,'.'+ plugName +' .title .month',function(ev){
					self.months();
				});
			$(window).on('resize.'+ plugName ,function(){ self.destroy(); });
		};
		pp.destroy = function(){
			this.$picker.remove();
			this.$picker = this.$calendar = null;
			$(document).off('click.'+ plugName);
			$(window).off('resize.'+ plugName);
		};
		pp.prevClick = function(){
			if( --this.viewM <1 ){
				this.viewM = 12;
				this.viewY--;
			}
			var self = this;
			var $newCalendar = this.newCalendar().css({
				 position:'absolute'
				,left    : this.calendarLeft - this.calendarWidth
				,top     : 0
				,width   : this.calendarWidth
			})
			.insertAfter( this.$calendar )
			.animate({
				left: this.calendarLeft
			},{
				complete:function(){
					self.$calendar.remove();
					self.$calendar = $newCalendar;
				}
				,duration:100
			});
			this.$calendar.animate({
				left: this.calendarLeft + this.calendarWidth
			},{
				duration:100
			});
			$newCalendar.children('.dates').height(
				this.$picker.height() - $newCalendar.children('.title').outerHeight()
			);
		};
		pp.nextClick = function(){
			if( ++this.viewM >12 ){
			    this.viewM = 1;
			    this.viewY++;
			}
			var self = this;
			var $newCalendar = this.newCalendar().css({
				 position:'absolute'
				,left    : this.calendarLeft + this.calendarWidth
				,top     : 0
				,width   : this.calendarWidth
			})
			.insertAfter( this.$calendar )
			.animate({
				left: this.calendarLeft
			},{
				complete:function(){
					self.$calendar.remove();
					self.$calendar = $newCalendar;
				}
				,duration:100
			});
			this.$calendar.animate({
				left: this.calendarLeft - this.calendarWidth
			},{
				duration:100
			});
			$newCalendar.children('.dates').height(
				this.$picker.height() - $newCalendar.children('.title').outerHeight()
			);
		};
		pp.newCalendar = function(){
			var html = '<div class=calendar>';
			var gengos = toGENGO( this.viewY ,this.viewM );
			var gengo = [];
			// 元号
			for( var i=0; i<gengos.length; i++ ){
				var G = gengos[i];
				gengo.push(
					'<span class=gengo>'+ G.name +'</span><span class=genyear>'+ G.Y +'</span>'
				);
			}
			// 年月
			html += '<div class=title>'
			      + '<a class=year>'+ gengo.join('/') +'<div class=AD>'+ this.viewY +'</div></a>'+ opt.yearSuffix
			      + '<a class=month>'+ this.viewM +'</a>'+ opt.monthSuffix
			      + '</div>';
			// 曜日・日付テーブル
			html += '<table class=dates>';
			// 曜日行
			html += '<tr>';
			for( var i=0; i<opt.weekTitles.length; i++ ){
				html += '<th class="'+ opt.weekClasses[i] +'">'+ opt.weekTitles[i] +'</th>';
			}
			html += '</tr>';
			// 表示月の1日と最終日
			var first = new Date( this.viewY ,this.viewM - 1 ,1 );
			var last = new Date( this.viewY ,this.viewM ,0 );
			// 先月と来月が入ってくるそれぞれの日数
			if( opt.mondayStart ){
				// 月曜はじまり
				var prevMonthDays = [6,0,1,2,3,4,5][first.getDay()];
				var nextMonthDays = [0,6,5,4,3,2,1][last.getDay()];
			}
			else{
				// 日曜はじまり
				var prevMonthDays = first.getDay();
				var nextMonthDays = [6,5,4,3,2,1,0][last.getDay()];
			}
			// 表示年月日
			var dates = [];
			// 先月
			if( prevMonthDays ){
				// 先月の最終日
				var prevLast = (new Date( this.viewY ,this.viewM - 1 ,0 )).getDate();
				var Y = this.viewY;
				var M = this.viewM - 1;
				if( M < 1 ){ Y--; M = 12; };
				for( var i=prevLast - prevMonthDays + 1; i<=prevLast; i++ ){
					dates.push({ Y:Y ,M:M ,D:i });
				}
			}
			// 今月
			for( var i=1; i<=last.getDate(); i++ ){
				dates.push({ Y:this.viewY ,M:this.viewM ,D:i });
			}
			// 来月
			for( var i=1; i<=nextMonthDays; i++ ){
				var Y = this.viewY;
				var M = this.viewM + 1;
				if( M > 12 ){ Y++; M = 1; };
				dates.push({ Y:Y ,M:M ,D:i });
			}
			// 今日
			var now = new Date();
			var today = { Y:now.getFullYear() ,M:now.getMonth()+1 ,D:now.getDate() };
			// HTML生成
			var self = this;
			for( var i=0; i<dates.length; ){
				html += '<tr>';
				for( var w=0; w<7; w++, i++ ){
					var d = dates[i];
					var dataYMD = d.Y +'-'+ d.M +'-'+ d.D;
					var classes = [opt.weekClasses[w]];
					if( d.M !== this.viewM ){
					    classes.push('otherMonth');
					}
					if( d.Y===today.Y && d.M===today.M && d.D===today.D ){
					    classes.push('today');
					}
					if( d.Y===this.old.Y && d.M===this.old.M && d.D===this.old.D ){
					    classes.push('current');
					}
					html += '<td class="'+ classes.join(' ') +'" data-ymd="'+ dataYMD +'">'
					      + d.D
					      + '</td>';
				}
				html += '</tr>';
			}
			html += '</table>';
			html += '</div>';
			return $(html).on('click','td',function(){
				var d = parseYMD( $(this).data('ymd') );
				self.target.value = self.format( d );
				self.destroy();
			});
		};
		pp.format = function( d ){
			var weeks = ['日','月','火','水','木','金','土'];
			var w = (new Date( d.Y ,d.M - 1 ,d.D )).getDay();
			return opt.format
				.replace('YYYY',d.Y)
				.replace('MM',('0'+ d.M).slice(-2))
				.replace('DD',('0'+ d.D).slice(-2))
				.replace('WW',weeks[w]);
		};
		pp.years = function(){
			var W = this.$picker.width();
			var html = '<div class=years style="width:'+ W +'px;">';
			var beginY = this.viewY - 50;
			var endY = this.viewY + 50;
			var yearW = (W - 17) / 4;
			var nowY = (new Date()).getFullYear();
			for( var y=beginY; y<endY; y++ ){
				var yClass = ['year'];
				var gengos = toGENGO( y );
				var gengo = [];
				if( y===this.viewY ) yClass.push('current');
				if( y===nowY ) yClass.push('now');
				for( var i=0; i<gengos.length; i++ ){
					var G = gengos[i];
					gengo.push(
						'<span class=gengo>'+ G.name +'</span><span class=genyear>'+ G.Y +'</span>'
					);
				}
				html += '<div class="'+ yClass.join(' ') +'" style="width:'+ yearW +'px;">'
					  + gengo.join('/') +'<div class=AD>'+ y +'</div>'
					  + '</div>';
			}
			html += '</div>';
			var self = this;
			var $years = $(html).on('click','.year',function(){
				self.viewY = parseInt( $(this).children('.AD').text() );
				self.months();
				$years.fadeOut(100,function(){
					$years.remove();
					self.$picker.removeClass('years');
				});
			})
			.appendTo( this.$picker.addClass('years') );

			this.$picker.scrollTop( ($years.height() - this.$picker.height()) / 2 );
		};
		pp.months = function(){
			var nowM = (new Date()).getMonth() + 1;
			var month = 1;
			var html = '<table class=months>';
			for( var row=4; row--; ){
				html += '<tr>';
				for( var col=3; col--; ){
					var mClass = [];
					if( month===nowM ) mClass.push('now');
					if( month===this.viewM ) mClass.push('current');
					html += '<td class="'+ mClass.join(' ') +'"><big>'+ (month++) +'</big>'+ opt.monthSuffix +'</td>';
				}
				html += '</tr>';
			}
			html += '</table>';
			var self = this;
			var $months = $(html).on('click','td',function(){
				self.viewM = parseInt( $(this).children('big').text() );
				var $newCalendar = self.newCalendar().css({
					 position:'absolute'
					,left    : self.calendarLeft
					,top     : 0
					,width   : self.calendarWidth
				})
				.insertAfter( self.$calendar );
				$newCalendar.children('.dates').height(
					self.$picker.height() - $newCalendar.children('.title').outerHeight()
				);
				self.$calendar.remove();
				self.$calendar = $newCalendar;
				$months.fadeOut(100,function(){ $months.remove(); });
			})
			.height( this.$picker.height() ).appendTo( this.$picker );
		};
		this.each(function(){
			$(this).on('click.'+ plugName ,function(){ new Picker(this); });
		});
		return this;
	};
})(window.jQuery);
