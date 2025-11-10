import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
  ApolloLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { fetchAuthSession } from "aws-amplify/auth";

// HTTP connection to the API
const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_ENDPOINT,
});

// Auth link to add JWT token to headers
const authLink = setContext(async (_, { headers }) => {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();

    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",
      },
    };
  } catch (error) {
    console.error("Error getting auth session:", error);
    return { headers };
  }
});

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }: any) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }: any) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
        extensions
      );

      // Handle 401 errors
      if (extensions?.code === "UNAUTHORIZED") {
        // Redirect to login or refresh token
        window.location.href = "/";
      }
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

// Remove extensions link to avoid sending clientLibrary metadata
const removeExtensionsLink = new ApolloLink((operation, forward) => {
  // Remove extensions from operation
  if (operation.extensions) {
    delete operation.extensions.clientLibrary;
  }

  return forward(operation);
});

// Create Apollo Client
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, removeExtensionsLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "network-only",
    },
    query: {
      fetchPolicy: "network-only",
    },
  },
});

export default apolloClient;
