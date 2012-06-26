# v0.4
- Performance overhaul. No longer evaluates an array on every render. Instead it compiles source into an executable function.

# v0.3
- Tweaked Settee.to_html to work in node.js and JavaScriptCore

# v0.2
- Added support for defining custom tags via `Settee.define(tag, template[, callback])`
- Added support for concatting strings (swallowing nulls)
- Cleaned up evaluation internal
- More tests!

# v0.1
- Initial release. Yay!