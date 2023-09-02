import React, {useState} from 'react'
import {ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native'
import {observer} from 'mobx-react-lite'
import {Slider} from '@miblanchard/react-native-slider'
import {Text} from '../com/util/text/Text'
import {useStores} from 'state/index'
import {s, colors} from 'lib/styles'
import {usePalette} from 'lib/hooks/usePalette'
import {isWeb, isDesktopWeb} from 'platform/detection'
import {ToggleButton} from 'view/com/util/forms/ToggleButton'
import {CommonNavigatorParams, NativeStackScreenProps} from 'lib/routes/types'
import {ViewHeader} from 'view/com/util/ViewHeader'
import {CenteredView} from 'view/com/util/Views'

function RepliesThresholdInput({enabled}: {enabled: boolean}) {
  const store = useStores()
  const pal = usePalette('default')
  const [value, setValue] = useState(store.preferences.homeFeedRepliesThreshold)

  return (
    <View style={[s.mt10, !enabled && styles.dimmed]}>
      <Text type="xs" style={pal.text}>
        {value === 0
          ? `Show all replies`
          : `Show replies with at least ${value} ${
              value > 1 ? `likes` : `like`
            }`}
      </Text>
      <Slider
        value={value}
        onValueChange={(v: number | number[]) => {
          const threshold = Math.floor(Array.isArray(v) ? v[0] : v)
          setValue(threshold)
          store.preferences.setHomeFeedRepliesThreshold(threshold)
        }}
        minimumValue={0}
        maximumValue={25}
        containerStyle={isWeb ? undefined : s.flex1}
        disabled={!enabled}
        thumbTintColor={colors.blue3}
      />
    </View>
  )
}

type Props = NativeStackScreenProps<
  CommonNavigatorParams,
  'PreferencesHomeFeed'
>
export const PreferencesHomeFeed = observer(({navigation}: Props) => {
  const pal = usePalette('default')
  const store = useStores()

  return (
    <CenteredView
      testID="preferencesHomeFeedScreen"
      style={[
        pal.view,
        pal.border,
        styles.container,
        isDesktopWeb && styles.desktopContainer,
      ]}>
      <ViewHeader title="Home Feed Preferences" showOnDesktop />
      <View style={styles.titleSection}>
        <Text type="xl" style={[pal.textLight, styles.description]}>
          Fine-tune the content you see on your home screen.
        </Text>
      </View>

      <ScrollView>
        <View style={styles.cardsContainer}>
          <View style={[pal.viewLight, styles.card]}>
            <Text type="title-sm" style={[pal.text, s.pb5]}>
              Show Replies
            </Text>
            <Text style={[pal.text, s.pb10]}>
              Adjust the number of likes a reply must have to be shown in your
              feed.
            </Text>
            <ToggleButton
              type="default-light"
              label={store.preferences.homeFeedRepliesEnabled ? 'Yes' : 'No'}
              isSelected={store.preferences.homeFeedRepliesEnabled}
              onPress={store.preferences.toggleHomeFeedRepliesEnabled}
            />

            <RepliesThresholdInput
              enabled={store.preferences.homeFeedRepliesEnabled}
            />
          </View>

          <View style={[pal.viewLight, styles.card]}>
            <Text type="title-sm" style={[pal.text, s.pb5]}>
              Show Reposts
            </Text>
            <Text style={[pal.text, s.pb10]}>
              Set this setting to "No" to hide all reposts from your feed.
            </Text>
            <ToggleButton
              type="default-light"
              label={store.preferences.homeFeedRepostsEnabled ? 'Yes' : 'No'}
              isSelected={store.preferences.homeFeedRepostsEnabled}
              onPress={store.preferences.toggleHomeFeedRepostsEnabled}
            />
          </View>

          <View style={[pal.viewLight, styles.card]}>
            <Text type="title-sm" style={[pal.text, s.pb5]}>
              Show Quote Posts
            </Text>
            <Text style={[pal.text, s.pb10]}>
              Set this setting to "No" to hide all quote posts from your feed.
              Reposts will still be visible.
            </Text>
            <ToggleButton
              type="default-light"
              label={store.preferences.homeFeedQuotePostsEnabled ? 'Yes' : 'No'}
              isSelected={store.preferences.homeFeedQuotePostsEnabled}
              onPress={store.preferences.toggleHomeFeedQuotePostsEnabled}
            />
          </View>
        </View>
      </ScrollView>

      <View style={[styles.btnContainer, pal.borderDark]}>
        <TouchableOpacity
          testID="confirmBtn"
          onPress={() => {
            navigation.canGoBack()
              ? navigation.goBack()
              : navigation.navigate('Settings')
          }}
          style={[styles.btn, isDesktopWeb && styles.btnDesktop]}
          accessibilityRole="button"
          accessibilityLabel="Confirm"
          accessibilityHint="">
          <Text style={[s.white, s.bold, s.f18]}>Done</Text>
        </TouchableOpacity>
      </View>
    </CenteredView>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: isDesktopWeb ? 40 : 90,
  },
  desktopContainer: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  titleSection: {
    paddingBottom: 30,
    paddingTop: isDesktopWeb ? 20 : 0,
  },
  title: {
    textAlign: 'center',
    marginBottom: 5,
  },
  description: {
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  cardsContainer: {
    paddingHorizontal: 20,
  },
  card: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
    padding: 14,
    backgroundColor: colors.blue3,
  },
  btnDesktop: {
    marginHorizontal: 'auto',
    paddingHorizontal: 80,
  },
  btnContainer: {
    paddingTop: 20,
    borderTopWidth: isDesktopWeb ? 0 : 1,
  },
  dimmed: {
    opacity: 0.3,
  },
})
