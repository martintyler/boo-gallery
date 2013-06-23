/**
    Copyright (C) 2013 by Martin Tyler (martin.tyler@boo.org)

    Visit http://www.boo.org
*/


Boo.Gallery = {};


Boo.Gallery.ColumnGallery = function(args) {
	var settings = args;
	var container = typeof settings.container == 'string' ? $(settings.container) : settings.container;
	container.css({ position: 'relative' });
	var captionFade = settings.captionFade == undefined ? 1000 : settings.captionFade;
	var minWidth = settings.minWidth || 250;
	var maxWidth = settings.maxWidth || 400;
	var minCols = settings.minCols || 1;
	var maxCols = settings.maxCols || 5;
	var cols;
	var lastPhoto;
	var cache = [];
	var numCols;
	var fullWidth;
	var width;
	var imgWidth;
	var lowestCol;

	var slideshow = settings.slideshow;
	var gallery = this;

	if (settings.hidden) {
		container.hide();
	}

	if (maxCols > 10) {
		maxCols = 10;
	}

	if (minCols < 1) {
		minCols = 1;
	}

	var reset = function() {
		container.width("100%");
		container.height("100%");
		cols = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
		lastPhoto = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
		numCols = settings.numCols;
		fullWidth = container.width();

		if (numCols > 0) {
			width = fullWidth / numCols;
		} else {
			numCols = minCols;
			while (1) {
				width = fullWidth / numCols;
				if (numCols < maxCols && width > maxWidth) {
					numCols++;
				} else {
					break;
				}
			}
		}

		imgWidth = width - 10;
		lowestCol = 0;
	}

	reset();

	this.getImageWidth = function() {
		return imgWidth;
	};

	var photoDiv = function(photo, num, top, left) {
		var caption = photo.galleryCaption || photo.caption;
		if (photo.buyurl) {
			caption = '<div style="float: left;">' + caption + '</div>' +
				'<div style="float: right;"><a href="' + photo.buyurl + '">buy</a></div>' + 
				'<div style="clear: both;"></div>';
		}
		var div = $('<div />')
			.addClass('boo-imgdiv')
			.css({ top: top, left: left, width: photo.gallery.finalWidth, height: photo.gallery.finalHeight, margin: '5px' });

		var div2;

		if (photo.link) {
			div2 = $('<a />')
				.attr({ href: photo.link });
		} else {
			div2 = $('<div />');
		}

		var img = $('<img />')
			.attr({ id: 'img' + num })
			.css({ width: photo.gallery.finalWidth })
			.attr({ src: photo.gallery.finalWidth < photo.gallery.finalHeight && photo.portrait ? photo.portrait : photo.thumbnail });

		if (photo.gallery.ratio === undefined) {
			img.bind('load', function() {
				photo.gallery.ratio = this.width / this.height;
				if (resizeTimer == undefined) {
					resizeTimer = setTimeout(gallery.redraw, 250);
				}
			});
		}

		div2.addClass('boo-lightbox')
			.data('photo-num', num)
			.append(img);

		div.append(div2);
		div.append(
			$('<div />')
				.addClass('boo-caption')
				.html(photo.galleryCaption || photo.caption)
			);

		return div;
	};

	var draw = function(photos, start) {
		for (var i = 0; i < photos.length; i++) {
			var photo = photos[i];
			var col = 0;
			for (var c = 1; c < numCols; c++) {
				if (cols[c] < cols[col]) {
					col = c;
				}
			}
			var imgHeight = photo.height * (imgWidth / photo.width);
			if (photo.gallery === undefined) {
				photo.gallery = {};
			}
			if (photo.gallery.ratio) {
				imgHeight = imgWidth / photo.gallery.ratio;
			}
			var height = imgHeight + 10;
			photo.gallery.finalWidth = imgWidth;
			photo.gallery.finalHeight = imgHeight;
			photo.gallery.finalTop = cols[col];
			photo.gallery.finalLeft = col * width;
			photo.gallery.div = photoDiv(photo, start + i, cols[col], col * width);
			container.append(photo.gallery.div);
			cols[col] += height;
			if (cols[col] > lowestCol) {
				lowestCol = cols[col];
			}
			lastPhoto[col] = photo;
		}

		if (settings.extraReflection == undefined) {
			lowestCol += 75;
		} else if (settings.extraReflection == -1) {
			var min = 800;
			var diff = 0;
			for (var col = 0; col < numCols; col++) {
				if (lastPhoto[col] && lastPhoto[col].gallery.finalHeight < min) {
					min = lastPhoto[col].gallery.finalHeight;
					diff = lowestCol - cols[col];
				}
			}
			lowestCol += min - diff;
		} else {
			lowestCol += settings.extraReflection;
		}

		for (var col = 0; col < numCols; col++) {
			if (cols[col] < lowestCol) {
				var height = lowestCol - cols[col] - 10;
				var photo = lastPhoto[col];
				if (photo) {
					var imgHeight = photo.gallery.finalHeight;
					if (imgHeight < height) {
						imgHeight = height;
					}
					var div = $('<div />')
						.addClass('boo-spacerdivV')
						.css({
							top: cols[col],
							left: col * width,
							width: imgWidth,
							height: height,
							margin: '5px',
							'background-image': 'url('+photo.thumbnail+')',
							'background-size': imgWidth+'px '+imgHeight+'px'
						});
					container.append(div);
					var div = $('<div />')
						.addClass('boo-spacerdivV-overlay')
						.css({ top: cols[col], left: col * width, width: imgWidth, height: height, margin: '5px' });
					container.append(div);
				}
			}
		}

		container.height(lowestCol + 5);

		if (slideshow) {
			$('.boo-lightbox').bind('click', function() {
				container.fadeOut(1000);
				slideshow.showPhoto($(this).data('photo-num'));
			});
		}

		if (captionFade == 0) {
			$('.boo-imgdiv').find('.boo-caption').fadeIn(3000);
		} else {
			$('.boo-imgdiv').mouseover(function() {
				$(this).find('.boo-caption').fadeIn(captionFade);
			}).mouseleave(function() {
				$(this).find('.boo-caption').fadeOut(captionFade);
			});
		}
	};

	var removeSpacers = function() {
		container.find('.boo-spacerdivV').remove()
		container.find('.boo-spacerdivV-overlay').remove()
	};

	this.push = function(photos) {
		var start = cache.length;
		if (start > 0) {
			removeSpacers();
		}
		cache = cache.concat(photos);
		draw(photos, start);
	};

	var resizeTimer;

	this.redraw = function() {
		container.html('');
		reset();
		draw(cache, 0);
		resizeTimer = undefined;
	};

	this.onresize = function() {
		if (resizeTimer == undefined) {
			resizeTimer = setTimeout(this.redraw, 250);
		}
	};

	this.showPhoto = function(num) {
		var photo = cache[num];
		$('.boo-imgdiv').css({ opacity: 0.25 });
		container.show();
		photo.gallery.div.css({ opacity: 1 });
		$('.boo-imgdiv').animate({ opacity: 1 }, 2000);
		var y = photo.gallery.finalTop + photo.gallery.finalHeight/2 - window.innerHeight/2 + container.position().top;
		window.scrollTo(0, y);
	};

	this.setSlideshow = function(s) {
		slideshow = s;
	};

	$(window).resize(function() {
		gallery.onresize();
	});
};


Boo.Gallery.Slideshow = function(args) {
	var settings = args;
	var container = typeof settings.container == 'string' ? $(settings.container) : settings.container;
	var captionFade = settings.captionFade == undefined ? 1000 : settings.captionFade;
	var fullHeight;
	var fullWidth;
	var imgHeight;
	var nextWidth;
	var cache = [];
	var current = 0;
	var timeout;
	var initialised = false;
	var gallery = settings.gallery;
	var slideshow = this;
	var viewdiv;
	var slidediv;
	var nextClickArea;
	var prevClickArea;

	if (gallery) {
		gallery.setSlideshow(slideshow);
	}

	var controlsFadeInTimeout;
	var controlsFadeOutTimeout;

	var controlDisplayFunc = function() {
		if (controlsFadeInTimeout == undefined) {
			controlsFadeInTimeout = setTimeout(function() {
				controlsFadeInTimeout = undefined;
				if (controlsFadeOutTimeout == undefined) {
					$('.boo-slideshow-controls').stop(true);
					$('.boo-slideshow-controls').animate({ opacity: 1}, 250);
				} else{
					clearTimeout(controlsFadeOutTimeout);
				}
				controlsFadeOutTimeout = setTimeout(function() {
					$('.boo-slideshow-controls').animate({ opacity: 0}, 1000);
					controlsFadeOutTimeout = undefined;
				}, 3000);
			}, 250);
		}
	};

	var reset = function() {
		initialised = true;

		viewdiv = $('<div />');
		viewdiv.css({
			position: 'absolute',
			top: settings.viewTop || '0px',
			left: settings.viewLeft || '0px',
			bottom: settings.viewBottom || '0px',
			right: settings.viewRight || '0px'
		});
		
		slidediv = $('<div />').addClass('boo-slidediv');
		nextClickArea = $('<div />');
		prevClickArea = $('<div />');

		container.append(viewdiv);
		viewdiv.append(slidediv);
		viewdiv.append(nextClickArea);
		viewdiv.append(prevClickArea);

		nextWidth = 0;
		fullHeight = slidediv.height();
		fullWidth = slidediv.width();
		imgHeight = fullHeight - 10;
		
		nextClickArea.css({
			position: 'absolute',
			top: 0,
			left: fullWidth / 2,
			bottom: 0,
			right: 0,
			width: fullWidth / 2,
			height: '100%',
			'z-index': 100
		});
		prevClickArea.css({
			position: 'absolute',
			top: 0,
			left: 0,
			bottom: 0,
			right: fullWidth / 2,
			width: fullWidth / 2,
			height: '100%',
			'z-index': 100
		});

		nextClickArea.mousemove(controlDisplayFunc);
		prevClickArea.mousemove(controlDisplayFunc);
		nextClickArea.click(function() {
			controlDisplayFunc();
			slideshow.next();
		});
		prevClickArea.click(function() {
			controlDisplayFunc();
			slideshow.prev();
		});
	}

	if (settings.hidden) {
		container.hide();
		$('.boo-slideshow-controls').hide();
	} else {
		reset();
	}

	this.getImageWidth = function() {
		return imgHeight * 1.5;
	};

	var photoDiv = function(photo, top, left) {
		return  $('<div />')
			.addClass('boo-slideshow-image')
			.css({ top: top, left: left, width: photo.slideshow.finalWidth, height: photo.slideshow.finalHeight, margin: '5px' })
			.append(
				$('<img />')
					.css({ height: photo.slideshow.finalHeight })
					.attr({ src: photo.large })
			);
	};

	var getPositionForPhoto = function(photo) {
		var left = - photo.slideshow.divLeft;
		if (photo.slideshow.divWidth < fullWidth) {
			left += (fullWidth - photo.slideshow.divWidth) / 2
		}
		return left;
	};

	var showCurrent = function(last, slideTime) {
		cache[last].slideshow.div.animate({ opacity: 0.1 }, 250);
		var photo = cache[current];
		photo.slideshow.div.animate({ opacity: 1 }, 250);
		slidediv.animate({ left: getPositionForPhoto(photo) }, slideTime, 'swing', function() {
		});
		$('#boo-slideshow-caption').animate({ opacity: 0 }, 250, function() {
			$(this).html(photo.slideshowCaption || photo.caption);
			$(this).animate({ opacity: 1 }, 500);
		});
		$('#boo-slideshow-buylink').animate({ opacity: 0 }, 250, function() {
			$(this).html(photo.slideshow.buylink);
			$(this).animate({ opacity: 1 }, 500);
		});
		$('#boo-slideshow-number').animate({ opacity: 0 }, 250, function() {
			$(this).html((current+1)+' out of '+(cache.length));
			$(this).animate({ opacity: 1 }, 500);
		});
	};

	this.next = function() {
		var last = current;
		current += 1;
		if (current == cache.length) {
			current = 0;
		}
		showCurrent(last, 250);
	};

	this.prev = function() {
		var last = current;
		current -= 1;
		if (current < 0) {
			current = cache.length - 1;
		}
		showCurrent(last, 250);
	};

	this.play = function() {
		if (timeout == undefined) {
			timeout = setInterval(function() {
				slideshow.next();
			}, 5000);
		}
		$('.boo-slideshow-controls-play').removeClass('boo-slideshow-controls-play').addClass('boo-slideshow-controls-pause');
	};

	this.stop = function() {
		if (timeout) {
			clearTimeout(timeout);
			timeout = undefined;
		}
		$('.boo-slideshow-controls-pause').removeClass('boo-slideshow-controls-pause').addClass('boo-slideshow-controls-play');
	};

	this.goToGallery = function() {
		if (gallery) {
			slideshow.stop();
			$('.boo-slideshow-controls').fadeOut(250);
			container.fadeOut(1000);
			gallery.showPhoto(current);
		}
	};

	if (settings.autoplay) {
		this.play();
	} else {
		this.stop();
	}
	
	$('.boo-slideshow-controls-next').click(function() {
		controlDisplayFunc();
		slideshow.next();
	});
	$('.boo-slideshow-controls-prev').click(function() {
		controlDisplayFunc();
		slideshow.prev();
	});

	$(document).keydown(function(event) {
		if (event.keyCode == 39) {
			slideshow.next();
		} else if (event.keyCode == 37) {
			slideshow.prev();
		} else if (event.keyCode == 27) {
			slideshow.goToGallery();
		}
	});
	
	$('.boo-slideshow-controls').mousemove(function() {
		controlDisplayFunc();
	});

	$('.boo-slideshow-controls-play').click(function() {
		if (timeout) {
			slideshow.stop();
		} else {
			slideshow.play();
		}
	});

	$('.boo-slideshow-controls-stop').click(function() {
		slideshow.goToGallery();
	});

	this.showPhoto = function(num) {
		var last = current;
		current = num;
		container.fadeIn(1000);
		if (initialised == false) {
			reset();
			draw(cache, false);
		}
		$('.boo-slideshow-controls').fadeIn(1000);
		showCurrent(last, 0);
	};

	var draw = function(photos, isRedraw) {
		for (var i = 0; i < photos.length; i++) {
			var photo = photos[i];
			var thisImgHeight = imgHeight;
			var imgWidth = photo.width * (thisImgHeight / photo.height);
			if (photo.gallery && photo.gallery.ratio) {
				imgWidth = photo.gallery.ratio * thisImgHeight;
			}
			var width = imgWidth + 10;
			if (width > fullWidth) {
				width = fullWidth;
				imgWidth = width - 10;
				thisImgHeight = photo.height * (imgWidth / photo.width);
				if (photo.gallery && photo.gallery.ratio) {
					thisImgHeight = imgWidth / photo.gallery.ratio;
				}
			}
			photo.slideshow = {};
			photo.slideshow.finalWidth = imgWidth;
			photo.slideshow.finalHeight = thisImgHeight;
			photo.slideshow.div = photoDiv(photo, (imgHeight - thisImgHeight) / 2, nextWidth);
			slidediv.append(photo.slideshow.div);
			photo.slideshow.divWidth = width;
			photo.slideshow.divLeft = nextWidth;
			photo.slideshow.divMiddle = nextWidth + width / 2;
			nextWidth += width;
			photo.slideshow.divRight = nextWidth;

			if (photo.buyurl) {
				photo.slideshow.buylink = '<a href="' + photo.buyurl + '">Buy this photo</a>';
			}
		}

		$('.boo-slideshow-image').css({ opacity: 0.1 });
		if (isRedraw) {
			photos[current].slideshow.div.css({ opacity: 1 });
		} else {
			photos[current].slideshow.div.animate({ opacity: 1 }, 2000);
		}
		slidediv.css({ left: getPositionForPhoto(photos[current]) });
		$('#boo-slideshow-caption').html(photos[current].slideshowCaption || photos[current].caption);
		$('#boo-slideshow-number').html((current+1)+' out of '+(cache.length));
	};

	this.push = function(photos) {
		cache = cache.concat(photos);
		if (initialised) {
			draw(photos, false);
		}
	};

	var resizeTimer;

	this.redraw = function() {
		if (viewdiv) {
			viewdiv.html('');
		}
		reset();
		draw(cache, true);
		resizeTimer = undefined;
	};

	this.onresize = function() {
		if (resizeTimer == undefined) {
			resizeTimer = setTimeout(this.redraw, 250);
		}
	};

	$(window).resize(function() {
		slideshow.onresize();
	});
};


Boo.Gallery.SlideshowGallery = function(args) {
	var settings = args;
	var gallerySettings = settings.gallerySettings || {};
	gallerySettings.container = gallerySettings.container || (settings.galleryContainer || '#boo-gallery');
	if (gallerySettings.hidden === undefined) {
		gallerySettings.hidden = settings.startWithSlideshow ? true : false;
	}
	this.gallery = new Boo.Gallery.ColumnGallery(gallerySettings);

	var slideshowSettings = settings.slideshowSettings || {};
	slideshowSettings.container = slideshowSettings.container || (settings.slideshowContainer || '#boo-slideshow');
	if (slideshowSettings.hidden === undefined) {
		slideshowSettings.hidden = settings.startWithSlideshow ? false : true;
	}
	if (slideshowSettings.autoplay === undefined) {
		slideshowSettings.autoplay = settings.startWithSlideshow ? true : false;
	}
	slideshowSettings.gallery = this.gallery;
	this.slideshow = new Boo.Gallery.Slideshow(slideshowSettings);

	this.getImageWidth = function() {
		return this.gallery.getImageWidth();
	};

	this.push = function(photos) {
		this.slideshow.push(photos);
		this.gallery.push(photos);
	};
};