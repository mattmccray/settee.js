###
Settee.js v0.3

       ________
      (        )
     ()________()
     ||________||
     '          '

An s-expression template engine with no external dependencies.

**Templates look like this:**

    (html
      (head
        (title "Hello")
        (script src="/js/my-app.js"))
      (body
        (article
          (section.main
            (p "Welcome to my site, " name "!")))
        (aside.sidebar
            (ul
              (li
                (a href="/index.html" "Home"))))))

**Use it like this:**

    var template= Settee(source, { auto_balance:true }),
        html= template({ name:"Matt" })

It's great to drink coffee while lounging on the settee!

    template= Settee source, auto_balance:yes
    html= template name:"Matt"

It can be classy too!

    template= new Settee(source, auto_balance:yes, auto_tag:yes)
    html= template.render name:"Matt"

## Method Signature

As function:

    Settee( source:string [, options:object] )

Returns a #template function:

    template( context:object, helpers:object )

As class:

    new Settee( source:string [, options:object] )

Returns a settee #object:

    object.render( context:object, helpers:object )

## Options

* auto_balance:Bool  -- ignore imbalanced parens (default:true)
* auto_tag:Bool      -- unknown actions create tags (default:false)

###

#= require_self

# Using a -coffee extension hack so that Sprockets won't compile
# the coffeescript before it includes it. (I don't want multiple
# closures for this one file.)

#= include settee/helpers.js.-coffee
#= include settee/parser.js.-coffee
#= include settee/evaluation.js.-coffee


# TODO
# - Add '#' operation for comments
# - Add '#!' operation for html comments
# - Return all nodes not just the last one? ... Leaning toward no
# - Get mocha via node working
# - Test in node
# - Add support for npm


class Settee
  @options:
    auto_balance: true
    auto_tag: false
    extended: true # nothing yet...

  @parse: (source, opts)->
    opts= _.defaults((opts or {}), Settee.options)
    [code, info]= _do_parse(source)
    error= if info.balanced > 0
      "The expression is not balanced. Add #{info.balanced} parentheses."
    else if info.balanced < 0
      "The expression is not balanced. Remove #{Math.abs info.balanced} parentheses."
    else
      no
    throw error if error and !opts.auto_balance
    code

  @evaluate: (code, env={}, opts)->
    results= _do_evaluate(code, env, opts)
    results.pop()

  @to_html: (source, env={}, opts)->
    (new Settee(source, opts)).render(env)

  @define: (tag, template, callback=false)->    
    src_nodes= Settee.parse(template).pop()
    _.log "Settee: Warning, overwriting tag #{tag}" if Settee.tags[tag]

    Settee.tags[tag]=(expr, env, _evaluate)->
      callback expr, env, _evaluate if callback
      attrs= Settee._.extractAttrs expr
      newenv= _parent: env, blocks:""
      for atom,i in expr
        newenv.blocks += newenv["block#{i}"]= Settee._.tag_builder atom, env, _evaluate if i > 0
      src_nodes.splice(1,0,attrs...)
      results= Settee._.tag_builder src_nodes, newenv, _evaluate
      src_nodes.splice(1, attrs.length)
      results

    # track it...
    Settee.define._tags or= []
    Settee.define._tags.push tag
    @

  @undefine: (tag)->
    if tag
      delete Settee.tags[tag]
    else
      # remove all custom tags
      for tagname in Settee.define._tags
        delete Settee.tags[tagname]
      Settee.define._tags= []



  # Main entry point (typically)
  constructor: (source, opts)->
    opts= _.defaults((opts or {}), Settee.options)
    code= Settee.parse(source, opts)
    if @ is root # called as function
      return (ctx={})->
        Settee.evaluate(code, ctx, opts)

    else  # called as constructor
      @source= source
      @opts= opts
      @code= code

  render: (ctx={})->
    Settee.evaluate(@code, ctx, @opts)

(module?.exports || this).Settee= Settee
