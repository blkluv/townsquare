import {makeAutoObservable} from 'mobx'
import {RootStoreModel} from '../root-store'
import {ServiceDescription} from '../session'
import {DEFAULT_SERVICE} from 'state/index'
import {ComAtprotoServerCreateAccount} from '@atproto/api'
import * as EmailValidator from 'email-validator'
import {createFullHandle} from 'lib/strings/handles'
import {cleanError} from 'lib/strings/errors'
import {getAge} from 'lib/strings/time'
import {track} from 'lib/analytics/analytics'

const DEFAULT_DATE = new Date(Date.now() - 60e3 * 60 * 24 * 365 * 20) // default to 20 years ago

export class CreateAccountModel {
  step: number = 3
  isProcessing = false
  isFetchingServiceDescription = false
  didServiceDescriptionFetchFail = false
  error = ''

  serviceUrl = DEFAULT_SERVICE
  serviceDescription: ServiceDescription | undefined = undefined
  userDomain = ''
  inviteCode = ''
  email = ''
  password = ''
  handle = ''
  birthDate = DEFAULT_DATE

  constructor(public rootStore: RootStoreModel) {
    makeAutoObservable(this, {}, {autoBind: true})
  }

  get isAge13() {
    return getAge(this.birthDate) >= 13
  }

  get isAge18() {
    return getAge(this.birthDate) >= 18
  }

  // form state controls
  // =

  next() {
    this.error = ''
    if (this.step === 2) {
      if (!this.isAge13) {
        this.error =
          'Unfortunately, you do not meet the requirements to create an account.'
        return
      }
    }
    this.step++
  }

  back() {
    this.error = ''
    this.step--
  }

  setStep(v: number) {
    this.step = v
  }

  async fetchServiceDescription() {
    this.setError('')
    this.setIsFetchingServiceDescription(true)
    this.setDidServiceDescriptionFetchFail(false)
    this.setServiceDescription(undefined)
    if (!this.serviceUrl) {
      return
    }
    try {
      const desc = await this.rootStore.session.describeService(this.serviceUrl)
      this.setServiceDescription(desc)
      this.setUserDomain(desc.availableUserDomains[0])
    } catch (err: any) {
      this.rootStore.log.warn(
        `Failed to fetch service description for ${this.serviceUrl}`,
        err,
      )
      this.setError(
        'Unable to contact your service. Please check your Internet connection.',
      )
      this.setDidServiceDescriptionFetchFail(true)
    } finally {
      this.setIsFetchingServiceDescription(false)
    }
  }

  async submit() {
    if (!this.email) {
      this.setStep(2)
      return this.setError('Please enter your email.')
    }
    if (!EmailValidator.validate(this.email)) {
      this.setStep(2)
      return this.setError('Your email appears to be invalid.')
    }
    if (!this.password) {
      this.setStep(2)
      return this.setError('Please choose your password.')
    }
    if (!this.handle) {
      this.setStep(3)
      return this.setError('Please choose your handle.')
    }
    this.setError('')
    this.setIsProcessing(true)

    try {
      // NOTE(zfaizal2): need to look into what this is actually doing
      // this.rootStore.onboarding.start() // start now to avoid flashing the wrong view
      await this.rootStore.session.createAccount({
        service: this.serviceUrl,
        email: this.email,
        handle: createFullHandle(this.handle, this.userDomain),
        password: this.password,
        inviteCode: this.inviteCode,
      })
      track('Create Account')
    } catch (e: any) {
      this.rootStore.onboarding.skip() // undo starting the onboard
      let errMsg = e.toString()
      if (e instanceof ComAtprotoServerCreateAccount.InvalidInviteCodeError) {
        errMsg =
          'Invite code not accepted. Check that you input it correctly and try again.'
      }
      this.rootStore.log.error('Failed to create account', e)
      this.setIsProcessing(false)
      this.setError(cleanError(errMsg))
      throw e
    }
  }

  // form state accessors
  // =

  get canBack() {
    return this.step > 1
  }

  get canNext() {
    if (this.step === 1) {
      return !!this.serviceDescription
    } else if (this.step === 3) {
      return (
        (!this.isInviteCodeRequired || this.inviteCode) &&
        !!this.email &&
        !!this.password
      )
    }
    return !!this.handle
  }

  get isServiceDescribed() {
    return !!this.serviceDescription
  }

  get isInviteCodeRequired() {
    return this.serviceDescription?.inviteCodeRequired
  }

  // setters
  // =

  setIsProcessing(v: boolean) {
    this.isProcessing = v
  }

  setIsFetchingServiceDescription(v: boolean) {
    this.isFetchingServiceDescription = v
  }

  setDidServiceDescriptionFetchFail(v: boolean) {
    this.didServiceDescriptionFetchFail = v
  }

  setError(v: string) {
    this.error = v
  }

  setServiceUrl(v: string) {
    this.serviceUrl = v
  }

  setServiceDescription(v: ServiceDescription | undefined) {
    this.serviceDescription = v
  }

  setUserDomain(v: string) {
    this.userDomain = v
  }

  setInviteCode(v: string) {
    this.inviteCode = v
  }

  setEmail(v: string) {
    this.email = v
  }

  setPassword(v: string) {
    this.password = v
  }

  setHandle(v: string) {
    this.handle = v
  }

  setBirthDate(v: Date) {
    this.birthDate = v
  }
}
