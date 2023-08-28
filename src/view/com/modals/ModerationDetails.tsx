import {StyleSheet, View} from 'react-native'

import {Button} from '../util/forms/Button'
import {ModerationUI} from '@atproto/api'
import React from 'react'
import {Text} from '../util/text/Text'
import {TextLink} from '../util/Link'
import {isDesktopWeb} from 'platform/detection'
import {listUriToHref} from 'lib/strings/url-helpers'
import {s} from 'lib/styles'
import {usePalette} from 'lib/hooks/usePalette'
import {useStores} from 'state/index'

export const snapPoints = [300]

export function Component({
  context,
  moderation,
}: {
  context: 'account' | 'content'
  moderation: ModerationUI
}) {
  const store = useStores()
  const pal = usePalette('default')

  let name
  let description
  if (!moderation.cause) {
    name = 'Content Warning'
    description =
      'Moderator has chosen to set a general warning on the content.'
  } else if (moderation.cause.type === 'blocking') {
    name = 'User Blocked'
    description = 'You have blocked this user. You cannot view their content.'
  } else if (moderation.cause.type === 'blocked-by') {
    name = 'User Blocks You'
    description = 'This user has blocked you. You cannot view their content.'
  } else if (moderation.cause.type === 'block-other') {
    name = 'Content Not Available'
    description =
      'This content is not available because one of the users involved has blocked the other.'
  } else if (moderation.cause.type === 'muted') {
    if (moderation.cause.source.type === 'list') {
      const list = moderation.cause.source.list
      name = <>Account Muted by List</>
      description = (
        <>
          This user is included the{' '}
          <TextLink
            type="2xl"
            href={listUriToHref(list.uri)}
            text={list.name}
            style={pal.link}
          />{' '}
          list which you have muted.
        </>
      )
    } else {
      name = 'Account Muted'
      description = 'You have muted this user.'
    }
  } else {
    name = moderation.cause.labelDef.strings[context].en.name
    description = moderation.cause.labelDef.strings[context].en.description
  }

  return (
    <View testID="moderationDetailsModal" style={[styles.container, pal.view]}>
      <Text type="title-xl" style={[pal.text, styles.title]}>
        {name}
      </Text>
      <Text type="2xl" style={[pal.text, styles.description]}>
        {description}
      </Text>
      <View style={s.flex1} />
      <Button
        type="primary"
        style={styles.btn}
        onPress={() => store.shell.closeModal()}>
        <Text type="button-lg" style={[pal.textLight, s.textCenter, s.white]}>
          Okay
        </Text>
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: isDesktopWeb ? 0 : 14,
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    textAlign: 'center',
  },
  btn: {
    paddingVertical: 14,
    marginTop: isDesktopWeb ? 40 : 0,
    marginBottom: isDesktopWeb ? 0 : 40,
  },
})