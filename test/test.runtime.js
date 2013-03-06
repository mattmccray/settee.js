// Generated by CoffeeScript 1.6.1

(function(global){
if( typeof(settee) == 'undefined' && typeof(expect) == 'undefined' && typeof(require) != 'undefined'){
  settee= require('../settee.js').settee;
  expect= require('chai').expect;
}
})(this);
var expected_output, global, precompile, source_indented, source_inline, _set;

global = this;

_set = null;

source_indented = '(html\n  (head\n    (title "Test"))\n  (body\n    (p "...")))';

source_inline = '(html (head (title "Test")) (body (p "...")))';

expected_output = '<html><head><title>Test</title></head><body><p>...</p></body></html>';

precompile = function(src) {
  return fullSettee.compile(fullSettee.parse(src), false);
};

describe("settee() v" + settee.version, function() {
  it('should exist', function() {
    expect(settee).to.not.be.undefined;
    return expect(settee).to.be.a('function');
  });
  it("should generate <html> for (html)", function() {
    var result, tmpl;
    tmpl = settee(precompile('(html)'));
    result = tmpl();
    expect(result).to.be.an('string');
    return expect(result).to.equal("<html></html>");
  });
  it('should generate <html lang="en"> for (html lang="en")', function() {
    var result, tmpl;
    tmpl = settee(precompile('(html  lang="en")'));
    result = tmpl();
    expect(result).to.be.an('string');
    return expect(result).to.equal('<html lang="en"></html>');
  });
  it('should generate <html lang="en"> for (html lang=en)', function() {
    var result, tmpl;
    tmpl = settee(precompile('(html  lang=en)'));
    result = tmpl();
    expect(result).to.be.an('string');
    return expect(result).to.equal('<html lang="en"></html>');
  });
  it('should generate properly nested html', function() {
    var result, tmpl;
    tmpl = settee(precompile(source_inline));
    result = tmpl();
    expect(result).to.be.an('string');
    return expect(result).to.equal(expected_output);
  });
  it('should not generate a tag for .', function() {
    return expect(settee(precompile('(. "Hello")'))()).to.equal('Hello');
  });
  it('should reference data from context as :varname', function() {
    var ctx;
    ctx = {
      name: 'Matt',
      city: 'Dallas'
    };
    expect(settee(precompile('(. :name)'))(ctx)).to.equal(ctx.name);
    expect(settee(precompile('(p "My name is " :name)'))(ctx)).to.equal("<p>My name is Matt</p>");
    return expect(settee(precompile('(p @name)'))(ctx)).to.equal('<p>Matt</p>');
  });
  it('should reference env variable by @symbol too', function() {
    expect(settee(precompile("(. @name)"))({
      name: "Matt"
    })).to.equal('Matt');
    return expect(settee(precompile("(. @city)"))({
      city: "Dallas"
    })).to.equal('Dallas');
  });
  it('should support (if expr, ifpasses...)', function() {
    var src;
    src = precompile('(if (eq :name "Matt")\n  (div "Hello!"))');
    expect(settee.render(src)).to.equal("");
    return expect(settee.render(src, {
      name: 'Matt'
    })).to.equal("<div>Hello!</div>");
  });
  it('should support (ifelse expr, truelist, falselist)', function() {
    var src;
    src = precompile('(ifelse (eq :name "Matt")\n  (div "Hello!")\n  (div "Who?"))');
    expect(settee.render(src)).to.equal("<div>Who?</div>");
    return expect(settee.render(src, {
      name: 'Matt'
    })).to.equal("<div>Hello!</div>");
  });
  it('should support (unless expr, iffails...)', function() {
    var src;
    src = precompile('(unless (is :name "Matt")\n  (div "Hello!"))');
    expect(settee.render(src)).to.equal("<div>Hello!</div>");
    return expect(settee.render(src, {
      name: 'Matt'
    })).to.equal("");
  });
  describe("generated output", function() {
    var _this = this;
    it("should return an html string", function() {
      var html, t;
      t = settee(precompile(source_inline));
      html = t();
      return expect(html).to.equal(expected_output);
    });
    it("should not care about source whitespace (indention)", function() {
      var t;
      t = settee(precompile(source_indented));
      return expect(t()).to.equal(expected_output);
    });
    it("should support quoted or unquoted attributes", function() {
      expect(settee(precompile('(div id="main")'))()).to.equal('<div id="main"></div>');
      return expect(settee(precompile('(div id=main)'))()).to.equal('<div id="main"></div>');
    });
    it("should add class shortcuts (div.list.active)", function() {
      expect(settee(precompile('(div.list)'))()).to.equal('<div class="list"></div>');
      return expect(settee.render(precompile('(div.list.active)'))).to.equal('<div class="list active"></div>');
    });
    it("should default to div for (.list.active)", function() {
      expect(settee.render(precompile('(.list)'))).to.equal('<div class="list"></div>');
      expect(settee.render(precompile('(.list.active)'))).to.equal('<div class="list active"></div>');
      return expect(settee.render(precompile('(.list#main)'))).to.equal('<div id="main" class="list"></div>');
    });
    it("should add id shortcut (div#main)", function() {
      expect(settee(precompile('(div#main)'))()).to.equal('<div id="main"></div>');
      return expect(settee.render(precompile('(div#main.list.active)'))).to.equal('<div id="main" class="list active"></div>');
    });
    it("should default to div for (#main)", function() {
      expect(settee.render(precompile('(#main)'))).to.equal('<div id="main"></div>');
      expect(settee.render(precompile('(#main.test)'))).to.equal('<div id="main" class="test"></div>');
      return expect(settee.render(precompile('(.test#main)'))).to.equal('<div id="main" class="test"></div>');
    });
    it("should allow mixing shortcut types (div#main.container)", function() {
      expect(settee.render(precompile('(div#main.list)'))).to.equal('<div id="main" class="list"></div>');
      expect(settee.render(precompile('(div#main.list.active)'))).to.equal('<div id="main" class="list active"></div>');
      expect(settee.render(precompile('(div.list#main.active)'))).to.equal('<div id="main" class="list active"></div>');
      return expect(settee.render(precompile('(div.list.active#main)'))).to.equal('<div id="main" class="list active"></div>');
    });
    it('should support auto_tag generation: <crap></crap> for (crap)', function() {
      var res;
      res = settee.render(precompile('(crap)'));
      expect(res).to.equal('<crap></crap>');
      res = settee(precompile('(crap.active)'));
      return expect(res()).to.equal('<crap class="active"></crap>');
    });
    it('should swallow null/undefined when using (. :varname)', function() {
      var res, src;
      src = precompile('(div "Hello" (. :name))');
      res = settee.render(src, {
        name: null
      });
      expect(res).to.equal("<div>Hello</div>");
      src = precompile('(div "Hello " (. :name :city))');
      res = settee.render(src, {
        city: "Dallas"
      });
      return expect(res).to.equal("<div>Hello Dallas</div>");
    });
    it('should allow creating custom tags / helpers from other precompiled templates', function() {
      var expected, output, src, tmp;
      tmp = precompile('(div.widget (div.body :block1');
      settee.define('widget', tmp);
      console.log(tmp);
      src = precompile('(widget\n  (div "Hello!"))');
      output = settee.render(src);
      expected = '<div class="widget"><div class="body"><div>Hello!</div></div></div>';
      expect(output).to.equal(expected);
      settee.undefine('widget');
      return expect(settee(precompile('(widget)'))()).to.equal("<widget></widget>");
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
      src = precompile('(.\n(widget id=mine\n  (div "Hello!"))\n(widget id=yours \n  (div "Hello!")\n  (div "GOODBYE!"))');
      output = settee.render(src);
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
      return expect(_set.render).to.be.a["function"];
    });
    return describe('disconnected settee function', function() {
      return it('should still be usable', function() {
        return expect(_set.render(precompile("(div (span 'hello'"))).to.equal('<div><span>hello</span></div>');
      });
    });
  });
});
