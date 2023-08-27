import {StyleSheet, View} from 'react-native'

import React from 'react'
import {Text} from './text/Text'
import {usePalette} from 'lib/hooks/usePalette'
import {useStores} from 'state/index'

export function PostSandboxWarning() {
  const store = useStores()
  const pal = usePalette('default')
  if (store.session.isSandbox) {
    return (
      <View style={styles.container}>
        <Text
          type="title-2xl"
          style={[pal.text, styles.text]}
          accessible={false}>
          SANDBOX
        </Text>
      </View>
    )
  }
  return null
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 6,
    right: 10,
  },
  text: {
    fontWeight: 'bold',
    opacity: 0.07,
  },
})
