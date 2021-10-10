module.exports = {
  "presets": [
    "@babel/preset-typescript",
    [
      "@babel/preset-env",
      {
        "targets": {
          "node": "14.15.0"
        }
      }
    ]
  ],
  "plugins": [
    [
      "module-resolver",
      {
        "root": ["./src"],
        "alias": {
          "~": "./src"
        }
      }
    ],
    [
      "transform-define",
      {
        "process.env.NODE_ENV": process.env.NODE_ENV,
      }
    ],
    "minify-dead-code-elimination"
  ]
}
