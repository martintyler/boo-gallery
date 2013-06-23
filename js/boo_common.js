/**
    Copyright (C) 2013 by Martin Tyler (martin.tyler@boo.org)

    Visit http://www.boo.org
*/

var Boo = {};

Boo.urlParams = {};

(function () {
	var match,
		pl     = /\+/g,  // Regex for replacing addition symbol with a space
		search = /([^&=]+)=?([^&]*)/g,
		decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
		query  = window.location.search.substring(1);

	while (match = search.exec(query))
	   MTP.urlParams[decode(match[1])] = decode(match[2]);
})();

Boo.shuffleArray = function(myArray) {
	var i = myArray.length, j, tempi, tempj;
	if ( i == 0 ) return false;
	while ( --i ) {
		j = Math.floor( Math.random() * ( i + 1 ) );
		tempi = myArray[i];
		tempj = myArray[j];
		myArray[i] = tempj;
		myArray[j] = tempi;
	}
}
