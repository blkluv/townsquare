import * as Toast from 'view/com/util/Toast'

import {
  Pressable,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native'

import {AtUri} from '@atproto/api'
import {CustomFeedModel} from 'state/models/feeds/custom-feed'
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome'
import {NavigationProp} from 'lib/routes/types'
import React from 'react'
import {Text} from '../util/text/Text'
import {UserAvatar} from '../util/UserAvatar'
import {observer} from 'mobx-react-lite'
import {pluralize} from 'lib/strings/helpers'
import {s} from 'lib/styles'
import {useNavigation} from '@react-navigation/native'
import {usePalette} from 'lib/hooks/usePalette'
import {useStores} from 'state/index'

export const TabBarCustomFeed = observer(
  ({
    item,
    style,
    showSaveBtn = false,
    showDescription = false,
    showLikes = false,
  }: {
    item: CustomFeedModel
    style?: StyleProp<ViewStyle>
    showSaveBtn?: boolean
    showDescription?: boolean
    showLikes?: boolean
  }) => {
    const store = useStores()
    const pal = usePalette('default')
    const navigation = useNavigation<NavigationProp>()

    const onToggleSaved = React.useCallback(async () => {
      if (store.session.isDefaultSession) {
        navigation.navigate('SignIn')
        return
      }
      if (item.isSaved) {
        store.shell.openModal({
          name: 'confirm',
          title: 'Remove from my feeds',
          message: `Remove ${item.displayName} from my feeds?`,
          onPressConfirm: async () => {
            try {
              await store.me.savedFeeds.unsave(item)
              Toast.show('Removed from my feeds')
            } catch (e) {
              Toast.show('There was an issue contacting your server')
              store.log.error('Failed to unsave feed', {e})
            }
          },
        })
      } else {
        try {
          await store.me.savedFeeds.save(item)
          Toast.show('Added to my feeds')
          await item.reload()
        } catch (e) {
          Toast.show('There was an issue contacting your server')
          store.log.error('Failed to save feed', {e})
        }
      }
    }, [store, item, navigation])

    // store.log.debug('item.displayName', item)
    console.log('item.displayName', item.displayName)
    console.log('item.displayName', item.data)

    return (
      <View>
        {!item.isSaved && (
          <TouchableOpacity
            accessibilityRole="button"
            style={[styles.container, pal.border, style]}
            onPress={() => {
              navigation.push('CustomFeed', {
                name: item.data.creator.did,
                rkey: new AtUri(item.data.uri).rkey,
              })
            }}
            key={item.data.uri}>
            <View style={[styles.headerContainer]}>
              <View style={[s.mr10]}>
                <UserAvatar type="algo" size={36} avatar={item.data.avatar} />
              </View>
              <View style={[styles.headerTextContainer]}>
                <Text style={[pal.text, s.bold]} numberOfLines={3}>
                  {item.displayName}
                </Text>
                <Text style={[pal.textLight]} numberOfLines={3}>
                  by @{item.data.creator.handle}
                </Text>
              </View>
              {showSaveBtn && (
                <View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      item.isSaved ? 'Remove from my feeds' : 'Add to my feeds'
                    }
                    accessibilityHint=""
                    onPress={onToggleSaved}
                    hitSlop={15}
                    style={styles.btn}>
                    {item.isSaved ? (
                      <FontAwesomeIcon
                        icon={['far', 'trash-can']}
                        size={19}
                        color={pal.colors.icon}
                      />
                    ) : (
                      <FontAwesomeIcon
                        icon="plus"
                        size={18}
                        color={pal.colors.link}
                      />
                    )}
                  </Pressable>
                </View>
              )}
            </View>

            {showDescription && item.data.description ? (
              <Text
                style={[pal.textLight, styles.description]}
                numberOfLines={3}>
                {item.data.description}
              </Text>
            ) : null}

            {showLikes ? (
              <Text type="sm-medium" style={[pal.text, pal.textLight]}>
                Liked by {item.data.likeCount || 0}{' '}
                {pluralize(item.data.likeCount || 0, 'user')}
              </Text>
            ) : null}
          </TouchableOpacity>
        )}
      </View>
    )
  },
)

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingVertical: 20,
    flexDirection: 'column',
    flex: 1,
    borderTopWidth: 1,
    gap: 14,
  },
  headerContainer: {
    flexDirection: 'row',
  },
  headerTextContainer: {
    flexDirection: 'column',
    columnGap: 4,
    flex: 1,
  },
  description: {
    flex: 1,
    flexWrap: 'wrap',
  },
  btn: {
    paddingVertical: 6,
  },
})
