import {FlatList, View} from 'react-native'
import {
  NativeStackScreenProps,
  NotificationsTabNavigatorParams,
} from 'lib/routes/types'

import {Feed} from '../com/notifications/Feed'
import {InvitedUsers} from '../com/notifications/InvitedUsers'
import {LoadLatestBtn} from 'view/com/util/load-latest/LoadLatestBtn'
import React from 'react'
import {ViewHeader} from '../com/util/ViewHeader'
import {isWeb} from 'platform/detection'
import {observer} from 'mobx-react-lite'
import {s} from 'lib/styles'
import {useAnalytics} from 'lib/analytics/analytics'
import {useFocusEffect} from '@react-navigation/native'
import {useOnMainScroll} from 'lib/hooks/useOnMainScroll'
import {useStores} from 'state/index'
import {useTabFocusEffect} from 'lib/hooks/useTabFocusEffect'
import {withAuthRequired} from 'view/com/auth/withAuthRequired'

type Props = NativeStackScreenProps<
  NotificationsTabNavigatorParams,
  'Notifications'
>
export const NotificationsScreen = withAuthRequired(
  observer(({}: Props) => {
    const store = useStores()
    const [onMainScroll, isScrolledDown, resetMainScroll] =
      useOnMainScroll(store)
    const scrollElRef = React.useRef<FlatList>(null)
    const {screen} = useAnalytics()

    // event handlers
    // =
    const onPressTryAgain = React.useCallback(() => {
      store.me.notifications.refresh()
    }, [store])

    const scrollToTop = React.useCallback(() => {
      scrollElRef.current?.scrollToOffset({offset: 0})
      resetMainScroll()
    }, [scrollElRef, resetMainScroll])

    const onPressLoadLatest = React.useCallback(() => {
      scrollToTop()
      store.me.notifications.refresh()
    }, [store, scrollToTop])

    // on-visible setup
    // =
    useFocusEffect(
      React.useCallback(() => {
        store.shell.setMinimalShellMode(false)
        store.log.debug('NotificationsScreen: Updating feed')
        const softResetSub = store.onScreenSoftReset(onPressLoadLatest)
        store.me.notifications.update()
        screen('Notifications')

        return () => {
          softResetSub.remove()
          store.me.notifications.markAllRead()
        }
      }, [store, screen, onPressLoadLatest]),
    )
    useTabFocusEffect(
      'Notifications',
      React.useCallback(
        isInside => {
          // on mobile:
          // fires with `isInside=true` when the user navigates to the root tab
          // but not when the user goes back to the screen by pressing back
          // on web:
          // essentially equivalent to useFocusEffect because we dont used tabbed
          // navigation
          if (isInside) {
            if (isWeb) {
              store.me.notifications.syncQueue()
            } else {
              if (store.me.notifications.unreadCount > 0) {
                store.me.notifications.refresh()
              } else {
                store.me.notifications.syncQueue()
              }
            }
          }
        },
        [store],
      ),
    )

    const hasNew =
      store.me.notifications.hasNewLatest &&
      !store.me.notifications.isRefreshing
    return (
      <View testID="notificationsScreen" style={s.hContentRegion}>
        <ViewHeader title="Notifications" canGoBack={false} />
        <InvitedUsers />
        <Feed
          view={store.me.notifications}
          onPressTryAgain={onPressTryAgain}
          onScroll={onMainScroll}
          scrollElRef={scrollElRef}
        />
        {(isScrolledDown || hasNew) && (
          <LoadLatestBtn
            onPress={onPressLoadLatest}
            label="Load new notifications"
            showIndicator={hasNew}
            minimalShellMode={true}
          />
        )}
      </View>
    )
  }),
)
