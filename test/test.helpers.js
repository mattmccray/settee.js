(function() {

  describe('Settee._', function() {
    it('should exist', function() {
      return expect(Settee._).to.not.be.undefined;
    });
    describe("#isArray()", function() {
      return it("should correctly identify an array", function() {
        var args;
        expect(Settee._.isArray([])).to.be["true"];
        expect(Settee._.isArray("")).to.be["false"];
        expect(Settee._.isArray(null)).to.be["false"];
        expect(Settee._.isArray(1)).to.be["false"];
        expect(Settee._.isArray(/re/)).to.be["false"];
        expect(Settee._.isArray(arguments)).to.be["false"];
        args = Array.prototype.slice.call(arguments);
        return expect(Settee._.isArray(args)).to.be["true"];
      });
    });
    describe("#isString()", function() {
      return it("should correctly identify a string", function() {
        var name;
        expect(Settee._.isString([])).to.be["false"];
        expect(Settee._.isString("")).to.be["true"];
        expect(Settee._.isString(null)).to.be["false"];
        expect(Settee._.isString(1)).to.be["false"];
        expect(Settee._.isString(/re/)).to.be["false"];
        expect(Settee._.isString(arguments)).to.be["false"];
        name = "variable string";
        return expect(Settee._.isString(name)).to.be["true"];
      });
    });
    describe("#isFunction()", function() {
      return it("should correctly identify a function", function() {
        var name;
        expect(Settee._.isFunction([])).to.be["false"];
        expect(Settee._.isFunction("")).to.be["false"];
        expect(Settee._.isFunction(null)).to.be["false"];
        expect(Settee._.isFunction(1)).to.be["false"];
        expect(Settee._.isFunction(/re/)).to.be["false"];
        expect(Settee._.isFunction(arguments)).to.be["false"];
        name = "variable string";
        expect(Settee._.isFunction(name)).to.be["false"];
        expect(Settee._.isFunction(function() {})).to.be["true"];
        return expect(Settee._.isFunction(Array.prototype.slice)).to.be["true"];
      });
    });
    describe('#trim()', function() {
      return it('should remove unwanted whitespace', function() {
        expect(Settee._.trim(" hello ")).to.equal("hello");
        expect(Settee._.trim(" hello")).to.equal("hello");
        expect(Settee._.trim("hello ")).to.equal("hello");
        expect(Settee._.trim("    hello    ")).to.equal("hello");
        expect(Settee._.trim("hello")).to.equal("hello");
        return expect(Settee._.trim("   ")).to.equal("");
      });
    });
    describe('#defaults()', function() {
      it('should add missing properties from source object to target object', function() {
        var def, exp, src;
        src = {
          name: 'Matt'
        };
        def = {
          name: 'Unknown',
          city: 'Dallas'
        };
        exp = {
          name: 'Matt',
          city: 'Dallas'
        };
        expect(Settee._.defaults(src, def)).to.deep.equal(exp);
        return expect(src).to.deep.equal(exp);
      });
      return it('should add missing properties from multiple source objects', function() {
        var def, exp, mor, src;
        src = {
          name: 'Matt'
        };
        def = {
          city: 'Dallas'
        };
        mor = {
          state: 'TX'
        };
        exp = {
          name: 'Matt',
          city: 'Dallas',
          state: 'TX'
        };
        expect(Settee._.defaults(src, def, mor)).to.deep.equal(exp);
        return expect(src).to.deep.equal(exp);
      });
    });
    describe('#parseAttrs()', function() {
      it('should parse id=main and id="main"', function() {
        expect(Settee._.parseAttrs('id=main')).to.equal('id="main"');
        return expect(Settee._.parseAttrs('id="main"')).to.equal('id="main"');
      });
      return it('should optionally return a hash', function() {
        return expect(Settee._.parseAttrs('id="main"', false)).to.deep.equal({
          key: 'id',
          value: 'main'
        });
      });
    });
    describe("#replaceArrayVal()", function() {
      return it('should replace a value within and array, recursively', function() {
        var arr, narr;
        arr = ['a', 'b', 'c'];
        narr = Settee._.replaceArrayVal(arr, 'b', 'BEE');
        return expect(narr).to.deep.equal(['a', 'BEE', 'c']);
      });
    });
    return describe('#extractAttrs()', function() {
      it('should remove attr atoms and return hash of values', function() {
        var atts, src;
        src = Settee.parse('(div id=main class=bob "HELLO"').pop();
        atts = Settee._.extractAttrs(src, true);
        expect(src).to.deep.equal(['div', '"HELLO']);
        return expect(atts).to.deep.equal({
          "class": 'bob',
          id: 'main'
        });
      });
      return it('should remove attr atoms and return array of attr strings', function() {
        var atts, src;
        src = Settee.parse('(div id=main class=bob "HELLO"').pop();
        atts = Settee._.extractAttrs(src);
        expect(src).to.deep.equal(['div', '"HELLO']);
        return expect(atts).to.deep.equal(['id="main"', 'class="bob"']);
      });
    });
  });

}).call(this);
