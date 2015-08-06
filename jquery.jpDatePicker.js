(function($){
	'use strict';
	function parseYMD( s ){
		if( /^\s*(\d+)[^\d]+(\d+)[^\d]+(\d+)/.test(s) ){
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
			this.width = 360;
			this.height = 240;

			this.$prev = $('<a class=prev><!--<span>&lt;&lt;</span>--></a>').css({
				 display :'block'
				,position:'absolute'
				,left    : 0
				,top     : 0
				,height  : this.height
			})
			.click(function(){ self.prevMonth(); });

			this.$next =$('<a class=next><!--<span>&gt;&gt;</span>--></a>').css({
				 display :'block'
				,position:'absolute'
				,right   : 0
				,top     : 0
				,height  : this.height
			})
			.click(function(){ self.nextMonth(); });

			var pos = $(target).position();
			this.$picker = $('<div></div>').css({
				 position:'absolute'
				,left    : pos.left
				,top     : pos.top + $(target).outerHeight()
				,width   : this.width
				,height  : this.height
			})
			.addClass( plugName ).append( this.$prev ).append( this.$next )
			.appendTo( document.body );

			setTimeout(function(){ self.initCalendar(); },0);
		};
		var pp = Picker.prototype;
		pp.initCalendar = function(){
			this.$calendar = this.newCalendar().css({
				position:'absolute'
				,left    : this.$prev.width()
				,top     : 0
				,width   : this.width - this.$prev.width() - this.$next.width()
			})
			.prependTo( this.$picker );

			this.datesHeight = this.height - this.$calendar.children('.title').height();
			this.$calendar.children('.dates').height( this.datesHeight );

			var self = this;
			$(document).on('click.'+ plugName ,function(ev){
				var off = self.$picker.offset();
				off.right = off.left + self.width;
				off.bottom = off.top + self.height;
				if( ev.pageX < off.left || off.right < ev.pageX ||
				    ev.pageY < off.top || off.bottom < ev.pageY
				){
					self.destroy();
				}
			});
		};
		pp.destroy = function(){
			this.$picker.remove();
			this.$picker = this.$next = this.$prev = this.$calendar = null;
			$(document).off('click.'+ plugName);
		};
		pp.prevMonth = function(){
			if( --this.viewM <1 ){
				this.viewM = 12;
				this.viewY--;
			}
			var self = this;
			var $newCalendar = this.newCalendar().css({
				 position:'absolute'
				,left    : this.$prev.width() - this.$calendar.width()
				,top     : 0
				,width   : this.$calendar.width()
			})
			.insertAfter( this.$calendar )
			.animate({ left: this.$prev.width() },{
				complete:function(){
					self.$calendar.remove();
					self.$calendar = $newCalendar;
				}
				,duration:100
			});
			$newCalendar.children('.dates').height( this.datesHeight );
		};
		pp.nextMonth = function(){
			if( ++this.viewM >12 ){
			    this.viewM = 1;
			    this.viewY++;
			}
			var self = this;
			var $newCalendar = this.newCalendar().css({
				 position:'absolute'
				,left    : this.$prev.width() + this.$calendar.width()
				,top     : 0
				,width   : this.$calendar.width()
			})
			.insertAfter( this.$calendar )
			.animate({ left: this.$prev.width() },{
				complete:function(){
					self.$calendar.remove();
					self.$calendar = $newCalendar;
				}
				,duration:100
			});
			$newCalendar.children('.dates').height( this.datesHeight );
		};
		pp.newCalendar = function(){
			var html = '<div class=calendar>';
			// 年月
			html += '<div class=title>'
			      + '<span class=year>'+ this.viewY +'</span>'+ opt.yearSuffix
			      + '<span class=month>'+ this.viewM +'</span>'+ opt.monthSuffix
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
		this.each(function(){
			$(this).on('click.'+ plugName ,function(){ new Picker(this); });
		});
		return this;
	};
})(window.jQuery);
