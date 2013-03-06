class tag

  ".": (tag, attrs, children)-> 
    children.join ''
  "+": @::['.']

  if: (tag, attrs, children)->
    first= children.shift()
    if first then children.join '' else ''

  unless: (tag, attrs, children)->
    first= children.shift()
    if !first then children.join '' else ''

  ifelse: (tag, attrs, children)->
    if children[0] then children[1] else children[2]

  eq: (tag, attrs, children)->
    children[0] == children[1]
  'is': @::eq
  '=': @::eq

  not: (tag, attrs, children)->
    !children[0]
  '!': @::eq

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
      instance[tag](tag, attrs, children)
    else
      attr_s= ''
      for own name,value of attrs
        attr_s+= " #{ name }=\"#{ value }\""
      """<#{ tag + attr_s }>#{ children.join '' }</#{ tag }>"""

if module?
  module.exports= tag
else
  @tag= tag
