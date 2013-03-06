# Settee.js

       ________
      (        )
     ()________()
     ||________||
     '          '

An s-expression template engine with no external dependencies.

**Templates look like this:**

```lisp
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
```

**Use it like this:**

```javascript
var template= settee(source),
    html= template({ name:"Matt" })
```

It's great to drink coffee while lounging on the settee!

```coffeescript
template= settee source
html= template name:"Matt"
```

## Templates

Templates are rudimentary s-expressions (think LISP). S-expressions, if you aren't
familiar, are just lists of lists. Each list is surrounded in (parenthesis).

In Settee, the first list item is the tag name.

```lisp
(div)
```
Output:
```html
<div></div>
```

You can set attributes using `attr=value` syntax.

```lisp
(div class=body)
```
```html
<div class="body"></div>
```

You can use css-style syntax on the tag name to set the class names and id:

```lisp
(div#main.body)
```
```html
<div id="main" class="body"></div>
```

Nested lists generate nested HTML:
 
```lisp
(article
  (header "Heading")
  (section.body
    (p "Content")
  )
)
```
```html
<article>
  <header>Heading</header>
  <section class="body">
    <p>Content</p>
  </section>
</article>
```

Note: The indented whitespace is added for readability, the generated output
will not have any whitepace between tags.

Settee also supports a shorter syntax. You don't need the indentions or 
closing parenthesis for the last list. So that previous template could also look
like this:

```lisp
(article (header "Heading")(section.body (p "Content"
```

You can insert values from the rendering context using `:varname` syntax:

```lisp
(div "hello " :name)
```

Given a context of `{ name:'Matt' }`:

```html
<div>hello Matt</div>
```

There some built in tags to help you build your templates:

```lisp
(if (eq :name "Matt")
  (div "Hello Matt")
  (div "You aren't Matt!"))
```

Builtins: `if`, `unless`, `eq` (aliased as `=` and `is`), `neq` (aliased as `!=` 
and `isnt`).

There is a special helper `.` that returns all the child lists with adding 
anything around them. This is because Settee expects to have only one root list.

```lisp
(.
  (div "One")
  (div "Two")
```
```html
<div>One</div><div>Two</div>
```

## Method Signatures

As function:

```javascript
settee( source ); // source= String | Array
// => returns template function
```

If `source` isn't a `String`, Settee will assume it's precompiled source and build the 
template function with it. Otherwise the source is parsed first.

The resulting  template function looks like this:

```javascript
template( context ); // context= Object 
// => returns rendered template as a String
```

Just send the rendering context as an object.

If you want to do it in one pass, use `render`:

```javascript
settee.render( source, context ); 
// => returns rendered template as a String
```

## Custom Tags / Partials

You can define custom tags, or partials, in two ways. The first way is as a 
sub-template:

```coffeescript
settee.define 'layout', '''
(article.layout
  (header "My App")
  (section.body :block1)
  (footer :block2))
'''
```

You can then use it as a tag in your templates:

```lisp
(layout
  (div "Content Area")
  (div "Copyright me"))
```

The resulting template compiles to (whitespace added for redability):

```html
<article class="layout">
  <header>My App</header>
  <section class="body">
    <div>Content Area</div>
  </section>
  <footer>
    <div>Copyright me</div>
  </footer>
</article>
```

If you need a little more control, you can specify a handler function that works
at a lower level:

```coffeescript
settee.define 'widget', (tag, attrs, children)->
  # types: tag= String, attrs= Object, children= Array

  # This function should return a 'rendered' String.
  """<div id="#{ attrs.id or 'widget' }">#{ children.join '' }</div>"""
```

## Precompiling

Want to precompile your templates from node for added speed?

Install `settee-templates`:

```
npm install settee-templates
```

Then:

```coffeescript
settee= require 'settee-templates'

source= '(html (body'
output= settee.precompile source 
# => function anonymous(b) {return b('html', {  }, [b('body', {  }, [])]); }
```

You'll still need to include settee in your page, but it will skip the parse phase.

You can include `settee.runtime.js` if all you plan to use is precompiled templates. 
The runtime version omits the parser and compiler code.

### Credits

Original S-Expression parser code based on:

> [http://code.google.com/p/javascript-lisp-interpreter/source/browse/lisp.js](http://code.google.com/p/javascript-lisp-interpreter/source/browse/lisp.js)
