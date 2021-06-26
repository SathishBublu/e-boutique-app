const { expressCspHeader, INLINE, NONE, SELF } = require('express-csp-header');

module.exports = expressCspHeader({
  directives: {
    // 'default-src': [SELF],
    'script-src': [SELF, INLINE],
    // 'style-src': [SELF, 'fonts.gstatic.com', 'fonts.googleapis.com'],
    // 'img-src': ['data:', 'images.com'],
    'worker-src': [NONE],
    'block-all-mixed-content': true,
  },
});
