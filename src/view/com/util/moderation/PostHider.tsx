import {Pressable, StyleSheet, View} from 'react-native'
import React, {ComponentProps} from 'react'

import {Link} from '../Link'
import {ModerationUI} from '@atproto/api'
import {ShieldExclamation} from 'lib/icons'
import {Text} from '../text/Text'
import {addStyle} from 'lib/styles'
import {describeModerationCause} from 'lib/moderation'
import {isDesktopWeb} from 'platform/detection'
import {usePalette} from 'lib/hooks/usePalette'
import {useStores} from 'state/index'

interface Props extends ComponentProps<typeof Link> {
  // testID?: string
  // href?: string
  // style: StyleProp<ViewStyle>
  moderation: ModerationUI
}

export function PostHider({
  testID,
  href,
  moderation,
  style,
  children,
  ...props
}: Props) {
  const store = useStores()
  const pal = usePalette('default')
  const [override, setOverride] = React.useState(false)

  if (!moderation.blur) {
    return (
      <Link
        testID={testID}
        style={style}
        href={href}
        noFeedback
        accessible={false}
        {...props}>
        {children}
      </Link>
    )
  }

  const desc = describeModerationCause(moderation.cause, 'content')
  return (
    <>
      <Pressable
        onPress={() => {
          if (!moderation.noOverride) {
            setOverride(v => !v)
          }
        }}
        accessibilityRole="button"
        accessibilityHint={override ? 'Hide the content' : 'Show the content'}
        accessibilityLabel=""
        style={[styles.description, pal.viewLight]}>
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
          accessibilityHint="">
          <ShieldExclamation size={18} style={pal.text} />
        </Pressable>
        <Text type="lg" style={pal.text}>
          {desc.name}
        </Text>
        {!moderation.noOverride && (
          <Text type="xl" style={[styles.showBtn, pal.link]}>
            {override ? 'Hide' : 'Show'}
          </Text>
        )}
      </Pressable>
      {override && (
        <View style={[styles.childrenContainer, pal.border, pal.viewLight]}>
          <Link
            testID={testID}
            style={addStyle(style, styles.child)}
            href={href}
            noFeedback>
            {children}
          </Link>
        </View>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  description: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 14,
    paddingLeft: 18,
    paddingRight: isDesktopWeb ? 18 : 22,
    marginTop: 1,
  },
  showBtn: {
    marginLeft: 'auto',
    alignSelf: 'center',
  },
  childrenContainer: {
    paddingHorizontal: 4,
    paddingBottom: 6,
  },
  child: {
    borderWidth: 0,
    borderTopWidth: 0,
    borderRadius: 8,
  },
})
