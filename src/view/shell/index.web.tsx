import React, {useEffect} from 'react'
import {observer} from 'mobx-react-lite'
import {View, StyleSheet, TouchableOpacity} from 'react-native'
import {useStores} from 'state/index'
import {DesktopLeftNav} from './desktop/LeftNav'
import {DesktopRightNav} from './desktop/RightNav'
import {ErrorBoundary} from '../com/util/ErrorBoundary'
import {Lightbox} from '../com/lightbox/Lightbox'
import {ModalsContainer} from '../com/modals/Modal'
import {Composer} from './Composer.web'
import {useColorSchemeStyle} from 'lib/hooks/useColorSchemeStyle'
import {s, colors} from 'lib/styles'
import {RoutesContainer, FlatNavigator} from '../../Navigation'
import {DrawerContent} from './Drawer'
import {useWebMediaQueries} from '../../lib/hooks/useWebMediaQueries'
import {BottomBarWeb} from './bottom-bar/BottomBarWeb'
import {useNavigation} from '@react-navigation/native'
import {NavigationProp} from 'lib/routes/types'

const ShellInner = observer(() => {
  const store = useStores()
  const {isDesktop} = useWebMediaQueries()
  const navigator = useNavigation<NavigationProp>()

  useEffect(() => {
    navigator.addListener('state', () => {
      store.shell.closeAnyActiveElement()
    })
  }, [navigator, store.shell])

  const showBottomBar = !isDesktop && !store.onboarding.isActive
  const showSideNavs =
    isDesktop && store.session.hasSession && !store.onboarding.isActive
  return (
    <>
      <View style={s.hContentRegion}>
        <ErrorBoundary>
          <FlatNavigator />
        </ErrorBoundary>
      </View>
      {showSideNavs && (
        <>
          <DesktopLeftNav />
          <DesktopRightNav />
        </>
      )}
      <Composer
        active={store.shell.isComposerActive}
        onClose={() => store.shell.closeComposer()}
        winHeight={0}
        replyTo={store.shell.composerOpts?.replyTo}
        quote={store.shell.composerOpts?.quote}
        onPost={store.shell.composerOpts?.onPost}
        mention={store.shell.composerOpts?.mention}
      />
      {showBottomBar && <BottomBarWeb />}
      <ModalsContainer />
      <Lightbox />
      {!isDesktop && store.shell.isDrawerOpen && (
        <TouchableOpacity
          onPress={() => store.shell.closeDrawer()}
          style={styles.drawerMask}
          accessibilityLabel="Close navigation footer"
          accessibilityHint="Closes bottom navigation bar">
          <View style={styles.drawerContainer}>
            <DrawerContent />
          </View>
        </TouchableOpacity>
      )}
    </>
  )
})

export const Shell: React.FC = observer(() => {
  const pageBg = useColorSchemeStyle(styles.bgLight, styles.bgDark)
  return (
    <View style={[s.hContentRegion, pageBg]}>
      <RoutesContainer>
        <ShellInner />
      </RoutesContainer>
    </View>
  )
})

const styles = StyleSheet.create({
  bgLight: {
    backgroundColor: colors.white,
    fontFamily: 'Manrope',
  },
  bgDark: {
    backgroundColor: colors.black, // TODO
    fontFamily: 'Manrope',
  },
  drawerMask: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  drawerContainer: {
    display: 'flex',
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
  },
})
