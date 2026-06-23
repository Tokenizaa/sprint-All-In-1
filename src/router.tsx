import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

// Cache QueryClient to prevent recreation on navigation
let queryClientInstance: QueryClient | null = null;

export const getRouter = () => {
  if (!queryClientInstance) {
    queryClientInstance = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5, // 5 minutes
          refetchOnWindowFocus: false,
        },
      },
    });
  }

  const router = createRouter({
    routeTree,
    context: { queryClient: queryClientInstance },
    scrollRestoration: true,
    defaultPreloadStaleTime: 1000 * 60 * 5, // Enable preloading with 5min stale time
  } as any);

  return router;
};
