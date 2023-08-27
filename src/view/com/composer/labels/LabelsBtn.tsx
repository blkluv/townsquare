import {Keyboard, StyleSheet} from 'react-native'

import {Button} from '../../../../view/com/util/forms/Button'
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome'
import {FontAwesomeIconStyle} from '@fortawesome/react-native-fontawesome'
import React from 'react'
import {ShieldExclamation} from '../../../../lib/icons'
import {isNative} from '../../../../platform/detection'
import {observer} from 'mobx-react-lite'
import {usePalette} from '../../../../lib/hooks/usePalette'
import {useStores} from '../../../../state/index'

export const LabelsBtn = observer(function LabelsBtn({
  labels,
  hasMedia,
  onChange,
}: {
  labels: string[]
  hasMedia: boolean
  onChange: (v: string[]) => void
}) {
  const pal = usePalette('default')
  const store = useStores()

  return (
    <Button
      type="default-light"
      testID="labelsBtn"
      style={[styles.button, !hasMedia && styles.dimmed]}
      accessibilityLabel="Content warnings"
      accessibilityHint=""
      onPress={() => {
        if (isNative) {
          if (Keyboard.isVisible()) {
            Keyboard.dismiss()
          }
        }
        store.shell.openModal({name: 'self-label', labels, hasMedia, onChange})
      }}>
      <ShieldExclamation style={pal.link} size={26} />
      {labels.length > 0 ? (
        <FontAwesomeIcon
          icon="check"
          size={16}
          style={pal.link as FontAwesomeIconStyle}
        />
      ) : null}
    </Button>
  )
})

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginRight: 4,
  },
  dimmed: {
    opacity: 0.4,
  },
  label: {
    maxWidth: 100,
  },
})
