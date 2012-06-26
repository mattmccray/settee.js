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
            (p "Welcome to my site, " :name "!")))
        (aside.sidebar
            (ul
              (li
                (a href="/index.html" "Home"))))))

**Use it like this:**

    var template= settee(source),
        html= template({ name:"Matt" })

It's great to drink coffee while lounging on the settee!

    template= settee source
    html= template name:"Matt"


## Method Signature

As function:

    settee( source:string )

Returns a #template function:

    template( context:object )


### Credits

S-Expression parser code based on:

> [http://code.google.com/p/javascript-lisp-interpreter/source/browse/lisp.js](http://code.google.com/p/javascript-lisp-interpreter/source/browse/lisp.js)
