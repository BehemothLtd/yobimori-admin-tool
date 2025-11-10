import { Amplify } from "aws-amplify";
import type { ResourcesConfig } from "aws-amplify";

const amplifyConfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_ADMIN_USER_POOL_ID || "",
      userPoolClientId:
        import.meta.env.VITE_COGNITO_ADMIN_USER_POOL_CLIENT_ID || "",
      identityPoolId: import.meta.env.VITE_COGNITO_ADMIN_IDENTITY_POOL_ID || "",
    },
  },
  API: {
    GraphQL: {
      endpoint: import.meta.env.VITE_GRAPHQL_ENDPOINT || "",
      defaultAuthMode: "userPool",
    },
  },
};

export function configureAmplify() {
  Amplify.configure(amplifyConfig);
}

export default amplifyConfig;
