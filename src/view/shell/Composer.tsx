import {Animated, Easing, Platform, StyleSheet, View} from 'react-native'
import React, {useEffect} from 'react'

import {ComposePost} from '../com/composer/Composer'
import {ComposerOpts} from 'state/models/ui/shell'
import {observer} from 'mobx-react-lite'
import {useAnimatedValue} from 'lib/hooks/useAnimatedValue'
import {usePalette} from 'lib/hooks/usePalette'

export const Composer = observer(
  ({
    active,
    winHeight,
    replyTo,
    onPost,
    onClose,
    quote,
    mention,
  }: {
    active: boolean
    winHeight: number
    replyTo?: ComposerOpts['replyTo']
    onPost?: ComposerOpts['onPost']
    onClose: () => void
    quote?: ComposerOpts['quote']
    mention?: ComposerOpts['mention']
  }) => {
    const pal = usePalette('default')
    const initInterp = useAnimatedValue(0)

    useEffect(() => {
      if (active) {
        Animated.timing(initInterp, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }).start()
      } else {
        initInterp.setValue(0)
      }
    }, [initInterp, active])
    const wrapperAnimStyle = {
      transform: [
        {
          translateY: initInterp.interpolate({
            inputRange: [0, 1],
            outputRange: [winHeight, 0],
          }),
        },
      ],
    }

    // rendering
    // =

    if (!active) {
      return <View />
    }

    return (
      <Animated.View
        style={[styles.wrapper, pal.view, wrapperAnimStyle]}
        aria-modal
        accessibilityViewIsModal>
        <ComposePost
          replyTo={replyTo}
          onPost={onPost}
          onClose={onClose}
          quote={quote}
          mention={mention}
        />
      </Animated.View>
    )
  },
)

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '100%',
    ...Platform.select({
      ios: {
        paddingTop: 24,
      },
    }),
  },
})
