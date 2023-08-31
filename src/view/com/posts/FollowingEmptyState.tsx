import {
  FontAwesomeIcon,
  FontAwesomeIconStyle,
} from '@fortawesome/react-native-fontawesome'
import {StyleSheet, View} from 'react-native'

import {Button} from '../util/forms/Button'
import {MagnifyingGlassIcon} from 'lib/icons'
import {NavigationProp} from 'lib/routes/types'
import React from 'react'
import {Text} from '../util/text/Text'
import {s} from 'lib/styles'
import {useNavigation} from '@react-navigation/native'
import {usePalette} from 'lib/hooks/usePalette'

// import {isWeb} from 'platform/detection'

export function FollowingEmptyState() {
  const pal = usePalette('default')
  const palInverted = usePalette('inverted')
  const navigation = useNavigation<NavigationProp>()

  // const onPressFindAccounts = React.useCallback(() => {
  //   if (isWeb) {
  //     navigation.navigate('Search', {})
  //   } else {
  //     navigation.navigate('SearchTab')
  //     navigation.popToTop()
  //   }
  // }, [navigation])

  const onPressDiscoverFeeds = React.useCallback(() => {
    navigation.navigate('DiscoverFeeds')
  }, [navigation])

  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <MagnifyingGlassIcon style={[styles.emptyIcon, pal.text]} size={62} />
      </View>
      {/* <Text type="xl-medium" style={[s.textCenter, pal.text]}>
        Your following feed is empty! Find some accounts to follow to fix this.
      </Text>
      <Button
        type="inverted"
        style={styles.emptyBtn}
        onPress={onPressFindAccounts}>
        <Text type="lg-medium" style={palInverted.text}>
          Find accounts to follow
        </Text>
        <FontAwesomeIcon
          icon="angle-right"
          style={palInverted.text as FontAwesomeIconStyle}
          size={14}
        />
      </Button> */}

      <Text type="xl-medium" style={[s.textCenter, pal.text, s.mt20]}>
        You can also discover new Custom Feeds to follow.
      </Text>
      <Button
        type="inverted"
        style={[styles.emptyBtn, s.mt10]}
        onPress={onPressDiscoverFeeds}>
        <Text type="lg-medium" style={palInverted.text}>
          Discover new communities!
        </Text>
        <FontAwesomeIcon
          icon="angle-right"
          style={palInverted.text as FontAwesomeIconStyle}
          size={14}
        />
      </Button>
    </View>
  )
}
const styles = StyleSheet.create({
  emptyContainer: {
    height: '100%',
    paddingVertical: 40,
    paddingHorizontal: 30,
  },
  emptyIconContainer: {
    marginBottom: 16,
  },
  emptyIcon: {
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  emptyBtn: {
    marginVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 30,
  },

  feedsTip: {
    position: 'absolute',
    left: 22,
  },
  feedsTipArrow: {
    marginLeft: 32,
    marginTop: 8,
  },
})
