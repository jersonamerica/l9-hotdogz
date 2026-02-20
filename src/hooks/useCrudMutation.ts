import { useMutation, useQueryClient } from "@tanstack/react-query";

type CrudMethod = "POST" | "PUT" | "PATCH" | "DELETE";

type UrlResolver<TInput> = string | ((input: TInput) => string);

interface UseCrudMutationOptions<TInput, TOutput> {
  method: CrudMethod;
  url: UrlResolver<TInput>;
  invalidateKeys?: unknown[][];
  headers?: HeadersInit;
  onSuccess?: (data: TOutput, input: TInput) => void | Promise<void>;
  onError?: (error: unknown, input: TInput) => void;
}

const resolveUrl = <TInput,>(
  url: UrlResolver<TInput>,
  input: TInput,
): string => {
  return typeof url === "function" ? url(input) : url;
};

export function useCrudMutation<TInput = void, TOutput = unknown>(
  options: UseCrudMutationOptions<TInput, TOutput>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TInput) => {
      const res = await fetch(resolveUrl(options.url, input), {
        method: options.method,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...(input !== undefined ? { body: JSON.stringify(input) } : {}),
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      if (res.status === 204) {
        return undefined as TOutput;
      }

      return (await res.json()) as TOutput;
    },
    onSuccess: async (data, variables) => {
      if (options.invalidateKeys?.length) {
        await Promise.all(
          options.invalidateKeys.map((key) =>
            queryClient.invalidateQueries({ queryKey: key }),
          ),
        );
      }

      if (options.onSuccess) {
        await options.onSuccess(data, variables);
      }
    },
    onError: (error, variables) => {
      options.onError?.(error, variables);
    },
  });
}
