module.exports = {
  extends: ["blitz"],
  rules: {
    "react/no-unknown-property": [
      2,
      {
        ignore: ["jsx", "global"],
      },
    ],
  },
}
