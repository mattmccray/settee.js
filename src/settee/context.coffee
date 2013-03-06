
class context
  constructor: (@ctx)->
  get: (path)->
    parts= path.split('.')
    name= parts.shift()
    data= @ctx[name]
    while parts.length and data?
      nextname= parts.shift()
      data= data[nextname]
      name= nextname if data?
    data || '' # throw "#{name} doesn't contain a #{nextname}" unless data? ????
  has: (path)->
    @get(path) and @get(path) isnt ''

if module?
  module.exports= context
else
  @context= context