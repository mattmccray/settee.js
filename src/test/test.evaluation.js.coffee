
source='''
(html lang="en"
  (head 
    (title "Test")) 
  (body 
    (p "...")))
'''

arr_asa= ["list",
        ["html",
          'en="lang"',
          ["head",
            ["title","\"Test"]
          ],
        ["body",
          ["p","\"..."]]]] 

expected_output= '<html lang="en"><head><title>Test</title></head><body><p>...</p></body></html>'

describe 'Settee#evaluate', ->
  it 'should exist', ->
    expect(Settee.evaluate).to.not.be.undefined
    expect(Settee.evaluate).to.be.a('function')

  it "should generate <html> for (html)", ->
    code= Settee.parse('(html)')
    result= Settee.evaluate(code)
    expect(result).to.be.an('string')
    expect(result).to.equal("<html></html>")

  it 'should generate <html lang="en"> for (html lang="en")', ->
    code= Settee.parse('(html  lang="en")')
    result= Settee.evaluate(code)
    expect(result).to.be.an('string')
    expect(result).to.equal('<html lang="en"></html>')

  it 'should generate <html lang="en"> for (html lang=en)', ->
    code= Settee.parse('(html  lang=en)')
    result= Settee.evaluate(code)
    expect(result).to.be.an('string')
    expect(result).to.equal('<html lang="en"></html>')

  it 'should generate properly nested html', ->
    code= Settee.parse(source)
    result= Settee.evaluate(code)
    expect(result).to.be.an('string')
    expect(result).to.equal(expected_output)

  it 'should do mathy things', ->
    expect( Settee('(+ 1 1)')() ).to.equal(2)
    expect( Settee('(- 10 5)')() ).to.equal(5)
    expect( Settee('(* 3 5)')() ).to.equal(15)
    expect( Settee('(/ 10 5)')() ).to.equal(2)

  it 'should reference data from context', ->
    ctx=
      name: 'Matt'
      city: 'Dallas'
    expect( Settee('(+ name)')(ctx) ).to.equal(ctx.name)
    expect( Settee('(+ "My name is " name)')(ctx) ).to.equal("My name is Matt")
    expect( Settee('(p name)')(ctx) ).to.equal('<p>Matt</p>')

  it 'should reference env variable by :symbol', ->
    expect(Settee.to_html("(+ :name)", name:"Matt")).to.equal('Matt')
    expect(Settee.to_html("(+ :city)", city:"Dallas")).to.equal('Dallas')

  it 'should support (if (expr))', ->
    src='''
        (if (eq :name "Matt")
          (div "Hello!")
          (div "Who?"))
        '''
    expect(Settee.to_html(src)).to.equal("<div>Who?</div>")
    expect(Settee.to_html(src, name:'Matt')).to.equal("<div>Hello!</div>")

  it 'should support (case (expr) (expr))', ->
    src='''
        (case
          ((eq :name "Matt")
            (div "Hi Matt!"))
          ((eq :name "Dan")
            (div "Hey Dan!"))
        '''
    expect(Settee.to_html(src, name:'Matt')).to.equal("<div>Hi Matt!</div>")
    expect(Settee.to_html(src, name:'Dan')).to.equal("<div>Hey Dan!</div>")
    expect(Settee.to_html(src)).to.equal(null)
    
