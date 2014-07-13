var util = require('util'),
    crypto = require('crypto'),
    http = require('http');

/**
 * Handle an incoming web request
 *
 * @method handleRequest
 * @param  {Request}      req Request object from Node
 * @param  {Response}     res Response object from Node
 */
function handleRequest(req, res) {
    var that = this,
        path = req.url.split('/').slice(1), // Skip the first slash
        nonce = path.shift(),
        item = path.shift();

    // Validate nonce
    if (nonce !== this.nonce) {
        res.writeHead(403);
        res.end('Invalid Nonce');
        return;
    }

    // Send data
    res.writeHead(200, {'Content-Type': 'application/json'});
    if (req.method === 'GET') {
        res.end(JSON.stringify({
            key: item,
            value: that.get(item)
        }));
    }

    req.setEncoding('utf8');
    req.on('data', function (chunk) {
        try {
            var data = JSON.parse(chunk.toString());
            that.set(item, data.value);
            res.end();
        } catch (error) {
            res.writeHead(500);
            res.end('Unable to parse JSON');
        }
    });
}

/**
 * Start the HTTP Server
 *
 * @method startServer
 * @param  {Function}  callback Function to call when complete (url)
 */
function startServer(callback) {
    var that = this;

    this.server.on('listening', function() {
        that.port = that.server.address().port;
        that.url = util.format('http://127.0.0.1:%d/%s/', that.port, that.nonce);
        process.env.VARIABLE_TUNNEL_URL = that.url;
        callback(that.url);
    });
    this.server.listen(0, '127.0.0.1');
}

/**
 * Stop the HTTP Server
 *
 * @method stopServer
 * @param  {Function} callback Function to call when complete (error)
 */
function stopServer(callback) {
    this.server.close(callback);
}

/**
 * Get a value of a field in the variable
 *
 * @method getValue
 * @param  {String} field Dot deliminated field description
 * @return {varied}       Contents of that field
 */
function getValue (field) {
    var fields = field.split('.'),
        index = this.variables;
    while (fields.length && (index = index[fields.shift()])) { }
    return index;
}

/**
 * Set a value in the variable
 *
 * @method setValue
 * @param  {String} field Dot deliminated field description
 * @param  {varied} value New contents of that field
 */
function setValue (field, value) {
    var fields = field.trim().split('.'),
        ref = this.variables,
        key;

    // Skip blank updates
    if (fields.length === 1 && fields[0] === '') {
        return undefined;
    }
    while (fields.length > 1) {
        key = fields.shift();
        if (!ref[key]) {
            ref[key] = {};
        }
        ref = ref[key];
    }
    key = fields.shift();
    ref[key] = value;
    return ref[key];
}

/**
 * Meta Server
 *
 * @method Server
 * @param  {Object}  [existingVariables={}]   Key => Values
 * @param  {Integer} [timeout=5000]      Timeout for server
 */
function Server(existingVariables, timeout) {
    this.variables = existingVariables || {};
    this.nonce = crypto.createHash('sha1').update(Date.now() + ':' + Math.random()).digest('hex');
    this.server = http.createServer(handleRequest.bind(this));
    this.server.timeout = timeout || 5000; // 5 second timeout
}

Server.prototype = {
    start: startServer,
    stop: stopServer,
    get: getValue,
    set: setValue
};

module.exports = Server;