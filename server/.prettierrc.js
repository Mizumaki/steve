module.exports = {
  printWidth: 120, // If there are more characters than this, the line will be automatically broken
  tabWidth: 2, // Tab means 2 spaces
  useTabs: false, // Do not use Tabs for religious reasons
  semi: true,
  singleQuote: true,
  jsxSingleQuote: true,
  trailingComma: 'es5', // https://prettier.io/docs/en/options.html#trailing-commas
  bracketSpacing: true, // If true => `{ foo: bar }`. When false => `{foo:bar}`
  jsxBracketSameLine: true, // https://prettier.io/docs/en/options.html#jsx-brackets
  arrowParens: 'avoid', // If avoid => `const func = x => {}`. When always => `const func = (x) => {}`
  endOfLine: 'auto', // https://prettier.io/docs/en/options.html#end-of-line
};
