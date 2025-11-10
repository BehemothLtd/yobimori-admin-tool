import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: ["graphql/schema.graphql"],
  documents: ["src/gql/queries/**/*.graphql"],
  config: {
    scalars: {
      AWSTimestamp: "number",
    },
  },
  generates: {
    "src/gql/generated/": {
      preset: "client",
      presetConfig: {
        fragmentMasking: false,
      },
      config: {
        enumsAsTypes: true,
        useTypeImports: true,
      },
    },
  },
};

export default config;
