"use client";
import { ApolloClient, InMemoryCache, ApolloProvider, split, HttpLink } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";

export const AppoloProviderContext = ({ children }) => {
  const httpLink = new HttpLink({
    uri: "http://localhost:8000/graphql",
  });

  const wsLink = new GraphQLWsLink(
    createClient({
      url: "ws://localhost:8000/graphql",
    })
  );

  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return definition.kind === "OperationDefinition" && definition.operation === "subscription";
    },
    wsLink,
    httpLink
  );

  const client = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
    defaultOptions: {
      mutate: {
        errorPolicy: "all",
      },
    },
  });

  // client
  //   .query({
  //     query: gql`
  //       query GetPrefrenceUser {
  //         getUserPreference {
  //           background_color
  //         }
  //       }
  //     `,
  //   })
  //   .then((result) => console.log(result));

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
