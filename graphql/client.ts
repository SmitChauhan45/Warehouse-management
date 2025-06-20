import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  ApolloLink,
} from "@apollo/client";

// Create the http link
const httpLink = createHttpLink({
  uri: "http://localhost:5000/graphql", // Replace with your GraphQL endpoint
});

// Middleware for adding the auth token
const authMiddleware = new ApolloLink((operation, forward) => {
  // Get the authentication token from localStorage
  const token = localStorage.getItem("token");

  // Add the token to the headers
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  }));

  return forward(operation);
});

// Create the Apollo client
const client = new ApolloClient({
  link: authMiddleware.concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;
