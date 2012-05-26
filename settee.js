
/*
Settee.js v0.2

       ________
      (        )
     ()________()
     ||________||
     '          '

An s-expression template engine with no external dependencies.

**Templates look like this:**

    (html
      (head
        (title "Hello")
        (script src="/js/my-app.js"))
      (body
        (article
          (section.main
            (p "Welcome to my site, " name "!")))
        (aside.sidebar
            (ul
              (li
                (a href="/index.html" "Home"))))))

**Use it like this:**

    var template= Settee(source, { auto_balance:true }),
        html= template({ name:"Matt" })

It's great to drink coffee while lounging on the settee!

    template= Settee source, auto_balance:yes
    html= template name:"Matt"

It can be classy too!

    template= new Settee(source, auto_balance:yes, auto_tag:yes)
    html= template.render name:"Matt"

## Method Signature

As function:

    Settee( source:string [, options:object] )

Returns a #template function:

    template( context:object, helpers:object )

As class:

    new Settee( source:string [, options:object] )

Returns a settee #object:

    object.render( context:object, helpers:object )

## Options

* auto_balance:Bool  -- ignore imbalanced parens (default:true)
* auto_tag:Bool      -- unknown actions create tags (default:false)
*/


(function() {
  var ArrayProto, Settee, StringProto, apply_to, attrRE, breaker, can_apply_log, escapeRegExp, get_env, has_console, has_env, make_proc, nativeForEach, nativeIsArray, nativeMap, nativeTrim, quotedAttrRE, root, slice, tagName, _, _do_evaluate, _do_parse, _evaluate, _i, _len, _parser, _ref, _scanner,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty;

  Settee = (function() {

    Settee.options = {
      auto_balance: true,
      auto_tag: false,
      extended: true
    };

    Settee.parse = function(source, opts) {
      var code, error, info, _ref;
      opts = _.defaults(opts || {}, Settee.options);
      _ref = _do_parse(source), code = _ref[0], info = _ref[1];
      error = info.balanced > 0 ? "The expression is not balanced. Add " + info.balanced + " parentheses." : info.balanced < 0 ? "The expression is not balanced. Remove " + (Math.abs(info.balanced)) + " parentheses." : false;
      if (error && !opts.auto_balance) {
        throw error;
      }
      return code;
    };

    Settee.evaluate = function(code, env, opts) {
      var results;
      if (env == null) {
        env = {};
      }
      results = _do_evaluate(code, env, opts);
      return results.pop();
    };

    Settee.to_html = function(source, env, opts) {
      if (env == null) {
        env = {};
      }
      return Settee(source, opts)(env);
    };

    Settee.define = function(tag, template, callback) {
      var src_nodes, _base;
      if (callback == null) {
        callback = false;
      }
      src_nodes = Settee.parse(template).pop();
      if (Settee.tags[tag]) {
        _.log("Settee: Warning, overwriting tag " + tag);
      }
      Settee.tags[tag] = function(expr, env, _evaluate) {
        var atom, attrs, i, newenv, results, _i, _len;
        if (callback) {
          callback(expr, env, _evaluate);
        }
        attrs = Settee._.extractAttrs(expr);
        newenv = {
          _parent: env,
          blocks: ""
        };
        for (i = _i = 0, _len = expr.length; _i < _len; i = ++_i) {
          atom = expr[i];
          if (i > 0) {
            newenv.blocks += newenv["block" + i] = Settee._.tag_builder(atom, env, _evaluate);
          }
        }
        src_nodes.splice.apply(src_nodes, [1, 0].concat(__slice.call(attrs)));
        results = Settee._.tag_builder(src_nodes, newenv, _evaluate);
        src_nodes.splice(1, attrs.length);
        return results;
      };
      (_base = Settee.define)._tags || (_base._tags = []);
      Settee.define._tags.push(tag);
      return this;
    };

    Settee.undefine = function(tag) {
      var tagname, _i, _len, _ref;
      if (tag) {
        return delete Settee.tags[tag];
      } else {
        _ref = Settee.define._tags;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          tagname = _ref[_i];
          delete Settee.tags[tagname];
        }
        return Settee.define._tags = [];
      }
    };

    function Settee(source, opts) {
      var code;
      opts = _.defaults(opts || {}, Settee.options);
      code = Settee.parse(source, opts);
      if (this === root) {
        return function(ctx) {
          if (ctx == null) {
            ctx = {};
          }
          return Settee.evaluate(code, ctx, opts);
        };
      } else {
        this.source = source;
        this.opts = opts;
        this.code = code;
      }
    }

    Settee.prototype.render = function(ctx) {
      if (ctx == null) {
        ctx = {};
      }
      return Settee.evaluate(this.code, ctx, this.opts);
    };

    return Settee;

  })();

  ((typeof module !== "undefined" && module !== null ? module.exports : void 0) || window).Settee = Settee;

  root = this;

  has_console = (function() {
    try {
      if (console && console.log) {
        return true;
      } else {
        return false;
      }
    } catch (ex) {
      return false;
    }
  })();

  can_apply_log = (function() {
    try {
      console.log.apply(console, []);
      return true;
    } catch (ex) {
      return false;
    }
  })();

  breaker = {};

  ArrayProto = Array.prototype;

  StringProto = String.prototype;

  slice = ArrayProto.slice;

  nativeForEach = ArrayProto.forEach;

  nativeMap = ArrayProto.map;

  nativeIsArray = Array.isArray;

  nativeTrim = StringProto.trim;

  escapeRegExp = function(str) {
    return str.replace(/([-.*+?^${}()|[\]\/\\])/g, '\\$1');
  };

  quotedAttrRE = /([\w]*)="([\w ]*)"/;

  attrRE = /([\w]*)=([\w]*)/;

  Settee._ = _ = {
    map: function(obj, iterator, context) {
      var results;
      results = [];
      if (obj === null) {
        return results;
      }
      if (nativeMap && obj.map === nativeMap) {
        return obj.map(iterator, context);
      }
      _.each(obj, function(value, index, list) {
        return results[results.length] = iterator.call(context, value, index, list);
      });
      if (obj.length === +obj.length) {
        results.length = obj.length;
      }
      return results;
    },
    each: function(obj, iterator, context) {
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
    },
    breakLoop: function() {
      throw breaker;
    },
    extend: function(obj) {
      _.each(slice.call(arguments, 1), function(source) {
        var prop, value, _results;
        _results = [];
        for (prop in source) {
          value = source[prop];
          _results.push(obj[prop] = value);
        }
        return _results;
      });
      return obj;
    },
    defaults: function(obj) {
      _.each(slice.call(arguments, 1), function(source) {
        var prop, value, _results;
        _results = [];
        for (prop in source) {
          value = source[prop];
          if (!obj[prop]) {
            _results.push(obj[prop] = value);
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      });
      return obj;
    },
    trim: function(str, char) {
      if (str === null) {
        return "";
      }
      if (!char && nativeTrim) {
        return nativeTrim.call(str);
      }
      char = char ? escapeRegExp(char) : '\\s';
      str.replace(new RegExp('\^[' + characters + ']+|[' + characters + ']+$', 'g'), '');
      return str.replace(/^[#{char}]+|[#{char}]+$/g, '');
    },
    isString: function(obj) {
      return !!(obj === '' || (obj && obj.charCodeAt && obj.substr));
    },
    isArray: nativeIsArray || function(obj) {
      return !!(obj && obj.concat && obj.unshift && !obj.callee);
    },
    isFunction: function(obj) {
      return !!(obj && obj.constructor && obj.call && obj.apply);
    },
    isUndefined: function(obj) {
      return obj === void 0;
    },
    parseAttrs: function(val, as_string) {
      var full, key, value, _ref, _ref1;
      if (as_string == null) {
        as_string = true;
      }
      if (_.isString(val)) {
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
    },
    extractAttrs: function(expr, parse, recurse) {
      var atom, att, atts, i, idx, _i, _j, _len, _len1, _ref;
      if (parse == null) {
        parse = false;
      }
      if (recurse == null) {
        recurse = false;
      }
      atts = parse ? {} : [];
      idx = [];
      for (i = _i = 0, _len = expr.length; _i < _len; i = ++_i) {
        atom = expr[i];
        if ((att = _.parseAttrs(atom, !parse))) {
          if (parse) {
            atts[att.key] = att.value;
          } else {
            atts.push(att);
          }
          idx.push(i);
        }
      }
      _ref = idx.reverse();
      for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
        i = _ref[_j];
        expr.splice(i, 1);
      }
      return atts;
    },
    replaceArrayVal: function(arr, key, value, all) {
      var i, idx, item, items, _i, _j, _len, _len1;
      if (all == null) {
        all = false;
      }
      items = arr;
      idx = [];
      for (i = _i = 0, _len = arr.length; _i < _len; i = ++_i) {
        item = arr[i];
        if (item === key) {
          idx.push(i);
          if (!all) {
            break;
          }
        } else if (_.isArray(item)) {
          _.replaceArrayVal(item, key, value, all);
        }
      }
      for (_j = 0, _len1 = idx.length; _j < _len1; _j++) {
        i = idx[_j];
        arr.splice(i, 1, value);
      }
      return arr;
    },
    tag_builder: function(expr, env, evaluate) {
      var attr, attrs, body, exp, key, parts, tag, _i, _len, _ref;
      body = "";
      attrs = "";
      tag = expr[0];
      if ((parts = tag.split('.')).length > 1) {
        tag = parts.shift() || "div";
        attrs += " class=\"" + (parts.join(' ')) + "\"";
      }
      _ref = expr.slice(1);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        exp = _ref[_i];
        if (attr = _.parseAttrs(exp)) {
          attrs += " " + attr;
        } else {
          if (exp[0] === '@') {
            key = exp[1][0] === '"' ? evaluate(exp[1], env) : exp[1];
            attr = " " + key + "=\"" + (evaluate(exp[2], env)) + "\"";
            attrs += attr;
          } else {
            body += evaluate(exp, env);
          }
        }
      }
      return "<" + tag + attrs + ">" + body + "</" + tag + ">";
    },
    log: (function() {
      if (has_console) {
        if (can_apply_log) {
          return function() {
            var args;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            return console.log.apply(console, args);
          };
        } else {
          return function() {
            var arg, args, _i, _len, _results;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            _results = [];
            for (_i = 0, _len = args.length; _i < _len; _i++) {
              arg = args[_i];
              _results.push(console.log(arg));
            }
            return _results;
          };
        }
      } else {
        return function() {};
      }
    })()
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
    } else {
      index = this.text.search(/[ \n)]/);
    }
    if (index < 1) {
      index = this.text.length;
    }
    t = this.text.substring(start, index);
    this.text = _.trim(this.text.substring(index + delta));
    return t;
  };

  _do_parse = function(source) {
    var code, exprs, parse_data;
    parse_data = {
      text: _.trim(source),
      balanced: 0
    };
    code = ['list'];
    while (parse_data.text.length) {
      exprs = _parser.apply(parse_data);
      code = code.concat(exprs);
    }
    return [code, parse_data];
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

  /*
  
  OPERATIONS:
    Arguments are the evaluated list atoms
  
  FUNCTIONS:
    Arguments are unevaluated list nodes
  */


  Settee.op = {
    first: function() {
      var l;
      l = arguments[0];
      if (!l || !l.length) {
        return null;
      }
      return l[0];
    },
    rest: function() {
      var l;
      l = arguments[0];
      if (!l || !l.length) {
        return [];
      }
      return l.slice(1);
    },
    cons: function() {
      var a;
      a = arguments[1];
      if (!a) {
        return [arguments[0]];
      }
      a.unshift(arguments[0]);
      return a;
    },
    not: function() {
      return !arguments[0];
    },
    and: function() {
      var arg, _i, _len;
      for (_i = 0, _len = arguments.length; _i < _len; _i++) {
        arg = arguments[_i];
        if (!arg) {
          return false;
        }
      }
      return true;
    },
    or: function() {
      var arg, _i, _len;
      for (_i = 0, _len = arguments.length; _i < _len; _i++) {
        arg = arguments[_i];
        if (arg) {
          return true;
        }
      }
      return false;
    },
    "<=": function(x, y) {
      return x <= y;
    },
    "<": function(x, y) {
      return x < y;
    },
    ">=": function(x, y) {
      return x >= y;
    },
    ">": function(x, y) {
      return x > y;
    },
    "=": function(x, y) {
      return x === y;
    },
    "eq": function(x, y) {
      return x === y;
    },
    "neq": function(x, y) {
      return x !== y;
    },
    "+": function() {
      var res;
      res = isNaN(arguments[0]) ? "" : 0;
      _.each(arguments, function(x, i) {
        return res += x;
      });
      return res;
    },
    "-": function() {
      var res;
      res = arguments[0] * 2;
      _.each(arguments, function(x, i) {
        return res -= x;
      });
      return res;
    },
    "*": function() {
      var res;
      res = 1;
      _.each(arguments, function(x, i) {
        return res *= x;
      });
      return res;
    },
    "/": function() {
      var res;
      res = arguments[0] * arguments[0];
      _.each(arguments, function(x, i) {
        return res /= x;
      });
      return res;
    },
    ".": function() {
      var res;
      res = "";
      _.each(arguments, function(x, i) {
        if (!(x === null || _.isUndefined(x))) {
          return res += x;
        } else {
          return "";
        }
      });
      return res;
    }
  };

  Settee.op.car = Settee.op.first;

  Settee.op.cdr = Settee.op.rest;

  Settee.op["?"] = Settee.op.and;

  Settee.fn = {
    print_r: function(expr, env, evaluate) {
      return Settee._.log(expr);
    },
    '"': function(expr, env, _evaluate) {
      var v;
      v = expr.slice(1);
      return v.replace(/[\\]"/g, '"');
    },
    ':': function(expr, env, _evaluate) {
      var key, val;
      key = expr.slice(1);
      val = get_env(key, env);
      return val || "";
    },
    "if": function(expr, env, _evaluate) {
      if (_evaluate(expr[1], env)) {
        return _evaluate(expr[2], env);
      }
      if (expr.length <= 3) {
        return "";
      }
      _.each(expr.slice(2, expr[expr.length - 2]), function(x, i) {
        return _evaluate(x, env);
      });
      return _evaluate(expr[expr.length - 1], env);
    },
    "case": function(expr, env, _evaluate) {
      var cases, rule, _i, _len;
      cases = expr.slice(1, expr.length);
      for (_i = 0, _len = cases.length; _i < _len; _i++) {
        rule = cases[_i];
        if (_evaluate(rule[0], env)) {
          return _evaluate(rule[rule.length - 1], env);
        }
      }
      return null;
    },
    "list": function(expr, env, _evaluate) {
      return _.map(expr.slice(1), function(x) {
        var v;
        v = _evaluate(x, env);
        if (_.isArray(v)) {
          return Array(v);
        }
        return v;
      });
    },
    'quote': function(expr, env, _evaluate) {
      var v;
      v = expr[1];
      if (v[0] === '"') {
        return v.slice(1).replace(/[\\]"/g, '"');
      }
      return v;
    },
    "set": function(expr, env, _evaluate) {
      var variable;
      variable = env[expr[1]] = _evaluate(expr[2], env);
      return variable;
    },
    'each': function(expr, env, _evaluate) {
      var data, newenv, res, source, _i, _len, _ref;
      source = expr[1][0];
      res = [];
      _ref = _evaluate(source, env);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        data = _ref[_i];
        newenv = data;
        newenv['_parent'] = env;
        res.push(_evaluate(expr[2], newenv));
      }
      return res.join('');
    },
    'lambda': function(expr, env, _evaluate) {
      return make_proc(expr[1], expr.slice(2), env);
    },
    'def': function(expr, env, _evaluate) {
      return env[expr[1]] = make_proc(expr[2], expr.slice(3), env);
    },
    'js': function(expr, env, _evaluate) {
      return eval(expr[1]);
    }
  };

  Settee.fn.cond = Settee;

  Settee.fn.setq = Settee.fn['set!'] = Settee;

  Settee.fn.defun = Settee;

  Settee.tags = {};

  _ref = "a abbr address area article aside audio b base bdi bdo blockquote body br button canvas caption cite code col colgroup command data datalist dd del details dfn div dl dt em embed eventsource fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins kbd keygen label legend li link mark map menu meta meter nav noscript object ol optgroup option output p param pre progress q ruby rp rt s samp script section select small source span strong style sub summary sup table tbody td textarea tfoot th thead time title tr track u ul var video wbr".split(' ');
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    tagName = _ref[_i];
    Settee.tags[tagName] = _.tag_builder;
  }

  get_env = function(expr, env) {
    var obj, part, parts, _j, _len1;
    if (typeof expr !== "string") {
      return false;
    }
    if (expr in env) {
      return env[expr];
    }
    if ((parts = expr.split('.')).length > 1) {
      if (parts[0] in env) {
        obj = env;
        for (_j = 0, _len1 = parts.length; _j < _len1; _j++) {
          part = parts[_j];
          obj = obj[part];
        }
        if (obj !== env) {
          return obj;
        }
      }
    }
    if ('_parent' in env) {
      return get_env(expr, env['_parent']);
    }
    return null;
  };

  has_env = function(expr, env) {
    var obj, part, parts, _j, _len1;
    if (typeof expr !== "string") {
      return false;
    }
    if (expr in env) {
      return true;
    }
    if ((parts = expr.split('.')).length > 1) {
      if (parts[0] in env) {
        obj = env;
        for (_j = 0, _len1 = parts.length; _j < _len1; _j++) {
          part = parts[_j];
          obj = obj[part];
        }
        if (obj !== env) {
          return true;
        }
      }
    }
    if ('_parent' in env) {
      return has_env(expr, env['_parent']);
    }
    return false;
  };

  apply_to = function(proc, args) {
    if (_.isFunction(proc)) {
      return proc.apply(this, args);
    }
    throw "Procedure " + proc + " is not defined";
  };

  make_proc = function(args, body, env) {
    return function() {
      var newenv, params;
      params = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      newenv = {};
      newenv['_parent'] = env;
      _.each(args, function(x, i) {
        return newenv[x] = params[i];
      });
      _.each(body.slice(0, body.length - 1), function(x, i) {
        return _evaluate(x, newenv);
      });
      return _evaluate(body[body.length - 1], newenv);
    };
  };

  _do_evaluate = function(code, env, opts) {
    if (env == null) {
      env = {};
    }
    if (opts == null) {
      opts = {};
    }
    env['@auto_tag'] = opts.auto_tag ? true : false;
    return _evaluate(code, env);
  };

  _evaluate = function(expr, env) {
    var ev, ez, ge, parts;
    ez = expr[0];
    if (expr === "nil" || expr === "null" || expr === null) {
      return null;
    }
    if (!isNaN(expr)) {
      return Number(expr);
    }
    if ((ge = get_env(expr, env))) {
      return ge;
    }
    if (ez in Settee.fn) {
      return Settee.fn[ez](expr, env, _evaluate);
    }
    if (expr in Settee.op) {
      return Settee.op[expr];
    }
    if (ez in Settee.tags) {
      return Settee.tags[ez](expr, env, _evaluate);
    } else if (typeof ez === 'string' && (parts = ez.split('.')).length > 1) {
      if (parts[0] in Settee.tags) {
        return Settee.tags[parts[0]](expr, env, _evaluate);
      }
    }
    if (get_env('@auto_tag', env)) {
      ev = function(src) {
        return _evaluate(src, env);
      };
      return _.tag_builder(expr, ev);
    }
    if (_.isArray(expr)) {
      return apply_to(_evaluate(ez, env), _.map(expr.slice(1), function(x, i) {
        var v;
        v = _evaluate(x, env);
        if (_.isArray(v)) {
          return Array(v);
        } else {
          return v;
        }
      }));
    }
    throw "" + expr + " is not defined.";
  };

}).call(this);
