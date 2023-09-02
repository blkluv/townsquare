import React, {useState} from 'react'
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import {Text} from '../util/text/Text'
import {useStores} from 'state/index'
import {s, gradients} from 'lib/styles'
import {ErrorMessage} from '../util/error/ErrorMessage'
import {cleanError} from 'lib/strings/errors'
import {usePalette} from 'lib/hooks/usePalette'
import {isDesktopWeb} from 'platform/detection'
import type {ConfirmModal} from 'state/models/ui/shell'

export const snapPoints = ['50%']

export function Component({
  title,
  message,
  onPressConfirm,
  onPressCancel,
  confirmBtnText,
  confirmBtnStyle,
}: ConfirmModal) {
  const pal = usePalette('default')
  const store = useStores()
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const onPress = async () => {
    setError('')
    setIsProcessing(true)
    try {
      await onPressConfirm()
      store.shell.closeModal()
      return
    } catch (e: any) {
      setError(cleanError(e))
      setIsProcessing(false)
    }
  }
  return (
    <View testID="confirmModal" style={[pal.view, styles.container]}>
      <Text type="title-xl" style={[pal.text, styles.title]}>
        {title}
      </Text>
      {typeof message === 'string' ? (
        <Text type="xl" style={[pal.textLight, styles.description]}>
          {message}
        </Text>
      ) : (
        message()
      )}
      {error ? (
        <View style={s.mt10}>
          <ErrorMessage message={error} />
        </View>
      ) : undefined}
      <View style={s.flex1} />
      {isProcessing ? (
        <View style={[styles.btn, s.mt10]}>
          <ActivityIndicator />
        </View>
      ) : (
        <TouchableOpacity
          testID="confirmBtn"
          onPress={onPress}
          style={[styles.btn, confirmBtnStyle]}
          accessibilityRole="button"
          accessibilityLabel="Confirm"
          accessibilityHint="">
          <Text style={[s.white, s.bold, s.f18]}>
            {confirmBtnText ?? 'Confirm'}
          </Text>
        </TouchableOpacity>
      )}
      {onPressCancel === undefined ? null : (
        <TouchableOpacity
          testID="cancelBtn"
          onPress={onPressCancel}
          style={[styles.btnCancel, s.mt10]}
          accessibilityRole="button"
          accessibilityLabel="Cancel"
          accessibilityHint="">
          <Text type="button-lg" style={pal.textLight}>
            Cancel
          </Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    paddingBottom: isDesktopWeb ? 0 : 60,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    textAlign: 'center',
    paddingHorizontal: 22,
    marginBottom: 10,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
    padding: 14,
    marginTop: 22,
    marginHorizontal: 44,
    backgroundColor: gradients.purple.start,
  },
  btnCancel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
    padding: 14,
    marginHorizontal: 20,
  },
})
