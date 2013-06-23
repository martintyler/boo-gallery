/**
    Copyright (C) 2013 by Martin Tyler (martin.tyler@boo.org)

    Visit http://www.boo.org
*/


Boo.Flickr = {};


Boo.Flickr.PhotosFromAPI = function(flickr, width) {
	var photos = [];
	var images = flickr.photos.photo;

	for (var i = 0; i < images.length; i++) {

		var item = images[i];
		var baseUrl = 'http://farm' + item.farm + '.static.flickr.com/' + item.server + '/' + item.id + '_' + item.secret;
 
		var w = 600;
		var h = 400;

		var photo = {
			width: w,
			height: h,
			caption: item.title,
			filename: item.title,
			thumbnail: baseUrl + '_z.jpg',
			portrait: baseUrl + '_z.jpg',
			large: baseUrl + '_b.jpg'
		};

		photos.push(photo);
	}

	this.getPhotos = function() {
		return photos;
	}
};


Boo.Flickr.SlideshowGallery = function(args) {
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

	this.loadAlbum = function(userID) {
		albums++;
		var url = 'http://api.flickr.com/services/rest/?&method=flickr.people.getPublicPhotos' +
			'&api_key=' + settings.apiKey +
			'&user_id=' + userID +
			'&per_page=' + (settings.perPage || 20) +
			'&page=1' +
			'&format=json';
		$.getJSON(url + '&jsoncallback=?', function(flickr) {
			var albumPhotos = new Boo.Flickr.PhotosFromAPI(flickr, gallery.getImageWidth());
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