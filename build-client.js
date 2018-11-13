"use strict";

const fs = require("fs-extra");
const path = require("path");
const cleancss = require("clean-css");
const htmlminifier = require("html-minifier");
const handlebars = require("handlebars");
const babel = require("@babel/core");

const {
  BUILD_CLIENT,
  BUILD_DATA_JOBS,

  CLIENT,
  CLIENT_TEMPLATE,

  ENV_ANALYTICS,

  FIELDS,
} = require("./const");

const generate_analytics = tracking_id => `
  <script async src="https://www.googletagmanager.com/gtag/js?id=${tracking_id}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    
    function gtag () {
      dataLayer.push(arguments);
    }
    
    gtag("js", new Date());
    
    gtag("config", "${tracking_id}");
  </script>
`;


const concat_static_source_files_of_type = async (ext) =>
  fs.readdir(CLIENT)
    .then(files => files.filter(f => new RegExp(`\\.${ext}$`, "i").test(f)))
    .then(files => Promise.all(files.map(f => fs.readFile(path.join(CLIENT, f), "utf8"))))
    .then(files => files.reduce((js, f) => js + f, ""));

const transpile_js = js => babel.transformAsync(js, {
  plugins: [
    ["@babel/plugin-transform-arrow-functions"],
    ["@babel/plugin-transform-block-scoping"],
    ["@babel/plugin-transform-shorthand-properties"],
    ["@babel/plugin-transform-template-literals", {
      loose: true,
    }],
    ["@babel/plugin-transform-parameters", {
      loose: true,
    }],
    ["@babel/plugin-transform-destructuring", {
      loose: true,
      useBuiltIns: true,
    }],
    ["@babel/plugin-proposal-object-rest-spread", {
      loose: true,
      useBuiltIns: true,
    }],
    ["@babel/plugin-transform-spread", {
      loose: true,
    }],
    ["@babel/plugin-transform-for-of", {
      assumeArray: true,
    }],
  ],
}).then(res => res.code);

const minify_js = js => {
  const {error, warnings, code} = uglifyes.minify(js, {
    mangle: true,
    compress: {
      booleans: true,
      collapse_vars: true,
      comparisons: true,
      conditionals: true,
      dead_code: true,
      drop_console: true,
      drop_debugger: true,
      evaluate: true,
      hoist_funs: true,
      hoist_vars: false,
      if_return: true,
      join_vars: true,
      keep_fargs: false,
      keep_fnames: false,
      loops: true,
      negate_iife: true,
      properties: true,
      reduce_vars: true,
      sequences: true,
      unsafe: true,
      unused: true,
    },
    warnings: true,
  });
  if (error) {
    throw error;
  }
  if (warnings) {
    warnings.forEach(console.log);
  }
  return code;
};

const minify_html = html => htmlminifier.minify(html, {
  collapseBooleanAttributes: true,
  collapseInlineTagWhitespace: true,
  collapseWhitespace: true,
  decodeEntities: true,
  ignoreCustomFragments: [/{{{?[^{}]+}}}?/],
  includeAutoGeneratedTags: true,
  keepClosingSlash: false,
  minifyCSS: false,
  minifyJS: false,
  minifyURLs: false,
  preserveLineBreaks: false,
  preventAttributesEscaping: false,
  processConditionalComments: false,
  removeAttributeQuotes: true,
  removeComments: true,
  removeEmptyAttributes: false,
  removeEmptyElements: false,
  removeOptionalTags: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  removeTagWhitespace: true,
  sortAttributes: true,
  sortClassName: true,
  useShortDoctype: true,
});

const minify_css = css => new cleancss({
  returnPromise: true,
}).minify(css)
  .then(({styles}) => styles);

Promise.all([
  concat_static_source_files_of_type("js")
    .then(transpile_js)
    .then(minify_js),

  concat_static_source_files_of_type("css")
    .then(minify_css),

  fs.readFile(CLIENT_TEMPLATE, "utf8")
    .then(minify_html),

  fs.readJSON(BUILD_DATA_JOBS)
    .then(d => d.length),
])
  .then(([js, css, html, jobsCount]) => handlebars.compile(html)({
    analytics: ENV_ANALYTICS && generate_analytics(ENV_ANALYTICS),
    jobsCount: jobsCount,
    fields: FIELDS,
    script: js,
    style: css,
  }))
  .then(html => fs.writeFile(BUILD_CLIENT, html))
;
