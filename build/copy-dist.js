const { cpSync } = require('fs');

cpSync('packages/reference/dist', 'dist/reference', {
  recursive: true,
});