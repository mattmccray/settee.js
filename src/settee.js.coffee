###
Settee.js v0.1

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
# - Add 'has' operation to check for var in env
# - Add support for :symbols that resolve to env variables only
# - Return all nodes not just the last one? ... Leaning toward no
# - Get mocha via node working
# - Test in node
# - Add support for npm
# - Test in IE (yikes!)
# - Cleanup _evaluate to pull ops and fn into objects instead of a ton of ifs

class Settee
  @options:
    auto_balance: true
    auto_tag: false
    extended: true # nothing yet...

  # For handling raw exprs
  @op: {}
    
  # For handling evaluated exprs
  @fn:
    print: ->
      str= ""
      str += msg for msg in arguments
      Settee._.log str

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
    Settee(source, opts)(env)


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

(module?.exports || window).Settee= Settee
