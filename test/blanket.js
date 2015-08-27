var
  path  = require('path'),
  src   = path.join(__dirname, '..', 'src');

// Only files that match the pattern will be instrumented
require('blanket')({
  pattern: src
});

