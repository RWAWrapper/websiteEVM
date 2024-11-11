'use client';

import * as React from 'react';
import ReactDOM from 'react-dom';
// import Auth from './authWrapper';
// import '/src/polyfills';

// rainbowkit login
import '@rainbow-me/rainbowkit/styles.css';
import { 
  getDefaultConfig,
  RainbowKitProvider,
  createAuthenticationAdapter,
  RainbowKitAuthenticationProvider,
  AuthenticationStatus,
  connectorsForWallets,
  getDefaultWallets
} from '@rainbow-me/rainbowkit';
import { WagmiProvider, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createSiweMessage } from 'viem/siwe';
import { config } from '@/lib/wagmi';

const projectId: string = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJEXT_ID ?? '';
console.log('ProjectId: ', projectId);

const { wallets } = getDefaultWallets();

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
    const [mount, setMount] = React.useState(false);
    const fetchingStatusRef = React.useRef(false);
    const verifyingRef = React.useRef(false);
    const [authStatus, setAuthStatus] = React.useState<AuthenticationStatus>('loading');

    React.useEffect(() => {
      setMount(true);

      // fetch user when
      const fetchStatus = async () => {
        if (fetchingStatusRef.current || verifyingRef.current) {
          return;
        }

        fetchingStatusRef.current = true;

        try {
          const responce = await fetch('/api/me');
          const json = await responce.json();
          setAuthStatus(json.address ? 'authenticated' : 'unauthenticated');
          // console.log('address: ', json.address)
        }
        catch (e) {
          console.log(e);
          setAuthStatus('unauthenticated');
        }
        finally {
          fetchingStatusRef.current = false;
        }
      }

      // 1.refresh
      fetchStatus();

      // 2.window is focused (in case user logs out of another window)
      window.addEventListener('focus', fetchStatus);
      return () => window.removeEventListener('focus', fetchStatus);
    }, []);
  
    const authAdapter = React.useMemo(() => {
      return createAuthenticationAdapter({
        getNonce: async () => {
          const response = await fetch('/api/nonce');
          return await response.text();
        },
  
        createMessage: ({ nonce, address, chainId }) => {
          return createSiweMessage({
            domain: window.location.host,
            address,
            statement: 'Sign in with Ethereum to RWA Wrapper.',
            uri: window.location.origin,
            version: '1',
            chainId,
            nonce,
          });
        },
  
        verify: async ({ message, signature }) => {
          verifyingRef.current = true;
  
          try {
            const response = await fetch('/api/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message, signature }),
            });
  
            const authenticated = Boolean(response.ok);
  
            if (authenticated) {
              setAuthStatus(authenticated ? 'authenticated' : 'unauthenticated');
            }
  
            return authenticated;
          } catch (error) {
            return false;
          } finally {
            verifyingRef.current = false;
          }
        },
  
        signOut: async () => {
          setAuthStatus('unauthenticated');
          await fetch('/api/logout');
        },
      });
    }, []);


    return (
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitAuthenticationProvider 
              adapter={authAdapter}
            status={authStatus}
          >
              <RainbowKitProvider showRecentTransactions={true} coolMode >
                  {mount && children}
              </RainbowKitProvider>
            </RainbowKitAuthenticationProvider>
          </QueryClientProvider>
        </WagmiProvider>
    )
}