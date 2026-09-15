module.exports = {
  ci: {
    collect: {
      // SPA fallback so /login and /register resolve to index.html
      startServerCommand: 'npx --yes serve dist/demo-weather-app/browser -s -l 8080',
      url: ['http://127.0.0.1:8080/', 'http://127.0.0.1:8080/login', 'http://127.0.0.1:8080/register'],
      numberOfRuns: 1,
      settings: {
        preset: 'desktop',
        onlyCategories: ['performance', 'accessibility', 'best-practices'],
      },
    },
    assert: {
      assertions: {
        // Soft demo thresholds — show the gate without flaky red builds
        'categories:performance': ['warn', { minScore: 0.5 }],
        'categories:accessibility': ['warn', { minScore: 0.7 }],
        'categories:best-practices': ['warn', { minScore: 0.7 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 4000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 5000 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.25 }],
        'total-blocking-time': ['warn', { maxNumericValue: 600 }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: './lighthouse-report',
    },
  },
};
