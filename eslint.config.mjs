import hmppsConfig from '@ministryofjustice/eslint-config-hmpps'

export default [
  ...hmppsConfig({
    extraPathsAllowingDevDependencies: ['**/__testutils/**', '.allowed-scripts.mjs'],
    extraIgnorePaths: ['assets/**'],
  }),
  {
    rules: {
      'no-param-reassign': 'off',
      '@typescript-eslint/no-shadow': 'off',
      'import/no-cycle': 'off',
      'max-classes-per-file': 'off',
    },
  },
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: 'res|next|^err|_',
          ignoreRestSiblings: true,
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
]
