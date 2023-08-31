import {FlatList, Image, StyleSheet, View} from 'react-native'
import {colors, s} from 'lib/styles'
import {isDesktopWeb, isMobileWeb} from 'platform/detection'

import {CenteredView} from 'view/com/util/Views.web'
import {Link} from 'view/com/util/Link'
import {MissionsTabNavigatorParams} from 'lib/routes/types'
import {NativeStackScreenProps} from '@react-navigation/native-stack'
import React from 'react'
import {ScrollView} from '../com/util/Views'
import {Text} from 'view/com/util/text/Text'
import {ToggleButton} from 'view/com/util/forms/ToggleButton'
import {UserAvatar} from 'view/com/util/UserAvatar'
import {ViewHeader} from 'view/com/util/ViewHeader'
import {observer} from 'mobx-react-lite'
import {usePalette} from 'lib/hooks/usePalette'
import {useStores} from 'state/index'
import {withAuthRequired} from 'view/com/auth/withAuthRequired'

function getReactionPackTitle(reactionPack: string): string {
  if (reactionPack == 'gaming') {
    return `Rubian Reactions by Zen Republic`
  } else {
    return `Solarplex ${
      reactionPack.charAt(0).toUpperCase() + reactionPack.slice(1)
    } Reactions`
  }
}

function getReactionPackStyle(reactionPack: string) {
  if (reactionPack == 'default') {
    return {
      width: isMobileWeb ? 40 : 50,
      height: isMobileWeb ? 40 : 50,
    }
  } else if (reactionPack == 'gaming') {
    return {
      width: isMobileWeb ? 60 : 60,
      height: isMobileWeb ? 60 : 60,
    }
  } else if (reactionPack == 'squid') {
    return {
      width: isMobileWeb ? 100 : 100,
      height: isMobileWeb ? 100 : 100,
    }
  } else {
    return {
      width: isMobileWeb ? 75 : 70,
      height: isMobileWeb ? 75 : 70,
    }
  }
}

export const GrayedImage = ({
  image,
  reactionpack,
}: {
  image: any
  reactionpack: string
}) => {
  return (
    <View>
      <Image
        accessibilityIgnoresInvertColors={true}
        source={{
          uri: image,
        }}
        style={{
          tintColor: 'gray',
          ...getReactionPackStyle(reactionpack),
        }}
      />
      <Image
        accessibilityIgnoresInvertColors={true}
        source={{
          uri: image,
        }}
        style={{
          position: 'absolute',
          opacity: 0.17,
          ...getReactionPackStyle(reactionpack),
        }}
      />
    </View>
  )
}

const DisplayReactions = observer(function DisplayReactions() {
  const pal = usePalette('default')
  const store = useStores()

  const onPressReactionPack = (reactionPack: string) => {
    if (reactionPack === store.reactions.curReactionsSet) {
      store.reactions.selectReactionSet('default')
      return
    }
    store.reactions.earnedReactions[reactionPack]?.length
      ? store.reactions.selectReactionSet(reactionPack)
      : {}
  }

  return (
    <View>
      {/* <View style={s.p10}>
        <InfoText text="Reaction packs are on chain collectibles that allow you to uniquely express yourself on Solarplex posts. Engage with/create posts to win points and unlock packs!" />
      </View> */}
      {Object.keys(store.reactions.reactionSets)
        .sort((a, b) => (a === 'gaming' ? -1 : b === 'gaming' ? 1 : 0))
        .map(reactionPack => (
          <View
            key={reactionPack}
            style={[
              pal.view,
              !store.reactions.earnedReactions[reactionPack]?.length && {
                opacity: 0.2,
              },
            ]}>
            <View style={styles.HeaderRow}>
              <View style={styles.horizontalContainer}>
                <UserAvatar
                  size={25}
                  avatar={
                    reactionPack === 'gaming'
                      ? 'https://live.solarplex.xyz/image/agIRkUaOAo7UKR83WhTqnSYMBUGILjWmXEKhlw0lhrc/rs:fill:1000:1000:1:0/plain/bafkreihko7w6unxciovmrzsou2naohht5zb7jst2op4hqaoi573m6bzh3m@jpeg'
                      : 'https://i.ibb.co/NLkvySY/blob.png'
                  }
                />

                <View
                  style={
                    isMobileWeb ? styles.verticalView : styles.horizontalView
                  }>
                  <Text type="lg-heavy" style={[pal.text, styles.textPadding]}>
                    {reactionPack === 'gaming' ? (
                      <Link href="/profile/zenrepublic.live.solarplex.xyz">
                        {' '}
                        {getReactionPackTitle(reactionPack)}
                      </Link>
                    ) : (
                      <>{getReactionPackTitle(reactionPack)}</>
                    )}
                  </Text>
                  <Text
                    type="sm-heavy"
                    style={[pal.text, styles.textPadding, styles.reaction]}>
                    {Math.min(
                      store.reactions.earnedReactions[reactionPack]?.length ??
                        0,
                      11,
                    )}
                    /{store.reactions.reactionSets[reactionPack]?.length}{' '}
                    Reactions
                  </Text>
                </View>
              </View>

              <ToggleButton
                type="default-light"
                isSelected={store.reactions.curReactionsSet === reactionPack}
                onPress={() => onPressReactionPack(reactionPack)}
                label=""
              />
            </View>
            <View style={styles.reactionList}>
              <FlatList
                data={store.reactions.reactionSets[reactionPack]}
                numColumns={isMobileWeb ? 4 : 4}
                key={4}
                renderItem={({item}) => {
                  if (
                    store.reactions.earnedReactions[reactionPack]?.find(
                      reaction => reaction.reaction_id === item.reaction_id,
                    )
                  ) {
                    return (
                      <View
                        style={{
                          width: 100,
                          height: 100,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          paddingHorizontal: isMobileWeb ? 8 : 12,
                        }}>
                        <Image
                          accessibilityIgnoresInvertColors={true}
                          source={{
                            uri: item.nft_metadata.image,
                          }}
                          style={getReactionPackStyle(reactionPack)}
                        />
                      </View>
                    )
                  } else {
                    return (
                      <View
                        style={{
                          width: 100,
                          height: 100,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          paddingHorizontal: isMobileWeb ? 8 : 12,
                        }}>
                        <GrayedImage
                          reactionpack={reactionPack}
                          image={item.nft_metadata.image}
                        />
                      </View>
                    )
                  }
                }}
              />
            </View>
          </View>
        ))}
      <View style={styles.spacer20} />
    </View>
  )
})

type Props = NativeStackScreenProps<MissionsTabNavigatorParams, 'Missions'>
export const MissionsTab = withAuthRequired(
  observer(function Missions(_props: Partial<Props>) {
    const pal = usePalette('default')

    return (
      <View testID="communitiesScreen" style={s.hContentRegion}>
        <ScrollView
          style={[s.hContentRegion]}
          contentContainerStyle={!isDesktopWeb && pal.viewLight}
          scrollIndicatorInsets={{right: 1}}>
          <ViewHeader title="Reactions" canGoBack={false} />
          <CenteredView style={styles.container}>
            <DisplayReactions />
          </CenteredView>
        </ScrollView>
      </View>
    )
  }),
)

const styles = StyleSheet.create({
  outer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEDC9B',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  reactionsBox: {
    backgroundColor: colors.gray1,
  },
  horizontalView: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  verticalView: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  container: {
    // backgroundColor: colors.gray1,
    padding: 2,
  },
  RollBtn: {
    width: 200,
    paddingVertical: 4,
  },
  DiceRollImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
  },
  DiceRowCol: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.gray1,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  DiceRollText: {
    paddingVertical: 6,
  },
  ImgView: {
    width: 150,
    height: 150,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  HeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexWrap: 'wrap',
  },
  horizontalContainer: {
    flexDirection: 'row',
    // alignItems: "center",
    justifyContent: 'space-between',
  },
  HeaderItemVStack: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  textPadding: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    flexWrap: 'wrap',
  },
  reactionImage: {
    width: 100,
    height: 100,
  },
  solarplexReactionContainer: {
    paddingHorizontal: 15,
  },
  solarplexReactionImage: {
    width: 100,
    height: 100,
  },
  reactionList: {
    width: 'full',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 10,
    paddingHorizontal: 12,
  },
  reaction: {
    backgroundColor: colors.gray2,
    borderRadius: 32,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  spacer20: {
    height: 20,
  },
})
