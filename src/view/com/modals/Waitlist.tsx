import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import {
  FontAwesomeIcon,
  FontAwesomeIconStyle,
} from '@fortawesome/react-native-fontawesome'
import {gradients, s} from 'lib/styles'

import {ErrorMessage} from '../util/error/ErrorMessage'
import LinearGradient from 'react-native-linear-gradient'
import React from 'react'
import {Text} from '../util/text/Text'
import {TextInput} from './util'
import {cleanError} from 'lib/strings/errors'
import {usePalette} from 'lib/hooks/usePalette'
import {useStores} from 'state/index'
import {useTheme} from 'lib/ThemeContext'

export const snapPoints = ['80%']

export function Component({}: {}) {
  const pal = usePalette('default')
  const theme = useTheme()
  const store = useStores()
  const [email, setEmail] = React.useState<string>('')
  const [isEmailSent, setIsEmailSent] = React.useState<boolean>(false)
  const [isProcessing, setIsProcessing] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string>('')

  const onPressSignup = async () => {
    setError('')
    setIsProcessing(true)
    try {
      const res = await fetch('https://bsky.app/api/waitlist', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email}),
      })
      const resBody = await res.json()
      if (resBody.success) {
        setIsEmailSent(true)
      } else {
        setError(
          resBody.error ||
            'Something went wrong. Check your email and try again.',
        )
      }
    } catch (e: any) {
      setError(cleanError(e))
    }
    setIsProcessing(false)
  }
  const onCancel = () => {
    store.shell.closeModal()
  }

  return (
    <View
      style={[styles.container, {backgroundColor: pal.colors.backgroundLight}]}>
      <View style={[styles.innerContainer, pal.view]}>
        <Text type="title-xl" style={[styles.title, pal.text]}>
          Join the waitlist
        </Text>
        <Text type="lg" style={[styles.description, pal.text]}>
          Solarplex will launch soon. Join the waitlist to try the beta before
          it's publicly available.
        </Text>
        <TextInput
          style={[styles.textInput, pal.borderDark, pal.text, s.mb10, s.mt10]}
          placeholder="Enter your email"
          placeholderTextColor={pal.textLight.color}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardAppearance={theme.colorScheme}
          value={email}
          onChangeText={setEmail}
          accessible={true}
          accessibilityLabel="Email"
          accessibilityHint="Input your email to get on the Solarplex waitlist"
        />
        {error ? (
          <View style={s.mt10}>
            <ErrorMessage message={error} style={styles.error} />
          </View>
        ) : undefined}
        {isProcessing ? (
          <View style={[styles.btn, s.mt10]}>
            <ActivityIndicator />
          </View>
        ) : isEmailSent ? (
          <View style={[styles.btn, s.mt10]}>
            <FontAwesomeIcon
              icon="check"
              style={pal.text as FontAwesomeIconStyle}
            />
            <Text style={s.ml10}>
              Your email has been saved! We&apos;ll be in touch soon.
            </Text>
          </View>
        ) : (
          <>
            <TouchableOpacity
              onPress={onPressSignup}
              accessibilityRole="button"
              accessibilityHint={`Confirms signing up ${email} to the waitlist`}>
              <LinearGradient
                colors={[gradients.blueLight.start, gradients.blueLight.end]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={[styles.btn]}>
                <Text type="button-lg" style={[s.white, s.bold]}>
                  Join Waitlist
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, s.mt10]}
              onPress={onCancel}
              accessibilityRole="button"
              accessibilityLabel="Cancel waitlist signup"
              accessibilityHint={`Exits signing up for waitlist with ${email}`}
              onAccessibilityEscape={onCancel}>
              <Text type="button-lg" style={pal.textLight}>
                Cancel
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    paddingBottom: 20,
  },
  title: {
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
  description: {
    textAlign: 'center',
    paddingHorizontal: 22,
    marginBottom: 10,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 20,
    marginHorizontal: 20,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
    padding: 14,
    marginHorizontal: 20,
  },
  error: {
    borderRadius: 6,
    marginHorizontal: 20,
    marginBottom: 20,
  },
})
