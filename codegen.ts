import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'http://localhost:8008/api/graphql',
  documents: ['src/**/*.graphql'],
  generates: {
    './src/lib/graphql/generated.ts': { // Output file path
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-graphql-request',
      ],
      config: {
        useTypeImports: true
      }
    },
  },
};

export default config;
