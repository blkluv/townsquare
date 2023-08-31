import {
  FontAwesomeIcon,
  FontAwesomeIconStyle,
} from '@fortawesome/react-native-fontawesome'
import {Link, TextLink} from '../util/Link'
import {StyleSheet, View} from 'react-native'

import {AppBskyActorDefs} from '@atproto/api'
import {Button} from '../util/forms/Button'
import {CenteredView} from '../util/Views.web'
import {FollowButton} from '../profile/FollowButton'
import React from 'react'
import {Text} from '../util/text/Text'
import {UserAvatar} from '../util/UserAvatar'
import {observer} from 'mobx-react-lite'
import {s} from 'lib/styles'
import {sanitizeDisplayName} from 'lib/strings/display-names'
import {usePalette} from 'lib/hooks/usePalette'
import {useStores} from 'state/index'

export const InvitedUsers = observer(() => {
  const store = useStores()
  return (
    <CenteredView>
      {store.invitedUsers.profiles.map(profile => (
        <InvitedUser key={profile.did} profile={profile} />
      ))}
    </CenteredView>
  )
})

function InvitedUser({
  profile,
}: {
  profile: AppBskyActorDefs.ProfileViewDetailed
}) {
  const pal = usePalette('default')
  const store = useStores()

  const onPressDismiss = React.useCallback(() => {
    store.invitedUsers.markSeen(profile.did)
  }, [store, profile])

  return (
    <View
      testID="invitedUser"
      style={[
        styles.layout,
        {
          backgroundColor: pal.colors.unreadNotifBg,
          borderColor: pal.colors.unreadNotifBorder,
        },
      ]}>
      <View style={styles.layoutIcon}>
        <FontAwesomeIcon
          icon="user-plus"
          size={24}
          style={[styles.icon, s.blue3 as FontAwesomeIconStyle]}
        />
      </View>
      <View style={s.flex1}>
        <Link href={`/profile/${profile.handle}`}>
          <UserAvatar avatar={profile.avatar} size={35} />
        </Link>
        <Text style={[styles.desc, pal.text]}>
          <TextLink
            type="md-bold"
            style={pal.text}
            href={`/profile/${profile.handle}`}
            text={sanitizeDisplayName(profile.displayName || profile.handle)}
          />{' '}
          joined using your invite code!
        </Text>
        <View style={styles.btns}>
          {!store.session.isSolarplexSession && (
            <FollowButton
              unfollowedType="primary"
              followedType="primary-light"
              did={profile.did}
            />
          )}
          <Button
            testID="dismissBtn"
            type="primary-light"
            label="Dismiss"
            onPress={onPressDismiss}
          />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  layout: {
    flexDirection: 'row',
    borderTopWidth: 1,
    padding: 10,
  },
  layoutIcon: {
    width: 70,
    alignItems: 'flex-end',
    paddingTop: 2,
  },
  icon: {
    marginRight: 10,
    marginTop: 4,
  },
  desc: {
    paddingVertical: 6,
  },
  btns: {
    flexDirection: 'row',
    gap: 10,
  },
})
