// lib/client.ts
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { GQL_ENDPOINT } from "@/constants/config";
// change the schema's uri with our graphql server end point
export const getClient = () => {
  return new ApolloClient({
    uri: GQL_ENDPOINT,
    cache: new InMemoryCache(),
    defaultOptions: {
      query: {
        fetchPolicy: "no-cache",
        errorPolicy: "all",
      },
    },
  });
};
