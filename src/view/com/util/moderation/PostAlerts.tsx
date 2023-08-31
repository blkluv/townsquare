import {Pressable, StyleProp, StyleSheet, ViewStyle} from 'react-native'

import {ModerationUI} from '@atproto/api'
import React from 'react'
import {ShieldExclamation} from 'lib/icons'
import {Text} from '../text/Text'
import {describeModerationCause} from 'lib/moderation'
import {usePalette} from 'lib/hooks/usePalette'
import {useStores} from 'state/index'

export function PostAlerts({
  moderation,
  includeMute,
  style,
}: {
  moderation: ModerationUI
  includeMute?: boolean
  style?: StyleProp<ViewStyle>
}) {
  const store = useStores()
  const pal = usePalette('default')

  const shouldAlert =
    !!moderation.cause &&
    (moderation.alert ||
      (includeMute && moderation.blur && moderation.cause?.type === 'muted'))
  if (!shouldAlert) {
    return null
  }

  const desc = describeModerationCause(moderation.cause, 'content')
  return (
    <Pressable
      onPress={() => {
        store.shell.openModal({
          name: 'moderation-details',
          context: 'content',
          moderation,
        })
      }}
      accessibilityRole="button"
      accessibilityLabel="Learn more about this warning"
      accessibilityHint=""
      style={[styles.container, pal.viewLight, style]}>
      <ShieldExclamation style={pal.text} size={16} />
      <Text type="lg" style={pal.text}>
        {desc.name}
      </Text>
      <Text type="lg" style={[pal.link, styles.learnMoreBtn]}>
        Learn More
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingLeft: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  learnMoreBtn: {
    marginLeft: 'auto',
  },
})
