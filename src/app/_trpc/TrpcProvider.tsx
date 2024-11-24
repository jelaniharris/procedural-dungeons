'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getFetch, httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import superjson from 'superjson';
import { trpc } from './client';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 1000 } },
});

export default function TrpcProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const url =
    process.env.NEXT_PUBLIC_APP_DOMAIN &&
    !process.env.NEXT_PUBLIC_APP_DOMAIN.includes('localhost')
      ? `https://${process.env.NEXT_PUBLIC_APP_DOMAIN}/api/trpc/`
      : 'http://localhost:3000/api/trpc/';

  /*let apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if ((!apiUrl || apiUrl.length === 0) && typeof window !== 'undefined') {
    apiUrl = `${window.location.origin}/api`;
  }*/

  const [trpcClient] = useState(() =>
    trpc.createClient({
      transformer: superjson,
      links: [
        /*loggerLink({
            enabled: () => true,
          }),*/
        httpBatchLink({
          url,
          fetch: async (input, init?) => {
            const fetch = getFetch();
            return fetch(input, {
              ...init,
              credentials: 'include',
            });
          },
        }),
      ],
    })
  );

  /*const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${apiUrl}/trpc`,
        }),
      ],
    })
  );*/

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
