// vim:set ts=4 noexpandtab:vim modeline
//
// 祝日一覧を生成する。
// TODO:結果が正しいかどうか少ししか確認してない。
//
(function(){
'use strict';

// 春分の日（ある年の春分の日は3月の何日か）
//   http://ja.wikipedia.org/wiki/春分の日
//   http://www.wikiwand.com/ja/春分
function vernalEqninox( Y ){
	if( 1800 <= Y && Y <= 1827 ) return 21;
	if( 1828 <= Y && Y <= 1859 ) return [20,21,21,21][Y % 4];
	if( 1860 <= Y && Y <= 1891 ) return [20,20,21,21][Y % 4];
	if( 1892 <= Y && Y <= 1899 ) return [20,20,20,21][Y % 4];
	if( 1900 <= Y && Y <= 1923 ) return [21,21,21,22][Y % 4];
	if( 1924 <= Y && Y <= 1959 ) return 21;
	if( 1960 <= Y && Y <= 1991 ) return [20,21,21,21][Y % 4];
	if( 1992 <= Y && Y <= 2023 ) return [20,20,21,21][Y % 4];
	if( 2024 <= Y && Y <= 2055 ) return [20,20,20,21][Y % 4];
	if( 2056 <= Y && Y <= 2091 ) return 20;
	if( 2092 <= Y && Y <= 2099 ) return [19,20,20,20][Y % 4];
	if( 2100 <= Y && Y <= 2123 ) return [20,21,21,21][Y % 4];
	if( 2124 <= Y && Y <= 2155 ) return [20,20,21,21][Y % 4];
	if( 2156 <= Y && Y <= 2187 ) return [20,20,20,21][Y % 4];
	if( 2188 <= Y && Y <= 2199 ) return 20;
	return undefined;
}

// 秋分の日（ある年の秋分の日は9月の何日か）
//   http://ja.wikipedia.org/wiki/秋分の日
//   http://www.wikiwand.com/ja/秋分
function autumnalEquinox( Y ){
	if( 1800 <= Y && Y <= 1823 ) return [23,23,24,24][Y % 4];
	if( 1824 <= Y && Y <= 1851 ) return [23,23,23,24][Y % 4];
	if( 1852 <= Y && Y <= 1887 ) return 23;
	if( 1888 <= Y && Y <= 1899 ) return [22,23,23,23][Y % 4];
	if( 1900 <= Y && Y <= 1919 ) return [23,24,24,24][Y % 4];
	if( 1920 <= Y && Y <= 1947 ) return [23,23,24,24][Y % 4];
	if( 1948 <= Y && Y <= 1979 ) return [23,23,23,24][Y % 4];
	if( 1980 <= Y && Y <= 2011 ) return 23;
	if( 2012 <= Y && Y <= 2043 ) return [22,23,23,23][Y % 4];
	if( 2044 <= Y && Y <= 2075 ) return [22,22,23,23][Y % 4];
	if( 2076 <= Y && Y <= 2099 ) return [22,22,22,23][Y % 4];
	if( 2100 <= Y && Y <= 2103 ) return [23,23,23,24][Y % 4];
	if( 2104 <= Y && Y <= 2139 ) return 23;
	if( 2140 <= Y && Y <= 2167 ) return [22,23,23,23][Y % 4];
	if( 2168 <= Y && Y <= 2199 ) return [22,22,23,23][Y % 4];
	return undefined;
}

// 基本祝日ルール配列
var basicRules = [
	// --------------------------------------------------------------------
	// [年, 月, 日, 名前]					特定の年月日
	// [[開始年], 月, 日, 名前]				開始年からずっと毎年
	// [[開始年, 終了年], 月, 日, 名前]		開始年と終了年の間のみ
	// [年, 月, [何回目, 曜日], 名前]		第2月曜日の場合は日の配列[2,1]
	// [年, 月, 関数, 名前]					日を関数で求める（春分・秋分用）
	// --------------------------------------------------------------------
	// 1月
	[[1874,1948], 1,  1,    "四方節"],
	[[1949],      1,  1,    "元日"],
	[[1874,1948], 1,  3,    "元始祭"],
	[[1874,1948], 1,  5,    "新年宴会"],
	[[1949,1999], 1, 15,    "成人の日"],
	[[2000],      1, [2,1], "成人の日"],
	[[1874,1912], 1, 30,    "孝明天皇祭"],
	// 2月
	[[1874,1948], 2, 11, "紀元節"],
	[[1967],      2, 11, "建国記念日"],
	[[1989,1989], 2, 24, "昭和天皇の大喪の礼"],
	// 3月
	[[1879,1948], 3, vernalEqninox, "春季皇霊祭"],
	[[1949,2199], 3, vernalEqninox, "春分の日"],
	// 4月
	[[1874,1948], 4,  3, "神武天皇祭"],
	[[1959,1959], 4, 10, "皇太子・明仁親王の結婚の儀"],
	[[1927,1948], 4, 29, "天長節"],
	[[1949,1988], 4, 29, "天皇誕生日"],
	[[1989,2006], 4, 29, "みどりの日"],
	[[2007],      4, 29, "昭和の日"],
	// 5月
	[[1949], 5, 3, "憲法記念日"],
	[[2007], 5, 4, "みどりの日"],
	[[1949], 5, 5, "こどもの日"],
	// 6月
	[1993, 6, 9, "皇太子・徳仁親王の結婚の儀"],
	// 7月
	[[1996,2002], 7, 20,    "海の日"],
	[[2003],      7, [3,1], "海の日"],
	[[1913,1926], 7, 30,    "明治天皇祭"],
	// 8月
	[[2016],      8, 11, "山の日"],
	[[1913,1926], 8, 31, "天長節"],
	// 9月
	[[1966,2002], 9, 15,    "敬老の日"],
	[[1874,1878], 9, 17,    "神嘗祭"],
	[[2003],      9, [3,1], "敬老の日"],
	[[1878,1947], 9, autumnalEquinox, "秋季皇霊祭"],
	[[1948,2199], 9, autumnalEquinox, "秋分の日"],
	// 10月
	[[1966,1999], 10, 10,    "体育の日"],
	[[2000],      10, [2,1], "体育の日"],
	[[1873,1879], 10, 17,    "神嘗祭"],
	[[1913,1926], 10, 31,    "天長節祝日"],
	// 11月
	[[1873,1911], 11,  3, "天長節"],
	[[1927,1947], 11,  3, "明治節"],
	[[1948],      11,  3, "文化の日"],
	[1915,        11, 10, "即位の礼"],
	[1928,        11, 10, "即位の礼"],
	[1990,        11, 12, "即位の礼正殿の儀"],
	[1915,        11, 14, "大嘗祭"],
	[1928,        11, 14, "大嘗祭"],
	[1915,        11, 16, "大饗第1日"],
	[1928,        11, 16, "大饗第1日"],
	[[1873,1947], 11, 23, "新嘗祭"],
	[[1948],      11, 23, "勤労感謝の日"],
	// 12月
	[[1989],      12, 23, "天皇誕生日"],
	[[1927,1947], 12, 25, "大正天皇祭"]
];

// 基本祝日ルール1つに、Y年が適合するかどうか
function ruleYearMatch( rule ,Y ){
	var rY = rule[0];
	if( Array.isArray(rY) ){
		if( rY.length > 1 ){
			if( rY[0] <= Y && Y <= rY[1] ) return true;
		}
		else if( rY[0] <= Y ) return true;
	}
	else if( rY == Y ) return true;

	return false;
}

// Y年M月の中のW曜日の日付配列を返す
function monthWeekDays( Y ,M ,W ){
	// M月1日の曜日(0～6)
	var w1 = (new Date(Y ,M-1 ,1)).getDay();
	// W曜日の最初の日付
	// Wが日曜(0)で1日が日曜(0)ならそのまま1日
	// Wが月曜(1)で1日が日曜(0)なら2日
	// Wが日曜(0)で1日が月曜(1)なら7日
	var day = W - w1 + 1;
	if( day <= 0 ) day += 7;
	// M月最終日
	var lastDay = (new Date(Y ,M ,0)).getDate();
	// 7日毎
	var days = [];
	do{ days.push(day), day += 7; } while( day <= lastDay );
	return days;
}

// 基本祝日ルール1つで決まる、Y年M月の日付を返す(※年がルールに適合している前提)
function ruleDay( rule ,Y ,M ){
	var rD = rule[2];

	if( $.isFunction(rD) ) return rD(Y);

	if( Array.isArray(rD) ){
		var N = rD[0];
		var W = rD[1];
		// Y年M月の第N W曜日(Happy Monday)
		return monthWeekDays( Y ,M ,W )[N-1];
	}
	return rD;
}

// 連想配列のキーにする日付文字列 YYYY-MM-DD
function keyYMD( d ){
	var Y = d.getFullYear();
	var M = d.getMonth() + 1;
	var D = d.getDate();
	return Y +'-'+ ('0'+M).slice(-2) +'-'+ ('0'+D).slice(-2);
}

// 1日のミリ秒
var day1msec = 24 * 60 * 60 * 1000;
var day2msec = day1msec * 2;

// 1年分の基本祝日から振替休日を求める
// 1973年4月12日以降、日曜日に当たる場合は該当日の翌日以降の平日を振替休日にする
// ※年をまたぐ振替休日は存在しない前提。可能性がある場合は修正が必要。
var furikaeFrom = new Date( 1973 ,4-1 ,12 );
function furikaeDays( days ){
	var array = {};
	for( var key in days ){
		var A = days[key].date;
		if( furikaeFrom <= A && A.getDay()==0 ){
			// 日曜祝日Aの翌日B
			var B = new Date( A.getTime() + day1msec );
			// 翌日以降の平日
			var key = keyYMD( B );
			while( key in days ){
				B.setDate( B.getDate() + 1 );
				key = keyYMD( B );
			}
			// 追加
			if( key in array ) console.log('振替休日が重複しています？ '+key);
			array[key] = { date:B ,name:'振替休日' };
		}
	}
	return array;
}
// 1年分の基本祝日から国民の休日を求める
// 1985年12月27日以降、祝日と祝日に挟まれた平日の場合は挟まれた平日を国民の休日にする
// ※年をまたぐ国民の休日は存在しない前提。もし12/30が祝日になったら修正が必要。
var kokuminFrom = new Date( 1985 ,12-1 ,27 );
function kokuminDays( days ){
	var array = {};
	var keys = Object.keys(days).sort();
	var i = keys.length - 1;
	var A ,B = days[keys[i]].date;
	for( ; i--; ){
		A = days[keys[i]].date;
		if( kokuminFrom <= A && (B - A) == day2msec ){
			// 祝日A,Bに挟まれた非祝日C発見
			var C = new Date( A.getTime() + day1msec );
			switch( A.getDay() ){
			// Aが日曜の時は平日Cは振替休日になる
			// Aが土曜＝Cが日曜の場合も国民の休日とはならない
			case 0: case 6: break;
			default:
				// 追加
				var key = keyYMD( C );
				if( key in array ) console.log('国民の休日が重複しています？ '+key);
				array[key] = { date:C ,name:'振替休日' };
			}
		}
		B = A;
	}
	return array;
}

// Y年の祝日一覧を連想配列で作成
function holidaysYear1( Y ){
	// 基本祝日
	var basic = {};
	for( var i=basicRules.length; i--; ){
		var rule = basicRules[i];
		var rM = rule[1];
		var name = rule[3];

		if( ruleYearMatch( rule ,Y ) ){
			var D = ruleDay( rule ,Y ,rM );
			var date = new Date( Y ,rM-1 ,D );
			var key = keyYMD( date );
			if( key in basic ) console.log('基本祝日が重複しています？ '+key);
			basic[key] = { date:date ,name:name };
		}
	}
	// 振替休日
	var furikae = furikaeDays( basic );
	// 国民の休日
	var kokumin = kokuminDays( basic );

	// 重複チェック＋結合
	for( key in furikae ){
		if( key in basic ) console.log('振替休日が既に基本祝日に存在しています？ '+key);
		basic[key] = furikae[key];
	}
	for( key in kokumin ){
		if( key in basic ) console.log('国民の休日が既に休日になっています？ '+key);
		basic[key] = kokumin[key];
	}

	// basicそのままJSON.stringifyするとキーが順番にならずイマイチなので
	// JSON化した時にきれいにキーが並ぶよう新しい連想配列を作って返却する。
	// でもJSON.stringifyのキーの並び順って保証されない仕様なのでは…？
	var holidays = {};
	var keys = Object.keys(basic).sort();
	for( var i=0; i<keys.length; i++ ){
		var key = keys[i];
		holidays[key] = basic[key].name;
	}
	return holidays;
}

// 祝日一覧JSON生成
var holidays = {};
for( var Y=1873; Y<=2199; Y++ ){
	$.extend( holidays ,holidaysYear1(Y) );
}
$('#json').val(JSON.stringify(holidays,null,1));

})();
