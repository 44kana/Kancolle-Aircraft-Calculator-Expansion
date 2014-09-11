// ==UserScript==
// @name        艦載機計算機の隠し味
// @version     0.0
// @description 艦載機計算機の編成と装備とマップを保存します。
// @include     http://www.kancolle-calc.net/aircrafts.html*
// @author      44kana
// @namespace   https://github.com/44kana/
// @license     MIT; https://github.com/44kana/Kancolle-Aircraft-Calculator-Expansion/blob/master/LICENSE
// @copyright   2014, 44kana
// ==/UserScript==

// 警告抑制
/* jshint browser:true */
/* jshint jquery:true */
var fDeck;
var fDeckKeys;
var fillDeck;
var fillMap;
var putColor;

(function(d, w, fn){
	'use strict';
	var s = d.createElement('script');
	if(typeof fn === 'function'){
		fn = '(' + fn + ')();';
	}
	s.textContent = '' + fn;
	d.body.appendChild(s);
	d.body.removeChild(s);
})(document, unsafeWindow, function(){$(function($){
	'use strict';
	function hashalert(h,s,i){s='';for(i in h){s+=i+' : '+h[i]+'\n';}alert(s);}
	var Storage = (function(l, m){
		return {
			set : function(k,s){
				l.setItem(m+k,s);
			},
			get : function(k){
				return l.getItem(m+k);
			}
		};
	})(localStorage, "kancolle-calc-");
	function _setDeck(data){
		var fleet = data.fDeck===undefined?
				Binder.binder()[$(this).index()]:data,
			i=0, l=0;
		fleet = JSON.parse(JSON.stringify(fleet));
		fDeck = fleet.fDeck;
		fDeckKeys = fleet.fDeckKeys;
		fillDeck();
		putColor($('#data td'));
		for(i=0,l=fleet.fDeckKeys.length;i<l;i++){
			putColor($('#data img[src$="' + fleet.fDeckKeys[i] + '.jpg"]')
					 .parent().siblings());
		}
		$('#mapSelect :selected').attr('selected', false);
		$('#mapSelect').val(fleet.map);
		setTimeout(fillMap(), 30);
		return false;
	}
	var Binder = (function(w, d, $){
		var _key = 'binder',
			_binder = [],
			$combtn,
			$template,
		_setBinder = function(){
			var $li,
				$ul,
				$span = $('<span/>'),
				i=0;

			$('<div id="binderWrap">')
			.css({
				backgroundColor:'#fff',
				position : 'fixed',
				top : '0px',
				right : '0px',
				boxShadow : '0 0 6px rgba(0, 0, 0, .3)'
			})
			.appendTo('body');

			$combtn = $span.clone().addClass('combtn link').css({zIndex:'5'})
			.hover(
				function(){
				this.style.backgroundColor = '#9ef';
			},
				function(){
				this.style.backgroundColor = '';
			});

			$template = $('<li class="binder">')
			.hover(function(){
				this.childNodes[1].style.display='block';
			}, function(){
				this.childNodes[1].style.display='none';
			})
			.on('click', _setDeck)
			.css({position:'relative',width:'100%'})
			.append($span.clone().addClass('name'))
			.append($span.clone().addClass('com')
					.css({display:'none',
						 position:'absolute',
						 right:'0px',
						 bottom:'1px',
						 backgroundColor:'#FFF'})
					.hover(function(){
						this.style.boxShadow = '0 0 10px rgba(0, 204, 255, .4) inset';
					}, function(){
						this.style.boxShadow = '';
					})
					.append($combtn.clone(true)
						   .text('編')
						   .on('click', Binder.edit))
					.append($combtn.clone(true)
						   .text('Ur')
						   .on('click', Binder.createUrl))
					.append($combtn.clone(true)
						   .text('↑')
						   .on('click', {type:-1}, Binder.moverecipe))
					.append($combtn.clone(true)
						   .text('↓')
						   .on('click', {type:2}, Binder.moverecipe))
					.append($combtn.clone(true)
						   .text('書')
						   .on('click', Binder.saverecipe))
					.append($combtn.clone(true)
						   .text('消')
						   .on('click', Binder.deleterecipe))
					);

			$ul = $('<ul id="binder">')
			.css({listStyleType:"none",padding:'0'});
			for(i=0;i<_binder.length;i++){
				$li = $template.clone(true,true);
				$li.children('.name').text(_binder[i].name);
				$ul.append($li);
			}
			$ul.append($('<li id="binder-last" class="binder last">')
					   .css({position:'relative',
							 width:'100%',
							 textAlign:'right'})
					   .hover(function(){
							this.childNodes[1].style.display='block';
						},function(){
							this.childNodes[1].style.display='none';
						})
					   .append($span.clone().addClass('binder link op')
							   .css({zIndex:'-999'})
							   .text('バインダー操作'))
					   .append($span.clone().addClass('com')
					.hover(function(){
						this.style.boxShadow = '0 0 10px rgba(0, 204, 255, .4) inset';
					}, function(){
						this.style.boxShadow = '';
					})
							   .css({display:'none',
									 position:'absolute',
									 right:'0px',
									 bottom:'1px',
									 backgroundColor:'#FFF'})
							   .append($combtn.clone(true)
									   .text('追加'))
									   .on('click',Binder.add)
							   .append($combtn.clone(true)
									   .text('保存')
									   .on('click',Binder.save))))
			.appendTo('#binderWrap');
		},
		_decordURL = function(){
			var url = location.search.substring(1);
			if(url === ''){
				return;
			}
			var data      = url.split('&'),
				mapinfo   = w.mapinfo,
				tmpBinder = {},
				i, j,l,
				area, no;

			for(i=0,l=data.length;i<l;i++){
				tmpBinder[data[i].split('=')[0]] =
					JSON.parse(decodeURIComponent(data[i].split('=')[1]));
			}
			area = tmpBinder.map.split('-')[0]-0;
			no   = tmpBinder.map.split('-')[1]-0;
			for(i=0,l=mapinfo.length;i<l;i++){
				if(mapinfo[i].api_maparea_id === area&&
				   mapinfo[i].api_no === no
				  ){
					tmpBinder.map += ': ' + mapinfo[i].api_opetext;
					break;
				}
			}
			for(i in tmpBinder.fDeck){
				for(j in tmpBinder.fDeck[i]){
					tmpBinder.fDeck[i][j] =
						w.itemIdRetrieve(tmpBinder.fDeck[i][j]).name;
				}
			}
			_setDeck(tmpBinder);
			return;
		};
		return {
			init : function(){
				_decordURL();
				_binder = (_binder=Storage.get(_key))?JSON.parse(_binder):[];
				_setBinder();
			},
			binder : function(){
				return _binder;
			},
			// 新規追加
			add : function(){
				var sav = {
					fDeck     : fDeck,
					fDeckKeys : fDeckKeys,
					map       : $('#mapSelect').val()
				};
				sav.name = sav.map;
				if(JSON.stringify(_binder).indexOf(JSON.stringify(sav)) === -1){
					_binder[_binder.length] = sav;
					$template.clone(true,true)
					.children('.name')
					.text(sav.name)
					.end()
					.insertBefore('#binder-last');
				}
				return false;
			},
			// ローカルストレージに格納
			save : function(){
				Storage.set(_key, JSON.stringify(_binder));
				alert('localStorageに\n\n  '+Storage.get(_key)+'\n\nを保存しました');
				return false;
			},
			// 項目表示名変更
			edit : function(){
				var $li   = $(this).parent().parent(),
					n     = $li.index(),
					input = prompt('編成名 :', _binder[n].name);

				switch(input){
					case null:			  // キャンセル
					case '':			  // 入力なし
					case _binder[n].name: // 変更なし
						break;
					default:
						_binder[n].name  = input;
						$li[0].childNodes[0].innerText = input;
						break;
				}
				return false;
			},
			createUrl : function(){
				var $li = $(this).parent().parent(),
					n   = $li.index(),
					str = [],
					t   = $.extend(true, {}, _binder[n]),
					url = 'http://www.kancolle-calc.net/aircrafts.html?',
					i, j;

				// t.name と t.map が同じだったら削除(予定は未定
				// 表示名は提示しなくても……いいよね？
				delete t.name;
				t.map = t.map.split(':')[0];

				// item 名から item の api_id 取得
				for(i in t.fDeck){
					for(j in t.fDeck[i]){
						t.fDeck[i][j] = w.itemNameRetrieve(t.fDeck[i][j]).id;
					}
				}
				for(i in t){
					str[str.length] = i + '=' + JSON.stringify(t[i]);
				}
				str = url + str.join('&');
				prompt('コピーしてお使いください。', str);
				return false;
			},
			// 項目移動
			moverecipe : function(e){
				var $li = $(this).parent().parent(),
					l   = _binder.length+1,
					n   = $li.index(),
					s   = e.data.type,
					t   = _binder[n],
					dmy = 'dmy';

				// ここもうちょいきれいにしたいね
				_binder.splice((n+s+l)%l, 0, dmy);
				_binder.filter(function(v, i, arr){
					if(v === t){
						t = JSON.parse(JSON.stringify(t));
						arr.splice(i, 1);
					}
				});
				_binder.some(function(v, i, arr){
					if(v === dmy){
						arr[i] = t;
					}
				});

				$li.insertBefore($($li.parent()[0].childNodes[(n+s+l)%l]));
				return false;
			},
			// 項目上書き
			saverecipe : function(){
				var $li = $(this).parent().parent(),
					sav = {
						fDeck     : fDeck,
						fDeckKeys : fDeckKeys,
						map       : $('#mapSelect').val()
					};
				sav.name = sav.map;
				_binder[$li.index()] = sav;
				$li.children('.name').text(sav.name);
				return false;
			},
			// 項目削除
			deleterecipe : function(){
				var $li = $(this).parent().parent();
				_binder.splice($li.index(), 1);
				$li.remove();
				return false;
			}
		};
	})(window, document, $);
	Binder.init();
});});
