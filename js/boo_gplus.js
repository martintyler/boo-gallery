/**
    Copyright (C) 2013 by Martin Tyler (martin.tyler@boo.org)

    Visit http://www.boo.org
*/


Boo.GPlus = {};


Boo.GPlus.PhotosFromAPI = function(gplus, width) {
	var photos = [];

	var images = gplus.feed.entry;

	width = Math.floor(width);
	
	if (window.devicePixelRatio == 2) {
		width *= 2;
	}

	for (var i = 0; i < images.length; i++) {

		var item = images[i];
		var url = item.content.src;
 
		var w = item.gphoto$width.$t;
		var h = item.gphoto$height.$t;

		var title = item.title.$t;
		var filename = title;
		title = title.replace('.jpg','');
		var thumbnail = item.media$group.media$thumbnail[0];
		var s = thumbnail.width > thumbnail.height ? thumbnail.width : thumbnail.height;

		url = thumbnail.url.replace('/s'+s+'/', '/s2048/');
		thumbnail_url = thumbnail.url.replace('/s'+s+'/', '/w'+width+'/');

		var photo = {
			width: w,
			height: h,
			caption: title,
			filename: title,
			thumbnail: thumbnail_url,
			portrait: url,
			large: url
		};

		photos.push(photo);
	}

	console.log(photos);
	this.getPhotos = function() {
		return photos;
	}
};


Boo.GPlus.SlideshowGallery = function(args) {
	var settings = args;
	var photos = [];
	var albums = 0;
	var show = false;
	var gallery = new Boo.Gallery.SlideshowGallery(settings);

	this.slideshowgallery = gallery;

	var draw = function() {
		if (settings.shuffle) {
			Boo.shuffleArray(photos);
		}
		gallery.push(photos);		
	}

	this.loadAlbum = function(userID, albumID) {
		albums++;
		var url = 'https://picasaweb.google.com/data/feed/api' +
			'/user/' + userID +
			'/albumid/' + albumID +
			'?alt=json';
		$.getJSON(url + '&callback=?', function(gplus) {
			var albumPhotos = new Boo.GPlus.PhotosFromAPI(gplus, gallery.getImageWidth());
			photos = photos.concat(albumPhotos.getPhotos());
			if (--albums == 0 && show) {
				draw();
			}
		});
	};

	this.showGallery = function() {
		show = true;
		if (albums == 0) {
			draw();
		}
	}
};