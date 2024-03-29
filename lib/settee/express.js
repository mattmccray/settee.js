// Generated by CoffeeScript 1.6.1
var settee;

settee = require('./index');

module.exports = function(path, options, done) {
  return fs.readFile(path, 'utf8', function(err, str) {
    var content;
    if (err != null) {
      return done(err);
    }
    content = settee.render(str, options);
    return done(null, content);
  });
};
