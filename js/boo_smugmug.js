/**
    Copyright (C) 2013 by Martin Tyler (martin.tyler@boo.org)

    Visit http://www.boo.org
*/


Boo.SmugMug = {};


Boo.SmugMug.ImageSizes =   [ 'S', 'M', 'L', 'XL', 'X2', 'X3', 'O' ];
Boo.SmugMug.ImageWidths =  [ 400, 600, 800, 1024, 1280, 1600, 99999 ];
Boo.SmugMug.ImageHeights = [ 300, 450, 600, 768,  960,  1200, 99999 ]


Boo.SmugMug.GetSmugMugSize = function(lenArray, len, defaultSize) {
	var size = defaultSize;

	if (len) {
		if (window.devicePixelRatio == 2) {
			len *= 2;
		}
		var i;
		for (i = 0; i < lenArray.length; i++) {
			if (len < lenArray[i]) {
				size = Boo.SmugMug.ImageSizes[i];
				break;
			}
		}
	}

	return size;	
};


Boo.SmugMug.PhotosFromAPI = function(smugmug, width) {
	var photos = [];

	var images = smugmug.Album.Images;

	var domainURL = smugmug.Album.URL;
	var n = domainURL.indexOf('//');
	n = domainURL.indexOf('/', n+2);
	domainURL = domainURL.substring(0, n+1);

	var baseBuyURL = domainURL + 'buy/' + smugmug.Album.id + '_' + smugmug.Album.Key;

	var thumbnailSize = 'S';
	var portraitThumbnailSize = 'S';
	var largeSize = 'XL';

	thumbnailSize = Boo.SmugMug.GetSmugMugSize(Boo.SmugMug.ImageWidths, width, thumbnailSize);
	portraitThumbnailSize = Boo.SmugMug.GetSmugMugSize(Boo.SmugMug.ImageHeights, width*1.5, portraitThumbnailSize);
	largeSize = Boo.SmugMug.GetSmugMugSize(Boo.SmugMug.ImageWidths, $(window).width(), largeSize);

	if ("thumbnailsize" in Boo.urlParams) {
		thumbnailSize = Boo.urlParams["thumbnailsize"];
	}

	if ("largesize" in Boo.urlParams) {
		largeSize = Boo.urlParams["largesize"];
	}

	var convertURL = function(url, size) {
		return url.replace('/X3/', '/' + size + '/').replace('-X3.', '-' + size + '.');
	};

	for (var i = 0; i < images.length; i++) {
		var imgId = images[i].id + '_' + images[i].Key;
		var baseURL = smugmug.Album.URL + '/' + imgId;
		var buyURL = baseBuyURL + '/' + imgId;
		var ext = images[i].Format.toLowerCase();

		var w = images[i].Width;
		var h = images[i].Height;

		var photo = {
			width: w,
			height: h,
			caption: images[i].FileName.replace('.' + ext, ''),
			filename: images[i].FileName,
			thumbnail: convertURL(images[i].X3LargeURL, thumbnailSize),
			portrait: convertURL(images[i].X3LargeURL, portraitThumbnailSize),
			large: convertURL(images[i].X3LargeURL, largeSize),
			buyurl: buyURL
		};

		photos.push(photo);
	}

	Boo.shuffleArray(photos);

	this.getPhotos = function() {
		return photos;
	}
};


Boo.SmugMug.SlideshowGallery = function(args) {
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

	this.loadAlbum = function(albumID, albumKey) {
		albums++;
		var url = 'http://api.smugmug.com/services/api/json/1.3.0/?method=smugmug.images.get' + 
			'&AlbumID=' + albumID +
			'&AlbumKey=' + albumKey +
			'&Extras=Caption,FileName,Format,Width,Height,X3LargeURL' +
			'&APIKey=' + settings.apiKey;
		$.getJSON(url + '&Callback=?', function(smugmug) {
			var albumPhotos = new Boo.SmugMug.PhotosFromAPI(smugmug, gallery.getImageWidth());
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