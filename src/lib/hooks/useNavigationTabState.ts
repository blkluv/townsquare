import {useNavigationState} from '@react-navigation/native'
import {getTabState, TabState} from 'lib/routes/helpers'

export function useNavigationTabState() {
  return useNavigationState(state => {
    const res = {
      isAtHome: getTabState(state, 'Home') !== TabState.Outside,
      isAtSearch: getTabState(state, 'Search') !== TabState.Outside,
      isAtFeeds: getTabState(state, 'Feeds') !== TabState.Outside,
      isAtNotifications:
        getTabState(state, 'Notifications') !== TabState.Outside,
      isAtMyProfile: getTabState(state, 'MyProfile') !== TabState.Outside,
      isAtCommunities: getTabState(state, 'Communities') !== TabState.Outside,
      isAtRewards: getTabState(state, 'Rewards') !== TabState.Outside,
      isAtWallets: getTabState(state, 'Wallets') !== TabState.Outside,
      isAtReactions: getTabState(state, 'Reactions') !== TabState.Outside,
      isAtMissions: getTabState(state, 'Missions') !== TabState.Outside,
    }
    if (
      !res.isAtHome &&
      !res.isAtSearch &&
      !res.isAtFeeds &&
      !res.isAtNotifications &&
      !res.isAtMyProfile &&
      !res.isAtCommunities &&
      !res.isAtRewards &&
      !res.isAtWallets &&
      !res.isAtReactions &&
      !res.isAtMissions
    ) {
      // HACK for some reason useNavigationState will give us pre-hydration results
      //      and not update after, so we force isAtHome if all came back false
      //      -prf
      res.isAtHome = true
    }
    return res
  })
}
