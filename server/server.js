var app = require('./routes.js');

var port = process.env.port || 1337;

module.exports = app.listen(port, function() {
	console.log('listening on port ' + port);
});
