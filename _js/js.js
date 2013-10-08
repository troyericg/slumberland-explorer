<!-- // hide script from old browsers

var Slumberland = Slumberland || {};


Slumberland = {
	config: {
		win: $(window),
		gallery: 'div#gallery-view',
		entry: 'div .entry',
		linkFilters: 'div#link-controls'
	},

	init: function(){
		console.log("it's ON.");
		Slumberland.getData();
		Slumberland.buildSlider();
		//Slumberland.bindActions();
		Slumberland.modalator(Slumberland.config.entry);
	},

	getData: function(){
		$.ajax({
			url: "../data/comicdata.json",
			type: 'GET',
			datatype: "json",
			async: false,
			global: false,
			success: function(data){
				Slumberland.entryDisplay(data);
			},
			error: function(xhr, status, error) {
				var err = eval("(" + xhr.responseText + ")");
				console.log('Fail Blog! ' + xhr.responseText);
			}
		});
	},

	buildSlider: function(){
		var entries = $(Slumberland.config.entry);
		$("#slider-range").slider({
			range: true,
			min: 1905,
			max: 1914,
			values: [1905, 1914],
			slide: function(event, ui) {
				$("#amount").val("$" + ui.values[0] + " - $" + ui.values[1]);
			},
			change: function(event, ui) {
				Slumberland.rangeFilter('year',ui.values[0], ui.values[1]);
			}
		});

		$('div.status p.num-entries span').html($('div.entry').length);

		$('li.year-tick').click(function(){
			var setYear = $(this).data('year');
			$("#slider-range").slider("values", 0, setYear);
			$("#slider-range").slider("values", 1, setYear);
		});

		// reset all filters
		$('#link-controls div.status a').click(function(){
			$('#link-controls ul li').removeClass('buttonOn');
			$("#slider-range").slider("values", 0, 1905);
			$("#slider-range").slider("values", 1, 1914);
			return false;
		});
	},

	buildFilters: function(selector, people, themes, years){
		var charList = 'ul.characters', item;
		var contList = 'ul.contents';
		var mainThemes = [];
		$entries = $(Slumberland.config.entry);

		item = $('<li />').html('All Characters');
		$(charList).append(item);

		for (l=0; l<themes.length; l++) {
			if (themes[l][1] > 10) {
				mainThemes.push(themes[l]);
				//console.log("tag: " + themes[l][0] + "; count: " + themes[l][1]);
			}
		}

		for (m=0; m<years.length; m++) {
			$("li.year-tick[data-year*='" + years[m][0] + "']").data("numIssues", years[m][1])
		}

		// goes over every person name and adds them to the character list
		$.each(people, function(index, elem){
			var name = $('<span />').html(elem[0]);
			var num = $('<span />').html(elem[1]);
			
			$item = $('<li />').append(name).append(num);
			$(charList).append($item);
		});

		// goes over every tag name in the shortened array and adds them to the content list
		var $selectList = $("<select />").attr("id", "themes-list").appendTo( $(contList) );
		Slumberland.buildDropDown(mainThemes);


		$(charList + ' li').each(function(idx, itm){
			var mainChar;
			var popCharacter = $(this).find('span:first').text();

			switch ( popCharacter ) {
				case 'All Characters': mainChar = this; break;
				case 'King Morpheus': mainChar = this; break;
				case 'The Princess': mainChar = this; break;
				case 'Flip': mainChar = this; break;
				case 'Impie': mainChar = this; break;
				case 'Doctor Pill': mainChar = this; break;
				case 'The Professor': mainChar = this; break;
			}
			$(mainChar).appendTo($('ul.characters-mini'));
		});


		$('#link-controls ul li').on("click",function(){
			var person = $(this).find('span:first').text();
			var themes = $('select#themes-list');

			$('#link-controls ul li').removeClass('buttonOn');
			themes.prop('selectedIndex',0);
			themes.find("option").removeClass('buttonOn');
			$(this).addClass('buttonOn');

			Slumberland.clickFilter(Slumberland.config.entry, 'factors', person);
		});

	},

	buildDropDown: function(data){
		// Loops over themes and adds them to dropdown
		var $themesList = $('select#themes-list');
		var dataLength = data.length;
		
		$('<option></option>').val("default").html("ALL THEMES").appendTo($themesList);

		for(i=0; i < dataLength; i++) {
			$('<option></option>').val(data[i][0])
								  .html(data[i].join(" "))
								  .appendTo($themesList);
		}

		// working on theme dropdown
		$('select#themes-list').change(function(){
			var theme = $(this).val();

			$('#link-controls ul li').removeClass('buttonOn');
			$(this).find(":selected").attr('class','buttonOn');
			Slumberland.clickFilter(Slumberland.config.entry, 'factors', theme);
		});
	},

	entryDisplay: function(data){
		var json = data;
		var gallery = Slumberland.config.gallery;
		var characterList = [],
			contentList = [],
			yearList = [];

		// Defines main objects in display
		$.each(json, function(i, item){
			that = this;
			obj = $('<div />')
					.attr('class','entry visible')
					.data({
						'comic_id':this.comic_id,
						'author':this.author,
						'characters': this.characters,
						'contents': this.contents,
						'year': this.date_published,
						'display-date': this.date_display,
						'img-medium': this.img,
						'notes': this.notes,
						'transcript': this.transcript,
						'text': this.transcript_text,
						'factors': this.characters.concat(this.contents)
					});
			oImgLink = $('<a />').attr('href', this.img_link);
			oImg = $('<img />').attr('src', this.img_thumb);
			oImgLink.append(oImg);

			if (obj.data("year") !== null) {
				var year = obj.data("year").split("-")[0];
			} else {
				year = "1905";
			}

			yearList.push(year);

			obj.html('<p>' + this.date_published + '</p>');
			obj.prepend(oImg);
			$(gallery).append(obj);

			// Creates list of characters for filters 
			$.each(this.characters, function(index, elem){
				if (elem === "King Morphues") {
					elem = "King Morpheus";
				}
				characterList.push(elem);
			});

			$.each(this.contents, function(index, elem){
				contentList.push(elem);
			});
		});
		var yearsCounted = Slumberland.countClearSort(yearList);
		var contentsCounted = Slumberland.countClearSort(contentList);
		var charactersCounted = Slumberland.countClearSort(characterList);
		//console.log(yearsCounted);

		Slumberland.buildFilters(Slumberland.config.linkFilters, charactersCounted, contentsCounted, yearsCounted);
	},

	countClearSort: function(list){
		var miniArray = [], aFresh = [];

		var arr = list.sort();
		var copy = arr.slice(0);

		// COUNT AND CLEAR OUT DUPES //
		for (j=0; j<arr.length; j++) {
			var count = 0;

			for (k=0; k<copy.length; k++) {
				if (arr[j] == copy[k]) {
					count++;
					delete copy[k];
				}
			}

			if (count > 0) {
				var tinyArr = [];
				tinyArr[0] = arr[j];
				tinyArr[1] = count;
				aFresh.push(tinyArr);
			}
		}
		return aFresh;
	},

	rangeFilter: function(type, lower, upper){
		var numVisible;
		var allItems = $('div.entry');

		allItems.removeClass('visible ranged').hide();

		var returned = allItems.filter(function(index){ 
			var curString = $(this).data(type);
			if (curString == undefined) {
				yearString = '1905';
			} else {
				yearString = curString.split("-")[0];
			}
			return yearString >= lower && yearString <= upper;
		});

		returned.addClass('visible ranged');

		if ($('.buttonOn').length == 0) {
			returned.show();
		} else {
			var buttonOn = $('.buttonOn').find('span:first').text() || $('.buttonOn').val();
			Slumberland.clickFilter(Slumberland.config.entry, 'factors', buttonOn);
		}

		numVisible = $('div.entry.visible').length;
		$('div.status p.num-entries span').html(numVisible);

		//return false;
	},

	clickFilter: function(items, type, factor){
		
		var lower = $("#slider-range").slider("values", 0);
		var upper = $("#slider-range").slider("values", 1);
		var curString, curDate, numVisible, allItems;
		var rangedItems = $(items + '.ranged');

		if ($(items + '.visible').length != 0 && $(items + '.ranged').length == 0) {
			allItems = $(items);
		} else {
			allItems = (rangedItems.length != 0) ? rangedItems : $(items + '.visible');
		}

		allItems.removeClass('visible').hide();
		
		if (factor === "All Characters" || factor === "default") {
			allItems.addClass('visible').show();
		} 
		else {
			allItems.filter(function(index){ 
				curString = $(this).data(type);
				// console.log(factor);
				// console.log(curString);
				return $.inArray(factor, curString) != -1;

			}).addClass('visible').show();
		}

		numVisible = $('div.entry.visible').length;
		$('div.status p.num-entries span').html(numVisible);
		//return false;
	},

	modalator: function(entry){
		var divEntry = $(entry);
		var overlay = "<div id=\"modal-cover\"></div>";
		var modal = "<div id=\"modal-container\"><div class=\"button-close\"></div><div class=\"modal\"><div class=\"modal-inner\"><div class=\"issue-header\"></div><div class=\"img-container\"></div><div class=\"text-container\"><ul><li class=\"info-author\"><h3 class=\"kicker\">Author</h3></li><li class=\"info-characters\"><h3 class=\"kicker\">Characters</h3></li><li class=\"info-contents\"><h3 class=\"kicker\">Contents</h3></li><li class=\"info-transcript\"><h3 class=\"kicker transcript\">Transcript</h3></li></ul></div></div></div></div>";
		
		$('body').append(overlay).append(modal);
		var fullModal = $('#modal-container, #modal-cover').hide();

		divEntry.click(function(){
			var elem = $(this);
			var contents;
			var listItem = $('.text-container ul li');
			var img = $('<img />').attr('src', elem.data('img-medium'));

			$('.modal-inner .img-container').append(img);
			$('.issue-header').append("<h2>" + elem.data('display-date') + "</h2>");

			// Once I get new JSON, add in a "comic_id" data bind to this as well.
			$('.issue-header h2').data({
				'year': elem.data('year'),
				'comic_id': elem.data('comic_id')
			});

			$.each(listItem, function(i, index){
				switch($(this).attr('class')) {
					case 'info-author': contents = elem.data('author'); break;
					case 'info-characters': contents = elem.data('characters').join(', '); break;
					case 'info-contents': contents = elem.data('contents').join(', '); break;
					case 'info-transcript':
						if (elem.data('transcript') == true) {
							contents = elem.data('text');
							console.log(contents.replace(/$\n/,"<br /><br />"));
						} else { 
							contents = "This strip has not be transcribed. Help out the project by taking a few minutes to submit a transcription.<br /><br /><a href=\"#\" target=\"_blank\" class=\"button-transcribe\">TRANSCRIBE</a>";
						}
						break;
				}
				$(this).append("<p>" + contents + "</p>");
			});
			
			//$('body').addClass('scroll-lock');
			fullModal.show();

			$('.text-container p a.button-transcribe').click(function(){
				var date = $('.issue-header h2').data('year');
				var comicID = $('.issue-header h2').data('comic_id');
				var link = Slumberland.transcribeLink(date, comicID);
				var updated = $(this).attr('href', link);

				window.open($(this).attr('href'));
				return false;
			});

			$('.img-container img').click(function(){
				$('.img-container, .text-container').toggleClass('embiggen-image');
			});

			$(document).delegate('#modal-cover, .button-close', 'click', function(){
				//$('body').removeClass('scroll-lock');
				$('.img-container, .text-container').removeClass('embiggen-image');
				$('.issue-header, .img-container').empty(); listItem.find('p').empty();
				
				fullModal.hide();
			});
		});
	},

	transcribeLink: function(cDate, cID){
		var url1 = "http://www.ohnorobot.com/transcribe.pl?comicid=apdHw72WWbwgo864;title=Little%20Nemo%20-%20";
		var url2 = ";url=http%3A//comicstriplibrary.org/display/";
		var finURL = url1 + cDate + url2 + cID;
		return finURL;
	},

	bindActions:function(){
		var $years = $("ul.num-ticks li");
		var $hoverBox = $("#num-tick-box");

		$years.hover(function(e){
			var numIssues = $(this).data("numIssues");
			$hoverBox.stop().show();
			$(this).mousemove(function(e){
				var alph = $(this),
					parentOffset = alph.parent().offset(),
					yMous = e.pageY - 80,
					xMous = (e.pageX - parentOffset.left) - 25;

				$hoverBox.css({ 'left': xMous, 'top': yMous })
				$hoverBox.find(".num-tick-box-inner").text(numIssues);
			});
			$hoverBox.show();
		}, function(){
				$hoverBox.hide();
		});

	}
};




$(document).ready(function(){

	Slumberland.init();

	//Forces links to open in new window. 
	$("a").click(function() {
	var link_host = this.href.split("/")[2];
	var document_host = document.location.href.split("/")[2];
	
	if (link_host != document_host) {
		window.open(this.href);
		return false;
	}
});

});


// stop hiding script -->