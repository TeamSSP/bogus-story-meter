const app = require('./routes.js');

const port = process.env.port || 80;

module.exports = app.listen(port, function() {
  console.log('listening on port ' + port);
});
