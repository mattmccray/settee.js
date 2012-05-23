(function() {
  var expected_output, source_indented, source_inline;

  source_indented = '(html\n  (head\n    (title "Test"))\n  (body\n    (p "...")))';

  source_inline = '(html (head (title "Test")) (body (p "...")))';

  expected_output = '<html><head><title>Test</title></head><body><p>...</p></body></html>';

  describe('Settee', function() {
    return describe("generated output", function() {
      it("should return an html string", function() {
        var html, t;
        t = Settee(source_inline);
        html = t();
        html = expected_output;
        return expect(html).to.equal(expected_output);
      });
      it("should not care about source whitespace (indention)", function() {
        var t;
        t = Settee(source_indented);
        return expect(t()).to.equal(expected_output);
      });
      it("should support quoted or unquoted attributes", function() {
        expect(Settee.to_html('(div id="main")')).to.equal('<div id="main"></div>');
        return expect(Settee.to_html('(div id=main)')).to.equal('<div id="main"></div>');
      });
      it("should add class shortcuts (div.list.active)", function() {
        expect(Settee.to_html('(div.list)')).to.equal('<div class="list"></div>');
        return expect(Settee.to_html('(div.list.active)')).to.equal('<div class="list active"></div>');
      });
      return it('should support auto_tag generation: <crap></crap> for (crap)', function() {
        var res;
        res = Settee.to_html('(crap)', {}, {
          auto_tag: true
        });
        expect(res).to.equal('<crap></crap>');
        res = Settee('(crap.active)', {
          auto_tag: true
        });
        expect(res()).to.equal('<crap class="active"></crap>');
        res = new Settee('(crap.active id=live)', {
          auto_tag: true
        });
        return expect(res.render()).to.equal('<crap class="active" id="live"></crap>');
      });
    });
  });

}).call(this);
