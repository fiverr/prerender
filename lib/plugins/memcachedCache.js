var cache_manager = require('cache-manager');
var memcachedStore = require('cache-manager-memcached');

module.exports = {
    init: function(){
        this.cache = cache_manager.caching({
            store: memcachedStore, ttl: parseInt(process.env.CACHE_TTL || 60, 10), servers: (process.env.MEMCACHED_SERVERS && process.env.MEMCACHED_SERVERS.split(',')) || ['localhost:11211']
        });
    },

    beforePhantomRequest: function(req, res, next) {
        this.cache.get(req.prerender.url, function (err, result) {
            if (!err && result) {
                req.prerender.cached = true;
                res.send(200, result);
            } else {
                next();
            }
        });
    },

    afterPhantomRequest: function(req, res, next) {
        if (req.prerender.statusCode == 200) {
            this.cache.set(req.prerender.url, req.prerender.documentHTML);
        }

        next();
    }
}
