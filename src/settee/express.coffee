settee= require './index'

module.exports= (path, options, done)->
  # callback: done err, content
  fs.readFile path, 'utf8', (err, str)->
    return done err if err? 
    content= settee.render str, options
    done null, content