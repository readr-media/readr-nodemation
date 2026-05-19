import type { OperationVariables } from "@apollo/client";
import type { TypedDocumentNode } from "@graphql-typed-document-node/core";

import { getClient } from "@/lib/client";
import { logServerSideError, type TraceObject } from "./log";

export default async function queryGraphQL<
  TResult,
  TVariables extends OperationVariables,
>(
  query: TypedDocumentNode<TResult, TVariables>,
  variables?: TVariables,
  traceObject?: TraceObject,
  errorMessage?: string,
): Promise<TResult | null> {
  try {
    const queryOptions = variables === undefined ? { query } : { query, variables };
    const { data, errors: gqlErrors } = await getClient().query(queryOptions);

    if (gqlErrors && gqlErrors.length > 0) {
      const firstError = gqlErrors[0];
      throw new Error(`[GraphQL error]: ${firstError?.message ?? "Unknown error"}`);
    }
    return data;
  } catch (error) {
    const fallbackErrorMessage = `Fetch GraphQL failed, info: ${JSON.stringify({
      query,
      variables,
    })}`;

    logServerSideError(
      error,
      errorMessage || fallbackErrorMessage,
      traceObject,
    );
    return null;
  }
}

export async function mutateGraphQL<
  TResult,
  TVariables extends OperationVariables,
>(
  mutation: TypedDocumentNode<TResult, TVariables>,
  variables?: TVariables,
  traceObject?: TraceObject,
  errorMessage?: string,
): Promise<TResult | null> {
  try {
    const mutationOptions =
      variables === undefined ? { mutation } : { mutation, variables };
    const { data, errors: gqlErrors } = await getClient().mutate(mutationOptions);
    if (gqlErrors && gqlErrors.length > 0) {
      const firstError = gqlErrors[0];
      throw new Error(`[GraphQL error]: ${firstError?.message ?? "Unknown error"}`);
    }
    return data || null;
  } catch (error) {
    const fallbackErrorMessage = `Upload GraphQL failed, info: ${JSON.stringify(
      {
        mutation,
        variables,
      },
    )}`;
    logServerSideError(
      error,
      errorMessage || fallbackErrorMessage,
      traceObject,
    );
    return null;
  }
}
