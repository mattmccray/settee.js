(function() {
  var VERSION, attrRE, code_to_source, compile, context, escapeRegExp, global, idRE, nativeForEach, nativeIsArray, nativeMap, nativeTrim, old_settee, parse_source, quotedAttrRE, settee, slice, tag, translate, _checkVar, _do_parse, _each, _isArray, _isString, _map, _parseAttrs, _parser, _ref, _scanner, _trim,
    __hasProp = {}.hasOwnProperty;

  if (typeof module === "undefined" || module === null) {
    global = this;
    old_settee = global.settee;
  }

  slice = Array.prototype.slice;

  nativeForEach = Array.prototype.forEach;

  nativeMap = Array.prototype.map;

  nativeIsArray = Array.isArray;

  nativeTrim = String.prototype.trim;

  quotedAttrRE = /([\w\-_\.]*)="([\w\-_:@\. ]*)"/;

  attrRE = /([\w\-_\.]*)=([\w\-_:@\.]*)/;

  idRE = /(#[\w\-_]*)/;

  escapeRegExp = function(str) {
    return str.replace(/([-.*+?^${}()|[\]\/\\])/g, '\\$1');
  };

  _map = function(obj, iterator, context) {
    var results;
    results = [];
    if (obj === null) {
      return results;
    }
    if (nativeMap && obj.map === nativeMap) {
      return obj.map(iterator, context);
    }
    _each(obj, function(value, index, list) {
      return results[results.length] = iterator.call(context, value, index, list);
    });
    if (obj.length === +obj.length) {
      results.length = obj.length;
    }
    return results;
  };

  _each = function(obj, iterator, context) {
    var idx, item, key, _i, _len;
    if (obj === null) {
      return;
    }
    if (nativeForEach && obj.forEach === nativeForEach) {
      return obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (idx = _i = 0, _len = obj.length; _i < _len; idx = ++_i) {
        item = obj[idx];
        if (idx in obj && iterator.call(context, item, idx, obj) === breaker) {
          return;
        }
      }
    } else {
      for (key in obj) {
        if (!__hasProp.call(obj, key)) continue;
        item = obj[key];
        if (iterator.call(context, item, key, obj) === breaker) {
          return;
        }
      }
    }
  };

  _trim = function(str, char) {
    if (str === null) {
      return "";
    }
    if (!char && nativeTrim) {
      return nativeTrim.call(str);
    }
    char = char ? escapeRegExp(char) : '\\s';
    str.replace(new RegExp('\^[' + characters + ']+|[' + characters + ']+$', 'g'), '');
    return str.replace(/^[#{char}]+|[#{char}]+$/g, '');
  };

  _isString = function(obj) {
    return typeof obj === 'string';
  };

  _isArray = nativeIsArray || function(obj) {
    return !!(obj && obj.concat && obj.unshift && !obj.callee);
  };

  _parseAttrs = function(val, as_string) {
    var full, key, value, _ref, _ref1;
    if (as_string == null) {
      as_string = true;
    }
    if (_isString(val)) {
      if (quotedAttrRE.test(val)) {
        _ref = val.match(quotedAttrRE), full = _ref[0], key = _ref[1], value = _ref[2];
        if (as_string) {
          return "" + key + "=\"" + value + "\"";
        }
        return {
          key: key,
          value: value
        };
      } else if (attrRE.test(val)) {
        _ref1 = val.match(attrRE), full = _ref1[0], key = _ref1[1], value = _ref1[2];
        if (as_string) {
          return "" + key + "=\"" + value + "\"";
        }
        return {
          key: key,
          value: value
        };
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  _checkVar = function(token) {
    if (token[0] === '@' || token[0] === ':') {
      return "this.get('" + (token.substring(1)) + "')";
    } else {
      return token;
    }
  };

  _scanner = function() {
    var delta, fc, index, start, t;
    if (this.text.length === 0) {
      return "";
    }
    start = 0;
    index = 1;
    delta = 0;
    fc = this.text.charAt(0);
    if (fc === '(' || fc === ')') {
      index = 1;
      this.balanced += fc === '(' ? 1 : -1;
    } else if (fc === '"') {
      index = this.text.search(/[^\\]"/) + 1;
      delta = 1;
    } else if (fc === "'") {
      index = this.text.search(/[^\\]'/) + 1;
      delta = 1;
    } else {
      index = this.text.search(/[ \n)]/);
    }
    if (index < 1) {
      index = this.text.length;
    }
    t = this.text.substring(start, index);
    this.text = _trim(this.text.substring(index + delta));
    return t;
  };

  _parser = function() {
    var expr, result, token;
    result = [];
    token = _scanner.apply(this);
    while (token !== ')' && token !== "") {
      expr = token === '(' ? _parser.apply(this) : token;
      result.push(expr);
      token = _scanner.apply(this);
    }
    return result;
  };

  _do_parse = function(source) {
    var code, exprs, parse_data;
    parse_data = {
      text: _trim(source),
      balanced: 0
    };
    code = ['list'];
    while (parse_data.text.length) {
      exprs = _parser.apply(parse_data);
      code = code.concat(exprs);
    }
    return [code, parse_data];
  };

  parse_source = function(source, opts) {
    var code, info, _ref;
    _ref = _do_parse(source), code = _ref[0], info = _ref[1];
    return code.pop();
  };

  if (typeof exports !== "undefined" && exports !== null) {
    exports.parse_source = parse_source;
  } else {
    this.parse_source = parse_source;
  }

  translate = function(code, opts) {
    var cname, i, id, new_code, parts, tag, token, _i, _j, _len, _len1;
    new_code = [];
    tag = code[0];
    if (idRE.test(tag)) {
      id = tag.match(idRE)[0].substring(1);
      tag = tag.replace(idRE, '');
      if (tag === '') {
        tag = 'div';
      }
    }
    if (tag.indexOf('.') >= 0) {
      if (tag === '.') {
        tag = '.';
        new_code.push(tag);
        if (id) {
          new_code.push("id=" + id);
        }
      } else {
        parts = tag.split('.');
        tag = parts.shift();
        if (tag === '') {
          tag = 'div';
        }
        new_code.push(tag);
        if (id) {
          new_code.push("id=" + id);
        }
        for (_i = 0, _len = parts.length; _i < _len; _i++) {
          cname = parts[_i];
          new_code.push("class=" + cname);
        }
      }
    } else {
      new_code.push(tag);
      if (id) {
        new_code.push("id=" + id);
      }
    }
    for (i = _j = 0, _len1 = code.length; _j < _len1; i = ++_j) {
      token = code[i];
      if (i > 0) {
        if (_isArray(token)) {
          new_code.push(translate(token, opts));
        } else {
          new_code.push(token);
        }
      }
    }
    return new_code;
  };

  if (typeof exports !== "undefined" && exports !== null) {
    exports.translate = translate;
  } else {
    this.translate = translate;
  }

  code_to_source = function(code, fn_name) {
    var att, attr_str, attrs, key, params, tag, token, value, _i, _len;
    params = [];
    attrs = {};
    tag = code.shift();
    for (_i = 0, _len = code.length; _i < _len; _i++) {
      token = code[_i];
      if (_isArray(token)) {
        params.push(code_to_source(token, fn_name));
      } else {
        if (att = _parseAttrs(token, false)) {
          key = att.key;
          value = _checkVar(att.value);
          if (attrs[key]) {
            attrs[key] += " " + value;
          } else {
            attrs[key] = value;
          }
        } else if (token[0] === '"' || token[0] === "'") {
          params.push(JSON.stringify(token.substring(1)));
        } else if (token[0] === '@' || token[0] === ":") {
          params.push(_checkVar(token));
        } else {
          params.push(JSON.stringify(token));
        }
      }
    }
    attr_str = '';
    for (key in attrs) {
      if (!__hasProp.call(attrs, key)) continue;
      value = attrs[key];
      attr_str += String(key).indexOf('this.') !== 0 ? JSON.stringify(key) : key;
      attr_str += ':';
      attr_str += String(value).indexOf('this.') !== 0 ? JSON.stringify(value) : value;
      attr_str += ",";
    }
    if (tag === 'loop' || tag === 'each') {
      return "" + fn_name + "('" + tag + "', { " + (attr_str.substr(0, attr_str.length - 1)) + " }, " + (params.shift()) + ", function(){return [" + (params.join(', ')) + "]; })";
    } else {
      return "" + fn_name + "('" + tag + "', { " + (attr_str.substr(0, attr_str.length - 1)) + " }, [" + (params.join(', ')) + "])";
    }
  };

  if (typeof exports !== "undefined" && exports !== null) {
    exports.code_to_source = code_to_source;
  } else {
    this.code_to_source = code_to_source;
  }

  compile = function(code, opts) {
    var fn_name, source;
    fn_name = 's';
    source = code_to_source(code, fn_name);
    return new Function(fn_name, "return " + source + ";");
  };

  if (typeof exports !== "undefined" && exports !== null) {
    exports.compile = compile;
  } else {
    this.compile = compile;
  }

  context = (function() {

    function context(ctx) {
      this.ctx = ctx;
    }

    context.prototype.get = function(path) {
      var data, name, nextname, parts;
      parts = path.split('.');
      name = parts.shift();
      data = this.ctx[name];
      while (parts.length && (data != null)) {
        nextname = parts.shift();
        data = data[nextname];
        if (data != null) {
          name = nextname;
        }
      }
      return data || '';
    };

    context.prototype.has = function(path) {
      return this.get(path) && this.get(path) !== '';
    };

    return context;

  })();

  if (typeof module !== "undefined" && module !== null) {
    module.exports = context;
  } else {
    this.context = context;
  }

  tag = (function() {
    var instance;

    function tag() {}

    tag.prototype["."] = function(tag, attrs, children) {
      return children.join('');
    };

    tag.prototype["+"] = tag.prototype['.'];

    tag.prototype["if"] = function(tag, attrs, children) {
      var first, _ref, _ref1;
      first = children.shift();
      if (first) {
        return (_ref = children[0]) != null ? _ref : '';
      } else {
        return (_ref1 = children[1]) != null ? _ref1 : '';
      }
    };

    tag.prototype.ifelse = tag.prototype["if"];

    tag.prototype.unless = function(tag, attrs, children) {
      var first, _ref, _ref1;
      first = children.shift();
      if (!first) {
        return (_ref = children[0]) != null ? _ref : '';
      } else {
        return (_ref1 = children[1]) != null ? _ref1 : '';
      }
    };

    tag.prototype.eq = function(tag, attrs, children) {
      return children[0] === children[1];
    };

    tag.prototype['is'] = tag.prototype.eq;

    tag.prototype['='] = tag.prototype.eq;

    tag.prototype.not = function(tag, attrs, children) {
      return !children[0];
    };

    tag.prototype['!'] = tag.prototype.eq;

    tag.prototype.loop = function(tag, attrs, items, block) {
      var children, ctx, i, item, _i, _len;
      children = [];
      ctx = new context({
        items: items
      });
      for (i = _i = 0, _len = items.length; _i < _len; i = ++_i) {
        item = items[i];
        ctx.ctx.item = item;
        ctx.ctx.index = i;
        children.push(block.call(ctx));
      }
      return children.join('');
    };

    tag.prototype.each = tag.prototype.loop;

    tag.prototype.neq = function(tag, attrs, children) {
      return children[0] !== children[1];
    };

    tag.prototype['isnt'] = tag.prototype.neq;

    tag.prototype['!='] = tag.prototype.neq;

    instance = new tag;

    tag.define = function(name, value) {
      return instance[name] = value;
    };

    tag.undefine = function(name) {
      return delete instance[name];
    };

    tag.builder = function(tag, attrs, children) {
      var attr_s, name, value;
      if (attrs == null) {
        attrs = {};
      }
      if (children == null) {
        children = [];
      }
      if (instance[tag]) {
        return instance[tag].apply(instance[tag], arguments);
      } else {
        attr_s = '';
        for (name in attrs) {
          if (!__hasProp.call(attrs, name)) continue;
          value = attrs[name];
          attr_s += " " + name + "=\"" + value + "\"";
        }
        return "<" + (tag + attr_s) + ">" + (children.join('')) + "</" + tag + ">";
      }
    };

    return tag;

  })();

  if (typeof module !== "undefined" && module !== null) {
    module.exports = tag;
  } else {
    this.tag = tag;
  }

  VERSION = '0.7.0';

  if (typeof module !== "undefined" && module !== null) {
    _ref = require('./parser'), parse_source = _ref.parse_source, translate = _ref.translate, compile = _ref.compile, _isString = _ref._isString, _isArray = _ref._isArray;
    context = require('./context');
    tag = require('./tag');
  }

  settee = function(source) {
    var code;
    code = typeof source === 'string' ? translate(parse_source(source)) : source;
    return settee.compile(code);
  };

  settee.render = function(source, ctx) {
    if (ctx == null) {
      ctx = {};
    }
    return settee(source)(ctx);
  };

  settee.to_html = settee.render;

  settee.compile = function(code, wrap) {
    var fn;
    if (wrap == null) {
      wrap = true;
    }
    fn = typeof code === 'function' ? code : compile(code);
    if (!wrap) {
      return fn;
    }
    return function(src_ctx) {
      var ctx;
      if (src_ctx == null) {
        src_ctx = {};
      }
      ctx = new context(src_ctx);
      return fn.call(ctx, tag.builder);
    };
  };

  settee.parse = function(source) {
    var code;
    code = parse_source(source);
    return translate(code);
  };

  settee.precompile = function(source) {
    var code, tmpl_fn;
    code = settee.parse(source);
    tmpl_fn = settee.compile(code, false);
    return tmpl_fn;
  };

  settee.define = function(tagName, handler) {
    var sub_template;
    if (_isString(handler || handler.length === 1)) {
      sub_template = settee(handler);
      handler = (function(sub_template) {
        return function(tagName, attrs, children) {
          var childcontent, ctx, elem, i, _i, _len;
          childcontent = children.join('');
          ctx = {
            tagName: tagName,
            attrs: attrs,
            blocks: childcontent,
            "yield": childcontent
          };
          for (i = _i = 0, _len = children.length; _i < _len; i = ++_i) {
            elem = children[i];
            ctx["block" + (i + 1)] = elem;
          }
          return sub_template(ctx);
        };
      })(sub_template);
    }
    tag.define(tagName, handler);
    return settee;
  };

  settee.undefine = function(tagName) {
    tag.undefine(tagName);
    return settee;
  };

  settee.noConflict = function() {
    if (old_settee != null) {
      global.settee = old_settee;
    } else {
      delete global.settee;
    }
    return settee;
  };

  settee.tag_builder = tag.builder;

  settee.version = VERSION;

  if (typeof module !== "undefined" && module !== null) {
    module.exports = settee;
  } else {
    this.settee = settee;
  }

}).call(this);
