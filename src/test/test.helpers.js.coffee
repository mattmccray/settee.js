

describe 'Settee._', ->
  it 'should exist', ->
    expect(Settee._).to.not.be.undefined
    
  describe "#isArray()", ->
    it "should correctly identify an array", ->
      expect(Settee._.isArray([])).to.be.true
      expect(Settee._.isArray("")).to.be.false
      expect(Settee._.isArray(null)).to.be.false
      expect(Settee._.isArray(1)).to.be.false
      expect(Settee._.isArray(/re/)).to.be.false
      expect(Settee._.isArray(arguments)).to.be.false
      args= Array::slice.call(arguments)
      expect(Settee._.isArray(args)).to.be.true

  describe "#isString()", ->
    it "should correctly identify a string", ->
      expect(Settee._.isString([])).to.be.false
      expect(Settee._.isString("")).to.be.true
      expect(Settee._.isString(null)).to.be.false
      expect(Settee._.isString(1)).to.be.false
      expect(Settee._.isString(/re/)).to.be.false
      expect(Settee._.isString(arguments)).to.be.false
      name="variable string"
      expect(Settee._.isString(name)).to.be.true

  describe "#isFunction()", ->
    it "should correctly identify a function", ->
      expect(Settee._.isFunction([])).to.be.false
      expect(Settee._.isFunction("")).to.be.false
      expect(Settee._.isFunction(null)).to.be.false
      expect(Settee._.isFunction(1)).to.be.false
      expect(Settee._.isFunction(/re/)).to.be.false
      expect(Settee._.isFunction(arguments)).to.be.false
      name="variable string"
      expect(Settee._.isFunction(name)).to.be.false
      expect(Settee._.isFunction(->)).to.be.true
      expect(Settee._.isFunction(Array::slice)).to.be.true

  describe '#trim()', ->
    it 'should remove unwanted whitespace', ->
      expect(Settee._.trim(" hello ")).to.equal("hello")
      expect(Settee._.trim(" hello")).to.equal("hello")
      expect(Settee._.trim("hello ")).to.equal("hello")
      expect(Settee._.trim("    hello    ")).to.equal("hello")
      expect(Settee._.trim("hello")).to.equal("hello")
      expect(Settee._.trim("   ")).to.equal("")
  
  describe '#defaults()', ->
    it 'should add missing properties from source object to target object', ->
      src= { name:'Matt' }
      def= { name:'Unknown', city:'Dallas' }
      exp= { name:'Matt', city:'Dallas'}

      expect(Settee._.defaults(src, def)).to.deep.equal(exp)
      # src should be updated too
      expect(src).to.deep.equal(exp)
    it 'should add missing properties from multiple source objects', ->
      src= { name:'Matt' }
      def= { city:'Dallas' }
      mor= { state:'TX' }
      exp= { name:'Matt', city:'Dallas', state:'TX'}

      expect(Settee._.defaults(src, def, mor)).to.deep.equal(exp)
      # src should be updated too
      expect(src).to.deep.equal(exp)


  describe '#parseAttrs()', ->
    it 'should parse id=main and id="main"', ->
      expect(Settee._.parseAttrs('id=main')).to.equal('id="main"')
      expect(Settee._.parseAttrs('id="main"')).to.equal('id="main"')

    it 'should optionally return a hash', ->
      expect(Settee._.parseAttrs('id="main"', false)).to.deep.equal({key:'id', value:'main'})

  describe "#replaceArrayVal()", ->
    it 'should replace a value within and array, recursively', ->
      arr= ['a', 'b', 'c']
      narr= Settee._.replaceArrayVal(arr, 'b', 'BEE')
      expect(narr).to.deep.equal ['a', 'BEE', 'c']

  describe '#extractAttrs()', ->
    it 'should remove attr atoms and return hash of values', ->
      src= Settee.parse('(div id=main class=bob "HELLO"').pop()
      atts= Settee._.extractAttrs(src, yes)
      # Settee._.log src, atts
      expect(src).to.deep.equal(['div', '"HELLO'])
      expect(atts).to.deep.equal( class:'bob', id:'main')

    it 'should remove attr atoms and return array of attr strings', ->
      src= Settee.parse('(div id=main class=bob "HELLO"').pop()
      atts= Settee._.extractAttrs(src)
      # Settee._.log src, atts
      expect(src).to.deep.equal(['div', '"HELLO'])
      expect(atts).to.deep.equal([ 'id="main"', 'class="bob"'])

