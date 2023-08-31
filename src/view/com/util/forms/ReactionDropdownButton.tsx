import {Button, ButtonType} from './Button'
import {
  Dimensions,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native'
import React, {PropsWithChildren, useMemo, useRef} from 'react'
import {colors, s} from 'lib/styles'

import {IconProp} from '@fortawesome/fontawesome-svg-core'
import {Image} from 'expo-image'
import {NavigationProp} from 'lib/routes/types'
import RootSiblings from 'react-native-root-siblings'
import {SolarplexReaction} from 'state/models/media/reactions'
import {Text} from '../text/Text'
import {useNavigation} from '@react-navigation/native'
import {usePalette} from 'lib/hooks/usePalette'
import {useStores} from 'state/index'
import {useTheme} from 'lib/ThemeContext'

const HITSLOP = {left: 20, top: 20, right: 20, bottom: 20}

export interface ReactionDropdownItemButton {
  testID?: string
  icon?: IconProp
  label: string
  onPress: () => void
}
export interface DropdownItemSeparator {
  sep: true
}
export type DropdownItem = SolarplexReaction

export type DropdownButtonType = ButtonType | 'bare'

interface DropdownButtonProps {
  testID?: string
  type?: DropdownButtonType
  style?: StyleProp<ViewStyle>
  items: SolarplexReaction[]
  label?: string
  menuWidth?: number
  children?: React.ReactNode
  openToRight?: boolean
  rightOffset?: number
  bottomOffset?: number
  onPressReaction: (emoji: SolarplexReaction) => void
}

export function ReactionDropdownButton({
  testID,
  type = 'bare',
  style,
  items,
  label,
  menuWidth,
  children,
  onPressReaction,
  openToRight = false,
  rightOffset = 0,
  bottomOffset = 0,
}: PropsWithChildren<DropdownButtonProps>) {
  const ref1 = useRef<TouchableOpacity>(null)
  const ref2 = useRef<View>(null)
  const store = useStores()
  const navigation = useNavigation<NavigationProp>()

  const onPress = () => {
    if (store.session.isSolarplexSession) {
      navigation.navigate('SignIn')
      return
    }
    const ref = ref1.current || ref2.current
    ref?.measure(
      (
        _x: number,
        _y: number,
        width: number,
        height: number,
        pageX: number,
        pageY: number,
      ) => {
        if (!menuWidth) {
          menuWidth = 200
        }
        const winHeight = Dimensions.get('window').height
        let estimatedMenuHeight = 102
        // for (const item of items) {
        //   if (item && isSep(item)) {
        //     estimatedMenuHeight += ESTIMATED_SEP_HEIGHT;
        //   } else if (item && isBtn(item)) {
        //     estimatedMenuHeight += ESTIMATED_BTN_HEIGHT;
        //   }
        // }
        const newX = openToRight
          ? pageX + width + rightOffset
          : pageX + width - menuWidth
        let newY = pageY + height + bottomOffset
        if (newY + estimatedMenuHeight > winHeight) {
          newY -= estimatedMenuHeight
        }
        createDropdownMenu(
          newX,
          newY,
          250,
          items.filter(v => !!v) as DropdownItem[],
          onPressReaction,
        )
      },
    )
  }

  const numItems = useMemo(
    () =>
      items.filter(item => {
        if (item === undefined) {
          return false
        }

        return isBtn(item)
      }).length,
    [items],
  )

  if (type === 'bare') {
    return (
      <TouchableOpacity
        testID={testID}
        style={style}
        onPress={onPress}
        hitSlop={HITSLOP}
        ref={ref1}
        accessibilityRole="button"
        accessibilityLabel={`Opens ${numItems} options`}
        accessibilityHint={`Opens ${numItems} options`}>
        {children}
      </TouchableOpacity>
    )
  }
  return (
    <View ref={ref2}>
      <Button
        type={type}
        testID={testID}
        onPress={onPress}
        style={style}
        label={label}>
        {children}
      </Button>
    </View>
  )
}

// export function ReactionPostDropdownBtn({
//   testID,
//   style,
//   children,
//   itemUri,
//   itemCid,
//   itemHref,
//   isAuthor,
//   isThreadMuted,
//   onCopyPostText,
//   onOpenTranslate,
//   onToggleThreadMute,
//   onDeletePost,
// }: {
//   testID?: string;
//   style?: StyleProp<ViewStyle>;
//   children?: React.ReactNode;
//   itemUri: string;
//   itemCid: string;
//   itemHref: string;
//   itemTitle: string;
//   isAuthor: boolean;
//   isThreadMuted: boolean;
//   onCopyPostText: () => void;
//   onOpenTranslate: () => void;
//   onToggleThreadMute: () => void;
//   onDeletePost: () => void;
// }) {
//   const store = useStores();

//   // const dropdownItems: DropdownItem[] = [
//   //   {
//   //     testID: "postDropdownTranslateBtn",
//   //     icon: "language",
//   //     label: "Translate...",
//   //     onPress() {
//   //       onOpenTranslate();
//   //     },
//   //   },
//   //   {
//   //     testID: "postDropdownCopyTextBtn",
//   //     icon: ["far", "paste"],
//   //     label: "Copy post text",
//   //     onPress() {
//   //       onCopyPostText();
//   //     },
//   //   },
//   //   {
//   //     testID: "postDropdownShareBtn",
//   //     icon: "share",
//   //     label: "Share...",
//   //     onPress() {
//   //       const url = toShareUrl(itemHref);
//   //       shareUrl(url);
//   //     },
//   //   },
//   //   !store.session.isSolarplexSession && { sep: true },
//   //   !store.session.isSolarplexSession && {
//   //     testID: "postDropdownMuteThreadBtn",
//   //     icon: "comment-slash",
//   //     label: isThreadMuted ? "Unmute thread" : "Mute thread",
//   //     onPress() {
//   //       onToggleThreadMute();
//   //     },
//   //   },
//   //   !store.session.isSolarplexSession && { sep: true },
//   //   !store.session.isSolarplexSession &&
//   //     !isAuthor && {
//   //       testID: "postDropdownReportBtn",
//   //       icon: "circle-exclamation",
//   //       label: "Report post",
//   //       onPress() {
//   //         store.shell.openModal({
//   //           name: "report-post",
//   //           postUri: itemUri,
//   //           postCid: itemCid,
//   //         });
//   //       },
//   //     },
//   //   !store.session.isSolarplexSession &&
//   //     isAuthor && {
//   //       testID: "postDropdownDeleteBtn",
//   //       icon: ["far", "trash-can"],
//   //       label: "Delete post",
//   //       onPress() {
//   //         store.shell.openModal({
//   //           name: "confirm",
//   //           title: "Delete this post?",
//   //           message: "Are you sure? This can not be undone.",
//   //           onPressConfirm: onDeletePost,
//   //         });
//   //       },
//   //     },
//   // ].filter(Boolean) as DropdownItem[];

//   return (
//     <ReactionDropdownButton
//       testID={testID}
//       style={style}
//       items={dropdownItems}
//       menuWidth={isWeb ? 220 : 200}
//     >
//       {children}
//     </ReactionDropdownButton>
//   );
// }

function createDropdownMenu(
  x: number,
  y: number,
  width: number,
  items: DropdownItem[],
  onPressReaction: (emoji: SolarplexReaction) => void,
): RootSiblings {
  const onPressItem = (index: number) => {
    sibling.destroy()
    const item = items[index]
    if (isBtn(item)) {
      onPressReaction(item)
    }
  }
  const onOuterPress = () => sibling.destroy()
  const sibling = new RootSiblings(
    (
      <DropdownItems
        onOuterPress={onOuterPress}
        x={x}
        y={y}
        width={width}
        items={items}
        onPressItem={onPressItem}
      />
    ),
  )
  return sibling
}

type DropDownItemProps = {
  onOuterPress: () => void
  x: number
  y: number
  width: number
  items: DropdownItem[]
  onPressItem: (index: number) => void
}

const DropdownItems = ({
  onOuterPress,
  x,
  y,
  width,
  items,
  onPressItem,
}: DropDownItemProps) => {
  const pal = usePalette('default')
  const theme = useTheme()
  const dropDownBackgroundColor =
    theme.colorScheme === 'dark' ? pal.btn : pal.view
  const separatorColor =
    theme.colorScheme === 'dark' ? pal.borderDark : pal.border

  const numItems = items.filter(isBtn).length

  return (
    <>
      <TouchableWithoutFeedback
        onPress={onOuterPress}
        // TODO: Refactor dropdown components to:
        // - (On web, if not handled by React Native) use semantic <select />
        // and <option /> elements for keyboard navigation out of the box
        // - (On mobile) be buttons by default, accept `label` and `nativeID`
        // props, and always have an explicit label
        accessibilityRole="button"
        accessibilityLabel="Toggle dropdown"
        accessibilityHint="">
        <View style={[styles.bg]} />
      </TouchableWithoutFeedback>
      <View
        style={[
          styles.menu,
          {left: x, top: y, width},
          dropDownBackgroundColor,
        ]}>
        {items.map((item, index) => {
          if (isBtn(item)) {
            return (
              <TouchableOpacity
                testID={item.reaction_id}
                key={index}
                style={[styles.menuItem]}
                onPress={() => onPressItem(index)}
                accessibilityLabel={item.nft_metadata?.name as string}
                accessibilityHint={`Option ${index + 1} of ${numItems}`}>
                {/* {item.icon && (
                  <FontAwesomeIcon
                    style={styles.icon}
                    icon={item.icon}
                    color={pal.text.color as string}
                  />
                )}
                <Text style={[styles.label, pal.text]}>{item.label}</Text> */}
                {/* <Image style={styles.image} source={{uri: (item.emoji as string)}}/> */}
                {(item?.nft_metadata?.image as string)?.includes('http') ? (
                  <Image
                    accessibilityIgnoresInvertColors={true}
                    style={styles.image}
                    source={{
                      uri: item?.nft_metadata?.image as string,
                    }}
                  />
                ) : (
                  <Text
                    style={[
                      s.f20,
                      {marginLeft: index ? -8 : 0, zIndex: -1 * index},
                    ]}>
                    {item?.nft_metadata?.image as string}
                  </Text>
                )}
              </TouchableOpacity>
            )
          } else if (isSep(item)) {
            return (
              <View key={index} style={[styles.separator, separatorColor]} />
            )
          }
          return null
        })}
      </View>
    </>
  )
}

function isSep(item: DropdownItem): item is DropdownItem {
  return 'sep' in item && (item.sep as boolean)
}
function isBtn(item: DropdownItem): item is DropdownItem {
  return !isSep(item)
}

const styles = StyleSheet.create({
  bg: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#000',
    opacity: 0.1,
  },
  menu: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 14,
    opacity: 1,
    paddingVertical: 6,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingLeft: 15,
    paddingRight: 15,
  },
  menuItemBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.gray1,
    marginTop: 4,
    paddingTop: 12,
  },
  icon: {
    marginLeft: 0,
    marginRight: 0,
  },
  label: {
    fontSize: 18,
  },
  separator: {
    borderTopWidth: 1,
    marginVertical: 8,
  },
  image: {
    // width: '100%',
    // height: '100%',
    resizeMode: 'contain',
    width: 20,
    height: 20,
  },
})
