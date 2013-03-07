class tag

  ".": (tag, attrs, children)-> 
    children.join ''
  "+": @::['.']

  if: (tag, attrs, children)->
    first= children.shift()
    if first
      children[0] ? ''
    else 
      children[1] ? ''
  ifelse: @::if

  unless: (tag, attrs, children)->
    first= children.shift()
    if !first
      children[0] ? ''
    else 
      children[1] ? ''

  eq: (tag, attrs, children)->
    children[0] == children[1]
  'is': @::eq
  '=': @::eq

  not: (tag, attrs, children)->
    !children[0]
  '!': @::eq

  loop: (tag, attrs, items, block)->
    children =[]
    ctx= new context
      items: items
    for item,i in items
      ctx.ctx.item= item
      ctx.ctx.index= i
      children.push block.call(ctx)
    return children.join ''
  each: @::loop

  neq: (tag, attrs, children)->
    children[0] != children[1]
  'isnt': @::neq
  '!=': @::neq

  instance= new @

  @define: (name, value)->
    instance[name]= value # direct assign, or to prototype?
  @undefine: (name)->
    delete instance[name]

  @builder: (tag, attrs={}, children=[])->
    if instance[tag]
      instance[tag].apply instance[tag], arguments
    else
      attr_s= ''
      for own name,value of attrs
        attr_s+= " #{ name }=\"#{ value }\""
      """<#{ tag + attr_s }>#{ children.join '' }</#{ tag }>"""

if module?
  module.exports= tag
else
  @tag= tag
