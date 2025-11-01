// Flat ESLint config for Next.js 16 + TypeScript
import next from 'eslint-config-next'

/** @type {import('eslint').Linter.FlatConfig[]} */
const config = [
  ...next,
  {
    ignores: ['.next/**', 'node_modules/**']
  }
]

export default config
