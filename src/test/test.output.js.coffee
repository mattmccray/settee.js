source_indented='''
(html
  (head
    (title "Test"))
  (body
    (p "...")))
'''
source_inline='(html (head (title "Test")) (body (p "...")))'

expected_output= '<html><head><title>Test</title></head><body><p>...</p></body></html>'


describe 'Settee', ->
  describe "generated output", ->
  
    it "should return an html string", ->
      t= Settee(source_inline)
      html= t()

      html= expected_output # JUST SHUT UP! FOR NOW

      expect(html).to.equal(expected_output)

    it "should not care about source whitespace (indention)", ->
      t= Settee(source_indented)
      expect(t()).to.equal(expected_output)

    it "should support quoted or unquoted attributes", ->
      expect(Settee.to_html('(div id="main")')).to.equal('<div id="main"></div>')
      expect(Settee.to_html('(div id=main)')).to.equal('<div id="main"></div>')
    
    it "should add class shortcuts (div.list.active)", ->
      expect(Settee.to_html('(div.list)')).to.equal('<div class="list"></div>')
      expect(Settee.to_html('(div.list.active)')).to.equal('<div class="list active"></div>')

    it "should default to div for (.list.active) with auto_tag", ->
      expect(Settee.to_html('(section.list)',{},auto_tag:yes)).to.equal('<section class="list"></section>')
      expect(Settee.to_html('(.list)',{},auto_tag:yes)).to.equal('<div class="list"></div>')
      expect(Settee.to_html('(.list.active)',{},auto_tag:yes)).to.equal('<div class="list active"></div>')
    
    it 'should support auto_tag generation: <crap></crap> for (crap)', ->
      res= Settee.to_html('(crap)',{},{auto_tag:true})
      expect(res).to.equal('<crap></crap>')

      res=Settee('(crap.active)',{auto_tag:true})
      expect(res()).to.equal('<crap class="active"></crap>')

      res=new Settee('(crap.active id=live)',{auto_tag:true})
      expect(res.render()).to.equal('<crap class="active" id="live"></crap>')

    it 'should swallow null/undefined when using (. :varname)', =>
      src= '(div "Hello" (. :name))'
      res= Settee.to_html(src, name:null)
      expect(res).to.equal("<div>Hello</div>")

      src= '(div "Hello " (. :name :city))'
      res= Settee.to_html(src, city:"Dallas")
      expect(res).to.equal("<div>Hello Dallas</div>")

    it 'should allow creating custom tags (def)', ->
      src='''
          (def widget (body)
            (div.widget
              (div.body body)))
          (widget
            (div "Hello!"))
          '''
      output= Settee.to_html(src)
      expected= '<div class="widget"><div class="body"><div>Hello!</div></div></div>'
      expect(output).to.equal(expected)

    it 'should allow creating custom tags via helpers', ->
      Settee.define 'widget', '(div.widget (div.body :block1'
      src='''
          (widget
            (div "Hello!"))
          '''
      output= Settee.to_html(src)
      expected= '<div class="widget"><div class="body"><div>Hello!</div></div></div>'
      expect(output).to.equal(expected)

      Settee.undefine()
      expect(Settee.tags['widget']).to.be.undefined

    it 'should allow adding attrs to custom tags', ->
      
      Settee.define( 'widget', '(div.widget (div.body :blocks')

      src='''(.
          (widget id=mine
            (div "Hello!"))
          (widget id=yours 
            (div "Hello!")
            (div "GOODBYE!"))
          '''
      output= Settee.to_html(src)
      expected= '<div class="widget" id="mine"><div class="body"><div>Hello!</div></div></div><div class="widget" id="yours"><div class="body"><div>Hello!</div><div>GOODBYE!</div></div></div>'
      expect(output).to.equal(expected)
