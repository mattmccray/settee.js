# v0.7
- Added support for simple looping
- if tag now takes three params: tester, success_list, failure_list

# v0.6
- Made it easier to use in node
- Cleaned up source
- Added precompile feature (primarily for build tools like AssemBot)
- Removed all Ruby dependencies from build, now uses standard Makefile

# v0.5.1
- Build tool updates.

# v0.5
- Now supports id shortcut `(div#main)` #=> `<div id="main"></div>`
- Added safer data retrieval - swallows bad data refs
- Added helper tags if, eq, nq

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
