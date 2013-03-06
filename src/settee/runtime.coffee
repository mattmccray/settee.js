# You shouldn't use this directly, the build tool uses this as the index for the runtime-only version

VERSION= '0.6.0'

_isString= (obj) ->  typeof obj is 'string'

settee= (source)->
  code= if typeof source is 'string'
    throw new Error "The runtime version of settee does not support parsing template strings, only precompiled templates."
  settee.compile(source)

settee.render= (source, ctx={})->
  settee(source)(ctx)

settee.compile= (code)->
  fn= code
  (src_ctx={})->
    ctx= new context src_ctx
    fn.call ctx, tag.builder

settee.define= (tagName, handler)->
  if _isString handler
    throw new Error "The runtime version of settee does not support parsing template strings, only precompiled templates."
  else if handler.length is 1 # A precompiled template
    sub_template= handler
    wrapped_handler= do(sub_template)->
      (tagName, attrs, children)->
        childcontent= children.join('')
        ctx=
          tagName: tagName
          attrs: attrs
          blocks: childcontent
          yield: childcontent
        for elem,i in children
          ctx["block#{ i + 1 }"]= elem
        settee.render(sub_template, ctx)
    tag.define tagName, wrapped_handler
  else # A raw handler
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
