
source='''
(html 
  (head 
    (title "Test")) 
  (body 
    (p "...")))
'''

arr_asa= ["list",
        ["html",
          ["head",
            ["title","\"Test"]
          ],
        ["body",
          ["p","\"..."]]]] 

describe 'Settee#parse', ->
  it 'should exist', ->
    expect(Settee.parse).to.not.be.undefined
    expect(Settee.parse).to.be.a('function')
  
  it "should return an abstract syntax array", ->
    result= Settee.parse(source)
    # console.log(result)
    # console.log(JSON.stringify(result))
    expect(result).to.be.an('array')
    expect(result).to.deep.equal(arr_asa)

  # Test for auto_balance