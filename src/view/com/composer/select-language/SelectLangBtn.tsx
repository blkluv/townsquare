import React, {useCallback, useMemo} from 'react'
import {StyleSheet, Keyboard} from 'react-native'
import {observer} from 'mobx-react-lite'
import {
  FontAwesomeIcon,
  FontAwesomeIconStyle,
} from '@fortawesome/react-native-fontawesome'
import {Text} from 'view/com/util/text/Text'
import {
  DropdownButton,
  DropdownItem,
  DropdownItemButton,
} from 'view/com/util/forms/DropdownButton'
import {usePalette} from 'lib/hooks/usePalette'
import {useStores} from 'state/index'
import {isNative} from 'platform/detection'
import {codeToLanguageName} from '../../../../locale/helpers'

export const SelectLangBtn = observer(function SelectLangBtn() {
  const pal = usePalette('default')
  const store = useStores()

  const onPressMore = useCallback(async () => {
    if (isNative) {
      if (Keyboard.isVisible()) {
        Keyboard.dismiss()
      }
    }
    store.shell.openModal({name: 'post-languages-settings'})
  }, [store])

  const postLanguagesPref = store.preferences.postLanguages
  const postLanguagePref = store.preferences.postLanguage
  const items: DropdownItem[] = useMemo(() => {
    let arr: DropdownItemButton[] = []

    function add(commaSeparatedLangCodes: string) {
      const langCodes = commaSeparatedLangCodes.split(',')
      const langName = langCodes
        .map(code => codeToLanguageName(code))
        .join(' + ')

      /*
       * Filter out any duplicates
       */
      if (arr.find((item: DropdownItemButton) => item.label === langName)) {
        return
      }

      arr.push({
        icon:
          langCodes.every(code => store.preferences.hasPostLanguage(code)) &&
          langCodes.length === postLanguagesPref.length
            ? ['fas', 'circle-dot']
            : ['far', 'circle'],
        label: langName,
        onPress() {
          store.preferences.setPostLanguage(commaSeparatedLangCodes)
        },
      })
    }

    if (postLanguagesPref.length) {
      /*
       * Re-join here after sanitization bc postLanguageHistory is an array of
       * comma-separated strings too
       */
      add(postLanguagePref)
    }

    // comma-separted strings of lang codes that have been used in the past
    for (const lang of store.preferences.postLanguageHistory) {
      add(lang)
    }

    return [
      {heading: true, label: 'Post language'},
      ...arr.slice(0, 6),
      {sep: true},
      {
        label: 'Other...',
        onPress: onPressMore,
      },
    ]
  }, [store.preferences, onPressMore, postLanguagePref, postLanguagesPref])

  return (
    <DropdownButton
      type="bare"
      testID="selectLangBtn"
      items={items}
      openUpwards
      style={styles.button}
      accessibilityLabel="Language selection"
      accessibilityHint="">
      {postLanguagesPref.length > 0 ? (
        <Text type="lg-bold" style={[pal.link, styles.label]} numberOfLines={1}>
          {postLanguagesPref.map(lang => codeToLanguageName(lang)).join(', ')}
        </Text>
      ) : (
        <FontAwesomeIcon
          icon="language"
          style={pal.link as FontAwesomeIconStyle}
          size={26}
        />
      )}
    </DropdownButton>
  )
})

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 15,
  },
  label: {
    maxWidth: 100,
  },
})
