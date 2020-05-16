module.exports = {
  extends: 'erb/typescript',
  rules: {
    // A temporary hack related to IDE not resolving correct package.json
    'import/no-extraneous-dependencies': 'off',
    'react/jsx-props-no-spreading': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/no-noninteractive-element-interactions': 'off',
    'func-names': 'off',
    'prettier/prettier': 'off',
    'no-alert': 'off',
    'object-shorthand': 'off',
    'lines-between-class-members': 'off',
    '@typescript-eslint/no-this-alias': 'off',
    'no-new': 'off',
    'no-await-in-loop': 'off',
    'react/jsx-one-expression-per-line': 'off',
    'jsx-a11y/mouse-events-have-key-events': 'off',
    'no-shadow': 'off',
    'no-useless-escape': 'off',
    'react/jsx-curly-newline': 'off',
    'no-nested-ternary': 'off',
    'react/jsx-tag-spacing': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'jsx-a11y/label-has-associated-control': 'off',
    'compat/compat': 'off',
    'import/prefer-default-export': 'off',
    'prefer-destructuring': 'off',
    'react/jsx-wrap-multilines': 'off',
    'jsx-a11y/anchor-is-valid': 'off'
  },
  settings: {
    'import/resolver': {
      // See https://github.com/benmosher/eslint-plugin-import/issues/1396#issuecomment-575727774 for line below
      node: {},
      webpack: {
        config: require.resolve('./configs/webpack.config.eslint.js')
      }
    }
  }
};
