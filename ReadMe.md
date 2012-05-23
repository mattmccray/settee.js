# Settee.js

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

### Credits

S-Expression evaluation code based on:

> [http://code.google.com/p/javascript-lisp-interpreter/source/browse/lisp.js](http://code.google.com/p/javascript-lisp-interpreter/source/browse/lisp.js)

Some helpers based on Underscore.js:

> [http://underscorejs.org/](http://underscorejs.org/)
