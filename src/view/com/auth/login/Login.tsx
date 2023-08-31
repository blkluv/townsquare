import * as EmailValidator from 'email-validator'

import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import {DEFAULT_SERVICE, RootStoreModel, useStores} from 'state/index'
import React, {useEffect, useRef, useState} from 'react'
import {colors, gradients, s} from 'lib/styles'

import {AccountData} from 'state/models/session'
import {BskyAgent} from '@atproto/api'
import {Button} from 'view/com/util/forms/Button'
import {CenteredView} from 'view/com/util/Views'
import {ErrorBoundary} from 'view/com/util/ErrorBoundary'
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome'
import {NavigationProp} from 'lib/routes/types'
import {SOLARPLEX_IDENTIFIER} from 'lib/constants'
import {ServiceDescription} from 'state/models/session'
import {Text} from '../../util/text/Text'
import {UserAvatar} from '../../util/UserAvatar'
import {cleanError} from 'lib/strings/errors'
import {createFullHandle} from 'lib/strings/handles'
import {isMobileWeb} from 'platform/detection'
import {isNetworkError} from 'lib/strings/errors'
import {useAnalytics} from 'lib/analytics/analytics'
import {useNavigation} from '@react-navigation/native'
import {usePalette} from 'lib/hooks/usePalette'
import {useTheme} from 'lib/ThemeContext'

enum Forms {
  Login,
  ChooseAccount,
  ForgotPassword,
  SetNewPassword,
  PasswordUpdated,
}

export const Login = ({
  onPressBack,
  onPressCreateAccount,
}: {
  onPressBack: () => void
  onPressCreateAccount: () => void
}) => {
  const pal = usePalette('default')
  const store = useStores()
  const {track} = useAnalytics()
  const [error, setError] = useState<string>('')
  const [retryDescribeTrigger, setRetryDescribeTrigger] = useState<any>({})
  const [serviceUrl, setServiceUrl] = useState<string>(DEFAULT_SERVICE)
  const [serviceDescription, setServiceDescription] = useState<
    ServiceDescription | undefined
  >(undefined)
  const [initialHandle, setInitialHandle] = useState<string>('')
  const [currentForm, setCurrentForm] = useState<Forms>(
    store.session.hasAccounts && !store.session.isSolarplexSession
      ? Forms.ChooseAccount
      : Forms.Login,
  )

  const onSelectAccount = (account?: AccountData) => {
    if (account?.service) {
      setServiceUrl(account.service)
    }
    setInitialHandle(account?.handle || '')
    setCurrentForm(Forms.Login)
  }

  const gotoForm = (form: Forms) => () => {
    setError('')
    setCurrentForm(form)
  }

  useEffect(() => {
    let aborted = false
    setError('')
    store.session.describeService(serviceUrl).then(
      desc => {
        if (aborted) {
          return
        }
        setServiceDescription(desc)
      },
      err => {
        if (aborted) {
          return
        }
        store.log.warn(
          `Failed to fetch service description for ${serviceUrl}`,
          err,
        )
        setError(
          'Unable to contact your service. Please check your Internet connection.',
        )
      },
    )
    return () => {
      aborted = true
    }
  }, [store.session, store.log, serviceUrl, retryDescribeTrigger])

  const onPressRetryConnect = () => setRetryDescribeTrigger({})
  const onPressForgotPassword = () => {
    track('Signin:PressedForgotPassword')
    setCurrentForm(Forms.ForgotPassword)
  }

  return (
    <KeyboardAvoidingView
      testID="signIn"
      behavior="padding"
      style={[pal.view, s.pt10]}>
      {currentForm === Forms.Login ? (
        <LoginForm
          store={store}
          error={error}
          serviceUrl={serviceUrl}
          serviceDescription={serviceDescription}
          initialHandle={initialHandle}
          setError={setError}
          setServiceUrl={setServiceUrl}
          onPressBack={onPressBack}
          onPressForgotPassword={onPressForgotPassword}
          onPressRetryConnect={onPressRetryConnect}
          onPressCreateAccount={onPressCreateAccount}
        />
      ) : undefined}
      {currentForm === Forms.ChooseAccount ? (
        <ChooseAccountForm
          store={store}
          onSelectAccount={onSelectAccount}
          onPressBack={onPressBack}
        />
      ) : undefined}
      {currentForm === Forms.ForgotPassword ? (
        <ForgotPasswordForm
          store={store}
          error={error}
          serviceUrl={serviceUrl}
          serviceDescription={serviceDescription}
          setError={setError}
          setServiceUrl={setServiceUrl}
          onPressBack={gotoForm(Forms.Login)}
          onEmailSent={gotoForm(Forms.SetNewPassword)}
        />
      ) : undefined}
      {currentForm === Forms.SetNewPassword ? (
        <SetNewPasswordForm
          store={store}
          error={error}
          serviceUrl={serviceUrl}
          setError={setError}
          onPressBack={gotoForm(Forms.ForgotPassword)}
          onPasswordSet={gotoForm(Forms.PasswordUpdated)}
        />
      ) : undefined}
      {currentForm === Forms.PasswordUpdated ? (
        <PasswordUpdatedForm onPressNext={gotoForm(Forms.Login)} />
      ) : undefined}
    </KeyboardAvoidingView>
  )
}

const ChooseAccountForm = ({
  store,
  onSelectAccount,
  onPressBack,
}: {
  store: RootStoreModel
  onSelectAccount: (account?: AccountData) => void
  onPressBack: () => void
}) => {
  const {track, screen} = useAnalytics()
  const pal = usePalette('default')
  const [isProcessing, setIsProcessing] = React.useState(false)

  React.useEffect(() => {
    screen('Choose Account')
  }, [screen])

  const onTryAccount = async (account: AccountData) => {
    if (account.accessJwt && account.refreshJwt) {
      setIsProcessing(true)
      if (await store.session.resumeSession(account)) {
        track('Sign In', {resumedSession: true})
        setIsProcessing(false)
        return
      }
      setIsProcessing(false)
    }
    onSelectAccount(account)
  }

  return (
    <View testID="chooseAccountForm">
      <Text
        type="2xl-medium"
        style={[pal.text, styles.groupLabel, s.mt5, s.mb10]}>
        Sign in as...
      </Text>
      {store.session.accounts.map(
        account =>
          account.handle !== SOLARPLEX_IDENTIFIER && (
            <TouchableOpacity
              testID={`chooseAccountBtn-${account.handle}`}
              key={account.did}
              style={[pal.view, pal.border, styles.account]}
              onPress={() => onTryAccount(account)}
              accessibilityRole="button"
              accessibilityLabel={`Sign in as ${account.handle}`}
              accessibilityHint="Double tap to sign in">
              <View
                style={[
                  pal.borderDark,
                  styles.groupContent,
                  styles.noTopBorder,
                ]}>
                <View style={s.p10}>
                  <UserAvatar avatar={account.aviUrl} size={30} />
                </View>
                <Text style={styles.accountText}>
                  <Text type="lg-bold" style={pal.text}>
                    {account.displayName || account.handle}{' '}
                  </Text>
                  <Text type="lg" style={[pal.textLight]}>
                    {account.handle}
                  </Text>
                </Text>
                <FontAwesomeIcon
                  icon="angle-right"
                  size={16}
                  style={[pal.text, s.mr10]}
                />
              </View>
            </TouchableOpacity>
          ),
      )}
      <TouchableOpacity
        testID="chooseNewAccountBtn"
        style={[pal.view, pal.border, styles.account, styles.accountLast]}
        onPress={() => onSelectAccount(undefined)}
        accessibilityRole="button"
        accessibilityLabel="Login to account that is not listed"
        accessibilityHint="">
        <View style={[pal.borderDark, styles.groupContent, styles.noTopBorder]}>
          <Text style={[styles.accountText, styles.accountTextOther]}>
            <Text type="lg" style={pal.text}>
              Other account
            </Text>
          </Text>
          <FontAwesomeIcon
            icon="angle-right"
            size={16}
            style={[pal.text, s.mr10]}
          />
        </View>
      </TouchableOpacity>
      <View style={[s.flexRow, s.alignCenter, s.pl20, s.pr20]}>
        <TouchableOpacity onPress={onPressBack} accessibilityRole="button">
          <Text type="xl" style={[pal.link, s.pl5]}>
            Back
          </Text>
        </TouchableOpacity>
        <View style={s.flex1} />
        {isProcessing && <ActivityIndicator />}
      </View>
    </View>
  )
}

const LoginForm = ({
  store,
  error,
  serviceUrl,
  serviceDescription,
  initialHandle,
  setError,
  onPressRetryConnect,
  onPressForgotPassword,
  onPressCreateAccount,
}: {
  store: RootStoreModel
  error: string
  serviceUrl: string
  serviceDescription: ServiceDescription | undefined
  initialHandle: string
  setError: (v: string) => void
  setServiceUrl: (v: string) => void
  onPressRetryConnect: () => void
  onPressBack: () => void
  onPressForgotPassword: () => void
  onPressCreateAccount: () => void
}) => {
  const {track} = useAnalytics()
  const pal = usePalette('default')
  const theme = useTheme()
  const navigation = useNavigation<NavigationProp>()
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [identifier, setIdentifier] = useState<string>(initialHandle)
  const [password, setPassword] = useState<string>('')
  const passwordInputRef = useRef<TextInput>(null)

  const onPressNext = async () => {
    Keyboard.dismiss()
    setError('')
    setIsProcessing(true)

    try {
      // try to guess the handle if the user just gave their own username
      let fullIdent = identifier
      if (
        !identifier.includes('@') && // not an email
        !identifier.includes('.') && // not a domain
        serviceDescription &&
        serviceDescription.availableUserDomains.length > 0
      ) {
        let matched = false
        for (const domain of serviceDescription.availableUserDomains) {
          if (fullIdent.endsWith(domain)) {
            matched = true
          }
        }
        if (!matched) {
          fullIdent = createFullHandle(
            identifier,
            serviceDescription.availableUserDomains[0],
          )
        }
      }
      // store.session.removeAccount(SOLARPLEX_IDENTIFIER)

      await store.session.login({
        service: serviceUrl,
        identifier: fullIdent,
        password,
      })
    } catch (e: any) {
      const errMsg = e.toString()
      store.log.warn('Failed to login', e)
      setIsProcessing(false)
      if (errMsg.includes('Authentication Required')) {
        setError('Invalid username or password')
      } else if (errMsg.includes('Invalid identifier or password')) {
        setError('Invalid username or password')
      } else if (isNetworkError(e)) {
        setError(
          'Unable to contact your service. Please check your Internet connection.',
        )
      } else {
        setError(cleanError(errMsg))
      }
    } finally {
      track('Sign In', {resumedSession: false})
      if (store.session.hasSession) {
        navigation.navigate('Home')
      }
    }
  }

  const isReady = !!serviceDescription && !!identifier && !!password

  return (
    <>
      {isMobileWeb && (
        <View style={[s.flex1, s.p20, s.alignCenter]}>
          {/*<SolarplexLogo />*/}
        </View>
      )}
      <View testID="loginForm">
        <Text type="sm-bold" style={[pal.text, styles.groupLabel]}>
          Sign in to Solarplex
        </Text>
        {/* <View style={[pal.borderDark, styles.group]}>
          <View
            style={[pal.borderDark, styles.groupContent, styles.noTopBorder]}
          >
            <FontAwesomeIcon
              icon="globe"
              style={[pal.textLight, styles.groupContentIcon]}
            />
            <TouchableOpacity
              testID="loginSelectServiceButton"
              style={styles.textBtn}
              onPress={onPressSelectService}
              accessibilityRole="button"
              accessibilityLabel="Select service"
              accessibilityHint="Sets server for the Bluesky client"
            >
              <Text type="xl" style={[pal.text, styles.textBtnLabel]}>
                {toNiceDomain(serviceUrl)}
              </Text>
              <View style={[pal.btn, styles.textBtnFakeInnerBtn]}>
                <FontAwesomeIcon
                  icon="pen"
                  size={12}
                  style={pal.textLight as FontAwesomeIconStyle}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View> */}
        {/* <Text type="sm-bold" style={[pal.text, styles.groupLabel]}>
          Account
        </Text> */}
        <View style={[pal.borderDark, styles.group]}>
          <View
            style={[pal.borderDark, styles.groupContent, styles.noTopBorder]}>
            <FontAwesomeIcon
              icon="at"
              style={[pal.textLight, styles.groupContentIcon]}
            />
            <TextInput
              testID="loginUsernameInput"
              style={[pal.text, styles.textInput]}
              placeholder="Username or email address"
              placeholderTextColor={pal.colors.textLight}
              autoCapitalize="none"
              autoFocus
              autoCorrect={false}
              autoComplete="username"
              returnKeyType="next"
              onSubmitEditing={() => {
                passwordInputRef.current?.focus()
              }}
              blurOnSubmit={false} // prevents flickering due to onSubmitEditing going to next field
              keyboardAppearance={theme.colorScheme}
              value={identifier}
              onChangeText={str => setIdentifier((str || '').toLowerCase())}
              editable={!isProcessing}
              accessibilityLabel="Username or email address"
              accessibilityHint="Input the username or email address you used at signup"
            />
          </View>
          <View style={[pal.borderDark, styles.groupContent]}>
            <FontAwesomeIcon
              icon="lock"
              style={[pal.textLight, styles.groupContentIcon]}
            />
            <TextInput
              testID="loginPasswordInput"
              ref={passwordInputRef}
              style={[pal.text, styles.textInput]}
              placeholder="Password"
              placeholderTextColor={pal.colors.textLight}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="password"
              returnKeyType="done"
              enablesReturnKeyAutomatically={true}
              keyboardAppearance={theme.colorScheme}
              secureTextEntry={true}
              textContentType="password"
              clearButtonMode="while-editing"
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={onPressNext}
              blurOnSubmit={false} // HACK: https://github.com/facebook/react-native/issues/21911#issuecomment-558343069 Keyboard blur behavior is now handled in onSubmitEditing
              editable={!isProcessing}
              accessibilityLabel="Password"
              accessibilityHint={
                identifier === ''
                  ? 'Input your password'
                  : `Input the password tied to ${identifier}`
              }
            />
            <TouchableOpacity
              testID="forgotPasswordButton"
              style={styles.textInputInnerBtn}
              onPress={onPressForgotPassword}
              accessibilityRole="button"
              accessibilityLabel="Forgot password"
              accessibilityHint="Opens password reset form">
              <Text style={pal.link}>Forgot</Text>
            </TouchableOpacity>
          </View>
        </View>

        {error ? (
          <View style={styles.error}>
            <View style={styles.errorIcon}>
              <FontAwesomeIcon icon="exclamation" style={s.white} size={10} />
            </View>
            <View style={s.flex1}>
              <Text style={[s.white, s.bold]}>{error}</Text>
            </View>
          </View>
        ) : undefined}
        <View style={[s.flexRow, s.alignCenter, s.pl20, s.pr20]}>
          {/* <TouchableOpacity onPress={onPressBack} accessibilityRole="button">
            <Text type="xl" style={[pal.link, s.pl5]}>
              Back
            </Text>
          </TouchableOpacity> */}
          <View style={s.flex1} />
          {!serviceDescription && error ? (
            <TouchableOpacity
              testID="loginRetryButton"
              onPress={onPressRetryConnect}
              accessibilityRole="button"
              accessibilityLabel="Retry"
              accessibilityHint="Retries login">
              <Text type="xl-bold" style={[pal.link, s.pr5]}>
                Retry
              </Text>
            </TouchableOpacity>
          ) : !serviceDescription ? (
            <>
              <ActivityIndicator />
              <Text type="xl" style={[pal.textLight, s.pl10]}>
                Connecting...
              </Text>
            </>
          ) : isProcessing ? (
            <ActivityIndicator />
          ) : isReady ? (
            <Button
              testID="loginNextButton"
              onPress={onPressNext}
              // accessibilityRole="button"
              accessibilityLabel="Go to next"
              accessibilityHint="Navigates to the next screen"
              label="Next"
            />
          ) : undefined}
        </View>
        {/* <View>
        <br />
        <br />
        <Text type="sm-bold" style={[pal.text, styles.welcome, pal.textLight]}>
          Sign in with your Bluesky credentials.
          <br />
          <br />
          <br />
          Don't have a Bluesky invitation?
        </Text>
        <View style={[styles.textBtnFakeInnerBtn]}>
          <TouchableOpacity
            accessibilityRole="link"
            accessibilityLabel="Send feedback"
            accessibilityHint="Opens Google Forms feedback link"
            onPress={onPressFeedback}
            style={[
              styles.footerBtn,
              styles.footerBtnFeedback,
              theme.colorScheme === 'light'
                ? styles.footerBtnFeedbackLight
                : styles.footerBtnFeedbackDark,
            ]}>
            <FontAwesomeIcon
              style={pal.link as FontAwesomeIconStyle}
              size={19}
              icon={['far', 'message']}
            />
            <Text type="2xl-medium" style={[pal.link, s.pl10]}>
              Request Invite
            </Text>
          </TouchableOpacity>
        </View>
      </View> */}
        <CenteredView style={[styles.container, pal.view]}>
          <View
            testID="noSessionView"
            style={[
              styles.containerInner,
              isMobileWeb && styles.containerInnerMobile,
              pal.border,
            ]}>
            <ErrorBoundary>
              <Text
                style={isMobileWeb ? styles.subtitleMobile : styles.subtitle}>
                Don't have an account?
              </Text>
              <View testID="signinOrCreateAccount" style={styles.btns}>
                <TouchableOpacity
                  testID="createAccountButton"
                  style={[
                    styles.btn,
                    {backgroundColor: colors.splx.primary[50]},
                  ]}
                  onPress={onPressCreateAccount}
                  // TODO: web accessibility
                  accessibilityRole="button">
                  <Text style={[s.white, styles.btnLabel]}>
                    Create a new account
                  </Text>
                </TouchableOpacity>
                {/* <TouchableOpacity
                  testID="requestInviteButton"
                  style={[styles.btn]}
                  onPress={onPressRequestInvite}
                  // TODO: web accessibility
                  accessibilityRole="button"
                >
                  <Text style={[pal.text, styles.btnLabel]}>
                    Request Invite
                  </Text>
                </TouchableOpacity> */}
              </View>
              {/* <Text
              type="xl"
              style={[styles.notice, pal.textLight]}
              lineHeight={1.3}>
              Bluesky will launch soon.{' '}
              <TouchableOpacity
                onPress={onPressWaitlist}
                // TODO: web accessibility
                accessibilityRole="button">
                <Text type="xl" style={pal.link}>
                  Join the waitlist
                </Text>
              </TouchableOpacity>{' '}
              to try the beta before it's publicly available.
            </Text> */}
            </ErrorBoundary>
          </View>
        </CenteredView>
      </View>
    </>
  )
}

const ForgotPasswordForm = ({
  store,
  error,
  serviceUrl,
  serviceDescription,
  setError,
  onPressBack,
  onEmailSent,
}: {
  store: RootStoreModel
  error: string
  serviceUrl: string
  serviceDescription: ServiceDescription | undefined
  setError: (v: string) => void
  setServiceUrl: (v: string) => void
  onPressBack: () => void
  onEmailSent: () => void
}) => {
  const pal = usePalette('default')
  const theme = useTheme()
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [email, setEmail] = useState<string>('')
  const {screen} = useAnalytics()

  useEffect(() => {
    screen('Signin:ForgotPassword')
  }, [screen])

  const onPressNext = async () => {
    if (!EmailValidator.validate(email)) {
      return setError('Your email appears to be invalid.')
    }

    setError('')
    setIsProcessing(true)

    try {
      const agent = new BskyAgent({service: serviceUrl})
      await agent.com.atproto.server.requestPasswordReset({email})
      onEmailSent()
    } catch (e: any) {
      const errMsg = e.toString()
      store.log.warn('Failed to request password reset', e)
      setIsProcessing(false)
      if (isNetworkError(e)) {
        setError(
          'Unable to contact your service. Please check your Internet connection.',
        )
      } else {
        setError(cleanError(errMsg))
      }
    }
  }

  return (
    <>
      <View>
        <Text type="title-lg" style={[pal.text, styles.screenTitle]}>
          Reset password
        </Text>
        <Text type="md" style={[pal.text, styles.instructions]}>
          Enter the email you used to create your account. We'll send you a
          "reset code" so you can set a new password.
        </Text>
        <View
          testID="forgotPasswordView"
          style={[pal.borderDark, pal.view, styles.group]}>
          {/* <TouchableOpacity
            testID="forgotPasswordSelectServiceButton"
            style={[pal.borderDark, styles.groupContent, styles.noTopBorder]}
            onPress={onPressSelectService}
            accessibilityRole="button"
            accessibilityLabel="Hosting provider"
            accessibilityHint="Sets hosting provider for password reset"
          >
            <FontAwesomeIcon
              icon="globe"
              style={[pal.textLight, styles.groupContentIcon]}
            />
            <Text style={[pal.text, styles.textInput]} numberOfLines={1}>
              {toNiceDomain(serviceUrl)}
            </Text>
            <View style={[pal.btn, styles.textBtnFakeInnerBtn]}>
              <FontAwesomeIcon
                icon="pen"
                size={12}
                style={pal.text as FontAwesomeIconStyle}
              />
            </View>
          </TouchableOpacity> */}
          <View
            style={[pal.borderDark, styles.groupContent, styles.noTopBorder]}>
            <FontAwesomeIcon
              icon="envelope"
              style={[pal.textLight, styles.groupContentIcon]}
            />
            <TextInput
              testID="forgotPasswordEmail"
              style={[pal.text, styles.textInput]}
              placeholder="Email address"
              placeholderTextColor={pal.colors.textLight}
              autoCapitalize="none"
              autoFocus
              autoCorrect={false}
              keyboardAppearance={theme.colorScheme}
              value={email}
              onChangeText={setEmail}
              editable={!isProcessing}
              accessibilityLabel="Email"
              accessibilityHint="Sets email for password reset"
            />
          </View>
        </View>
        {error ? (
          <View style={styles.error}>
            <View style={styles.errorIcon}>
              <FontAwesomeIcon icon="exclamation" style={s.white} size={10} />
            </View>
            <View style={s.flex1}>
              <Text style={[s.white, s.bold]}>{error}</Text>
            </View>
          </View>
        ) : undefined}
        <View style={[s.flexRow, s.alignCenter, s.pl20, s.pr20]}>
          <TouchableOpacity onPress={onPressBack} accessibilityRole="button">
            <Text type="xl" style={[pal.link, s.pl5]}>
              Back
            </Text>
          </TouchableOpacity>
          <View style={s.flex1} />
          {!serviceDescription || isProcessing ? (
            <ActivityIndicator />
          ) : !email ? (
            <Text type="xl-bold" style={[pal.link, s.pr5, styles.dimmed]}>
              Next
            </Text>
          ) : (
            <TouchableOpacity
              testID="newPasswordButton"
              onPress={onPressNext}
              accessibilityRole="button"
              accessibilityLabel="Go to next"
              accessibilityHint="Navigates to the next screen">
              <Text type="xl-bold" style={[pal.link, s.pr5]}>
                Next
              </Text>
            </TouchableOpacity>
          )}
          {!serviceDescription || isProcessing ? (
            <Text type="xl" style={[pal.textLight, s.pl10]}>
              Processing...
            </Text>
          ) : undefined}
        </View>
      </View>
    </>
  )
}

const SetNewPasswordForm = ({
  store,
  error,
  serviceUrl,
  setError,
  onPressBack,
  onPasswordSet,
}: {
  store: RootStoreModel
  error: string
  serviceUrl: string
  setError: (v: string) => void
  onPressBack: () => void
  onPasswordSet: () => void
}) => {
  const pal = usePalette('default')
  const theme = useTheme()
  const {screen} = useAnalytics()

  useEffect(() => {
    screen('Signin:SetNewPasswordForm')
  }, [screen])

  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [resetCode, setResetCode] = useState<string>('')
  const [password, setPassword] = useState<string>('')

  const onPressNext = async () => {
    setError('')
    setIsProcessing(true)

    try {
      const agent = new BskyAgent({service: serviceUrl})
      const token = resetCode.replace(/\s/g, '')
      await agent.com.atproto.server.resetPassword({
        token,
        password,
      })
      onPasswordSet()
    } catch (e: any) {
      const errMsg = e.toString()
      store.log.warn('Failed to set new password', e)
      setIsProcessing(false)
      if (isNetworkError(e)) {
        setError(
          'Unable to contact your service. Please check your Internet connection.',
        )
      } else {
        setError(cleanError(errMsg))
      }
    }
  }

  return (
    <>
      <View>
        <Text type="title-lg" style={[pal.text, styles.screenTitle]}>
          Set new password
        </Text>
        <Text type="lg" style={[pal.text, styles.instructions]}>
          You will receive an email with a "reset code." Enter that code here,
          then enter your new password.
        </Text>
        <View
          testID="newPasswordView"
          style={[pal.view, pal.borderDark, styles.group]}>
          <View
            style={[pal.borderDark, styles.groupContent, styles.noTopBorder]}>
            <FontAwesomeIcon
              icon="ticket"
              style={[pal.textLight, styles.groupContentIcon]}
            />
            <TextInput
              testID="resetCodeInput"
              style={[pal.text, styles.textInput]}
              placeholder="Reset code"
              placeholderTextColor={pal.colors.textLight}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardAppearance={theme.colorScheme}
              autoFocus
              value={resetCode}
              onChangeText={setResetCode}
              editable={!isProcessing}
              accessible={true}
              accessibilityLabel="Reset code"
              accessibilityHint="Input code sent to your email for password reset"
            />
          </View>
          <View style={[pal.borderDark, styles.groupContent]}>
            <FontAwesomeIcon
              icon="lock"
              style={[pal.textLight, styles.groupContentIcon]}
            />
            <TextInput
              testID="newPasswordInput"
              style={[pal.text, styles.textInput]}
              placeholder="New password"
              placeholderTextColor={pal.colors.textLight}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardAppearance={theme.colorScheme}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!isProcessing}
              accessible={true}
              accessibilityLabel="Password"
              accessibilityHint="Input new password"
            />
          </View>
        </View>
        {error ? (
          <View style={styles.error}>
            <View style={styles.errorIcon}>
              <FontAwesomeIcon icon="exclamation" style={s.white} size={10} />
            </View>
            <View style={s.flex1}>
              <Text style={[s.white, s.bold]}>{error}</Text>
            </View>
          </View>
        ) : undefined}
        <View style={[s.flexRow, s.alignCenter, s.pl20, s.pr20]}>
          <TouchableOpacity onPress={onPressBack} accessibilityRole="button">
            <Text type="xl" style={[pal.link, s.pl5]}>
              Back
            </Text>
          </TouchableOpacity>
          <View style={s.flex1} />
          {isProcessing ? (
            <ActivityIndicator />
          ) : !resetCode || !password ? (
            <Text type="2xl-bold" style={[pal.link, s.pr5, styles.dimmed]}>
              Next
            </Text>
          ) : (
            <TouchableOpacity
              testID="setNewPasswordButton"
              onPress={onPressNext}
              accessibilityRole="button"
              accessibilityLabel="Go to next"
              accessibilityHint="Navigates to the next screen">
              <Text type="xl-bold" style={[pal.link, s.pr5]}>
                Next
              </Text>
            </TouchableOpacity>
          )}
          {isProcessing ? (
            <Text type="xl" style={[pal.textLight, s.pl10]}>
              Updating...
            </Text>
          ) : undefined}
        </View>
      </View>
    </>
  )
}

const PasswordUpdatedForm = ({onPressNext}: {onPressNext: () => void}) => {
  const {screen} = useAnalytics()

  // useEffect(() => {
  screen('Signin:PasswordUpdatedForm')
  // }, [screen])

  const pal = usePalette('default')
  return (
    <>
      <View>
        <Text type="title-lg" style={[pal.text, styles.screenTitle]}>
          Password updated!
        </Text>
        <Text type="lg" style={[pal.text, styles.instructions]}>
          You can now sign in with your new password.
        </Text>
        <View style={[s.flexRow, s.alignCenter, s.pl20, s.pr20]}>
          <View style={s.flex1} />
          <TouchableOpacity
            onPress={onPressNext}
            accessibilityRole="button"
            accessibilityLabel="Close alert"
            accessibilityHint="Closes password update alert">
            <Text type="xl-bold" style={[pal.link, s.pr5]}>
              Okay
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  screenTitle: {
    marginBottom: 10,
    marginHorizontal: 20,
  },
  instructions: {
    marginBottom: 20,
    marginHorizontal: 20,
  },
  welcome: {
    marginBottom: 20,
    marginHorizontal: 20,
    fontSize: 24,
  },
  group: {
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 20,
    marginHorizontal: 20,
  },
  groupLabel: {
    paddingHorizontal: 20,
    paddingBottom: 5,
  },
  groupContent: {
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  noTopBorder: {
    borderTopWidth: 0,
  },
  groupContentIcon: {
    marginLeft: 10,
  },
  account: {
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  accountLast: {
    borderBottomWidth: 1,
    marginBottom: 20,
    paddingVertical: 8,
  },
  textInput: {
    flex: 1,
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 17,
    letterSpacing: 0.25,
    fontWeight: '400',
    borderRadius: 10,
  },
  textInputInnerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginHorizontal: 6,
  },
  textBtn: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  textBtnLabel: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  textBtnFakeInnerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginHorizontal: 6,
  },
  accountText: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingVertical: 10,
  },
  accountTextOther: {
    paddingLeft: 12,
  },
  error: {
    backgroundColor: colors.red4,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -5,
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  errorIcon: {
    borderWidth: 1,
    borderColor: colors.white,
    color: colors.white,
    borderRadius: 30,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
  },
  dimmed: {opacity: 0.5},
  footerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 25,
  },
  footerBtnFeedback: {
    paddingHorizontal: 24,
  },
  footerBtnFeedbackLight: {
    backgroundColor: '#DDEFFF',
  },
  footerBtnFeedbackDark: {
    backgroundColor: colors.blue6,
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
    color: gradients.purple.start,
    fontSize: 68,
    fontWeight: 'bold',
    paddingBottom: 10,
  },
  titleMobile: {
    textAlign: 'center',
    color: gradients.purple.start,
    fontSize: 58,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    color: colors.gray5,
    fontSize: 24,
    fontWeight: 'bold',
    paddingBottom: 30,
  },
  subtitleMobile: {
    textAlign: 'center',
    color: colors.gray5,
    fontSize: 18,
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
    borderRadius: 30,
    paddingHorizontal: 24,
    paddingVertical: 12,
    minWidth: 220,
    backgroundColor: colors.purple1,
  },
  btnLabel: {
    textAlign: 'center',
    fontSize: 18,
  },
  notice: {
    paddingHorizontal: 40,
    textAlign: 'center',
    fontSize: 16,
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
