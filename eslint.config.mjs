import hmppsConfig from '@ministryofjustice/eslint-config-hmpps'

export default [
  ...hmppsConfig({
    extraPathsAllowingDevDependencies: ['**/__testutils/**'],
  }),
  {
    rules: {
      'no-shadow': 0,
      'import/no-named-as-default': 0,
      'max-classes-per-file': 0,
      'import/no-cycle': 0,
      'no-undef': 0,
      'no-plusplus': 0,
      'no-restricted-globals': 0,
      'consistent-return': 0,
      'no-unused-expressions': 0,
      'no-return-assign': 0,
      'no-sequences': 0,
      'no-param-reassign': 0,
      'no-return-assign': 0,
      'no-var': 0,
      'vars-on-top': 0,
      'no-dupe-keys': 0,
      'func-names': 0,
      '@typescript-eslint/no-unused-vars': 0,
      '@typescript-eslint/no-shadow': 0,
      '@typescript-eslint/no-empty-object-type': 0,
      'no-cond-assign': 0,
      'no-nested-ternary': 0,
      'import/no-unresolved': 0,
      'import/extensions': 0,
      eqeqeq: 0,
      'no-new-func': 0,
      'block-scoped-var': 0,
    },
  },
]
