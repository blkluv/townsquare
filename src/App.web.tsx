import React, {useState, useMemo, useEffect} from 'react'
import 'lib/sentry' // must be relatively on top
import {SafeAreaProvider} from 'react-native-safe-area-context'
import {RootSiblingParent} from 'react-native-root-siblings'
import * as view from './view/index'
import * as analytics from 'lib/analytics/analytics'
import {RootStoreModel, setupState, RootStoreProvider} from './state'
import {Shell} from './view/shell/index'
import {ToastContainer} from './view/com/util/Toast.web'
import {ThemeProvider} from 'lib/ThemeContext'
import {observer} from 'mobx-react-lite'

import {ConnectionProvider, WalletProvider} from '@solana/wallet-adapter-react'
import {WalletAdapter, WalletAdapterNetwork} from '@solana/wallet-adapter-base'
import {SolflareWalletAdapter} from '@solana/wallet-adapter-wallets'
import {WalletModalProvider} from '@solana/wallet-adapter-react-ui'
import {clusterApiUrl} from '@solana/web3.js'
import {useFonts} from 'expo-font'
require('@solana/wallet-adapter-react-ui/styles.css')

const App = observer(() => {
  const [rootStore, setRootStore] = useState<RootStoreModel | undefined>(
    undefined,
  )
  const [fontsLoaded] = useFonts({
    Manrope: require('../assets/fonts/Manrope.ttf'),
    Chirp: require('../assets/fonts/Chirp-Regular.ttf'),
  })

  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const network = WalletAdapterNetwork.Mainnet

  // You can also provide a custom RPC endpoint.
  const endpoint = useMemo(() => clusterApiUrl(network), [network])

  // init
  useEffect(() => {
    view.setup()
    setupState().then(store => {
      setRootStore(store)
      analytics.init(store)
    })
  }, [])

  // show nothing prior to init
  if (!rootStore || !fontsLoaded) {
    return null
  }

  const wallets: WalletAdapter[] = [
    //   new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    // new BackpackWalletAdapter(),
    // new GlowWalletAdapter(),
    // new BraveWalletAdapter(),
  ]

  return (
    <ThemeProvider theme={rootStore.shell.colorMode}>
      <RootSiblingParent>
        <analytics.Provider>
          <RootStoreProvider value={rootStore}>
            <ConnectionProvider endpoint={endpoint}>
              <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                  <SafeAreaProvider>
                    <Shell />
                  </SafeAreaProvider>
                  <ToastContainer />
                </WalletModalProvider>
              </WalletProvider>
            </ConnectionProvider>
          </RootStoreProvider>
        </analytics.Provider>
      </RootSiblingParent>
    </ThemeProvider>
  )
})

export default App
