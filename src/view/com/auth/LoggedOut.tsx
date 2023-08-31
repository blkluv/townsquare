import {CenteredView} from '../util/Views'
import {CreateAccount} from 'view/com/auth/create/CreateAccount'
import {ErrorBoundary} from 'view/com/util/ErrorBoundary'
import {Login} from 'view/com/auth/login/Login'
import React from 'react'
import {SafeAreaView} from 'react-native'
import {SplashScreen} from './SplashScreen'
import {observer} from 'mobx-react-lite'
import {s} from 'lib/styles'
import {useAnalytics} from 'lib/analytics/analytics'
import {usePalette} from 'lib/hooks/usePalette'
import {useStores} from 'state/index'

enum ScreenState {
  S_LoginOrCreateAccount,
  S_Login,
  S_CreateAccount,
}

export const LoggedOut = observer(() => {
  const pal = usePalette('default')
  const store = useStores()
  const {screen} = useAnalytics()
  const [screenState, setScreenState] = React.useState<ScreenState>(
    ScreenState.S_LoginOrCreateAccount,
  )

  React.useEffect(() => {
    screen('Login')
    store.shell.setMinimalShellMode(true)
  }, [store, screen])

  if (
    store.session.isResumingSession ||
    screenState === ScreenState.S_LoginOrCreateAccount
  ) {
    return (
      <SplashScreen
        onPressSignin={() => setScreenState(ScreenState.S_Login)}
        onPressCreateAccount={() => setScreenState(ScreenState.S_CreateAccount)}
      />
    )
  }

  return (
    <CenteredView style={[s.hContentRegion, pal.view]}>
      <SafeAreaView testID="noSessionView" style={s.hContentRegion}>
        <ErrorBoundary>
          {screenState === ScreenState.S_Login ? (
            <Login
              onPressBack={() => setScreenState(ScreenState.S_Login)}
              onPressCreateAccount={() =>
                setScreenState(ScreenState.S_CreateAccount)
              }
            />
          ) : undefined}
          {screenState === ScreenState.S_CreateAccount ? (
            <CreateAccount
              onPressBack={() => setScreenState(ScreenState.S_Login)}
            />
          ) : undefined}
        </ErrorBoundary>
      </SafeAreaView>
    </CenteredView>
  )
})
