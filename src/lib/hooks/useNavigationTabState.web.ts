import {useNavigationState} from '@react-navigation/native'
import {getCurrentRoute} from 'lib/routes/helpers'

export function useNavigationTabState() {
  return useNavigationState(state => {
    let currentRoute = state ? getCurrentRoute(state).name : 'Home'
    return {
      isAtHome: currentRoute === 'Home',
      isAtSearch: currentRoute === 'Search',
      isAtNotifications: currentRoute === 'Notifications',
      isAtMyProfile: currentRoute === 'MyProfile',
      isAtCommunities: currentRoute === 'Communities',
      isAtRewards: currentRoute === 'Rewards',
      isAtWallets: currentRoute === 'Wallets',
      isAtSignIn: currentRoute === 'SignIn',
      isAtReactions: currentRoute === 'Reactions',
      isAtMissions: currentRoute === 'Missions',
    }
  })
}
