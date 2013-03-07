`
(function(global){
if( typeof(settee) == 'undefined' && typeof(expect) == 'undefined' && typeof(require) != 'undefined'){
  settee= require('../settee.js').settee;
  expect= require('chai').expect;
}
})(this)`


global= @
_set= null


source_indented= '''
(html
  (head
    (title "Test"))
  (body
    (p "...")))
'''
source_inline= '(html (head (title "Test")) (body (p "...")))'

expected_output= '<html><head><title>Test</title></head><body><p>...</p></body></html>'


describe "settee() v#{ settee.version }", ->
  it 'should exist', ->
    expect(settee).to.not.be.undefined
    expect(settee).to.be.a('function')

  it "should generate <html> for (html)", ->
    tmpl= settee('(html)')
    result= tmpl()
    expect(result).to.be.an('string')
    expect(result).to.equal("<html></html>")

  it 'should generate <html lang="en"> for (html lang="en")', ->
    tmpl= settee('(html  lang="en")')
    result= tmpl()
    expect(result).to.be.an('string')
    expect(result).to.equal('<html lang="en"></html>')

  it 'should generate <html lang="en"> for (html lang=en)', ->
    tmpl= settee('(html  lang=en)')
    result= tmpl()
    expect(result).to.be.an('string')
    expect(result).to.equal('<html lang="en"></html>')

  it 'should generate properly nested html', ->
    tmpl= settee(source_inline)
    result= tmpl()
    expect(result).to.be.an('string')
    expect(result).to.equal(expected_output)

  it 'should not generate a tag for .', ->
    expect(settee('(. "Hello")')()).to.equal('Hello')

  it 'should reference data from context as :varname', ->
    ctx=
      name: 'Matt'
      city: 'Dallas'
    expect( settee('(. :name)')(ctx) ).to.equal(ctx.name)
    expect( settee('(p "My name is " :name)')(ctx) ).to.equal("<p>My name is Matt</p>")
    expect( settee('(p @name)')(ctx) ).to.equal('<p>Matt</p>')

  it 'should reference env variable by @symbol too', ->
    expect(settee("(. @name)")(name:"Matt")).to.equal('Matt')
    expect(settee("(. @city)")(city:"Dallas")).to.equal('Dallas')

  it 'should support (if expr, truelist)', ->
    src= '''
        (if (eq :name "Matt")(div "Hello!"))
        '''
    expect(settee.render(src)).to.equal("")
    expect(settee.render(src, name:'Matt')).to.equal("<div>Hello!</div>")

  it 'should support (ifelse expr, truelist, falselist)', ->
    src= '''
        (ifelse (eq :name "Matt")
          (div "Hello!")
          (div "Who?"))
        '''
    expect(settee.render(src)).to.equal("<div>Who?</div>")
    expect(settee.render(src, name:'Matt')).to.equal("<div>Hello!</div>")

  it 'should support (unless expr, iffails...)', ->
    src= '''
        (unless (is :name "Matt")
          (div "Hello!"))
        '''
    expect(settee.render(src)).to.equal("<div>Hello!</div>")
    expect(settee.render(src, name:'Matt')).to.equal("")

  it 'should support simple looping over an Array', ->
    src= '''
          (ul.list
            (loop :list
              (li.item :item)
            )
          )
        '''
    data= {
      list: [
        "Matt"
        "Dan"
        "Sam"
      ]
    }
    expect(settee.render(src, data)).to.equal(
      '<ul class="list"><li class="item">Matt</li><li class="item">Dan</li><li class="item">Sam</li></ul>'
    )

  it 'should support simple looping over an Array of Objects', ->
    src= '''
          (ul.list
            (loop :list
              (li.item :item.name)
            )
          )
        '''
    data= {
      list: [
        { name:"Matt" }
        { name:"Dan" }
        { name:"Sam" }
      ]
    }
    expect(settee.render(src, data)).to.equal(
      '<ul class="list"><li class="item">Matt</li><li class="item">Dan</li><li class="item">Sam</li></ul>'
    )

  describe "generated output", ->
  
    it "should return an html string", ->
      t= settee(source_inline)
      html= t()
      expect(html).to.equal(expected_output)

    it "should not care about source whitespace (indention)", ->
      t= settee(source_indented)
      expect(t()).to.equal(expected_output)

    it "should support quoted or unquoted attributes", ->
      expect(settee('(div id="main")')()).to.equal('<div id="main"></div>')
      expect(settee('(div id=main)')()).to.equal('<div id="main"></div>')
    
    it "should add class shortcuts (div.list.active)", ->
      expect(settee('(div.list)')()).to.equal('<div class="list"></div>')
      expect(settee.render('(div.list.active)')).to.equal('<div class="list active"></div>')

    it "should default to div for (.list.active)", ->
      expect(settee.render('(.list)')).to.equal('<div class="list"></div>')
      expect(settee.render('(.list.active)')).to.equal('<div class="list active"></div>')
      expect(settee.render('(.list#main)')).to.equal('<div id="main" class="list"></div>')

    it "should add id shortcut (div#main)", ->
      expect(settee('(div#main)')()).to.equal('<div id="main"></div>')
      expect(settee.render('(div#main.list.active)')).to.equal('<div id="main" class="list active"></div>')

    it "should default to div for (#main)", ->
      expect(settee.render('(#main)')).to.equal('<div id="main"></div>')
      expect(settee.render('(#main.test)')).to.equal('<div id="main" class="test"></div>')
      expect(settee.render('(.test#main)')).to.equal('<div id="main" class="test"></div>')

    it "should allow mixing shortcut types (div#main.container)", ->
      expect(settee.render '(div#main.list)' ).to.equal('<div id="main" class="list"></div>')
      expect(settee.render '(div#main.list.active)' ).to.equal('<div id="main" class="list active"></div>')
      expect(settee.render '(div.list#main.active)' ).to.equal('<div id="main" class="list active"></div>')
      expect(settee.render '(div.list.active#main)' ).to.equal('<div id="main" class="list active"></div>')
    
    it 'should support auto_tag generation: <crap></crap> for (crap)', ->
      res= settee.render('(crap)')
      expect(res).to.equal('<crap></crap>')

      res=settee('(crap.active)')
      expect(res()).to.equal('<crap class="active"></crap>')


    it 'should swallow null/undefined when using (. :varname)', =>
      src= '(div "Hello" (. :name))'
      res= settee.render(src, name:null)
      expect(res).to.equal("<div>Hello</div>")

      src= '(div "Hello " (. :name :city))'
      res= settee.render(src, city:"Dallas")
      expect(res).to.equal("<div>Hello Dallas</div>")

    it 'should render precompiled templates', ->
      tmp= settee.precompile '(html (body :city'
      res= settee.render(tmp, city:"Dallas")  
      expect(res).to.equal("<html><body>Dallas</body></html>")      

      res= settee(tmp)  
      expect(res(city:"Dallas")).to.equal("<html><body>Dallas</body></html>")      

    it 'should allow creating custom tags / helpers', ->
      settee.define 'widget', '(div.widget (div.body :block1'
      src= '''
          (widget
            (div "Hello!"))
          '''
      output= settee.render(src)
      expected= '<div class="widget"><div class="body"><div>Hello!</div></div></div>'
      expect(output).to.equal(expected)

      settee.undefine('widget')
      # The only way we can tell if it's gone is if auto-tagging returns
      expect(settee('(widget)')()).to.equal "<widget></widget>"

    it 'should allow creating custom tags / helpers from precompiled templates', ->
      settee.define 'widget', '(div.widget (div.body :block1'
      src= '''
          (widget
            (div "Hello!"))
          '''
      output= settee.render(src)
      expected= '<div class="widget"><div class="body"><div>Hello!</div></div></div>'
      expect(output).to.equal(expected)

      settee.undefine('widget')
      # The only way we can tell if it's gone is if auto-tagging returns
      expect(settee('(widget)')()).to.equal "<widget></widget>"

    it 'should allow adding attrs to custom tags', ->
      
      #'(div.widget (div.body :blocks'
      settee.define 'widget', (tag, attrs, elements)->
        attrs.class= 'widget'
        settee.tag_builder 'div', attrs, [settee.tag_builder('div', {class:'body'}, elements)]


      src= '''(.
          (widget id=mine
            (div "Hello!"))
          (widget id=yours 
            (div "Hello!")
            (div "GOODBYE!"))
          '''
      output= settee.render(src)
      expected= '<div id="mine" class="widget"><div class="body"><div>Hello!</div></div></div><div id="yours" class="widget"><div class="body"><div>Hello!</div><div>GOODBYE!</div></div></div>'
      expect(output).to.equal(expected)


  describe 'noConflict()', ->
    beforeEach ->
      _set= settee.noConflict()
    afterEach ->
      global.settee= _set

    it 'should remove settee from the global scope', ->
      expect(global.settee).to.be.undefined
      
    it 'should return the settee function', ->
      expect(_set).to.be.a.function
      expect(_set.render).to.be.a.function

    describe 'disconnected settee function', ->
      it 'should still be usable', ->
        expect(_set.render("(div (span 'hello'")).to.equal '<div><span>hello</span></div>'
