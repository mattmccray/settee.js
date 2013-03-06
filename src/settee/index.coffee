
VERSION= '0.6.0'

if module?
  {parse_source, translate, compile, _isString, _isArray}= require './parser'
  context= require './context'
  tag= require './tag'

settee= (source)->
  code= if typeof source is 'string'
    translate parse_source source
  else
    source
  settee.compile(code)

settee.render= (source, ctx={})->
  settee(source)(ctx)

# deprecated
settee.to_html= settee.render

settee.compile= (code, wrap=true)->
  fn= if typeof code is 'function' then code else compile code
  return fn unless wrap
  (src_ctx={})->
    ctx= new context src_ctx
    fn.call ctx, tag.builder

settee.parse= (source)->
  code= parse_source source
  translate code

settee.precompile= (source)->
  code= settee.parse source
  tmpl_fn= settee.compile code, false
  # tmpl_fn.toString()
  tmpl_fn

settee.define= (tagName, handler)->
  if _isString handler or handler.length is 1
    sub_template= settee(handler)
    handler= do(sub_template)->
      (tagName, attrs, children)->
        childcontent= children.join('')
        ctx=
          tagName: tagName
          attrs: attrs
          blocks: childcontent
          yield: childcontent
        for elem,i in children
          ctx["block#{ i + 1 }"]= elem
        sub_template(ctx)
  tag.define tagName, handler
  settee

settee.undefine= (tagName)->
  tag.undefine tagName
  settee

settee.noConflict= ()->
  if old_settee?
    global.settee= old_settee  
  else
    delete global.settee
  settee

settee.tag_builder= tag.builder
settee.version= VERSION

if module?
  module.exports= settee
else
  @settee= settee
 