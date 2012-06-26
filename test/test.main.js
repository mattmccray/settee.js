(function() {
  
(function(global){
if( typeof(settee) == 'undefined' && typeof(expect) == 'undefined' && typeof(require) != 'undefined'){
  settee= require('../settee.js').settee;
  expect= require('chai').expect;
}
})(this);

  var expected_output, global, source_indented, source_inline, _set;

  global = this;

  _set = null;

  source_indented = '(html\n  (head\n    (title "Test"))\n  (body\n    (p "...")))';

  source_inline = '(html (head (title "Test")) (body (p "...")))';

  expected_output = '<html><head><title>Test</title></head><body><p>...</p></body></html>';

  describe('settee()', function() {
    it('should exist', function() {
      expect(settee).to.not.be.undefined;
      return expect(settee).to.be.a('function');
    });
    it("should generate <html> for (html)", function() {
      var result, tmpl;
      tmpl = settee('(html)');
      result = tmpl();
      expect(result).to.be.an('string');
      return expect(result).to.equal("<html></html>");
    });
    it('should generate <html lang="en"> for (html lang="en")', function() {
      var result, tmpl;
      tmpl = settee('(html  lang="en")');
      result = tmpl();
      expect(result).to.be.an('string');
      return expect(result).to.equal('<html lang="en"></html>');
    });
    it('should generate <html lang="en"> for (html lang=en)', function() {
      var result, tmpl;
      tmpl = settee('(html  lang=en)');
      result = tmpl();
      expect(result).to.be.an('string');
      return expect(result).to.equal('<html lang="en"></html>');
    });
    it('should generate properly nested html', function() {
      var result, tmpl;
      tmpl = settee(source_inline);
      result = tmpl();
      expect(result).to.be.an('string');
      return expect(result).to.equal(expected_output);
    });
    it('should not generate a tag for .', function() {
      return expect(settee('(. "Hello")')()).to.equal('Hello');
    });
    it('should reference data from context as :varname', function() {
      var ctx;
      ctx = {
        name: 'Matt',
        city: 'Dallas'
      };
      expect(settee('(. :name)')(ctx)).to.equal(ctx.name);
      expect(settee('(p "My name is " :name)')(ctx)).to.equal("<p>My name is Matt</p>");
      return expect(settee('(p @name)')(ctx)).to.equal('<p>Matt</p>');
    });
    it('should reference env variable by @symbol too', function() {
      expect(settee("(. @name)")({
        name: "Matt"
      })).to.equal('Matt');
      return expect(settee("(. @city)")({
        city: "Dallas"
      })).to.equal('Dallas');
    });
    describe("generated output", function() {
      var _this = this;
      it("should return an html string", function() {
        var html, t;
        t = settee(source_inline);
        html = t();
        return expect(html).to.equal(expected_output);
      });
      it("should not care about source whitespace (indention)", function() {
        var t;
        t = settee(source_indented);
        return expect(t()).to.equal(expected_output);
      });
      it("should support quoted or unquoted attributes", function() {
        expect(settee('(div id="main")')()).to.equal('<div id="main"></div>');
        return expect(settee('(div id=main)')()).to.equal('<div id="main"></div>');
      });
      it("should add class shortcuts (div.list.active)", function() {
        expect(settee('(div.list)')()).to.equal('<div class="list"></div>');
        return expect(settee.to_html('(div.list.active)')).to.equal('<div class="list active"></div>');
      });
      it("should default to div for (.list.active) with auto_tag", function() {
        expect(settee.to_html('(section.list)', {}, {
          auto_tag: true
        })).to.equal('<section class="list"></section>');
        expect(settee.to_html('(.list)', {}, {
          auto_tag: true
        })).to.equal('<div class="list"></div>');
        return expect(settee.to_html('(.list.active)', {}, {
          auto_tag: true
        })).to.equal('<div class="list active"></div>');
      });
      it('should support auto_tag generation: <crap></crap> for (crap)', function() {
        var res;
        res = settee.to_html('(crap)');
        expect(res).to.equal('<crap></crap>');
        res = settee('(crap.active)');
        return expect(res()).to.equal('<crap class="active"></crap>');
      });
      it('should swallow null/undefined when using (. :varname)', function() {
        var res, src;
        src = '(div "Hello" (. :name))';
        res = settee.to_html(src, {
          name: null
        });
        expect(res).to.equal("<div>Hello</div>");
        src = '(div "Hello " (. :name :city))';
        res = settee.to_html(src, {
          city: "Dallas"
        });
        return expect(res).to.equal("<div>Hello Dallas</div>");
      });
      it('should allow creating custom tags / helpers', function() {
        var expected, output, src;
        settee.define('widget', '(div.widget (div.body :block1');
        src = '(widget\n  (div "Hello!"))';
        output = settee.to_html(src);
        expected = '<div class="widget"><div class="body"><div>Hello!</div></div></div>';
        expect(output).to.equal(expected);
        settee.undefine('widget');
        return expect(settee('(widget)')()).to.equal("<widget></widget>");
      });
      return it('should allow adding attrs to custom tags', function() {
        var expected, output, src;
        settee.define('widget', function(tag, attrs, elements) {
          attrs["class"] = 'widget';
          return settee.tag_builder('div', attrs, [
            settee.tag_builder('div', {
              "class": 'body'
            }, elements)
          ]);
        });
        src = '(.\n(widget id=mine\n  (div "Hello!"))\n(widget id=yours \n  (div "Hello!")\n  (div "GOODBYE!"))';
        output = settee.to_html(src);
        expected = '<div id="mine" class="widget"><div class="body"><div>Hello!</div></div></div><div id="yours" class="widget"><div class="body"><div>Hello!</div><div>GOODBYE!</div></div></div>';
        return expect(output).to.equal(expected);
      });
    });
    return describe('noConflict()', function() {
      beforeEach(function() {
        return _set = settee.noConflict();
      });
      afterEach(function() {
        return global.settee = _set;
      });
      it('should remove settee from the global scope', function() {
        return expect(global.settee).to.be.undefined;
      });
      it('should return the settee function', function() {
        expect(_set).to.be.a["function"];
        return expect(_set.to_html).to.be.a["function"];
      });
      return describe('disconnected settee function', function() {
        return it('should still be usable', function() {
          return expect(_set.to_html("(div (span 'hello'")).to.equal('<div><span>hello</span></div>');
        });
      });
    });
  });

}).call(this);