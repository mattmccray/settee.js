# Helpers
VERSION= '0.5.0'
global= @
old_settee= global.settee
slice= Array::slice
nativeForEach= Array::forEach
nativeMap= Array::.map
nativeIsArray= Array.isArray
nativeTrim= String::trim
quotedAttrRE= /([\w\-_\.]*)="([\w\-_:@\. ]*)"/
attrRE= /([\w\-_\.]*)=([\w\-_:@\.]*)/
idRE= /(#[\w\-_]*)/
# From MooTools core 1.2.4
escapeRegExp= (str)-> str.replace /([-.*+?^${}()|[\]\/\\])/g, '\\$1'

_map
_map= (obj, iterator, context)->
  results = []
  return results if obj is null
  return obj.map(iterator, context) if nativeMap and obj.map is nativeMap
  _each obj, (value, index, list) ->
    results[results.length]= iterator.call(context, value, index, list)
  results.length = obj.length if obj.length is +obj.length
  results

_each= (obj, iterator, context)->
  return if obj is null
  if nativeForEach and obj.forEach is nativeForEach
    obj.forEach iterator, context

  else if obj.length is +obj.length
    for item,idx in obj
      return if idx of obj and iterator.call(context, item, idx, obj) is breaker

  else
    for own key,item of obj
      return if iterator.call(context, item, key, obj) is breaker

# Find something better than RegExp?  
_trim= (str, char)->
  return "" if str is null
  return nativeTrim.call(str) if !char and nativeTrim
  char= if char
    escapeRegExp(char)
  else
    '\\s'
  str.replace new RegExp('\^[' + characters + ']+|[' + characters + ']+$', 'g'), ''
  str.replace /^[#{char}]+|[#{char}]+$/g, ''

_isString= (obj) -> 
  # !!(obj is '' or (obj and obj.charCodeAt and obj.substr))
  typeof obj is 'string'

_isArray= nativeIsArray or (obj) ->
  !!(obj and obj.concat and obj.unshift and not obj.callee)

# Attribute stuff?
_parseAttrs= (val, as_string=yes)->
  if _isString(val)
    if quotedAttrRE.test(val)
      # Ewok.log("matches", val.match(quotedAttrRE))
      [full,key,value]= val.match(quotedAttrRE)
      return "#{key}=\"#{value}\"" if as_string
      {key,value}
    else if attrRE.test(val)
      # Ewok.log("matches", val.match(attrRE))
      [full,key,value]= val.match(attrRE)
      return "#{key}=\"#{value}\"" if as_string
      {key,value}
    else
      false
  else
    false

_checkVar= (token)->
  if token[0] is '@' or token[0] is ':'
    "this.get('#{ token.substring(1) }')"
  else
    token

# called with parse_object as this
_scanner= ->
  return "" if @text.length is 0
  start= 0
  index= 1
  delta= 0
  fc= @text.charAt(0)
  if fc is '(' or fc is ')'
    index= 1
    @balanced += if fc is '(' then 1 else -1
  else if fc is '"'
    index= @text.search(/[^\\]"/) + 1
    delta=1 # bizarre bugfix... need to investigate further
  else if fc is "'"
    index= @text.search(/[^\\]'/) + 1
    delta=1 # bizarre bugfix... need to investigate further
  else
    index= @text.search(/[ \n)]/)
  index= @text.length if index < 1
  t= @text.substring start, index
  @text= _trim @text.substring(index + delta)
  t

_parser= ->
  result=[]
  token= _scanner.apply(@)
  while token isnt ')' and token isnt ""
    expr= if token is '(' then _parser.apply(@) else token
    result.push expr
    token= _scanner.apply(@)
  result

_do_parse= (source)->
  parse_data=
    text: _trim(source)
    balanced: 0
  code= ['list']
  while parse_data.text.length
    exprs=_parser.apply(parse_data)
    code= code.concat exprs
  [code, parse_data]


parse_source= (source, opts)->
    [code, info]= _do_parse(source)
    code.pop()

translate= (code, opts)->
  new_code=[]
  tag= code[0]

  if idRE.test tag
    id= tag.match(idRE)[0].substring(1)
    tag= tag.replace(idRE, '')
    tag= 'div' if tag is ''

  if tag.indexOf('.') >= 0
    if tag is '.'
      tag= '.'
      new_code.push tag
      new_code.push "id=#{id}" if id
    
    else
      parts= tag.split('.')
      tag= parts.shift()
      tag= 'div' if tag is ''
      new_code.push tag
      new_code.push "id=#{id}" if id

      for cname in parts
        new_code.push "class="+ cname
  
  else
    new_code.push tag
    new_code.push "id=#{id}" if id
  
  for token,i in code
    if i > 0
      if _isArray(token)
        new_code.push translate(token, opts)
      else
        new_code.push token
  
  new_code

code_to_source= (code, fn_name)->
  params= []
  attrs={}
  tag= code.shift()

  for token in code
    if _isArray token
      params.push code_to_source(token, fn_name)
    else
      if att= _parseAttrs(token, no)
        key= att.key
        value= _checkVar(att.value)
        if attrs[key]
          attrs[key] += " "+ value
        else
          attrs[key]= value
      else if token[0] is '"' or token[0] is "'"
        params.push JSON.stringify token.substring(1)
      else if token[0] is '@' or token[0] is ":"
        params.push _checkVar(token)
      else
        params.push JSON.stringify token

  attr_str= ''
  for own key,value of attrs
    attr_str += unless String(key).indexOf('this.') is 0
        JSON.stringify(key)
      else
        key
    attr_str += ':'
    attr_str += unless String(value).indexOf('this.') is 0
        JSON.stringify(value)
      else
        value
    attr_str += ","

  "#{ fn_name }('#{tag}', { #{ attr_str.substr(0,attr_str.length-1) } }, [#{ params.join ', ' }])"

compile= (code, opts)->
  fn_name= 'b'
  source= code_to_source code, fn_name
  new Function fn_name, "return #{ source };"

custom_tags= 
  ".": (tag, attrs, children)-> 
    children.join ''

  "if": (tag, attrs, children)->
    first= children.shift()
    if first
      children.join ''
    else
      ''
  "unless": (tag, attrs, children)->
    first= children.shift()
    if !first
      children.join ''
    else
      ''

  "ifelse": (tag, attrs, children)->
    if children[0]
      children[1]
    else
      children[2]

  "eq": (tag, attrs, children)->
    children[0] == children[1]
  
  "neq": (tag, attrs, children)->
    children[0] != children[1]

custom_tags['is']= custom_tags['eq']
custom_tags['=']= custom_tags['eq']
custom_tags['isnt']= custom_tags['neq']
custom_tags['!=']= custom_tags['neq']
custom_tags['+']= custom_tags['.']

tag_builder= (tag, attrs={}, children=[])->
  if custom_tags[tag]
    custom_tags[tag](tag, attrs, children)
  else
    attr_s= ''
    for own name,value of attrs
      attr_s+= " #{ name }=\"#{ value }\""
    """<#{ tag + attr_s }>#{ children.join '' }</#{ tag }>"""

context= (@ctx)->
context::get= (path)->
  parts= path.split('.')
  name= parts.shift()
  data= @ctx[name]
  while parts.length and data?
    nextname= parts.shift()
    data= data[nextname]
    name= nextname if data
  # throw "#{name} doesn't contain a #{nextname}" unless data?
  data || ''
context::has= (path)->
  @get(path) and @get(path) isnt ''


settee= (source)->
  code= parse_source source
  code= translate code
  fn= compile code
  (src_ctx={})->
    ctx= new context src_ctx
    fn.call ctx, tag_builder

settee.to_html= (source, ctx={}, opts)->
  settee(source)(ctx)

settee.define= (tag, handler)->
  if _isString handler
    sub_template= settee(handler)
    handler= do(sub_template)->
      (tag, attrs, children)->
        ctx=
          blocks: children.join('')
          yield: children.join('')
        for elem,i in children
          ctx["block#{ i + 1 }"]= elem
        sub_template(ctx)
  custom_tags[tag]= handler
  settee

settee.undefine= (tag)->
  delete custom_tags[tag] if custom_tags[tag]
  settee

settee.noConflict= ()->
  if old_settee
    global.settee= old_settee  
  else
    delete global.settee
  settee

settee.tag_builder= tag_builder
settee.version= VERSION

if module?.exports?
  module.exports.settee= settee
else
  global.settee= settee