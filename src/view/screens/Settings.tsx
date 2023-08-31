import * as AppInfo from 'lib/app-info'
import * as Toast from '../com/util/Toast'

import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native'
import {CommonNavigatorParams, NativeStackScreenProps} from 'lib/routes/types'
import {DropdownItem, NativeDropdown} from 'view/com/util/forms/NativeDropdown'
import {
  FontAwesomeIcon,
  FontAwesomeIconStyle,
} from '@fortawesome/react-native-fontawesome'
import {
  StackActions,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native'
import {colors, s} from 'lib/styles'

import {AccountData} from 'state/models/session'
import Clipboard from '@react-native-clipboard/clipboard'
import {Link} from '../com/util/Link'
import {NavigationProp} from 'lib/routes/types'
import React from 'react'
// import {STATUS_PAGE_URL} from 'lib/constants'
import {ScrollView} from '../com/util/Views'
import {SelectableBtn} from 'view/com/util/forms/SelectableBtn'
import {Text} from '../com/util/text/Text'
import {ToggleButton} from 'view/com/util/forms/ToggleButton'
import {UserAvatar} from '../com/util/UserAvatar'
import {ViewHeader} from '../com/util/ViewHeader'
import {formatCount} from 'view/com/util/numeric/format'
import {isDesktopWeb} from 'platform/detection'
import {makeProfileLink} from '../../lib/routes/links'
import {observer} from 'mobx-react-lite'
import {pluralize} from 'lib/strings/helpers'
import {reset as resetNavigation} from '../../Navigation'
import {useAnalytics} from 'lib/analytics/analytics'
import {useCustomPalette} from 'lib/hooks/useCustomPalette'
// TEMPORARY (APP-700)
// remove after backend testing finishes
// -prf
import {useDebugHeaderSetting} from 'lib/api/debug-appview-proxy-header'
import {usePalette} from 'lib/hooks/usePalette'
import {useStores} from 'state/index'
import {withAuthRequired} from 'view/com/auth/withAuthRequired'

type Props = NativeStackScreenProps<CommonNavigatorParams, 'Settings'>
export const SettingsScreen = withAuthRequired(
  observer(function Settings({}: Props) {
    const pal = usePalette('default')
    const store = useStores()
    const navigation = useNavigation<NavigationProp>()
    const {screen, track} = useAnalytics()
    const [isSwitching, setIsSwitching] = React.useState(false)
    const [debugHeaderEnabled, toggleDebugHeader] = useDebugHeaderSetting(
      store.agent,
    )

    const primaryBg = useCustomPalette<ViewStyle>({
      light: {backgroundColor: colors.blue0},
      dark: {backgroundColor: colors.blue6},
    })
    const primaryText = useCustomPalette<TextStyle>({
      light: {color: colors.blue3},
      dark: {color: colors.blue2},
    })

    const dangerBg = useCustomPalette<ViewStyle>({
      light: {backgroundColor: colors.red1},
      dark: {backgroundColor: colors.red7},
    })
    const dangerText = useCustomPalette<TextStyle>({
      light: {color: colors.red4},
      dark: {color: colors.red2},
    })

    useFocusEffect(
      React.useCallback(() => {
        screen('Settings')
        store.shell.setMinimalShellMode(false)
      }, [screen, store]),
    )

    const onPressSwitchAccount = React.useCallback(
      async (acct: AccountData) => {
        track('Settings:SwitchAccountButtonClicked')
        setIsSwitching(true)
        if (await store.session.resumeSession(acct)) {
          setIsSwitching(false)
          resetNavigation()
          Toast.show(`Signed in as ${acct.displayName || acct.handle}`)
          return
        }
        setIsSwitching(false)
        Toast.show('Sorry! We need you to enter your password.')
        navigation.navigate('HomeTab')
        navigation.dispatch(StackActions.popToTop())
        store.session.clear()
      },
      [track, setIsSwitching, navigation, store],
    )

    const onPressAddAccount = React.useCallback(() => {
      track('Settings:AddAccountButtonClicked')
      navigation.navigate('HomeTab')
      navigation.dispatch(StackActions.popToTop())
      store.session.clear()
    }, [track, navigation, store])

    const onPressChangeHandle = React.useCallback(() => {
      track('Settings:ChangeHandleButtonClicked')
      store.shell.openModal({
        name: 'change-handle',
        onChanged() {
          setIsSwitching(true)
          store.session.reloadFromServer().then(
            () => {
              setIsSwitching(false)
              Toast.show('Your handle has been updated')
            },
            err => {
              store.log.error(
                'Failed to reload from server after handle update',
                {err},
              )
              setIsSwitching(false)
            },
          )
        },
      })
    }, [track, store, setIsSwitching])

    const onPressInviteCodes = React.useCallback(() => {
      track('Settings:InvitecodesButtonClicked')
      store.shell.openModal({name: 'invite-codes'})
    }, [track, store])

    const onPressContentLanguages = React.useCallback(() => {
      track('Settings:ContentlanguagesButtonClicked')
      store.shell.openModal({name: 'content-languages-settings'})
    }, [track, store])

    const onPressSignout = React.useCallback(() => {
      track('Settings:SignOutButtonClicked')
      store.session.logout()
    }, [track, store])

    const onPressDeleteAccount = React.useCallback(() => {
      store.shell.openModal({name: 'delete-account'})
    }, [store])

    const onPressResetPreferences = React.useCallback(async () => {
      await store.preferences.reset()
      Toast.show('Preferences reset')
    }, [store])

    const onPressBuildInfo = React.useCallback(() => {
      Clipboard.setString(
        `Build version: ${AppInfo.appVersion}; Platform: ${Platform.OS}`,
      )
      Toast.show('Copied build version to clipboard')
    }, [])

    const openPreferencesModal = React.useCallback(() => {
      store.shell.openModal({
        name: 'preferences-home-feed',
      })
    }, [store])

    const onPressAppPasswords = React.useCallback(() => {
      navigation.navigate('AppPasswords')
    }, [navigation])

    const onPressSystemLog = React.useCallback(() => {
      navigation.navigate('Log')
    }, [navigation])

    const onPressStorybook = React.useCallback(() => {
      navigation.navigate('Debug')
    }, [navigation])

    const onPressSavedFeeds = React.useCallback(() => {
      navigation.navigate('SavedFeeds')
    }, [navigation])

    // const onPressStatusPage = React.useCallback(() => {
    //   Linking.openURL(STATUS_PAGE_URL)
    // }, [])

    return (
      <View style={[s.hContentRegion]} testID="settingsScreen">
        <ViewHeader title="Settings" />
        <ScrollView
          style={[s.hContentRegion]}
          contentContainerStyle={!isDesktopWeb && pal.viewLight}
          scrollIndicatorInsets={{right: 1}}>
          <View style={styles.spacer20} />
          {store.session.currentSession !== undefined ? (
            <>
              <Text type="xl-bold" style={[pal.text, styles.heading]}>
                Account
              </Text>
              <View style={[styles.infoLine]}>
                <Text type="lg-medium" style={pal.text}>
                  Email:{' '}
                  <Text type="lg" style={pal.text}>
                    {store.session.currentSession?.email}
                  </Text>
                </Text>
              </View>
              <View style={styles.spacer20} />
            </>
          ) : null}
          <View style={[s.flexRow, styles.heading]}>
            <Text type="xl-bold" style={pal.text}>
              Signed in as
            </Text>
            <View style={s.flex1} />
          </View>
          {isSwitching ? (
            <View style={[pal.view, styles.linkCard]}>
              <ActivityIndicator />
            </View>
          ) : (
            <Link
              href={makeProfileLink(store.me)}
              title="Your profile"
              noFeedback>
              <View style={[pal.view, styles.linkCard]}>
                <View style={styles.avi}>
                  <UserAvatar size={40} avatar={store.me.avatar} />
                </View>
                <View style={[s.flex1]}>
                  <Text type="md-bold" style={pal.text} numberOfLines={1}>
                    {store.me.displayName || store.me.handle}
                  </Text>
                  <Text type="sm" style={pal.textLight} numberOfLines={1}>
                    {store.me.handle}
                  </Text>
                </View>
                <TouchableOpacity
                  testID="signOutBtn"
                  onPress={isSwitching ? undefined : onPressSignout}
                  accessibilityRole="button"
                  accessibilityLabel="Sign out"
                  accessibilityHint={`Signs ${store.me.displayName} out of Solarplex`}>
                  <Text type="lg" style={pal.link}>
                    Sign out
                  </Text>
                </TouchableOpacity>
              </View>
            </Link>
          )}
          {store.session.switchableAccounts.map(account => (
            <TouchableOpacity
              testID={`switchToAccountBtn-${account.handle}`}
              key={account.did}
              style={[pal.view, styles.linkCard, isSwitching && styles.dimmed]}
              onPress={
                isSwitching ? undefined : () => onPressSwitchAccount(account)
              }
              accessibilityRole="button"
              accessibilityLabel={`Switch to ${account.handle}`}
              accessibilityHint="Switches the account you are logged in to">
              <View style={styles.avi}>
                <UserAvatar size={40} avatar={account.aviUrl} />
              </View>
              <View style={[s.flex1]}>
                <Text type="md-bold" style={pal.text}>
                  {account.displayName || account.handle}
                </Text>
                <Text type="sm" style={pal.textLight}>
                  {account.handle}
                </Text>
              </View>
              <AccountDropdownBtn handle={account.handle} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            testID="switchToNewAccountBtn"
            style={[styles.linkCard, pal.view, isSwitching && styles.dimmed]}
            onPress={isSwitching ? undefined : onPressAddAccount}
            accessibilityRole="button"
            accessibilityLabel="Add account"
            accessibilityHint="Create a new Solarplex account">
            <View style={[styles.iconContainer, pal.btn]}>
              <FontAwesomeIcon
                icon="plus"
                style={pal.text as FontAwesomeIconStyle}
              />
            </View>
            <Text type="lg" style={pal.text}>
              Add account
            </Text>
          </TouchableOpacity>

          <View style={styles.spacer20} />

          <Text type="xl-bold" style={[pal.text, styles.heading]}>
            Invite a Friend
          </Text>
          <TouchableOpacity
            testID="inviteFriendBtn"
            style={[styles.linkCard, pal.view, isSwitching && styles.dimmed]}
            onPress={isSwitching ? undefined : onPressInviteCodes}
            accessibilityRole="button"
            accessibilityLabel="Invite"
            accessibilityHint="Opens invite code list">
            <View
              style={[
                styles.iconContainer,
                store.me.invitesAvailable > 0 ? primaryBg : pal.btn,
              ]}>
              <FontAwesomeIcon
                icon="ticket"
                style={
                  (store.me.invitesAvailable > 0
                    ? primaryText
                    : pal.text) as FontAwesomeIconStyle
                }
              />
            </View>
            <Text
              type="lg"
              style={store.me.invitesAvailable > 0 ? pal.link : pal.text}>
              {formatCount(store.me.invitesAvailable)} invite{' '}
              {pluralize(store.me.invitesAvailable, 'code')} available
            </Text>
          </TouchableOpacity>

          <View style={styles.spacer20} />

          <Text type="xl-bold" style={[pal.text, styles.heading]}>
            Accessibility
          </Text>
          <View style={[pal.view, styles.toggleCard]}>
            <ToggleButton
              type="default-light"
              label="Require alt text before posting"
              labelType="lg"
              isSelected={store.preferences.requireAltTextEnabled}
              onPress={store.preferences.toggleRequireAltTextEnabled}
            />
          </View>

          <View style={styles.spacer20} />

          <Text type="xl-bold" style={[pal.text, styles.heading]}>
            Appearance
          </Text>
          <View>
            <View style={[styles.linkCard, pal.view, styles.selectableBtns]}>
              <SelectableBtn
                selected={store.shell.colorMode === 'system'}
                label="System"
                left
                onSelect={() => store.shell.setColorMode('system')}
                accessibilityHint="Set color theme to system setting"
              />
              <SelectableBtn
                selected={store.shell.colorMode === 'light'}
                label="Light"
                onSelect={() => store.shell.setColorMode('light')}
                accessibilityHint="Set color theme to light"
              />
              <SelectableBtn
                selected={store.shell.colorMode === 'dark'}
                label="Dark"
                right
                onSelect={() => store.shell.setColorMode('dark')}
                accessibilityHint="Set color theme to dark"
              />
            </View>
          </View>
          <View style={styles.spacer20} />

          <Text type="xl-bold" style={[pal.text, styles.heading]}>
            Advanced
          </Text>
          <TouchableOpacity
            testID="preferencesHomeFeedModalButton"
            style={[styles.linkCard, pal.view, isSwitching && styles.dimmed]}
            onPress={openPreferencesModal}
            accessibilityRole="button"
            accessibilityHint="Open home feed preferences modal"
            accessibilityLabel="Opens the home feed preferences modal">
            <View style={[styles.iconContainer, pal.btn]}>
              <FontAwesomeIcon
                icon="sliders"
                style={pal.text as FontAwesomeIconStyle}
              />
            </View>
            <Text type="lg" style={pal.text}>
              Home Feed Preferences
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="appPasswordBtn"
            style={[styles.linkCard, pal.view, isSwitching && styles.dimmed]}
            onPress={onPressAppPasswords}
            accessibilityRole="button"
            accessibilityHint="Open app password settings"
            accessibilityLabel="Opens the app password settings page">
            <View style={[styles.iconContainer, pal.btn]}>
              <FontAwesomeIcon
                icon="lock"
                style={pal.text as FontAwesomeIconStyle}
              />
            </View>
            <Text type="lg" style={pal.text}>
              App passwords
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="savedFeedsBtn"
            style={[styles.linkCard, pal.view, isSwitching && styles.dimmed]}
            accessibilityHint="Saved Feeds"
            accessibilityLabel="Opens screen with all saved feeds"
            onPress={onPressSavedFeeds}>
            <View style={[styles.iconContainer, pal.btn]}>
              <FontAwesomeIcon
                icon="satellite-dish"
                style={pal.text as FontAwesomeIconStyle}
              />
            </View>
            <Text type="lg" style={pal.text}>
              Saved Feeds
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="contentLanguagesBtn"
            style={[styles.linkCard, pal.view, isSwitching && styles.dimmed]}
            onPress={isSwitching ? undefined : onPressContentLanguages}
            accessibilityRole="button"
            accessibilityHint="Content languages"
            accessibilityLabel="Opens configurable content language settings">
            <View style={[styles.iconContainer, pal.btn]}>
              <FontAwesomeIcon
                icon="language"
                style={pal.text as FontAwesomeIconStyle}
              />
            </View>
            <Text type="lg" style={pal.text}>
              Content languages
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="changeHandleBtn"
            style={[styles.linkCard, pal.view, isSwitching && styles.dimmed]}
            onPress={isSwitching ? undefined : onPressChangeHandle}
            accessibilityRole="button"
            accessibilityLabel="Change handle"
            accessibilityHint="Choose a new Solarplex username or create">
            <View style={[styles.iconContainer, pal.btn]}>
              <FontAwesomeIcon
                icon="at"
                style={pal.text as FontAwesomeIconStyle}
              />
            </View>
            <Text type="lg" style={pal.text} numberOfLines={1}>
              Change handle
            </Text>
          </TouchableOpacity>
          <View style={styles.spacer20} />
          <Text type="xl-bold" style={[pal.text, styles.heading]}>
            Danger Zone
          </Text>
          <TouchableOpacity
            style={[pal.view, styles.linkCard]}
            onPress={onPressDeleteAccount}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Delete account"
            accessibilityHint="Opens modal for account deletion confirmation. Requires email code.">
            <View style={[styles.iconContainer, dangerBg]}>
              <FontAwesomeIcon
                icon={['far', 'trash-can']}
                style={dangerText as FontAwesomeIconStyle}
                size={18}
              />
            </View>
            <Text type="lg" style={dangerText}>
              Delete my account…
            </Text>
          </TouchableOpacity>
          <View style={styles.spacer20} />
          <Text type="xl-bold" style={[pal.text, styles.heading]}>
            Developer Tools
          </Text>
          <TouchableOpacity
            style={[pal.view, styles.linkCardNoIcon]}
            onPress={onPressSystemLog}
            accessibilityRole="button"
            accessibilityHint="Open system log"
            accessibilityLabel="Opens the system log page">
            <Text type="lg" style={pal.text}>
              System log
            </Text>
          </TouchableOpacity>
          {isDesktopWeb || __DEV__ ? (
            <ToggleButton
              type="default-light"
              label="Experiment: Use AppView Proxy"
              isSelected={debugHeaderEnabled}
              onPress={toggleDebugHeader}
            />
          ) : null}
          {__DEV__ ? (
            <>
              <TouchableOpacity
                style={[pal.view, styles.linkCardNoIcon]}
                onPress={onPressStorybook}
                accessibilityRole="button"
                accessibilityHint="Open storybook page"
                accessibilityLabel="Opens the storybook page">
                <Text type="lg" style={pal.text}>
                  Storybook
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[pal.view, styles.linkCardNoIcon]}
                onPress={onPressResetPreferences}
                accessibilityRole="button"
                accessibilityHint="Reset preferences"
                accessibilityLabel="Resets the preferences state">
                <Text type="lg" style={pal.text}>
                  Reset preferences state
                </Text>
              </TouchableOpacity>
            </>
          ) : null}
          <View style={[styles.footer]}>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={onPressBuildInfo}>
              <Text type="sm" style={[styles.buildInfo, pal.textLight]}>
                Build version {AppInfo.appVersion} {AppInfo.updateChannel}
              </Text>
            </TouchableOpacity>
            <Text type="sm" style={[pal.textLight]}>
              &middot; &nbsp;
            </Text>
            {/* <TouchableOpacity
              accessibilityRole="button"
              onPress={onPressStatusPage}>
              <Text type="sm" style={[styles.buildInfo, pal.textLight]}>
                Status page
              </Text>
            </TouchableOpacity> */}
          </View>
          <View style={s.footerSpacer} />
        </ScrollView>
      </View>
    )
  }),
)

function AccountDropdownBtn({handle}: {handle: string}) {
  const store = useStores()
  const pal = usePalette('default')
  const items: DropdownItem[] = [
    {
      label: 'Remove account',
      onPress: () => {
        store.session.removeAccount(handle)
        Toast.show('Account removed from quick access')
      },
      icon: {
        ios: {
          name: 'trash',
        },
        android: 'ic_delete',
        web: 'trash',
      },
    },
  ]
  return (
    <Pressable accessibilityRole="button" style={s.pl10}>
      <NativeDropdown testID="accountSettingsDropdownBtn" items={items}>
        <FontAwesomeIcon
          icon="ellipsis-h"
          style={pal.textLight as FontAwesomeIconStyle}
        />
      </NativeDropdown>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  dimmed: {
    opacity: 0.5,
  },
  spacer20: {
    height: 20,
  },
  heading: {
    paddingHorizontal: 18,
    paddingBottom: 6,
  },
  infoLine: {
    paddingHorizontal: 18,
    paddingBottom: 6,
  },
  profile: {
    flexDirection: 'row',
    marginVertical: 6,
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginBottom: 1,
  },
  linkCardNoIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 18,
    marginBottom: 1,
  },
  toggleCard: {
    paddingVertical: 8,
    paddingHorizontal: 6,
    marginBottom: 1,
  },
  avi: {
    marginRight: 12,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 30,
    marginRight: 12,
  },
  buildInfo: {
    paddingVertical: 8,
  },

  colorModeText: {
    marginLeft: 10,
    marginBottom: 6,
  },

  selectableBtns: {
    flexDirection: 'row',
  },

  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderRadius: 32,
    padding: 14,
    backgroundColor: colors.gray1,
  },
  toggleBtn: {
    paddingHorizontal: 0,
  },
  footer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 18,
  },
})
