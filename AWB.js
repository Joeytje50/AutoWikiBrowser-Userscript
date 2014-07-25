/**<nowiki>
 * Install this script by pasting the following in your personal JavaScript file:

importScriptURI('//en.wikipedia.org/w/index.php?title=User:Joeytje50/AWB.js/load.js&action=raw&ctype=text/javascript');

 * Or for users on en.wikipedia.org:

{{subst:iusc|User:Joeytje50/AWB.js/load.js}}

 * Note that this script will only run on the 'Project:AutoWikiBrowser/Script' page.
 * This script is based on the downloadable AutoWikiBrowser.
 * 
 * @licence
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 * http://www.gnu.org/copyleft/gpl.html
 * @version 2.0
 * @author Joeytje50
 */

window.AWB = {}; //The main global object for the script.

/***** User verification *****/

;(function() {
	if (wgCanonicalNamespace+':'+wgTitle !== 'Project:AutoWikiBrowser/Script' || AWB.allowed === false) {
		AWB.allowed = false;
		return;
	}
	importStylesheetURI('//en.wikipedia.org/w/index.php?title=User:Joeytje50/AWB.css&action=raw&ctype=text/css');
	mw.loader.load('mediawiki.action.history.diff');
	
	var i18n = importScriptURI('//en.wikipedia.org/w/index.php?title=User:Joeytje50/AWB.js/i18n.js&action=raw&ctype=text/javascript');
	i18n.onload = function() {
		if (AWB.allowed === true) {
			AWB.init(); //init if verification has already returned true
		} else if (AWB.allowed === false) {
			alert(AWB.msg('not-on-list'));
		}
	};
	
	(new mw.Api()).get({
		action: 'query',
		titles: 'Project:AutoWikiBrowser/CheckPage',
		prop: 'revisions',
		meta: 'userinfo|siteinfo',
		rvprop: 'content',
		rvlimit: 1,
		uiprop: 'groups',
		siprop: 'namespaces',
		indexpageids: true,
		format: 'json',
	}).done(function(response) {
		if (response.error) {
			alert('API error: ' + response.error.info);
			AWB = false; //preventing further access. No verification => no access.
			return;
		}
		AWB.ns = response.query.namespaces; //saving for later
		
		AWB.username = response.query.userinfo.name; //preventing any "hacks" that change wgUserName or mw.config.wgUserName
		var groups = response.query.userinfo.groups;
		var page = response.query.pages[response.query.pageids[0]];
		var users, bots;
		if (response.query.pageids[0] !== '-1' && /<!--\s*enabledusersbegins\s*-->/.test(page.revisions[0]['*'])) {
			var cont = page.revisions[0]['*'];
			users = cont.substring(
				cont.search(/<!--\s*enabledusersbegins\s*-->/),
				cont.search(/<!--\s*enabledusersends\s*-->/)
			).split('\n');
			if (/<!--\s*enabledbots\s*-->/.test(cont)) {
				bots = cont.substring(
					cont.search(/<!--\s*enabledbots\s*-->/),
					cont.search(/<!--\s*enabledbotsends\s*-->/)
				).split('\n');
			} else bots = [];
			var i=0;
			while (i<users.length) {
			    if (users[i].charAt(0) !== '*') {
			    	users.splice(i,1);
			    } else {
			    	users[i] = $.trim(users[i].substr(1));
			    	i++;
			    }
			}
			i=0;
			while (i<bots.length) {
			    if (bots[i].charAt(0) !== '*') {
			    	bots.splice(i,1);
			    } else {
			    	bots[i] = $.trim(bots[i].substr(1));
			    	i++;
			    }
			}
		} else {
			users = false; //fallback when page doesn't exist
		}
		AWB.bot = groups.indexOf('bot') !== -1 && (users === false || bots.indexOf(AWB.username) !== -1);
		AWB.sysop = groups.indexOf('sysop') !== -1;
		if (AWB.username === "Joeytje50" && response.query.userinfo.id === 13299994) {//TEMP: Dev full access to entire interface.
			AWB.bot = true;
			users.push("Joeytje50");
		}
		if (AWB.sysop || response.query.pageids[0] === '-1' || users.indexOf(AWB.username) !== -1 || users === false) {
			AWB.allowed = true;
			if (AWB.messages.en) AWB.init(); //init if messages have already loaded
		} else {
			if (AWB.messages.en) {
				//run this after messages have loaded, so the message that shows is in the user's language
				alert(AWB.msg('not-on-list'));
			}
			AWB = false; //prevent further access
		}
	}).fail(function(xhr, error) {
		alert(AWB.msg('verify-error') + '\n' + error);
		AWB = false; //preventing further access. No verification => no access.
	});
})();

/***** Global object/variables *****/

var objs = ['page', 'api', 'fn', 'pl', 'messages', 'setup', 'settings', 'ns'];
for (var i=0;i<objs.length;i++) {
	AWB[objs[i]] = {};
}
AWB.lang = mw.config.get('wgUserLanguage');
AWB.isStopped = true;
AWB.tooltip = window.tooltipAccessKeyPrefix || '';

/***** API functions *****/

//Main template for API calls
AWB.api.call = function(data, callback, onerror) {
	data.format = 'json';
	if (data.action !== 'query') data.bot = true;
	$.ajax({
		data: data,
		dataType: 'json',
		url: wgScriptPath + '/api.php',
		type: 'POST',
		success: function(response) {
			if (response.error) {
				alert('API error: ' + response.error.info);
				AWB.stop();
			} else {
				callback(response);
			}
		},
		error: function(xhr, error) {
			alert('AJAX error: ' + error);
			AWB.stop();
			if (onerror) onerror();
		}
	});
};

//Get page diff, and process it for more interactivity
AWB.api.diff = function(callback) {
	AWB.status('diff');
	var editBoxInput = $('#editBoxArea').val();
	var redirects = $('input.redirects:checked').val()==='follow'?'redirects':'inprop';
	var data = {
		'action': 'query',
		'prop': 'info|revisions',
		'indexpageids': true,
		'titles': AWB.page.name,
		'rvlimit': '1',
		'rvdifftotext': editBoxInput
	};
	data[redirects] = 'redirect';
	AWB.api.call(data, function(response) {
		var pageExists = response.query.pageids[0] !== '-1';
		var diff;
		if (pageExists) {
			var diffpage = response.query.pages[response.query.pageids[0]];
			diff = diffpage.revisions[0].diff['*'];
			if (diff === '') {
				diff = '<h2>'+AWB.msg('no-changes-made')+'</h2>';
			} else {
				diff = '<table class="diff">'+
					'<colgroup>'+
						'<col class="diff-marker">'+
						'<col class="diff-content">'+
						'<col class="diff-marker">'+
						'<col class="diff-content">'+
					'</colgroup>'+
					'<tbody>'+diff+'</tbody></table>';
			}
		} else {
			diff = '<span style="font-weight:bold;color:red;">'+AWB.msg('page-not-exists')+'</span>';
		}
		$('#resultWindow').html(diff);
		$('.diff-lineno').each(function() {
			$(this).parent().attr('data-line',parseInt($(this).html().match(/\d+/)[0])-1).addClass('lineheader');
		});
		$('table.diff tr').each(function() { //add data-line attribute to every line, relative to the previous one. Used for click event.
			if (!$(this).next().is('[data-line]') && !$(this).next().has('td.diff-deletedline + td.diff-empty')) {
				$(this).next().attr('data-line',parseInt($(this).data('line'))+1);
			} else if ($(this).next().has('td.diff-deletedline + td.diff-empty')) {
				$(this).next().attr('data-line',$(this).data('line')); //copy over current data-line for deleted lines to prevent them from messing up counting.
			}
		});
		AWB.status('done', false);
		if (typeof(callback) === 'function') {
			callback();
		}
	});
};

//Retrieve page contents/info, process them, and store information in AWB.page object.
AWB.api.get = function(pagename) {
	AWB.pageCount();
	if (!AWB.list[0] || AWB.isStopped) {
		return AWB.stop();
	}
	if (pagename === '#PRE-PARSE-STOP') {
		var curval = $('#articleList').val();
		$('#articleList').val(curval.substr(curval.indexOf('\n') + 1));
		$('#preparse').prop('checked', false);
		AWB.stop();
		return;
	}
	var redirect = $('input.redirects:checked').val();
	var data = {
		'action': 'query',
		'prop': 'info|revisions',
		'inprop': 'watched',
		'intoken': 'edit|delete|protect|move|watch',
		'titles': pagename,
		'rvprop': 'content|timestamp|ids',
		'rvlimit': '1',
		'indexpageids': true,
		'meta': 'userinfo',
		'uiprop': 'hasmsg'
	};
	if (redirect=='follow'||redirect=='skip') data.redirects = true;
	if (AWB.sysop) {
		data.list = 'deletedrevs';
		data.drprop = 'token';
	}
	AWB.status('load-page');
	AWB.api.call(data, function(response) {
		if (response.query.userinfo.hasOwnProperty('messages')) {
			var view = wgScriptPath + '?title=Special:MyTalk';
			var viewNew = view + '&diff=cur';
			AWB.status(
				'<span style="color:red;font-weight:bold;">'+
					AWB.msg('status-newmsg', 
						'<a href="'+view+'" target="_blank">'+AWB.msg('status-talklink')+'</a>',
						'<a href="'+viewNew+'" target="_blank">'+AWB.msg('status-difflink')+'</a>')+
				'</span>', false);
			alert(AWB.msg('new-message'));
			AWB.stop();
			return;
		}
		AWB.page = response.query.pages[response.query.pageids[0]];
		AWB.page.name = AWB.list[0].split('|')[0];
		AWB.page.pagevar = AWB.list[0].replace(/^.*?\|/, '');
		AWB.page.content = AWB.page.revisions ? AWB.page.revisions[0]['*'] : '';
		AWB.page.exists = !response.query.pages["-1"];
		AWB.page.deletedrevs = response.query.deletedrevs;
		AWB.page.watched = AWB.page.hasOwnProperty('watched');
		if (response.query.redirects) {
			AWB.page.name = response.query.redirects[0].to;
		}
		var newContent = AWB.replace(AWB.page.content);
		if (AWB.stopped === true) return;
		AWB.status('done', false);
		var containRegex = $('#containRegex').prop('checked'), containFlags = $('#containFlags').val();
		var skipContains = containRegex ? new RegExp($('#skipContains').val(), containFlags) : $('#skipContains').val();
		var skipNotContains = containRegex ? new RegExp($('#skipNotContains').val(), containFlags) : $('#skipContains').val();
		if (
			($('#skipNoChange').prop('checked') && AWB.page.content === newContent) || //skip if no changes are made
			($('#skipContains').val() && AWB.page.content.match(skipContains)) ||
			($('#skipNotContains').val() && !AWB.page.content.match(skipNotContains)) ||
			($('#exists-no').prop('checked') && !AWB.page.exists) ||
			($('#exists-yes').prop('checked') && AWB.page.exists) ||
			(redirect==='skip' && response.query.redirects) // variable  redirect  is defined outside this callback function.
		) {
			AWB.log('skip', AWB.page.name);
			return AWB.next();
		} else {
			$('#editBoxArea').val(newContent);
			if ($('#preparse').prop('checked')) {
				$('#articleList').val($.trim($('#articleList').val()) + '\n' + AWB.list[0]); //move current page to the bottom
				AWB.next();
				return;
			} else if (AWB.bot && $('#autosave').prop('checked')) {
				AWB.api.diff(function() {
					//timeout will take #throttle's value * 1000, if it's a number above 0. Currently defaults to 0.
					setTimeout(AWB.api.submit, Math.max(+$('#throttle').val() || 0, 0) * 1000);
				});
			} else {
				AWB.api.diff();
			}
		}
		AWB.updateButtons();
	});
};

//Some functions with self-explanatory names:
AWB.api.submit = function() {
	AWB.status('submit');
	var summary = $('#summary').val();
	var data = {
		'title': AWB.page.name,
		'summary': summary,
		'action': 'edit',
		'basetimestamp': AWB.page.revisions ? AWB.page.revisions[0].timestamp : '',
		'token': AWB.page.edittoken,
		'text': $('#editBoxArea').val(),
		'watchlist': $('#watchPage').val()
	};
	if ($('#minorEdit').prop('checked')) data.minor = true;
	AWB.api.call(data, function(response) {
		AWB.log('edit', response.edit.title, response.edit.newrevid);
		AWB.status('done', false);
		AWB.next();
	});
};
AWB.api.preview = function() {
	AWB.status('preview');
	AWB.api.call({
		'title': AWB.page.name,
		'action': 'parse',
		'text': $('#editBoxArea').val()
	}, function(response) {
		$('#resultWindow').html(response.parse.text['*']);
		$('#resultWindow div.previewnote').remove();
		AWB.status('done', false);
	});
};
AWB.api.move = function() {
	AWB.status('move');
	var topage = $('#moveTo').val().replace(/$x/gi, AWB.page.pagevar);
	var summary = $('#summary').val();
	var data = {
		'action':'move',
		'from': AWB.page.name,
		'to': topage,
		'token': AWB.page.movetoken,
		'reason': summary,
		'ignorewarnings': 'yes'
	};
	if ($('#moveTalk').prop('checked')) data.movetalk = true;
	if ($('#moveSubpage').prop('checked')) data.movesubpages = true;
	if ($('#suppressRedir').prop('checked')) data.noredirect = true;
	AWB.api.call(data, function(response) {
		AWB.log('move', response.move.from, reponse.move.to);
		AWB.status('done', false);
		if (!$('#moveTo').val().match(/$x/i)) $('#moveTo').val('')[0].focus(); //clear entered move-to pagename if it's not based on the pagevar
		AWB.next(topage);
	});
};
AWB.api.delete = function() {
	AWB.status(($('#deletePage').is('.undelete') ? 'un' : '') + 'delete');
	var summary = $('#summary').val();
	var undeltoken = AWB.page.deletedrevs ? AWB.page.deletedrevs[0].token : '';
	AWB.api.call({
		'action': (!AWB.page.exists ? 'un' : '') + 'delete',
		'title': AWB.page.name,
		'token': AWB.page.exists ? AWB.page.deletetoken : undeltoken,
		'reason': summary
	}, function(response) {
		AWB.log((!AWB.page.exists ? 'un' : '') + 'delete', (response.delete||response.undelete).title);
		AWB.status('done', false);
		AWB.next(response.undelete && response.undelete.title);
	});
};
AWB.api.protect = function() {
	AWB.status('protect');
	var summary = $('#summary').val();
	var editprot = $('#editProt').val();
	var moveprot = $('#moveProt').val();
	AWB.api.call({
		'action':'protect',
		'title': AWB.page.name,
		'token': AWB.page.protecttoken,
		'reason': summary,
		'expiry': $('#protectExpiry').val()!==''?$('#protectExpiry').val():'infinite',
		'protections': (AWB.page.exists?'edit='+editprot+'|move='+moveprot:'create='+editprot)
	}, function(response) {
		var protactions = '';
		var prots = response.protect.protections;
		for (var i=0;i<prots.length;i++) {
			if (typeof prots[i].edit == 'string') {
				protactions += ' edit: '+(prots[i].edit?prots[i].edit:'all');
			} else if (typeof prots[i].move == 'string') {
				protactions += ' move: '+(prots[i].move?prots[i].move:'all');
			} else if (typeof prots[i].create == 'string') {
				protactions += ' create: '+(prots[i].create?prots[i].create:'all');
			}
		}
		protactions += ' expires: '+prots[0].expiry;
		AWB.log('protect', response.protect.title, protactions);
		AWB.status('done', false);
		AWB.next(response.protect.title);
	});
};

AWB.api.watch = function() {
	AWB.status('watch');
	var data = {
		'action':'watch',
		'title':AWB.page.name,
		'token':AWB.page.watchtoken
	};
	if (AWB.page.watched) data.unwatch = true;
	AWB.api.call(data, function(response) {
		AWB.status('<span style="color:green;">'+
			AWB.msg('status-watch-'+(AWB.page.watched ? 'removed' : 'added'), "'"+AWB.page.name+"'")+
		'</span>', false);
		AWB.page.watched = !AWB.page.watched;
		$('#watchNow').html( AWB.msg('watch-' + (AWB.page.watched ? 'remove' : 'add')) );
	});
};

/***** Pagelist functions *****/

AWB.pl.list = [];
AWB.pl.iterations = 0;

AWB.pl.getNSpaces = function() {
	var list = $('#pagelistPopup [name="namespace"]')[0];
	if (list.selectedOptions.length == list.options.length) {
		return ''; //return empty string if every namespace is selected; this will make the request default to having no filter
	} else {
		return $('#pagelistPopup [name="namespace"]').val().join('|'); //.val() returns an array of selected options.
	}
};

AWB.pl.getList = function(abbrs, lists, data) {
	$('#pagelistPopup button, #pagelistPopup input, #pagelistPopup select').prop('disabled', true);
	AWB.pl.iterations++;
	data.action = 'query';
	var nspaces = AWB.pl.getNSpaces();
	for (var i=0;i<abbrs.length;i++) {
		if (nspaces) data[abbrs[i]+'namespace'] = nspaces;
		data[abbrs[i]+'limit'] = 10000;
	}
	if (lists.indexOf('links') !== -1) {
		data.prop = 'links';
	}
	data.list = lists.join('|');
	AWB.api.call(data, function(response) {
		if (!response.query) response.query = {};
		if (response.watchlistraw) response.query.watchlistraw = response.watchlistraw; //adding some consistency
		if (response.query.pages) {
			var links;
			for (var id in response.query.pages) {
				links = response.query.pages[id].links;
				for (var i=0;i<links.length;i++) {
					AWB.pl.list.push(links[i].title);
				}
			}
		}
		for (var l in response.query) {
			if (l === 'pages') continue;
			for (var i=0;i<response.query[l].length;i++) {
				AWB.pl.list.push(response.query[l][i].title);
			}
		}
		var cont = response['query-continue'];
		if (cont && AWB.pl.iterations <= 50) { //allow up to 50 consecutive requests at a time to avoid overloading the server.
			var lists = [];
			var abbrs = [];
			for (var list in cont) {
				lists.push(list); //add to the new array of &list= values
				for (var abbr in cont[list]) {
					abbrs.push(abbr.replace('continue',''));
					data[abbr] = cont[list][abbr]; //add the &xxcontinue= value to the data
				}
			}
			AWB.pl.getList(abbrs, lists, data); //recursive function to get every page of a list
		} else {
			$('#articleList').val($.trim($('#articleList').val()) + '\n' + AWB.pl.list.join('\n'));
			AWB.pageCount();
			AWB.pl.list = [];
			if (AWB.pl.iterations > 50) {
				AWB.status('exceeded-iterations', false);
			} else {
				AWB.status('done', false);
			}
			AWB.pl.iterations = 0;
			//re-enable where necessary
			$('#pagelistPopup [disabled]:not(fieldset [disabled]), #pagelistPopup legend input').prop('disabled', false);
			$('#pagelistPopup legend input').trigger('change');
			$('#pagelistPopup button img').remove();
		}
	}, function() { //on error, go with what we have and then reset
		$('#articleList').val($.trim($('#articleList').val()) + '\n' + AWB.pl.list.join('\n'));
		AWB.pl.iterations = 0;
		$('#pagelistPopup [disabled]:not(fieldset [disabled]), #pagelistPopup legend input').prop('disabled', false);
		$('#pagelistPopup legend input').trigger('change');
		$('#pagelistPopup button img').remove();
	});
};

//AWB.pl.getList(['wr'], ['watchlistraw'], {}) for watchlists
AWB.pl.generate = function() {
	var $fields = $('#pagelistPopup fieldset').not('[disabled]');
	var spinner = '<img src="//upload.wikimedia.org/wikipedia/commons/d/de/Ajax-loader.gif" width="15" height="15" alt="'+AWB.msg('status-alt')+'"/>';
	$('#pagelistPopup').find('button[type="submit"]').append(spinner);
	var abbrs = [], lists = [], data = {};
	$fields.each(function() {
		var list = $(this).find('legend input').attr('name');
		var abbr;
		if (list === 'linksto') { //Special case since this fieldset features 3 merged lists in 1 fieldset
			if (!$('[name="title"]').val()) return;
			$('[name="backlinks"], [name="embeddedin"], [name="imageusage"]').filter(':checked').each(function() {
				var val = this.value;
				abbrs.push(val);
				lists.push(this.name);
				data[val+'title'] = $('[name="title"]').val();
				data[val+'filterredir'] = $('[name="filterredir"]:checked').val();
				if ($('[name="redirect"]').prop('checked')) data[val+'redirect'] = true;
			});
		} else { //default input system
			abbr = $(this).find('legend input').val();
			lists.push(list);
			abbrs.push(abbr);
			$(this).find('input').not('legend input').each(function() {
				if ((this.type === 'checkbox' || this.type === 'radio') && this.checked === false) return;
				if ($(this).is('[name="cmtitle"]')) {
					//making sure every page has a Category: prefix, in case the user left it out
					$(this).val(AWB.ns[14]['*']+':'+$(this).val().replace(new RegExp(AWB.ns[14]['*']+':', 'gi'), ''));
				}
				var name = this.name;
				var val = this.value;
				if (data.hasOwnProperty(name)) {
					data[name] += '|'+val;
				} else {
					data[name] = val;
				}
			});
			console.log(abbrs, lists, data);
		}
	});
	if (abbrs.length) AWB.pl.getList(abbrs, lists, data);
};

/***** Setup functions *****/

AWB.setup.save = function(name) {
	name = name || prompt(AWB.msg('setup-prompt', AWB.msg('setup-prompt-store')), $('#loadSettings').val());
	if (name === null) return;
	var self = AWB.settings[name] = {
		string: {},
		bool: {},
		replaces: []
	};
	//inputs with a text value
	$('textarea, input[type="text"], input[type="number"], select').not('.replaces input, #editBoxArea, #settings *').each(function() {
		if (typeof $(this).val() == 'string') { 
			self.string[this.id] = this.value.replace(/\n{2,}/g,'\n');
		} else {
			self.string[this.id] = $(this).val();
		}
	});
	self.replaces = [];
	$('.replaces').each(function() {
		if ($(this).find('.replaceText').val() || $(this).find('.replaceWith').val()) {
			self.replaces.push({
				replaceText: $(this).find('.replaceText').val(),
				replaceWith: $(this).find('.replaceWith').val(),
				useRegex: $(this).find('.useRegex').prop('checked'),
				regexFlags: $(this).find('.regexFlags').val(),
				ignoreNowiki: $(this).find('.ignoreNowiki').prop('checked')
			});
		}
	});
	$('input[type="radio"], input[type="checkbox"]').not('.replaces input').each(function() {
		self.bool[this.id] = this.checked;
	});
	if (!$('#loadSettings option[value="'+name+'"]').length) {
		$('#loadSettings').append('<option value="'+name+'">'+name+'</option>');
	}
	$('#loadSettings').val(name);
	console.log(self);
};

AWB.setup.apply = function(name) {
	name = name && AWB.settings[name] ? name : 'default';
	var self = AWB.settings[name];
	$('#loadSettings').val(name);
	$('.replaces + .replaces').remove(); //reset find&replace inputs
	$('.replaces input[type="text"]').val('');
	$('.useRegex').each(function() {this.checked = false;});
	$('#pagelistPopup legend input').trigger('change'); //fix checked state of pagelist generating inputs
	for (var a in self.string) {
		$('#'+a).val(self.string[a]);
	}
	for (var b in self.bool) {
		($('#'+b)[0] || {}).checked = self.bool[b];
	}
	var cur;
	for (var c=0;c<self.replaces.length;c++) {
		if ($('.replaces').length <= c) $('#moreReplaces')[0].click();
		cur = self.replaces[c];
		for (var d in cur) {
			if (cur[d] === true || cur[d] === false) {
				$('.replaces').eq(c).find('.'+d).prop('checked', cur[d]);
			} else {
				$('.replaces').eq(c).find('.'+d).val(cur[d]);
			}
		}
	}
	$('.useRegex, #containRegex, #pagelistPopup legend input').trigger('change'); //reset disabled inputs
};

AWB.setup.getObj = function() {
	var settings = [];
	for (var i in AWB.settings) {
		if (i != '_blank') {
			settings.push('"' + i + '": ' + JSON.stringify(AWB.settings[i]));
		}
	}
	return '{\n\t' + settings.join(',\n\t') + '\n}';
};

AWB.setup.submit = function() {
	var name = prompt(AWB.msg('setup-submit', AWB.msg('setup-prompt', AWB.msg('setup-prompt-save')) ), $('#loadSettings').val());
	if (name === null) return;
	if ($.trim(name) === '') name = 'default';
	AWB.setup.save(name);
	AWB.status('setup-submit');
	AWB.api.call({
		'title': 'User:'+encodeURIComponent(AWB.username)+'/AWB-settings.js',
		'summary': AWB.msg(['setup-summary', mw.config.get('wgContentLanguage')]),
		'action': 'edit',
		'token': AWB.setup.edittoken,
		'text': AWB.setup.getObj(),
		'minor': true
	}, function(response) {
		AWB.status('done', false);
	});
};

AWB.setup.download = function() {
	var name = prompt(AWB.msg('setup-prompt', AWB.msg('setup-prompt-save')), $('#loadSettings').val());
	if (name === null) return;
	if ($.trim(name) === '') name = 'default';
	AWB.setup.save(name);
	AWB.status('setup-dload');
	var url = 'data:application/json;base64,' + btoa(AWB.setup.getObj());
	var elem = $('#download-anchor')[0];
	if (elem.hasOwnProperty('download')) { //use download attribute when possible, for its ability to specify a filename
		elem.href = url;
		elem.click();
		setTimeout(function() {elem.removeAttribute('href');}, 2000);
	} else { //fallback to iframes for browsers with no support for download="" attributes
		elem = $('#download-iframe')[0];
		elem.src = url.replace('application/json', 'application/octet-stream');
		setTimeout(function() {elem.removeAttribute('src');}, 2000);
	}
	AWB.status('done', false);
};

AWB.setup.import = function(e) {
	e.preventDefault();
	file = (e.dataTransfer||this).files[0];
	if ($(this).is('#import')) { //reset input
		this.outerHTML = this.outerHTML;
		$('#import').change(AWB.setup.import);
	}
	if (!window.hasOwnProperty('FileReader')) {
		alert(AWB.msg('old-browser'));
		AWB.status('old-browser', '<a target="_blank" href="/index.php?title=Special:MyPage/AWB-settings.js">/AWB-settings.js</a>');
		return;
	}
	if (file.name.split('.').pop().toLowerCase() !== 'json') {
		alert(AWB.msg('not-json'));
		return;
	}
	AWB.status('Processing file');
	var reader = new FileReader();
	reader.readAsText(file);
	reader.onload = function(e) {
		AWB.status('done', false);
		try {
			var data = JSON.parse(reader.result.replace(/\/\*[\w\W]*\*\/|\/\/[^\n]*/g, ''));
		} catch(e) {
			alert(AWB.msg('json-err', e.message, AWB.msg('json-err-upload')));
			return;
		}
		AWB.setup.extend(data);
	};
	
	AWB.status('Processing file');
};

AWB.setup.load = function() {
	AWB.status('setup-load');
	AWB.api.call({
		'action': 'query',
		'titles': 'User:' + (AWB.username||mw.config.get('wgUserName')) + '/AWB-settings.js',
		'prop': 'info|revisions',
		'intoken': 'edit',
		'rvprop': 'content',
		'indexpageids': true
	}, function(response) {
		AWB.status('done', false);
		if (AWB === false) return;
		var firstrun =  AWB.setup.edittoken ? false : true;
		var page = response.query.pages[response.query.pageids[0]];
		AWB.setup.edittoken = page.edittoken;
		if (response.query.pageids[0] === '-1') {
			if (AWB.allowed && firstrun) AWB.setup.save('default'); //this runs when this callback returns after the init has loaded.
			return;
		}
		var data = page.revisions[0]['*'];
		if (!data) {
			if (AWB.allowed && firstrun) AWB.setup.save('default'); //this runs when this callback returns after the init has loaded.
			return;
		}
		try {
			data = JSON.parse(data);
		} catch(e) {
			alert(AWB.msg('json-err', e.message, AWB.msg('json-err-page')) || 'JSON error:\n'+e.message);
			AWB.setup.save('default');
			return;
		}
		AWB.setup.extend(data);
	});
};

AWB.setup.extend = function(obj) {
	$.extend(AWB.settings, obj);
	if (!AWB.settings.hasOwnProperty('default')) {
		AWB.setup.save('default');
	}
	for (var i in AWB.settings) {
		if ($('#loadSettings').find('option[value="'+i+'"]').length) continue;
		$('#loadSettings').append('<option value="'+i+'">'+i+'</option>');
	}
	AWB.setup.apply($('#loadSettings').val());
};

AWB.setup.delete = function() {
	var name = $('#loadSettings').val();
	if (name === '_blank') return alert(AWB.msg('setup-delete-blank'));
	var temp = {};
	temp[name] = AWB.settings[name];
	AWB.setup.temp = $.extend({}, temp);
	delete AWB.settings[name];
	$('#loadSettings').val('default');
	if (name === 'default') {
		AWB.setup.apply('_blank');
		AWB.setup.save('default');
		AWB.status(AWB.msg('status-del-default', '<a href="javascript:AWB.setup.undelete();">'+AWB.msg('status-del-undo')+'</a>'), false);
	} else {
		$('#loadSettings').find('[value="'+name+'"]').remove();
		AWB.setup.apply();
		AWB.status(AWB.msg('status-del-setup', name, '<a href="javascript:AWB.setup.undelete();">'+AWB.msg('status-del-undo')+'</a>'), false);
	}
};
AWB.setup.undelete = function() {
	AWB.setup.extend(AWB.setup.temp);
	AWB.status('done', false);
};

/***** Main other functions *****/

//Show status message
AWB.status = function(action, spinner) {
	var status = AWB.msg('status-'+action);
	if (status === false) return;
	var spinImg = '<img src="//upload.wikimedia.org/wikipedia/commons/d/de/Ajax-loader.gif" width="15" height="15" alt="'+AWB.msg('status-alt')+'"/>';
	if (status) {
		if (spinner !== false) {
			status += ' ' + spinImg;
		}
	} else {
		status = action;
	}
	$('#status').html(status);
	AWB.pageCount();
	return action=='done';
};

AWB.pageCount = function() {
	if (AWB.allowed === false||!$('#articleList').length) return;
	$('#articleList').val(($('#articleList').val()||'').replace(/(^[ \t]*$\n)*/gm, ''));
	AWB.list = $('#articleList').val().split('\n');
	var count = AWB.list.length;
	if (count === 1 && AWB.list[0] === '') count = 0;
	$('#totPages').html(count);
};

//Perform all specified find&replace actions
AWB.replace = function(input) {
	AWB.pageCount();
 	var varOffset = AWB.list[0].indexOf('|') !== -1 ? AWB.list[0].indexOf('|') : 0;
 	AWB.page.pagevar = AWB.list[0].substr(varOffset);
	$('.replaces').each(function() {
		var $this = $(this);
		var regexFlags = $this.find('.regexFlags').val();
		var replace = $this.find('.replaceText').val().replace(/$x/gi, AWB.page.pagevar) || '$';
		var useRegex = replace === '$' || $this.find('.useRegex').prop('checked');
		if (useRegex && regexFlags.indexOf('_') !== -1) {
			replace = replace.replace(/[ _]/g, '[ _]'); //replaces any of [Space OR underscore] with a match for spaces or underscores.
			replace = replace.replace(/(\[[^\]]*)\[ _\]/g, '$1 _'); //in case a [ _] was placed inside another [] match, remove the [].
			regexFlags = regexFlags.replace('_', '');
		}
		rWith = $this.find('.replaceWith').val().replace(/$x/gi, AWB.page.pagevar).replace(/\\n/g,'\n');
		try {
			if ($this.find('.ignoreNowiki').prop('checked')) {
				if (!useRegex) {
					replace = replace.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
					regexFlags = 'g';
				}
				input = AWB.replaceParsed(input, replace, regexFlags, rWith);
			} else if (useRegex) {
				replace = new RegExp(replace, regexFlags);
				input = input.replace(replace, rWith);
			} else {
				input = input.split(replace).join(rWith); //global replacement without having to escape all special chars.
			}
		} catch(e) {
			AWB.stop();
			return AWB.status('regex-err', false);
		}
	});
	return input;
};

//function to *only* replace the parsed wikitext (so excluding the comments, nowikified, <math>, <source>/<syntaxhighlight>, and <pre> text)
//Based on http://stackoverflow.com/a/23589204/1256925
AWB.replaceParsed = function(str, replace, flags, rwith) {
	var exclude = '(<!--[\\s\\S]*?-->|<(nowiki|math|source|syntaxhighlight|pre)[^>]*?>[\\s\\S]*?<\\/\\2>)';
	//add /i flag, to exclude the correct tags regardless of casing.
	//This won't matter for the actual replacing, as the specified flags are used there.
	var re = new RegExp(exclude + '|(' + replace + ')', flags.replace(/i|$/, 'i'));
	return str.replace(re, function(match, g1, g2, g3) {
		if (g3) { //continue to perform replacement if the match is the group that's supposed to be the match
			return match.replace(new RegExp(replace, flags), rwith);
		} else { //do nothing if the match is one of the excluded groups
			return match;
		}
	});
};

//Adds a line to the logs tab.
AWB.log = function(action, page, info) {
	var d = new Date();
	var pagee = encodeURIComponent(page);
	var extraInfo = '', actionStat = '';
	switch (action) {
		case 'edit':
			if (typeof info === 'undefined') {
				action = 'null-edit';
				actionStat = 'nullEdits';
				extraInfo = '';
			} else {
				extraInfo = ' (<a target="_blank" href="/index.php?title='+pagee+'&diff='+info+'">diff</a>)';
				actionStat = 'pagesSaved';
			}
			break;
		case 'skip':
			actionStat = 'pagesSkipped';
			break;
		case 'move':
			extraInfo = ' to <a target="_blank" href="/wiki/'+encodeURIComponent(info)+'" title="'+info+'">'+info+'</a>';
			break;
		case 'protect':
			extraInfo = info;
			break;
	}
	actionStat = '#' + (actionStat || 'otherActions');
	$(actionStat).html(+$(actionStat).html() + 1);
	$('#actionlog tbody')
		.append('<tr>'+
			'<td>'+(AWB.fn.pad0(d.getHours())+':'+AWB.fn.pad0(d.getMinutes())+':'+AWB.fn.pad0(d.getSeconds()))+'</td>'+
			'<th>'+action+'</th>'+
			'<td><a target="_blank" href="/wiki/'+pagee+'" title="'+page+'">'+page+'</a>'+ extraInfo +'</td>'+
		'</tr>')
		.parents('.AWBtabc').scrollTop($('#actionlog tbody').parents('.AWBtabc')[0].scrollHeight);
};

//Move to the next page in the list
AWB.next = function(nextPage) {
	if ($.trim(nextPage) && !$('#skipAfterAction').prop('checked')) {
		nextPage = $.trim(nextPage) + '\n';
	} else {
		nextPage = '';
	}
	$('#articleList').val($('#articleList').val().replace(/^.*\n?/, nextPage));
	AWB.list.splice(0,1);
	AWB.pageCount();
	AWB.api.get(AWB.list[0].split('|')[0]);
};

//Stop everything, reset inputs and editor
AWB.stop = function() {
	$('#stopbutton, .editbutton, #watchNow, .AWBtabc[data-tab="2"] button, .AWBtabc[data-tab="4"] button').prop('disabled', true);
	$('#startbutton, #articleList, .AWBtabc[data-tab="1"] button, #replacesPopup button, #replacesPopup input, .AWBtabc input, select').prop('disabled', false);
	$('#resultWindow').html('');
	$('#editBoxArea').val('');
	AWB.isStopped = true;
};

//Start AutoWikiBrowsing
AWB.start = function() {
	AWB.pageCount();
	if (AWB.list.length === 0 || (AWB.list.length === 1 && !AWB.list[0])) {
		alert(AWB.msg('no-pages-listed'));
	} else if ($('#skipNoChange').prop('checked') && !$('.replaceText').val() && !$('.replaceWith').val()) {
		alert(AWB.msg('infinite-skip-notice'));
	} else {
		AWB.isStopped = false;
		if ($('#preparse').prop('checked') && !$('#articleList').val().match('#PRE-PARSE-STOP')) {
			$('#articleList').val($.trim($('#articleList').val()) + '\n#PRE-PARSE-STOP'); //mark where to stop pre-parsing
		} else {
			$('#preparse-reset').click();
		}
		$('#stopbutton, .editbutton, #watchNow, .AWBtabc[data-tab="2"] button, .AWBtabc[data-tab="4"] button').prop('disabled', false);
		$('#startbutton, #articleList, .AWBtabc[data-tab="1"] button, #replacesPopup button, #replacesPopup input, .AWBtabc input, select').prop('disabled', true);
		AWB.api.get(AWB.list[0].split('|')[0]);
	}
};

AWB.updateButtons = function() {
	if (!AWB.page.exists && $('#deletePage').is('.delete')) {
		$('#deletePage').removeClass('delete').addClass('undelete').html('Undelete');
		AWB.fn.blink('#deletePage'); //Indicate the button has changed
	} else if (AWB.page.exists && $('#deletePage').is('.undelete')) {
		$('#deletePage').removeClass('undelete').addClass('delete').html('Delete');
		AWB.fn.blink('#deletePage'); //Indicate the button has changed
	}
	if (!AWB.page.exists) {
		$('#movePage').prop('disabled', true);
	} else {
		$('#movePage').prop('disabled', false);
	}
	$('#watchNow').html( AWB.msg('watch-' + (AWB.page.watched ? 'remove' : 'add')) );
};

/***** General functions *****/

//Clear all existing timers to prevent them from getting errors
AWB.fn.clearAllTimeouts = function() {
	var i = setTimeout(function() {
		return void(0);
	}, 1000);
	for (var n=0;n<=i;n++) {
		clearTimeout(n);
		clearInterval(i);
	}
	console.log('Cleared all running intervals up to index',i);
};

//Filter an array to only contain unique values.
AWB.fn.uniques = function(arr) {
	var a = [];
	for (var i=0, l=arr.length; i<l; i++) {
		if (a.indexOf(arr[i]) === -1 && arr[i] !== '') {
			a.push(arr[i]);
		}
	}
	return a;
};

//Prepends zeroes until the number has the desired length of len (default 2)
AWB.fn.pad0 = function(n, len) {
	n = n.toString();
	len = len||2;
	return n.length < len ? Array(len-n.length).join('0')+n : n;
};

AWB.fn.blink = function(el,t) {
	t=t?t:500;
	$(el).prop('disabled', true)
	.children().animate({opacity:'0.1'},t-100)
	.animate({opacity:'1'},t)
	.animate({opacity:'0.1'},t-100)
	.animate({opacity:'1'},t);
	setTimeout("$('"+el+"').prop('disabled', false)",t*4-400);
};

AWB.fn.setSelection = function(el, start, end, dir) {
    dir = dir||'none'; //Default value
    end = end||start; //If no end is specified, assume the caret is placed without creating text selection.
    if (el.setSelectionRange) {
        el.focus();
        el.setSelectionRange(start, end, dir);
    } else if (el.createTextRange) {
        var rng = el.createTextRange();
        rng.collapse(true);
        rng.moveStart('character', start);
        rng.moveEnd('character', end);
        rng.select();
    }
};

AWB.fn.scrollSelection = function(el, index) { //function to fix scrolling to selection - doesn't do that automatically.
	var newEl = document.createElement('textarea'); //create a new textarea to simulate the same conditions
	var elStyle = getComputedStyle(el);
	newEl.style.height = elStyle.height; //copy over size-influencing styles
	newEl.style.width = elStyle.width;
	newEl.style.lineHeight = elStyle.lineHeight;
	newEl.style.fontSize = elStyle.fontSize;
	newEl.value = el.value.substr(0,index);
	document.body.appendChild(newEl); //needs to be added to the HTML for the scrollHeight and clientHeight to work.
	if (newEl.scrollHeight != newEl.clientHeight) {
		el.scrollTop = newEl.scrollHeight - 2;
	} else {
		el.scrollTop = 0;
	}
	newEl.remove(); //clean up the mess I've made
};

//i18n function
AWB.msg = function(message) {
	var args = arguments;
	var lang = AWB.lang;
	if (typeof message === 'object') {
		lang = message[1];
		message = message[0];
	}
	if (!AWB.messages || !AWB.messages.en) return false;
	var msg;
	if (AWB.messages.hasOwnProperty(lang) && AWB.messages[lang].hasOwnProperty(message)) {
		msg = AWB.messages[lang][message];
	} else {
		msg = (AWB.messages.en.hasOwnProperty(message)) ? AWB.messages.en[message] : '';
	}
	msg = msg.replace(/\$(\d+)/g, function(match, num) {
		return args[+num] || match;
	});
	return msg;
};

/***** Init *****/

AWB.init = function() {
	console.log(AWB.messages.en, !!AWB.messages.en);
	AWB.setup.load();
	AWB.fn.clearAllTimeouts();
	if (!AWB.messages[AWB.lang]) AWB.lang = 'en';
	
	var findreplace = '<div class="replaces">'+
		'<label style="display:block;">'+AWB.msg('label-replace')+' <input type="text" class="replaceText"/></label>'+
		'<label style="display:block;">'+AWB.msg('label-rwith')+' <input type="text" class="replaceWith"/></label>'+
		'<div class="regexswitch">'+
			'<label><input type="checkbox" class="useRegex"> '+AWB.msg('label-useregex')+'</label>'+
			'<a class="re101" href="http://regex101.com/#javascript" target="_blank">?</a>'+
			'<label class="divisor" title="'+AWB.msg('tip-regex-flags')+'" style="display:none;">'+
				AWB.msg('label-regex-flags')+' <input type="text" class="regexFlags" value="g"/>'+ //default: global replacement
			'</label>'+
			'<br/>'+
		'</div>'+
		'<label title="'+AWB.msg('tip-ignore-comment')+'">'+
			'<input type="checkbox" class="ignoreNowiki"> '+AWB.msg('label-ignore-comment')+
		'</label>'+
	'</div>';
	
	var NSList = '<select multiple name="namespace" id="namespacelist">';
	for (var i in AWB.ns) {
		if (parseInt(i) < 0) continue; //No Special: or Media: in the list
		NSList += '<option value="'+AWB.ns[i].id+'" selected>'+(AWB.ns[i]['*'] || '('+AWB.msg('namespace-main')+')')+'</option>';
	}
	NSList += '</select>';
	
	/***** Interface *****/
	
	document.title = 'AutoWikiBrowser Script'+(document.title.split('-')[1] ? ' -'+document.title.split('-')[1] : '');
	$('body').html(
		'<article id="resultWindow"></article>'+
		'<main id="inputsWindow">'+
			'<div id="inputsBox">'+
				'<aside id="articleBox">'+
					'<b>'+AWB.msg('pagelist-caption')+'</b>'+
					'<textarea id="articleList"></textarea>'+
				'</aside>'+
				'<section id="tabs">'+
					'<nav class="tabholder">'+
						'<span class="AWBtab" data-tab="1">'+AWB.msg('tab-setup')+'</span> '+
						'<span class="AWBtab active" data-tab="2">'+AWB.msg('tab-editing')+'</span> '+
						'<span class="AWBtab" data-tab="3">'+AWB.msg('tab-skip')+'</span> '+
						(AWB.sysop?'<span class="AWBtab" data-tab="4">'+AWB.msg('tab-other')+'</span> ':'')+
						' <span class="AWBtab log" data-tab="5">'+AWB.msg('tab-log')+'</span> '+
					'</nav>'+
					'<section class="AWBtabc" data-tab="1"></section>'+
					'<section class="AWBtabc active" data-tab="2"></section>'+
					'<section class="AWBtabc" data-tab="3"></section>'+
					(AWB.sysop?'<section class="AWBtabc" data-tab="4"></section>':'')+
					'<section class="AWBtabc log" data-tab="5"></section>'+
					'<footer id="status">done</footer>'+
				'</section>'+
				'<aside id="editBox">'+
					'<b>'+AWB.msg('editbox-caption')+' </b>'+
					'<textarea id="editBoxArea"></textarea>'+
				'</aside>'+
			'</div>'+
		'</main>'+
		'<footer id="stats">'+
			AWB.msg('stat-pages')+' <span id="totPages">0</span>;&emsp;'+
			AWB.msg('stat-save')+' <span id="pagesSaved">0</span>;&emsp;'+
			AWB.msg('stat-null')+' <span id="nullEdits">0</span>;&emsp;'+
			AWB.msg('stat-skip')+' <span id="pagesSkipped">0</span>;&emsp;'+
			AWB.msg('stat-other')+' <span id="otherActions">0</span>;&emsp;'+
		'</footer>'+
		'<div id="overlay" style="display:none;"></div>'+
		'<section class="AWBpopup" id="replacesPopup" style="display:none;">'+
			'<button id="moreReplaces">'+AWB.msg('button-more-fields')+'</button>'+
			'<br>'+findreplace+
		'</section>'+
		'<section class="AWBpopup" id="pagelistPopup" style="display:none;">'+
			'<form action="javascript:AWB.pl.generate();"></form>'+
		'</section>'
	);
	
	$('.AWBtabc[data-tab="1"]').html(
		'<fieldset id="pagelist">'+
			'<legend>'+AWB.msg('label-pagelist')+'</legend>'+
			'<button id="removeDupes">'+AWB.msg('button-remove-dupes')+'</button> '+
			'<button id="sortArticles">'+AWB.msg('button-sort')+'</button>'+
			'<br>'+
			'<label title="'+AWB.msg('tip-preparse')+'">'+
				'<input type="checkbox" id="preparse"> '+AWB.msg('preparse')+
			'</label>'+
			'<span class="divisor"></span>'+
			'<button id="preparse-reset" title="'+AWB.msg('tip-preparse-reset')+'">'+AWB.msg('preparse-reset')+'</button>'+
			'<br>'+
			'<button id="pagelistButton">'+AWB.msg('pagelist-generate')+'</button>'+
		'</fieldset>'+
		'<fieldset id="settings">'+
			'<legend>'+AWB.msg('label-settings')+'</legend>'+
			'<button id="saveAs" title="'+AWB.msg('tip-store-setup')+'">'+AWB.msg('store-setup')+'</button>'+
			'<br>'+
			'<label>'+
				AWB.msg('load-settings') + ' '+
				'<select id="loadSettings">'+
					'<option value="default" selected>default</option>'+
					'<option value="_blank">'+AWB.msg('blank-setup')+'</option>'+
				'</select>'+
			'</label>'+
			'<span class="divisor"></span>'+
			'<button id="deleteSetup" title="'+AWB.msg('tip-delete-setup')+'">'+AWB.msg('delete-setup')+'</button>'+
			'<hr>'+
			'<button id="saveToWiki">'+AWB.msg('save-setup')+'</button>'+
			'<span class="divisor"></span>'+
			'<button id="download">'+AWB.msg('download-setup')+'</button>'+
			'<hr>'+
			'<label class="button" id="importLabel" title="'+AWB.msg('tip-import-setup')+'">'+
				'<input type="file" id="import" accept=".json">'+
				AWB.msg('import-setup')+
			'</label>'+
			'<span class="divisor"></span>'+
			'<button id="updateSetups" title="'+AWB.msg('tip-update-setup')+'">'+AWB.msg('update-setup')+'</button>'+
			'<div id="downloads">'+
				'<a download="AWB-settings.json" target="_blank" id="download-anchor"></a>'+
				'<iframe id="download-iframe"></iframe>'+
			'</div>'+
		'</fieldset>'
	);
	$('.AWBtabc[data-tab="2"]').html(
		'<label style="float:right;"><input type="checkbox" id="minorEdit" checked> '+AWB.msg('minor-edit')+'</label>'+
		'<label>'+AWB.msg('edit-summary')+' <input class="fullwidth" type="text" id="summary" maxlength="250"/></label>'+
		'<select id="watchPage">'+
			'<option value="watch">'+AWB.msg('watch-watch')+'</option>'+
			'<option value="unwatch">'+AWB.msg('watch-unwatch')+'</option>'+
			'<option value="nochange" selected>'+AWB.msg('watch-nochange')+'</option>'+
			'<option value="preferences">'+AWB.msg('watch-preferences')+'</option>'+
		'</select>'+
		'<span class="divisor"></span>'+
		'<button id="watchNow" disabled accesskey="w" title="['+AWB.tooltip+'w]">'+
			AWB.msg('watch-add')+
		'</button>'+
		'<br>'+
		(AWB.bot?
			'<label><input type="checkbox" id="autosave"> '+AWB.msg('auto-save')+'</label>'+
			'<label title="'+AWB.msg('tip-save-interval')+'" class="divisor">'+
				AWB.msg('save-interval', '<input type="number" min="0" value="0" style="width:50px" id="throttle" disabled>')+
			'</label>'+
			'<br>'
		:'')+
		'<span id="startstop">'+
			'<button id="startbutton" accesskey="a" title="['+AWB.tooltip+'a]">'+AWB.msg('editbutton-start')+'</button>'+
			'<br>'+
			'<button id="stopbutton" disabled accesskey="q" title="['+AWB.tooltip+'q]">'+AWB.msg('editbutton-stop')+'</button> '+
		'</span>'+
		'<button class="editbutton" id="skipButton" disabled accesskey="n" title="['+AWB.tooltip+'n]">'+AWB.msg('editbutton-skip')+'</button>'+
		'<button class="editbutton" id="submitButton" disabled accesskey="s" title="['+AWB.tooltip+'s]">'+AWB.msg('editbutton-save')+'</button>'+
		'<br>'+
		'<button class="editbutton" id="previewButton" disabled accesskey="p" title="['+AWB.tooltip+'p]">'+AWB.msg('editbutton-preview')+'</button>'+
		'<button class="editbutton" id="diffButton" disabled accesskey="d" title="['+AWB.tooltip+'d]">'+AWB.msg('editbutton-diff')+'</button>'+
		'<button id="replacesButton">'+AWB.msg('button-open-popup')+'</button>'+
		findreplace
	);
	$('.AWBtabc[data-tab="3"]').html(
		'<fieldset>'+
			'<legend>'+AWB.msg('label-redirects')+'</legend>'+
			'<label title="'+AWB.msg('tip-redirects-follow')+'">'+
				'<input type="radio" class="redirects" value="follow" name="redir" id="redir-follow"> '+AWB.msg('redirects-follow')+' '+
			'</label>'+
			'<label title="'+AWB.msg('tip-redirects-skip')+'">'+
				 '<input type="radio" class="redirects" value="skip" name="redir" id="redir-skip"> '+AWB.msg('redirects-skip')+' '+
			'</label>'+
			'<label title="'+AWB.msg('tip-redirects-edit')+'">'+
				'<input type="radio" class="redirects" value="edit" name="redir" id="redir-edit" checked> '+AWB.msg('redirects-edit')+''+
			'</label>'+
		'</fieldset>'+
		'<fieldset>'+
			'<legend>'+AWB.msg('label-skip-when')+'</legend>'+
			'<label><input type="checkbox" id="skipNoChange"> '+AWB.msg('skip-no-change')+'</label>'+
			'<br>'+
			'<label><input type="radio" id="exists-yes" name="exists" value="yes"> '+AWB.msg('skip-exists-yes')+'</label>'+
			'<label><input type="radio" id="exists-no" name="exists" value="no" checked> '+AWB.msg('skip-exists-no')+'</label>'+
			'<label><input type="radio" id="exists-neither" name="exists" value="neither">'+AWB.msg('skip-exists-neither')+'</label>'+
			'<br>'+
			(AWB.sysop?'<label><input type="checkbox" id="skipAfterAction" checked> '+AWB.msg('skip-after-action')+'</label>':'')+
		'</fieldset>'+
		'<label>'+AWB.msg('skip-contains')+' <input class="fullwidth" type="text" id="skipContains"></label>'+
		'<label>'+AWB.msg('skip-not-contains')+' <input class="fullwidth" type="text" id="skipNotContains"></label>'+
		'<div class="regexswitch">'+
			'<label><input type="checkbox" id="containRegex"> '+AWB.msg('label-useregex')+'</label>'+
			'<a class="re101" href="http://regex101.com/#javascript" target="_blank">?</a>'+
			'<label class="divisor" title="'+AWB.msg('tip-regex-flags')+'" style="display:none;">'+
				AWB.msg('label-regex-flags')+' <input type="text" id="containFlags"/>'+
			'</label>'+
		'</div>'
	);
	if (AWB.sysop) $('.AWBtabc[data-tab="4"]').html(
		'<fieldset>'+
			'<legend>'+AWB.msg('move-header')+'</legend>'+
			'<label><input type="checkbox" id="suppressRedir"> '+AWB.msg('move-redir-suppress')+'</label>'+
			'<br>'+
			AWB.msg('move-also')+' '+
			'<label><input type="checkbox" id="movetalk"> '+AWB.msg('move-talk-page')+'</label> '+
			'<label><input type="checkbox" id="movesubpage"> '+AWB.msg('move-subpage')+'</label>'+
			'<br>'+
			'<label>'+AWB.msg('move-new-name')+' <input type="text" id="moveTo"></label>'+
		'</fieldset>'+
		'<fieldset>'+
		'<legend>'+AWB.msg('protect-header')+'</legend>'+
			AWB.msg('protect-edit')+
			'<select id="editProt">'+
				'<option value="all" selected>'+AWB.msg('protect-none')+'</option>'+
				'<option value="autoconfirmed">'+AWB.msg('protect-autoconf')+'</option>'+
				'<option value="sysop">'+AWB.msg('protect-sysop')+'</option>'+
			'</select> '+
			'<br>'+
			AWB.msg('protect-move')+
			'<select id="moveProt">'+
				'<option value="all" selected>'+AWB.msg('protect-none')+'</option>'+
				'<option value="autoconfirmed">'+AWB.msg('protect-autoconf')+'</option>'+
				'<option value="sysop">'+AWB.msg('protect-sysop')+'</option>'+
			'</select> '+
			'<br>'+
			'<label>'+AWB.msg('protect-expiry')+' <input type="text" id="protectExpiry"/></label>'+
		'</fieldset>'+
		'<button id="movePage" disabled accesskey="m" title="['+AWB.tooltip+'m]">'+AWB.msg('editbutton-move')+'</button> '+
		'<button id="deletePage" disabled accesskey="x" title="['+AWB.tooltip+'x]">'+AWB.msg('editbutton-delete')+'</button> '+
		'<button id="protectPage" disabled accesskey="z" title="['+AWB.tooltip+'z]">'+AWB.msg('editbutton-protect')+'</button> '+
		'<button id="skipPage" disabled title="['+AWB.tooltip+'n]">'+AWB.msg('editbutton-skip')+'</button>'
	);
	$('.AWBtabc[data-tab="5"]').html('<table id="actionlog"><tbody></tbody></table>');
	$('#pagelistPopup form').html(
		'<div id="ns-filter" title="'+AWB.msg('tip-ns-select')+'">' + AWB.msg('label-ns-select') + NSList + '</div>'+
		'<fieldset>'+
			'<legend><label><input type="checkbox" id="categorymembers" name="categorymembers" value="cm"> '+AWB.msg('legend-cm')+'</label></legend>'+
			'<label title="Namespace prefix not required.">'+AWB.msg('label-cm')+' <input type="text" name="cmtitle" id="cmtitle"></label>'+
			'<div>'+AWB.msg('cm-include')+' '+
				'<label><input type="checkbox" id="cmtype-page" name="cmtype" value="page" checked> '+AWB.msg('cm-include-pages')+'</label>'+
				'<label><input type="checkbox" id="cmtype-subcg" name="cmtype" value="subcat" checked> '+AWB.msg('cm-include-subcgs')+'</label>'+
				'<label><input type="checkbox" id="cmtype-file" name="cmtype" value="file" checked> '+AWB.msg('cm-include-files')+'</label>'+
			'</div>'+
		'</fieldset>'+
		'<fieldset>'+
			'<legend><label><input type="checkbox" name="linksto" id="linksto"> '+AWB.msg('legend-linksto')+'</label></legend>'+
			'<label>'+AWB.msg('label-linksto')+' <input type="text" name="title" id="linksto-title"></label>'+
			'<div>'+AWB.msg('links-include')+' '+
				'<label><input type="checkbox" id="backlinks" name="backlinks" value="bl" checked> '+AWB.msg('links-include-links')+'</label>'+
				'<label><input type="checkbox" id="embeddedin" name="embeddedin" value="ei"> '+AWB.msg('links-include-templ')+'</label>'+
				'<label><input type="checkbox" id="imageusage" name="imageusage" value="iu"> '+AWB.msg('links-include-files')+'</label>'+
			'</div>'+
			'<div>'+AWB.msg('links-redir')+' '+
				'<label><input type="radio" id="rfilter-redir" name="filterredir" value="redirects"> '+AWB.msg('links-redir-redirs')+'</label>'+
				'<label><input type="radio" id="rfilter-nonredir" name="filterredir" value="nonredirects"> '+AWB.msg('links-redir-noredirs')+'</label>'+
				'<label><input type="radio" id="rfilter-all" name="filterredir" value="all" checked> '+AWB.msg('links-redir-all')+'</label>'+
			'</div>'+
			'<label title="'+AWB.msg('tip-link-redir')+'">'+
				'<input type="checkbox" name="redirect" value="true" checked id="linksto-redir"> '+AWB.msg('label-link-redir')+
			'</label>'+
		'</fieldset>'+
		'<fieldset>'+
			'<legend><label><input type="checkbox" id="prefixsearch" name="prefixsearch" value="ps"> '+AWB.msg('legend-ps')+'</label></legend>'+
			'<label>'+AWB.msg('label-ps')+' <input type="text" name="pssearch" id="pssearch"></label>'+
		'</fieldset>'+
		'<fieldset>'+
			'<legend><label><input type="checkbox" id="watchlistraw" name="watchlistraw" value="wr"> '+AWB.msg('legend-wr')+'</label></legend>'+
			AWB.msg('label-wr')+
		'</fieldset>'+
		'<fieldset>'+
			'<legend><label><input type="checkbox" id="proplinks" name="links" value="pl"> '+AWB.msg('legend-pl')+'</label></legend>'+
			'<label title="'+AWB.msg('tip-pl')+'">'+AWB.msg('label-pl')+' <input type="text" id="pltitles" name="titles"></label>'+
		'</fieldset>'+
		'<button type="submit">'+AWB.msg('pagelist-generate')+'</button>'
	);
	$('body').addClass('AutoWikiBrowser'); //allow easier custom styling of AWB.
	
	/***** Setup *****/
	AWB.setup.save('_blank'); //default setup
	if (AWB.settings.hasOwnProperty('default')) {
		AWB.setup.apply();
	} else if (AWB.setup.hasOwnProperty('edittoken')) {
		AWB.setup.save('default');
	}
	AWB.setup.extend({});

	/***** Event handlers *****/
	
	//Alert user when leaving the tab, to prevent accidental closing.
	onbeforeunload = function() {
		return "Closing this tab will cause you to lose all progress.";
	};
	ondragover = function(e) {
		e.preventDefault();
	};
	
	$('.AWBtab').click(function() {
		$('.active').removeClass('active');
		$(this).addClass('active');
		$('.AWBtabc[data-tab="'+$(this).attr('data-tab')+'"]').addClass('active');
	});
	
	function showRegexFlags() {
		$(this).parent().nextAll('label').toggle(this.checked);
	}
	$('body').on('change', '#useRegex, #containRegex, .useRegex', showRegexFlags);
	
	$('#preparse-reset').click(function() {
		$('#articleList').val($('#articleList').val().replace(/#PRE-PARSE-STOP/g,'').replace(/\n\n/g, '\n'));
	});
	$('#saveAs').click(function() {
		AWB.setup.save();
	});
	$('#loadSettings').change(function() {
		AWB.setup.apply(this.value);
	});
	$('#download').click(AWB.setup.download);
	$('#saveToWiki').click(AWB.setup.submit);
	$('#import').change(AWB.setup.import);
	ondrop = AWB.setup.import;
	$('#updateSetups').click(AWB.setup.load);
	$('#deleteSetup').click(AWB.setup.delete);

	$('#replacesButton, #pagelistButton').click(function() {
		var popup = this.id.slice(0, -6); //omits the 'Button' in the id by cutting off the last 6 characters
		$('#'+popup+'Popup, #overlay').show();
	});
	$('#overlay').click(function() {
		$('#replacesPopup, #pagelistPopup, #overlay').hide();
	});
	$('#moreReplaces').click(function() {
		$('#replacesPopup').append(findreplace);
	});
	$('#replacesPopup').on('keydown', '.replaces:last', function(e) {
		if (e.which === 9) $('#moreReplaces')[0].click();
	});
	
	$('#pagelistPopup legend input').change(function() {
		//remove disabled attr when checked, add when not.
		$(this).parents('fieldset').find('input').not('legend input').prop('disabled', !this.checked);
		$(this).parents('fieldset').prop('disabled', !this.checked);
	}).trigger('change');
	
	$('#resultWindow').on('click', 'tr[data-line]:not(.lineheader) *', function(e) {
		var line = +$(e.target).closest('tr[data-line]').data('line');
		var index = $('#editBoxArea').val().split('\n').slice(0, line-1).join('\n').length;
		$('#editBoxArea')[0].focus();
		AWB.fn.setSelection($('#editBoxArea')[0], index+1);
		AWB.fn.scrollSelection($('#editBoxArea')[0], index);
	});
	
	$('#removeDupes').click(function() {
		$('#articleList').val(AWB.fn.uniques($('#articleList').val().split('\n')).join('\n'));
		AWB.pageCount();
	});
	$('#sortArticles').click(function() {
		$('#articleList').val($('#articleList').val().split('\n').sort().join('\n'));
		AWB.pageCount();
	});
	
	$('#watchNow').click(AWB.api.watch);
	$('#autosave').change(function() {
		$('#throttle').prop('disabled', !this.checked);
	});
	
	$('#startbutton').click(AWB.start);
	$('#stopbutton').click(AWB.stop);
	$('#submitButton').click(AWB.api.submit);
	$('#previewButton').click(AWB.api.preview);
	$('#diffButton').click(AWB.api.diff);
	
	$('#skipButton, #skipPage').click(function() {
		AWB.log('skip', AWB.list[0].split('|')[0]);
		AWB.next();
	});
	
	if (AWB.sysop) {
		$('#movePage').click(function() {
			if ($('#moveTo').val().length === 0) {
				return alert(AWB.msg('alert-no-move'));
			}
			AWB.api.move();
		});
		$('#protectPage').click(AWB.api.protect);
		$('#deletePage').click(AWB.api.delete);
	}
};

//Disable AWB altogether when it's loaded on a page other than Project:AutoWikiBrowser/Script. This script shouldn't be loaded on any other page in the first place.
if (AWB.allowed === false) AWB = false;
