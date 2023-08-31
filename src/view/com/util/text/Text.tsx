import {Text as RNText, TextProps} from 'react-native'
import {TypographyVariant, useTheme} from 'lib/ThemeContext'
import {lh, s} from 'lib/styles'

import React from 'react'

export type CustomTextProps = TextProps & {
  type?: TypographyVariant
  lineHeight?: number
  title?: string
  dataSet?: Record<string, string | number>
}

export function Text({
  type = 'md',
  children,
  lineHeight,
  style,
  title,
  dataSet,
  ...props
}: React.PropsWithChildren<CustomTextProps>) {
  const theme = useTheme()
  const typography = theme.typography[type]
  const lineHeightStyle = lineHeight ? lh(theme, type, lineHeight) : undefined
  return (
    <RNText
      style={[s.black, typography, lineHeightStyle, style]}
      // @ts-ignore web only -esb
      dataSet={Object.assign({tooltip: title}, dataSet || {})}
      {...props}>
      {children}
    </RNText>
  )
}
