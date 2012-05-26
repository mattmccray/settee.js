(function() {
  var expected_output, source_indented, source_inline;

  source_indented = '(html\n  (head\n    (title "Test"))\n  (body\n    (p "...")))';

  source_inline = '(html (head (title "Test")) (body (p "...")))';

  expected_output = '<html><head><title>Test</title></head><body><p>...</p></body></html>';

  describe('Settee', function() {
    return describe("generated output", function() {
      var _this = this;
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
      it("should default to div for (.list.active) with auto_tag", function() {
        expect(Settee.to_html('(section.list)', {}, {
          auto_tag: true
        })).to.equal('<section class="list"></section>');
        expect(Settee.to_html('(.list)', {}, {
          auto_tag: true
        })).to.equal('<div class="list"></div>');
        return expect(Settee.to_html('(.list.active)', {}, {
          auto_tag: true
        })).to.equal('<div class="list active"></div>');
      });
      it('should support auto_tag generation: <crap></crap> for (crap)', function() {
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
      it('should swallow null/undefined when using (. :varname)', function() {
        var res, src;
        src = '(div "Hello" (. :name))';
        res = Settee.to_html(src, {
          name: null
        });
        expect(res).to.equal("<div>Hello</div>");
        src = '(div "Hello " (. :name :city))';
        res = Settee.to_html(src, {
          city: "Dallas"
        });
        return expect(res).to.equal("<div>Hello Dallas</div>");
      });
      it('should allow creating custom tags (def)', function() {
        var expected, output, src;
        src = '(def widget (body)\n  (div.widget\n    (div.body body)))\n(widget\n  (div "Hello!"))';
        output = Settee.to_html(src);
        expected = '<div class="widget"><div class="body"><div>Hello!</div></div></div>';
        return expect(output).to.equal(expected);
      });
      it('should allow creating custom tags via helpers', function() {
        var expected, output, src;
        Settee.define('widget', '(div.widget (div.body :block1');
        src = '(widget\n  (div "Hello!"))';
        output = Settee.to_html(src);
        expected = '<div class="widget"><div class="body"><div>Hello!</div></div></div>';
        expect(output).to.equal(expected);
        Settee.undefine();
        return expect(Settee.tags['widget']).to.be.undefined;
      });
      return it('should allow adding attrs to custom tags', function() {
        var expected, output, src;
        Settee.define('widget', '(div.widget (div.body :blocks');
        src = '(.\n(widget id=mine\n  (div "Hello!"))\n(widget id=yours \n  (div "Hello!")\n  (div "GOODBYE!"))';
        output = Settee.to_html(src);
        expected = '<div class="widget" id="mine"><div class="body"><div>Hello!</div></div></div><div class="widget" id="yours"><div class="body"><div>Hello!</div><div>GOODBYE!</div></div></div>';
        return expect(output).to.equal(expected);
      });
    });
  });

}).call(this);
