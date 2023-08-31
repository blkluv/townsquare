import {CreateAccountModel} from 'state/models/ui/create-account'
import {Policies} from './Policies'
import React from 'react'
import {Text} from 'view/com/util/text/Text'
import {TextInput} from '../util/TextInput'
import {View} from 'react-native'
import {createFullHandle} from 'lib/strings/handles'
import {observer} from 'mobx-react-lite'
import {s} from 'lib/styles'
import {usePalette} from 'lib/hooks/usePalette'

export const Step3 = observer(({model}: {model: CreateAccountModel}) => {
  const pal = usePalette('default')
  return (
    <View>
      {/* <StepHeader step="3" title="Your user handle" /> */}
      <View style={s.pb10}>
        <Text type="md-medium" style={[pal.text, s.mb2]} nativeID="birthDate">
          Your username
        </Text>
        <TextInput
          testID="handleInput"
          icon="at"
          placeholder="eg alice (3-12 characters)"
          value={model.handle}
          editable
          onChange={model.setHandle}
          // TODO: Add explicit text label
          accessibilityLabel="User handle"
          accessibilityHint="Input your user handle"
        />

        <Text type="lg-bold" style={[pal.text, s.pl5, s.pt10]}>
          <Text type="lg" style={[pal.text]}>
            Your Handle will be
          </Text>{' '}
          @{createFullHandle(model.handle, model.userDomain)}
        </Text>
      </View>
      {/* {model.error ? (
        <ErrorMessage message={model.error} style={styles.error} />
      ) : undefined} */}
      {model.serviceDescription && (
        <Policies
          serviceDescription={model.serviceDescription}
          needsGuardian={!model.isAge18}
        />
      )}
    </View>
  )
})
