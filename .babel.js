module.exports = {
  presets: [
    ["@babel/preset-env", {
      useBuiltIns: "usage",
      corejs: "3",
      modules: false,
      target: {
        browsers: "last 2 versions, not ie <= 9"
      }
    }]
  ],
  plugins: [
    ["@babel/plugin-transform-runtime", {
      helpers: false
    }]
  ]
}