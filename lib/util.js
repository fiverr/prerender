/*jshint sub: true */
var url = require('url');

var util = exports = module.exports = {};

// Normalizes unimportant differences in URLs - e.g. ensures
// http://google.com/ and http://google.com normalize to the same string
util.normalizeUrl = function (u) {
    return url.format(url.parse(u, true));
};

// Gets the URL to prerender from a request, stripping out unnecessary parts
util.getUrl = function (req) {
    var decodedUrl
      , parts;

    try {
        decodedUrl = decodeURIComponent(req.url);
    } catch (e) {
        decodedUrl = req.url;
    }

    parts = url.parse(decodedUrl, true);

    // Remove the _escaped_fragment_ query parameter
    if (parts.query && parts.query.hasOwnProperty('_escaped_fragment_')) {
        
        if (parts.query['_escaped_fragment_'] && !Array.isArray(parts.query['_escaped_fragment_'])) {
            parts.hash = '#!' + parts.query['_escaped_fragment_'];
        }

        delete parts.query['_escaped_fragment_'];
        delete parts.search;
        parts.query['crawler'] = 1;
    }

    // Bing was seen accessing a URL like /?&_escaped_fragment_=
    delete parts.query[''];

    var newUrl = url.format(parts);
    if (newUrl[0] === '/') newUrl = newUrl.substr(1);

    // ensure no _escaped_fragment_ exists in order to avoid loops
    if (newUrl.indexOf('_escaped_fragment_') >= 0) {
       newUrl = newUrl.replace(new RegExp('_escaped_fragment_', 'g'), '');
    }

    return newUrl;
};

util.log = function() {
  if (process.env.DISABLE_LOGGING) {
    return;
  }

  console.log.apply(console.log, [new Date().toISOString()].concat(Array.prototype.slice.call(arguments, 0)));
};
