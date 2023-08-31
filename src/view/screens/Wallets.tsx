import {CommonNavigatorParams, NativeStackScreenProps} from 'lib/routes/types'
import {StyleSheet, View} from 'react-native'

import {ScrollView} from 'view/com/util/Views.web'
import {Text} from 'view/com/util/text/Text'
import {ViewHeader} from '../com/util/ViewHeader'
import {WalletConnect} from 'view/com/wallet/WalletConnect'
import {observer} from 'mobx-react-lite'
import {s} from 'lib/styles'
import {useFocusEffect} from '@react-navigation/native'
import {usePalette} from 'lib/hooks/usePalette'
import {useStores} from 'state/index'

import React = require('react')

type Props = NativeStackScreenProps<CommonNavigatorParams, 'Wallets'>
export const Wallets = observer((_props: Props) => {
  const store = useStores()
  const pal = usePalette('default')

  useFocusEffect(
    React.useCallback(() => {
      store.shell.setMinimalShellMode(false)
    }, [store]),
  )

  return (
    <View style={[s.hContentRegion]}>
      <ViewHeader title="Wallets" />
      <ScrollView
        style={[s.hContentRegion]}
        // contentContainerStyle={!isDesktopWeb && pal.viewLight}
        scrollIndicatorInsets={{right: 1}}>
        <View style={styles.spacer20} />
        <Text type="xl-bold" style={[pal.text, styles.heading]}>
          Wallets
        </Text>
        <WalletConnect />
      </ScrollView>
    </View>
  )
})

const styles = StyleSheet.create({
  heading: {
    paddingHorizontal: 36,
    paddingBottom: 6,
  },
  spacer20: {
    height: 20,
  },
})
