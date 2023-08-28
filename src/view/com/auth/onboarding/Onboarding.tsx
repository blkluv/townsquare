import {StyleSheet, View} from 'react-native'

import React from 'react'
import {Welcome} from './Welcome'
import {track} from 'lib/analytics/analytics'
import {usePalette} from 'lib/hooks/usePalette'
import {useStores} from 'state/index'

enum OnboardingStep {
  WELCOME = 'WELCOME',
  // SELECT_INTERESTS = 'SELECT_INTERESTS',
  COMPLETE = 'COMPLETE',
}
type OnboardingState = {
  currentStep: OnboardingStep
}
type Action = {type: 'NEXT_STEP'}
const initialState: OnboardingState = {
  currentStep: OnboardingStep.WELCOME,
}
const reducer = (state: OnboardingState, action: Action): OnboardingState => {
  switch (action.type) {
    case 'NEXT_STEP':
      switch (state.currentStep) {
        case OnboardingStep.WELCOME:
          track('Onboarding:Begin')
          return {...state, currentStep: OnboardingStep.COMPLETE}
        case OnboardingStep.COMPLETE:
          track('Onboarding:Complete')
          return state
        default:
          return state
      }
    default:
      return state
  }
}

export const Onboarding = () => {
  const pal = usePalette('default')
  const rootStore = useStores()
  const [state, dispatch] = React.useReducer(reducer, initialState)
  const next = React.useCallback(
    () => dispatch({type: 'NEXT_STEP'}),
    [dispatch],
  )

  React.useEffect(() => {
    if (state.currentStep === OnboardingStep.COMPLETE) {
      // navigate to home
      rootStore.shell.closeModal()
    }
  }, [state.currentStep, rootStore.shell])

  return (
    <View style={[pal.view, styles.container]}>
      {state.currentStep === OnboardingStep.WELCOME && <Welcome next={next} />}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
})
