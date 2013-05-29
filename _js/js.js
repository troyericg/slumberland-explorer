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
		Slumberland.bindActions();
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
				//console.log("lower: " + ui.values[0] + "; higher: " + ui.values[1]);
				Slumberland.rangeFilter('year',ui.values[0], ui.values[1]);
			}
		});

		$('div.status p.num-entries span').html($('div.entry').length);

		$('li.year-tick').click(function(){
			var setYear = $(this).data('year');
			$("#slider-range").slider("values", 0, setYear);
			$("#slider-range").slider("values", 1, setYear);
		});

		$('#link-controls div.status a').click(function(){

			$('#link-controls ul li').removeClass('buttonOn');

			$("#slider-range").slider("values", 0, 1905);
			$("#slider-range").slider("values", 1, 1914);
			//entries.removeClass('ranged');
			return false;
		});
	},

	buildFilters: function(selector, people, themes){
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

		// goes over every person name and adds them to the character list
		$.each(people, function(index, elem){
			item = $('<li />');
			item.html(elem);
			$(charList).append(item);
		});

		// goes over every tag name in the shortened array and adds them to the content list
		$.each(mainThemes, function(indx, it){
			numItem = $('<span />');it[0]
			numItem.html(it[1]);

			listItem = $('<li />');
			listItem.html(it[0].substring(0,1).toUpperCase() + it[0].substring(1));

			listItem.append(numItem);
			$(contList).append(listItem);
		});


		$(charList + ' li').each(function(idx, itm){
			var mainChar;
			switch ( $(this).text() ) {
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
			var person = $(this).text();
			$('#link-controls ul li').removeClass('buttonOn');
			$(this).addClass('buttonOn');

			Slumberland.clickFilter(Slumberland.config.entry, 'characters', person);
		});

	},

	entryDisplay: function(data){
		var json = data;
		var gallery = Slumberland.config.gallery;
		var characterList = [];
		var contentList = [];

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
						'text': this.transcript_text
					});
			oImgLink = $('<a />').attr('href', this.img_link);
			oImg = $('<img />').attr('src', this.img_thumb);
			oImgLink.append(oImg);

			obj.html('<p>' + this.date_published + '</p>');
			obj.prepend(oImg);
			$(gallery).append(obj);

			// Creates list of characters for filters 
			$.each(this.characters, function(index, elem){
				if (elem === "King Morphues") {
					elem = "King Morpheus";
				}
				if ($.inArray(elem, characterList) == -1) {
					characterList.push(elem);
				}
			});

			$.each(this.contents, function(index, elem){
				contentList.push(elem);
			});
		});

		var contentsCounted = Slumberland.countClearSort(contentList);
		characterList.sort();
		//Slumberland.buildContFilters();
		Slumberland.buildFilters(Slumberland.config.linkFilters, characterList, contentsCounted);
	},

	countClearSort: function(themes){
		var miniArray = [], aFresh = [];

		var arr = themes.sort();
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
			Slumberland.clickFilter(Slumberland.config.entry, 'characters', $('.buttonOn').text());
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
		
		if (factor === "All Characters") {
			allItems.addClass('visible').show();
		} 
		else {
			allItems.filter(function(index){ 
				curString = $(this).data(type);
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
		var charList = $('ul.characters p');
		charList.on('click', function(){
			$('ul.characters').toggleClass('expanded');
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