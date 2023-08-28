import { BLAZE, BONK, BSOL, GUAC, SOL } from "lib/tipTokens";
import { Button, ButtonType } from "./Button";
import {
  Dimensions,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from "react-native";
import React, { PropsWithChildren, useMemo, useRef } from "react";

import { Image } from "expo-image";
import RootSiblings from "react-native-root-siblings";
import { Text } from "../text/Text";
import { colors } from "lib/styles";
import { isWeb } from "platform/detection";
import { useAnalytics } from "lib/analytics/analytics";
import { usePalette } from "lib/hooks/usePalette";
import { useStores } from "state/index";
import { useTheme } from "lib/ThemeContext";

const HITSLOP = { left: 10, top: 10, right: 10, bottom: 10 };
const ESTIMATED_BTN_HEIGHT = 50;
const ESTIMATED_SEP_HEIGHT = 16;

export interface DropdownItemButton {
  testID?: string;
  icon?: string;
  label: string;
  onPress: () => void;
}
export interface DropdownItemSeparator {
  sep: true;
}
export type DropdownItem = DropdownItemButton | DropdownItemSeparator;
type MaybeDropdownItem = DropdownItem | false | undefined;

export type DropdownButtonType = ButtonType | "bare";

interface DropdownButtonProps {
  testID?: string;
  type?: DropdownButtonType;
  style?: StyleProp<ViewStyle>;
  items: MaybeDropdownItem[];
  label?: string;
  menuWidth?: number;
  children?: React.ReactNode;
  openToRight?: boolean;
  rightOffset?: number;
  bottomOffset?: number;
}

export function DropdownButton({
  testID,
  type = "bare",
  style,
  items,
  label,
  menuWidth,
  children,
  openToRight = false,
  rightOffset = 0,
  bottomOffset = 0,
}: PropsWithChildren<DropdownButtonProps>) {
  const ref1 = useRef<TouchableOpacity>(null);
  const ref2 = useRef<View>(null);

  const onPress = () => {
    const ref = ref1.current || ref2.current;
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
          menuWidth = 200;
        }
        const winHeight = Dimensions.get("window").height;
        let estimatedMenuHeight = 0;
        for (const item of items) {
          if (item && isSep(item)) {
            estimatedMenuHeight += ESTIMATED_SEP_HEIGHT;
          } else if (item && isBtn(item)) {
            estimatedMenuHeight += ESTIMATED_BTN_HEIGHT;
          }
        }
        const newX = openToRight
          ? pageX + width + rightOffset
          : pageX + width - menuWidth;
        let newY = pageY + height + bottomOffset;
        if (newY + estimatedMenuHeight > winHeight) {
          newY -= estimatedMenuHeight;
        }
        createDropdownMenu(
          newX,
          newY,
          menuWidth,
          items.filter((v) => !!v) as DropdownItem[],
        );
      },
    );
  };

  const numItems = useMemo(
    () =>
      items.filter((item) => {
        if (item === undefined || item === false) {
          return false;
        }

        return isBtn(item);
      }).length,
    [items],
  );

  if (type === "bare") {
    return (
      <TouchableOpacity
        testID={testID}
        style={style}
        onPress={onPress}
        hitSlop={HITSLOP}
        ref={ref1}
        accessibilityRole="button"
        accessibilityLabel={`Opens ${numItems} options`}
        accessibilityHint={`Opens ${numItems} options`}
      >
        {children}
      </TouchableOpacity>
    );
  }
  return (
    <View ref={ref2}>
      <Button
        type={type}
        testID={testID}
        onPress={onPress}
        style={style}
        label={label}
      >
        {children}
      </Button>
    </View>
  );
}

export function TipDropdownBtn({
  testID,
  style,
  children,
  onBonkTip,
  onGuacTip,
  onBSOLTip,
  onBLZETip,
  onSOLTip,
}: {
  testID?: string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  onBonkTip: () => void;
  onGuacTip: () => void;
  onBSOLTip: () => void;
  onBLZETip: () => void;
  onSOLTip: () => void;
}) {
  const { track } = useAnalytics();

  const tipBtnAnalytics = (func: () => void,tokenName:string) => {
    track("Tip:TipButton", {
      token: tokenName
    });
    func();
  }

  const dropdownItems: DropdownItem[] = [
    {
      testID: "postDropdownBlze",
      icon: SOL.tokenImage,
      label: SOL.tokenName,
      onPress() {
        tipBtnAnalytics(() => onSOLTip(),SOL.tokenName)
      },
    },
    {
      testID: "postDropdownBonk",
      icon: BONK.tokenImage,
      label: BONK.tokenName,
      onPress() {
       tipBtnAnalytics(() =>   onBonkTip(),BONK.tokenName)
      },
    },
    {
      testID: "postDropdownGuac",
      icon: GUAC.tokenImage,
      label: GUAC.tokenName,
      onPress() {
        tipBtnAnalytics(() =>   onGuacTip(),GUAC.tokenName);
      },
    },
    {
      testID: "postDropdownBsol",
      icon: BSOL.tokenImage,
      label:  BSOL.tokenName,
      onPress() {
       tipBtnAnalytics(() =>  onBSOLTip(),BSOL.tokenName)
      },
    },
    {
      testID: "postDropdownBlze",
      icon: BLAZE.tokenImage,
      label: BLAZE.tokenName,
      onPress() {
        tipBtnAnalytics(() => onBLZETip(),BLAZE.tokenName);
      },
    },
  ].filter(Boolean) as DropdownItem[];

  return (
    <DropdownButton
      testID={testID}
      style={style}
      items={dropdownItems}
      menuWidth={isWeb ? 150 : 200}
    >
      {children}
    </DropdownButton>
  );
}

function createDropdownMenu(
  x: number,
  y: number,
  width: number,
  items: DropdownItem[],
): RootSiblings {
  const onPressItem = (index: number) => {
    sibling.destroy();
    const item = items[index];
    if (isBtn(item)) {
      item.onPress();
    }
  };
  const onOuterPress = () => sibling.destroy();
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
  );
  return sibling;
}

type DropDownItemProps = {
  onOuterPress: () => void;
  x: number;
  y: number;
  width: number;
  items: DropdownItem[];
  onPressItem: (index: number) => void;
};

const DropdownItems = ({
  onOuterPress,
  x,
  y,
  width,
  items,
  onPressItem,
}: DropDownItemProps) => {
  const pal = usePalette("default");
  const theme = useTheme();
  const dropDownBackgroundColor =
    theme.colorScheme === "dark" ? pal.btn : pal.view;
  const separatorColor =
    theme.colorScheme === "dark" ? pal.borderDark : pal.border;

  const numItems = items.filter(isBtn).length;

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
        accessibilityHint=""
      >
        <View style={[styles.bg]} />
      </TouchableWithoutFeedback>
      <View
        style={[
          styles.menu,
          { left: x, top: y, width },
          dropDownBackgroundColor,
        ]}
      >
        {items.map((item, index) => {
          if (isBtn(item)) {
            return (
              <TouchableOpacity
                testID={item.testID}
                key={index}
                style={[styles.menuItem]}
                onPress={() => onPressItem(index)}
                accessibilityLabel={item.label}
                accessibilityHint={`Option ${index + 1} of ${numItems}`}
              >
                {item.icon && (
                  <Image
                    style={styles.icon}
                    source={{
                      uri: item.icon,
                    }}
                  />
                )}
                <Text style={[styles.label, pal.text]}>{item.label}</Text>
              </TouchableOpacity>
            );
          } else if (isSep(item)) {
            return (
              <View key={index} style={[styles.separator, separatorColor]} />
            );
          }
          return null;
        })}
      </View>
    </>
  );
};

function isSep(item: DropdownItem): item is DropdownItemSeparator {
  return "sep" in item && item.sep;
}
function isBtn(item: DropdownItem): item is DropdownItemButton {
  return !isSep(item);
}

const styles = StyleSheet.create({
  bg: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "#000",
    opacity: 0.1,
  },
  menu: {
    position: "absolute",
    backgroundColor: "#fff",
    borderRadius: 14,
    opacity: 1,
    paddingVertical: 6,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingLeft: 15,
    paddingRight: 20,
  },
  menuItemBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.gray1,
    marginTop: 4,
    paddingTop: 12,
  },
  icon: {
    width: 22,
    height: 22,
    marginLeft: 6,
    marginRight: 8,
  },
  label: {
    fontSize: 18,
  },
  separator: {
    borderTopWidth: 1,
    marginVertical: 8,
  },
});
