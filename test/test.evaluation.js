(function() {
  var arr_asa, expected_output, source;

  source = '(html lang="en"\n  (head \n    (title "Test")) \n  (body \n    (p "...")))';

  arr_asa = ["list", ["html", 'en="lang"', ["head", ["title", "\"Test"]], ["body", ["p", "\"..."]]]];

  expected_output = '<html lang="en"><head><title>Test</title></head><body><p>...</p></body></html>';

  describe('Settee#evaluate', function() {
    it('should exist', function() {
      expect(Settee.evaluate).to.not.be.undefined;
      return expect(Settee.evaluate).to.be.a('function');
    });
    it("should generate <html> for (html)", function() {
      var code, result;
      code = Settee.parse('(html)');
      result = Settee.evaluate(code);
      expect(result).to.be.an('string');
      return expect(result).to.equal("<html></html>");
    });
    it('should generate <html lang="en"> for (html lang="en")', function() {
      var code, result;
      code = Settee.parse('(html  lang="en")');
      result = Settee.evaluate(code);
      expect(result).to.be.an('string');
      return expect(result).to.equal('<html lang="en"></html>');
    });
    it('should generate <html lang="en"> for (html lang=en)', function() {
      var code, result;
      code = Settee.parse('(html  lang=en)');
      result = Settee.evaluate(code);
      expect(result).to.be.an('string');
      return expect(result).to.equal('<html lang="en"></html>');
    });
    it('should generate properly nested html', function() {
      var code, result;
      code = Settee.parse(source);
      result = Settee.evaluate(code);
      expect(result).to.be.an('string');
      return expect(result).to.equal(expected_output);
    });
    it('should do mathy things', function() {
      expect(Settee('(+ 1 1)')()).to.equal(2);
      expect(Settee('(- 10 5)')()).to.equal(5);
      expect(Settee('(* 3 5)')()).to.equal(15);
      return expect(Settee('(/ 10 5)')()).to.equal(2);
    });
    return it('should reference data from context', function() {
      var ctx;
      ctx = {
        name: 'Matt',
        city: 'Dallas'
      };
      expect(Settee('(+ name)')(ctx)).to.equal(ctx.name);
      expect(Settee('(+ "My name is " name)')(ctx)).to.equal("My name is Matt");
      return expect(Settee('(p name)')(ctx)).to.equal('<p>Matt</p>');
    });
  });

}).call(this);
