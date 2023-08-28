import {StyleSheet, TouchableOpacity, View} from 'react-native'

import {CharProgress} from '../../composer/char-progress/CharProgress'
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome'
import React from 'react'
import {SendReportButton} from './SendReportButton'
import {Text} from '../../util/text/Text'
import {TextInput} from '../util'
import {isDesktopWeb} from 'platform/detection'
import {s} from 'lib/styles'
import {usePalette} from 'lib/hooks/usePalette'

export function InputIssueDetails({
  details,
  setDetails,
  goBack,
  submitReport,
  isProcessing,
}: {
  details: string | undefined
  setDetails: (v: string) => void
  goBack: () => void
  submitReport: () => void
  isProcessing: boolean
}) {
  const pal = usePalette('default')

  return (
    <View style={[styles.detailsContainer]}>
      <TouchableOpacity
        testID="addDetailsBtn"
        style={[s.mb10, styles.backBtn]}
        onPress={goBack}
        accessibilityRole="button"
        accessibilityLabel="Add details"
        accessibilityHint="Add more details to your report">
        <FontAwesomeIcon size={18} icon="angle-left" style={[pal.link]} />
        <Text style={[pal.text, s.f18, pal.link]}> Back</Text>
      </TouchableOpacity>
      <View style={[pal.btn, styles.detailsInputContainer]}>
        <TextInput
          accessibilityLabel="Text input field"
          accessibilityHint="Enter a reason for reporting this post."
          placeholder="Enter a reason or any other details here."
          placeholderTextColor={pal.textLight.color}
          value={details}
          onChangeText={setDetails}
          autoFocus={true}
          numberOfLines={3}
          multiline={true}
          textAlignVertical="top"
          maxLength={300}
          style={[styles.detailsInput, pal.text]}
        />
        <View style={styles.detailsInputBottomBar}>
          <View style={styles.charCounter}>
            <CharProgress count={details?.length || 0} />
          </View>
        </View>
      </View>
      <SendReportButton onPress={submitReport} isProcessing={isProcessing} />
    </View>
  )
}

const styles = StyleSheet.create({
  detailsContainer: {
    marginTop: isDesktopWeb ? 0 : 12,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsInputContainer: {
    borderRadius: 8,
  },
  detailsInput: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 12,
    borderRadius: 8,
    minHeight: 100,
    fontSize: 16,
  },
  detailsInputBottomBar: {
    alignSelf: 'flex-end',
  },
  charCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
    paddingBottom: 8,
  },
})
