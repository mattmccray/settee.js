(function() {
  var arr_asa, source;

  source = '(html \n  (head \n    (title "Test")) \n  (body \n    (p "...")))';

  arr_asa = ["list", ["html", ["head", ["title", "\"Test"]], ["body", ["p", "\"..."]]]];

  describe('Settee#parse', function() {
    it('should exist', function() {
      expect(Settee.parse).to.not.be.undefined;
      return expect(Settee.parse).to.be.a('function');
    });
    return it("should return an abstract syntax array", function() {
      var result;
      result = Settee.parse(source);
      expect(result).to.be.an('array');
      return expect(result).to.deep.equal(arr_asa);
    });
  });

}).call(this);
