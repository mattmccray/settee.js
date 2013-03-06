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

precompile= (src)->
  fullSettee.precompile src
  # fullSettee.compile fullSettee.parse(src), false

describe "settee() v#{ settee.version }", ->
  it 'should exist', ->
    expect(settee).to.not.be.undefined
    expect(settee).to.be.a('function')

  it "should generate <html> for (html)", ->
    tmpl= settee precompile('(html)')
    result= tmpl()
    expect(result).to.be.an('string')
    expect(result).to.equal("<html></html>")

  it 'should generate <html lang="en"> for (html lang="en")', ->
    tmpl= settee precompile('(html  lang="en")')
    result= tmpl()
    expect(result).to.be.an('string')
    expect(result).to.equal('<html lang="en"></html>')

  it 'should generate <html lang="en"> for (html lang=en)', ->
    tmpl= settee precompile('(html  lang=en)')
    result= tmpl()
    expect(result).to.be.an('string')
    expect(result).to.equal('<html lang="en"></html>')

  it 'should generate properly nested html', ->
    tmpl= settee precompile(source_inline)
    result= tmpl()
    expect(result).to.be.an('string')
    expect(result).to.equal(expected_output)

  it 'should not generate a tag for .', ->
    expect(settee( precompile('(. "Hello")'))()).to.equal('Hello')

  it 'should reference data from context as :varname', ->
    ctx=
      name: 'Matt'
      city: 'Dallas'
    expect( settee( precompile '(. :name)')(ctx) ).to.equal(ctx.name)
    expect( settee( precompile '(p "My name is " :name)')(ctx) ).to.equal("<p>My name is Matt</p>")
    expect( settee(  precompile '(p @name)')(ctx) ).to.equal('<p>Matt</p>')

  it 'should reference env variable by @symbol too', ->
    expect(settee( precompile "(. @name)")(name:"Matt")).to.equal('Matt')
    expect(settee( precompile "(. @city)")(city:"Dallas")).to.equal('Dallas')

  it 'should support (if expr, ifpasses...)', ->
    src=  precompile '''
        (if (eq :name "Matt")
          (div "Hello!"))
        '''
    expect(settee.render(src)).to.equal("")
    expect(settee.render(src, name:'Matt')).to.equal("<div>Hello!</div>")

  it 'should support (ifelse expr, truelist, falselist)', ->
    src=  precompile '''
        (ifelse (eq :name "Matt")
          (div "Hello!")
          (div "Who?"))
        '''
    expect(settee.render(src)).to.equal("<div>Who?</div>")
    expect(settee.render(src, name:'Matt')).to.equal("<div>Hello!</div>")

  it 'should support (unless expr, iffails...)', ->
    src=  precompile '''
        (unless (is :name "Matt")
          (div "Hello!"))
        '''
    expect(settee.render(src)).to.equal("<div>Hello!</div>")
    expect(settee.render(src, name:'Matt')).to.equal("")

  describe "generated output", ->
  
    it "should return an html string", ->
      t= settee( precompile source_inline)
      html= t()
      expect(html).to.equal(expected_output)

    it "should not care about source whitespace (indention)", ->
      t= settee( precompile source_indented)
      expect(t()).to.equal(expected_output)

    it "should support quoted or unquoted attributes", ->
      expect(settee( precompile '(div id="main")')()).to.equal('<div id="main"></div>')
      expect(settee( precompile '(div id=main)')()).to.equal('<div id="main"></div>')
    
    it "should add class shortcuts (div.list.active)", ->
      expect(settee( precompile '(div.list)')()).to.equal('<div class="list"></div>')
      expect(settee.render( precompile '(div.list.active)')).to.equal('<div class="list active"></div>')

    it "should default to div for (.list.active)", ->
      expect(settee.render( precompile '(.list)')).to.equal('<div class="list"></div>')
      expect(settee.render( precompile '(.list.active)')).to.equal('<div class="list active"></div>')
      expect(settee.render( precompile '(.list#main)')).to.equal('<div id="main" class="list"></div>')

    it "should add id shortcut (div#main)", ->
      expect(settee( precompile '(div#main)')()).to.equal('<div id="main"></div>')
      expect(settee.render( precompile '(div#main.list.active)')).to.equal('<div id="main" class="list active"></div>')

    it "should default to div for (#main)", ->
      expect(settee.render( precompile '(#main)')).to.equal('<div id="main"></div>')
      expect(settee.render( precompile '(#main.test)')).to.equal('<div id="main" class="test"></div>')
      expect(settee.render( precompile '(.test#main)')).to.equal('<div id="main" class="test"></div>')

    it "should allow mixing shortcut types (div#main.container)", ->
      expect(settee.render  precompile '(div#main.list)' ).to.equal('<div id="main" class="list"></div>')
      expect(settee.render  precompile '(div#main.list.active)' ).to.equal('<div id="main" class="list active"></div>')
      expect(settee.render  precompile '(div.list#main.active)' ).to.equal('<div id="main" class="list active"></div>')
      expect(settee.render  precompile '(div.list.active#main)' ).to.equal('<div id="main" class="list active"></div>')
    
    it 'should support auto_tag generation: <crap></crap> for (crap)', ->
      res= settee.render( precompile '(crap)')
      expect(res).to.equal('<crap></crap>')

      res=settee( precompile '(crap.active)')
      expect(res()).to.equal('<crap class="active"></crap>')


    it 'should swallow null/undefined when using (. :varname)', =>
      src=  precompile '(div "Hello" (. :name))'
      res= settee.render(src, name:null)
      expect(res).to.equal("<div>Hello</div>")

      src=  precompile '(div "Hello " (. :name :city))'
      res= settee.render(src, city:"Dallas")
      expect(res).to.equal("<div>Hello Dallas</div>")

    it 'should allow creating custom tags / helpers from other precompiled templates', ->
      tmp= precompile '(div.widget (div.body :block1'
      settee.define 'widget', tmp
      # console.log tmp
      src=  precompile '''
          (widget
            (div "Hello!"))
          '''
      output= settee.render(src)
      expected= '<div class="widget"><div class="body"><div>Hello!</div></div></div>'
      expect(output).to.equal(expected)

      settee.undefine('widget')
      # The only way we can tell if it's gone is if auto-tagging returns
      expect(settee(precompile '(widget)')()).to.equal "<widget></widget>"

    it 'should allow adding attrs to custom tags', ->
      
      #'(div.widget (div.body :blocks'
      settee.define 'widget', (tag, attrs, elements)->
        attrs.class= 'widget'
        settee.tag_builder 'div', attrs, [settee.tag_builder('div', {class:'body'}, elements)]


      src= precompile '''(.
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
        expect(_set.render( precompile "(div (span 'hello'")).to.equal '<div><span>hello</span></div>'
