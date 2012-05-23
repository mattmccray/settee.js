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
    
    it 'should support auto_tag generation: <crap></crap> for (crap)', ->
      res= Settee.to_html('(crap)',{},{auto_tag:true})
      expect(res).to.equal('<crap></crap>')

      res=Settee('(crap.active)',{auto_tag:true})
      expect(res()).to.equal('<crap class="active"></crap>')

      res=new Settee('(crap.active id=live)',{auto_tag:true})
      expect(res.render()).to.equal('<crap class="active" id="live"></crap>')
