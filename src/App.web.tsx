import 'lib/sentry' // must be relatively on top

import * as analytics from 'lib/analytics/analytics'
import * as view from './view/index'

import React, {useEffect, useState} from 'react'
import {RootStoreModel, RootStoreProvider, setupState} from './state'

import {RootSiblingParent} from 'react-native-root-siblings'
import {SafeAreaProvider} from 'react-native-safe-area-context'
import {Shell} from './view/shell/index'
import {Text} from 'react-native'
import {ThemeProvider} from 'lib/ThemeContext'
import {ToastContainer} from './view/com/util/Toast.web'
import {observer} from 'mobx-react-lite'
import {useFonts} from 'expo-font'

const App = observer(() => {
  const [fontsLoaded] = useFonts({
    Manrope: require('../assets/fonts/Manrope.ttf'),
    Chirp: require('../assets/fonts/Chirp-Regular.ttf'),
  })
  const [rootStore, setRootStore] = useState<RootStoreModel | undefined>(
    undefined,
  )

  // init
  useEffect(() => {
    view.setup()
    setupState().then(store => {
      setRootStore(store)
      analytics.init(store)
    })
  }, [])

  // show nothing prior to init
  if (!rootStore) {
    return null
  }

  if (!fontsLoaded) {
    return null
  }

  return (
    <ThemeProvider theme={rootStore.shell.colorMode}>
      <RootSiblingParent>
        <analytics.Provider>
          <RootStoreProvider value={rootStore}>
            <SafeAreaProvider>
              <Shell />
            </SafeAreaProvider>
            <ToastContainer />
          </RootStoreProvider>
        </analytics.Provider>
      </RootSiblingParent>
    </ThemeProvider>
  )
})

export default App
