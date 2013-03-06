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

```javascript
settee( source ); // source= String | Array
// => returns template function
```

If an array is specified, it assumes it's pre-parsed source and builds the 
template function with it. Otherwise the source string is parsed first.

The resulting  template function looks like this:

```javascript
template( context); // context= Object 
// => returns rendered template as a String
```

Just send the context as an object.

If you want to do it in one pass, use `render`:

```javascript
settee.render( source, context); 
// => returns rendered template as a String
```

## Precompiling

Want to precompile your templates from node for added speed?

```coffeescript
settee= require 'settee-templates'

source= '(html (body'
output= settee.precompile source 
# => "settee(["html", ["body"]]);"
```

You'll still need to include settee in your page, but it will skip the parse phase.

### Credits

Original S-Expression parser code based on:

> [http://code.google.com/p/javascript-lisp-interpreter/source/browse/lisp.js](http://code.google.com/p/javascript-lisp-interpreter/source/browse/lisp.js)
