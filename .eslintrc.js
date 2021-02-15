module.exports = {
  "env": {
    "es2021": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": 12,
    "sourceType": "module",
    "tsconfigRootDir": __dirname,
    "project": "./tsconfig.json",
  },
  "plugins": [
    "react",
    "react-native",
    "@typescript-eslint"
  ],
  "rules": {
    "indent": ["warn", 2],
    "linebreak-style": ["error", "unix"],
    "quotes": ["warn", "single", { "allowTemplateLiterals": true }],
    "semi": ["warn", "always"],
    "comma-spacing": ["warn"],
    "object-curly-spacing": ["warn", "always"], // Spacing { beforeAndAfter }

    // "no-prototype-builtins": "off", // Dont allow obj.hasOwnProperty https://eslint.org/docs/rules/no-prototype-builtins

    "react/prop-types": "off",
    "react/display-name": "off",

    "@typescript-eslint/ban-ts-comment": "off", // Else would complain about // @ts-ignore in .js files. If I didn't need this ts-comment, this could be removed
    "@typescript-eslint/no-inferrable-types": "off", // ?
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off", // ?
    "@typescript-eslint/no-non-null-assertion": "off", // ?

    // TS doesn't allow "== false" yet (4.1.2), so, this rule isn't good enough to test for falsy values.
    // // "@typescript-eslint/strict-boolean-expressions": ["warn", {
    // //   allowNullableBoolean: true,
    // // }],

    "@typescript-eslint/no-empty-interface": "off",
    "@typescript-eslint/no-unsafe-assignment": "off", // ?


    "@typescript-eslint/no-floating-promises": "off",

    // This wasn't allowing different data types in `templates string`. Why the fuck not?
    "@typescript-eslint/restrict-template-expressions": "off",

    // wasn't allowing eg setTimeout(async () =>...). Any good reason to keep it on? https://stackoverflow.com/a/63488201/10247962
    "@typescript-eslint/no-misused-promises": "off",

    // Allow acessing props of any type var. Useful for if ((X as any).Y), to check if it exists.
    "@typescript-eslint/no-unsafe-member-access": "off",

    // To allow the return as any. I know what I am doing!
    "@typescript-eslint/no-unsafe-return": "off",

    // To allow calling new (Intl as any).RelativeTimeFormat(...), as TS doesn't know it yet.
    "@typescript-eslint/no-unsafe-call": "off",

    // Wasn't simply allowing `const a = x.y.functionA`.
    "@typescript-eslint/unbound-method": "off"
  }
};