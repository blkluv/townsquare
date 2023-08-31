import {StyleSheet, TouchableOpacity, View} from 'react-native'

import {CenteredView} from '../util/Views'
import {ErrorBoundary} from 'view/com/util/ErrorBoundary'
import React from 'react'
import {Text} from 'view/com/util/text/Text'
import {TextLink} from '../util/Link'
import {colors} from 'lib/styles'
import {isMobileWeb} from 'platform/detection'
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
      <View
        testID="noSessionView"
        style={[
          styles.containerInner,
          isMobileWeb && styles.containerInnerMobile,
          pal.border,
        ]}>
        <ErrorBoundary>
          {/* <Text style={isMobileWeb ? styles.titleMobile : styles.title}>
            Bluesky
          </Text> */}
          <View style={styles.logo}>{/*<SolarplexLogo />*/}</View>
          <Text style={isMobileWeb ? styles.subtitleMobile : styles.subtitle}>
            Welcome to Solarplex.
          </Text>
          <View testID="signinOrCreateAccount" style={styles.btns}>
            {/* <TouchableOpacity
              testID="createAccountButton"
              style={[styles.btn, {backgroundColor: colors.blue3}]}
              onPress={onPressCreateAccount}
              // TODO: web accessibility
              accessibilityRole="button">
              <Text style={[s.white, styles.btnLabel]}>
                Create a new account
              </Text>
            </TouchableOpacity> */}
            <TouchableOpacity
              testID="signInButton"
              style={[styles.btn]}
              onPress={onPressSignin}
              // TODO: web accessibility
              accessibilityRole="button">
              <Text style={[styles.btnLabel]}>Sign In</Text>
            </TouchableOpacity>
          </View>
          <Text type="xl" style={[styles.notice]} lineHeight={1.3}>
            Help communities better engage their members and have fun!
            {/* <TouchableOpacity
              onPress={onPressWaitlist}
              // TODO: web accessibility
              accessibilityRole="button">
              <Text type="xl" style={pal.link}>
                Join the waitlist
              </Text>
            </TouchableOpacity>{' '} */}
          </Text>
        </ErrorBoundary>
      </View>
      <Footer />
    </CenteredView>
  )
}

function Footer() {
  const pal = usePalette('default')
  return (
    <View style={[styles.footer, pal.view, pal.border]}>
      <TextLink
        href="https://www.solarplex.xyz/"
        text="solarplex"
        style={[styles.footerLink, pal.link]}
      />
      <TextLink
        href="https://twitter.com/solarplex_xyz"
        text="contact"
        style={[styles.footerLink, pal.link]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  logo: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    height: '100%',
  },
  containerInner: {
    height: '100%',
    justifyContent: 'center',
    paddingBottom: '20vh',
    paddingHorizontal: 20,
  },
  containerInnerMobile: {
    paddingBottom: 50,
  },
  title: {
    textAlign: 'center',
    color: colors.blue3,
    fontSize: 68,
    fontWeight: 'bold',
    paddingBottom: 10,
  },
  titleMobile: {
    textAlign: 'center',
    color: colors.blue3,
    fontSize: 58,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    color: colors.gray5,
    fontSize: 52,
    fontWeight: 'bold',
    paddingBottom: 30,
  },
  subtitleMobile: {
    textAlign: 'center',
    color: colors.gray5,
    fontSize: 42,
    fontWeight: 'bold',
    paddingBottom: 30,
  },
  btns: {
    flexDirection: isMobileWeb ? 'column' : 'row',
    gap: 20,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  btn: {
    backgroundColor: colors.splx.primary[50],

    borderRadius: 30,
    paddingHorizontal: 24,
    paddingVertical: 12,
    minWidth: 220,
  },
  btnLabel: {
    color: colors.splx.neutral[10],
    textAlign: 'center',
    fontSize: 18,
  },
  notice: {
    fontFamily: 'Manrope',
    paddingHorizontal: 40,
    textAlign: 'center',
    color: colors.splx.primary[70],
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    borderTopWidth: 1,
    flexDirection: 'row',
  },
  footerLink: {
    marginRight: 20,
  },
})
