import {SafeAreaView, StyleSheet, TouchableOpacity, View} from 'react-native'

import {CenteredView} from '../util/Views'
import {ErrorBoundary} from 'view/com/util/ErrorBoundary'
import React from 'react'
import {Text} from 'view/com/util/text/Text'
import {usePalette} from 'lib/hooks/usePalette'

export const SplashScreen = ({
  onPressSignin,
}: {
  onPressSignin: () => void
  onPressCreateAccount: () => void
}) => {
  const pal = usePalette('default')
  return (
    <CenteredView style={[styles.container, pal.view]}>
      <SafeAreaView testID="noSessionView" style={styles.container}>
        <ErrorBoundary>
          <View style={styles.hero}>
            <Text style={[styles.title, pal.link]}>Solarplex</Text>
            <Text style={[styles.subtitle, pal.textLight]}>
              See what's next
            </Text>
          </View>
          <View testID="signinOrCreateAccount" style={styles.btns}>
            {/* <TouchableOpacity
              testID="createAccountButton"
              style={[styles.btn, {backgroundColor: colors.blue3}]}
              onPress={onPressCreateAccount}
              accessibilityRole="button"
              accessibilityLabel="Create new account"
              accessibilityHint="Opens flow to create a new Bluesky account">
              <Text style={[s.white, styles.btnLabel]}>
                Create a new account
              </Text>
            </TouchableOpacity> */}
            <TouchableOpacity
              testID="signInButton"
              style={[styles.btn, pal.btn]}
              onPress={onPressSignin}
              accessibilityRole="button"
              accessibilityLabel="Sign in"
              accessibilityHint="Opens flow to sign into your existing Solarplex account">
              <Text style={[pal.text, styles.btnLabel]}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ErrorBoundary>
      </SafeAreaView>
    </CenteredView>
  )
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
  },
  hero: {
    flex: 2,
    justifyContent: 'center',
  },
  btns: {
    paddingBottom: 40,
  },
  title: {
    textAlign: 'center',
    fontSize: 68,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 42,
    fontWeight: 'bold',
  },
  btn: {
    borderRadius: 32,
    paddingVertical: 16,
    marginBottom: 20,
    marginHorizontal: 20,
  },
  btnLabel: {
    textAlign: 'center',
    fontSize: 21,
  },
})
