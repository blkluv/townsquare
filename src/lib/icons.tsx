import React from 'react'
import {StyleProp, TextStyle, ViewStyle} from 'react-native'
import Svg, {Circle, Ellipse, Line, Path, Rect} from 'react-native-svg'

export function MoneyBill({
  size,
  style,
}: {
  style?: StyleProp<ViewStyle>
  size?: string | number
}) {
  return (
    <Svg
      width={size || 22}
      height={size || 22}
      viewBox="0 0 576 512"
      fill="#71768A"
      style={style}>
      <path d="M312 24V34.5c6.4 1.2 12.6 2.7 18.2 4.2c12.8 3.4 20.4 16.6 17 29.4s-16.6 20.4-29.4 17c-10.9-2.9-21.1-4.9-30.2-5c-7.3-.1-14.7 1.7-19.4 4.4c-2.1 1.3-3.1 2.4-3.5 3c-.3 .5-.7 1.2-.7 2.8c0 .3 0 .5 0 .6c.2 .2 .9 1.2 3.3 2.6c5.8 3.5 14.4 6.2 27.4 10.1l.9 .3c11.1 3.3 25.9 7.8 37.9 15.3c13.7 8.6 26.1 22.9 26.4 44.9c.3 22.5-11.4 38.9-26.7 48.5c-6.7 4.1-13.9 7-21.3 8.8V232c0 13.3-10.7 24-24 24s-24-10.7-24-24V220.6c-9.5-2.3-18.2-5.3-25.6-7.8c-2.1-.7-4.1-1.4-6-2c-12.6-4.2-19.4-17.8-15.2-30.4s17.8-19.4 30.4-15.2c2.6 .9 5 1.7 7.3 2.5c13.6 4.6 23.4 7.9 33.9 8.3c8 .3 15.1-1.6 19.2-4.1c1.9-1.2 2.8-2.2 3.2-2.9c.4-.6 .9-1.8 .8-4.1l0-.2c0-1 0-2.1-4-4.6c-5.7-3.6-14.3-6.4-27.1-10.3l-1.9-.6c-10.8-3.2-25-7.5-36.4-14.4c-13.5-8.1-26.5-22-26.6-44.1c-.1-22.9 12.9-38.6 27.7-47.4c6.4-3.8 13.3-6.4 20.2-8.2V24c0-13.3 10.7-24 24-24s24 10.7 24 24zM568.2 336.3c13.1 17.8 9.3 42.8-8.5 55.9L433.1 485.5c-23.4 17.2-51.6 26.5-80.7 26.5H192 32c-17.7 0-32-14.3-32-32V416c0-17.7 14.3-32 32-32H68.8l44.9-36c22.7-18.2 50.9-28 80-28H272h16 64c17.7 0 32 14.3 32 32s-14.3 32-32 32H288 272c-8.8 0-16 7.2-16 16s7.2 16 16 16H392.6l119.7-88.2c17.8-13.1 42.8-9.3 55.9 8.5zM193.6 384l0 0-.9 0c.3 0 .6 0 .9 0z" />
    </Svg>
  )
}

/**
 * Put all new Solarplex icons here.
 */

export function CommunitiesIcon({
  strokeWidth = 1.5,
}: {
  style?: StyleProp<ViewStyle>
  size?: string | number
  strokeWidth?: number
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="1.3em"
      viewBox="0 0 640 512"
      strokeWidth={strokeWidth}>
      <path d="M128 128a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm-16 32C50.1 160 0 210.1 0 272c0 44.7 26.2 83.2 64 101.2V416c0 17.7 14.3 32 32 32h64c17.7 0 32-14.3 32-32V384c0-13.3-10.7-24-24-24s-24 10.7-24 24v16H112l0-16V336l0-128h32c12.6 0 24.3 3.6 34.2 9.9c7.9-14.2 18.1-26.9 30.2-37.6C190.2 167.5 168 160 144 160H112zM64 229.7v84.7C54 303.1 48 288.2 48 272s6-31.1 16-42.3zM496 208h32V336v48 16H496V384c0-13.3-10.7-24-24-24s-24 10.7-24 24v32c0 17.7 14.3 32 32 32h64c17.7 0 32-14.3 32-32V373.2c37.8-18 64-56.5 64-101.2c0-61.9-50.1-112-112-112H496c-24 0-46.2 7.5-64.4 20.3c12 10.7 22.3 23.4 30.2 37.6c9.9-6.3 21.6-9.9 34.2-9.9zm96 64c0 16.2-6 31.1-16 42.3V229.7c10 11.3 16 26.1 16 42.3zM560 80a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM320 144a56 56 0 1 0 0-112 56 56 0 1 0 0 112zm-16 32c-61.9 0-112 50.1-112 112c0 44.7 26.2 83.2 64 101.2V448c0 17.7 14.3 32 32 32h64c17.7 0 32-14.3 32-32V389.2c37.8-18 64-56.5 64-101.2c0-61.9-50.1-112-112-112H304zm0 224V352 224h32l0 128v48 32H304V400zm-48-69.7c-10-11.3-16-26.1-16-42.3s6-31.1 16-42.3v84.7zm128 0V245.7c10 11.3 16 26.1 16 42.3s-6 31.1-16 42.3z" />
    </svg>
  )
}

export function CommunitiesIconSolid() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="1.3em"
      viewBox="0 0 640 512">
      <path d="M72 88a56 56 0 1 1 112 0A56 56 0 1 1 72 88zM64 245.7C54 256.9 48 271.8 48 288s6 31.1 16 42.3V245.7zm144.4-49.3C178.7 222.7 160 261.2 160 304c0 34.3 12 65.8 32 90.5V416c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V389.2C26.2 371.2 0 332.7 0 288c0-61.9 50.1-112 112-112h32c24 0 46.2 7.5 64.4 20.3zM448 416V394.5c20-24.7 32-56.2 32-90.5c0-42.8-18.7-81.3-48.4-107.7C449.8 183.5 472 176 496 176h32c61.9 0 112 50.1 112 112c0 44.7-26.2 83.2-64 101.2V416c0 17.7-14.3 32-32 32H480c-17.7 0-32-14.3-32-32zm8-328a56 56 0 1 1 112 0A56 56 0 1 1 456 88zM576 245.7v84.7c10-11.3 16-26.1 16-42.3s-6-31.1-16-42.3zM320 32a64 64 0 1 1 0 128 64 64 0 1 1 0-128zM240 304c0 16.2 6 31 16 42.3V261.7c-10 11.3-16 26.1-16 42.3zm144-42.3v84.7c10-11.3 16-26.1 16-42.3s-6-31.1-16-42.3zM448 304c0 44.7-26.2 83.2-64 101.2V448c0 17.7-14.3 32-32 32H288c-17.7 0-32-14.3-32-32V405.2c-37.8-18-64-56.5-64-101.2c0-61.9 50.1-112 112-112h32c61.9 0 112 50.1 112 112z" />
    </svg>
  )
}

export function RegularFaceSmileIcon({
  size,
  style,
}: {
  style?: StyleProp<ViewStyle>
  size?: string | number
}) {
  return (
    <Svg
      width={size || 22}
      height={size || 22}
      viewBox="0 0 640 512"
      fill="#71768A"
      style={style}>
      <path d="M208 96C93.1 96 0 189.1 0 304s93.1 208 208 208 208-93.1 208-208S322.9 96 208 96zm0 368c-88.2 0-160-71.8-160-160s71.8-160 160-160 160 71.8 160 160-71.8 160-160 160zm61.8-124.2c-30.6 35.8-92.9 35.8-123.5 0-8.7-10.1-23.8-11.2-33.8-2.7-10.1 8.6-11.2 23.8-2.7 33.8 24.4 28.6 60.2 45 98.2 45s73.8-16.4 98.2-45c8.6-10.1 7.4-25.2-2.7-33.8-10-8.5-25.1-7.4-33.7 2.7zM144 288c17.7 0 32-14.3 32-32s-14.3-32-32-32-32 14.3-32 32 14.3 32 32 32zm128 0c17.7 0 32-14.3 32-32s-14.3-32-32-32-32 14.3-32 32 14.3 32 32 32zM624 88h-72V16c0-8.8-7.2-16-16-16h-16c-8.8 0-16 7.2-16 16v72h-72c-8.8 0-16 7.2-16 16v16c0 8.8 7.2 16 16 16h72v72c0 8.8 7.2 16 16 16h16c8.8 0 16-7.2 16-16v-72h72c8.8 0 16-7.2 16-16v-16c0-8.8-7.2-16-16-16z" />
    </Svg>
  )
}

export function SolidFaceSmileIcon({
  size,
  style,
}: {
  style?: StyleProp<ViewStyle>
  size?: string | number
}) {
  return (
    <Svg
      width={size || 22}
      height={size || 22}
      viewBox="0 0 640 512"
      fill="#71768A"
      style={style}>
      <path d="M544 0c-13.3 0-24 10.7-24 24V72H472c-13.3 0-24 10.7-24 24s10.7 24 24 24h48v48c0 13.3 10.7 24 24 24s24-10.7 24-24V120h48c13.3 0 24-10.7 24-24s-10.7-24-24-24H568V24c0-13.3-10.7-24-24-24zM224 512a224 224 0 1 0 0-448 224 224 0 1 0 0 448zM144.4 208a32 32 0 1 1 0 64 32 32 0 1 1 0-64zm128 32a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zM140 346.1c20.5 23.3 50.6 37.9 84 37.9s63.5-14.6 84-37.9c5.8-6.6 16-7.3 22.6-1.4s7.3 16 1.4 22.6C305.6 397.1 267 416 224 416s-81.6-18.9-108-48.7c-5.8-6.6-5.2-16.7 1.4-22.6s16.7-5.2 22.6 1.4z" />
    </Svg>
  )
}

export function SolidRankingStarIcon({
  size,
  style,
}: {
  style?: StyleProp<ViewStyle>
  size?: string | number
}) {
  return (
    <Svg
      style={style}
      width={size || 22}
      height={size || 22}
      viewBox="0 0 640 512"
      fill="#434248">
      <path d="M353.8 54.1L330.2 6.3c-3.9-8.3-16.1-8.6-20.4 0L286.2 54.1l-52.3 7.5c-9.3 1.4-13.3 12.9-6.4 19.8l38 37-9 52.1c-1.4 9.3 8.2 16.5 16.8 12.2l46.9-24.8 46.6 24.4c8.6 4.3 18.3-2.9 16.8-12.2l-9-52.1 38-36.6c6.8-6.8 2.9-18.3-6.4-19.8l-52.3-7.5zM256 256c-17.7 0-32 14.3-32 32V480c0 17.7 14.3 32 32 32H384c17.7 0 32-14.3 32-32V288c0-17.7-14.3-32-32-32H256zM32 320c-17.7 0-32 14.3-32 32V480c0 17.7 14.3 32 32 32H160c17.7 0 32-14.3 32-32V352c0-17.7-14.3-32-32-32H32zm416 96v64c0 17.7 14.3 32 32 32H608c17.7 0 32-14.3 32-32V416c0-17.7-14.3-32-32-32H480c-17.7 0-32 14.3-32 32z" />
    </Svg>
  )
}

export function RegularRankingStarIcon({
  size,
  style,
}: {
  style?: StyleProp<ViewStyle>
  size?: string | number
}) {
  return (
    <Svg
      style={style}
      width={size || 22}
      height={size || 22}
      viewBox="0 0 640 512"
      fill="#434248">
      <path d="M353.8 54.1l52.3 7.5c9.3 1.4 13.2 12.9 6.4 19.8l-38 36.6 9 52.1c1.4 9.3-8.2 16.5-16.8 12.2l-46.6-24.4-46.9 24.8c-8.6 4.3-18.3-2.9-16.8-12.2l9-52.1-38-37c-6.8-6.8-2.9-18.3 6.4-19.8l52.3-7.5L309.8 6.3c4.3-8.6 16.5-8.3 20.4 0l23.6 47.8zM272 304V464h96V304H272zm-48 0c0-26.5 21.5-48 48-48h96c26.5 0 48 21.5 48 48V464c0 26.5-21.5 48-48 48H272c-26.5 0-48-21.5-48-48V304zM48 368v96h96V368H48zM0 368c0-26.5 21.5-48 48-48h96c26.5 0 48 21.5 48 48v96c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V368zm592 32H496v64h96V400zm-96-48h96c26.5 0 48 21.5 48 48v64c0 26.5-21.5 48-48 48H496c-26.5 0-48-21.5-48-48V400c0-26.5 21.5-48 48-48z" />
    </Svg>
  )
}

export function SolidReactionIcon({
  size,
  style,
}: {
  style?: StyleProp<ViewStyle>
  size?: string | number
}) {
  return (
    <Svg
      style={style}
      width={size || 22}
      height={size || 22}
      viewBox="0 0 512 512"
      fill="#434248">
      <path d="M500.3 7.3C507.7 13.3 512 22.4 512 32V176c0 26.5-28.7 48-64 48s-64-21.5-64-48s28.7-48 64-48V71L352 90.2V208c0 26.5-28.7 48-64 48s-64-21.5-64-48s28.7-48 64-48V64c0-15.3 10.8-28.4 25.7-31.4l160-32c9.4-1.9 19.1 .6 26.6 6.6zM74.7 304l11.8-17.8c5.9-8.9 15.9-14.2 26.6-14.2h61.7c10.7 0 20.7 5.3 26.6 14.2L213.3 304H240c26.5 0 48 21.5 48 48V464c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V352c0-26.5 21.5-48 48-48H74.7zM192 408a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM478.7 278.3L440.3 368H496c6.7 0 12.6 4.1 15 10.4s.6 13.3-4.4 17.7l-128 112c-5.6 4.9-13.9 5.3-19.9 .9s-8.2-12.4-5.3-19.2L391.7 400H336c-6.7 0-12.6-4.1-15-10.4s-.6-13.3 4.4-17.7l128-112c5.6-4.9 13.9-5.3 19.9-.9s8.2 12.4 5.3 19.2zm-339-59.2c-6.5 6.5-17 6.5-23 0L19.9 119.2c-28-29-26.5-76.9 5-103.9c27-23.5 68.4-19 93.4 6.5l10 10.5 9.5-10.5c25-25.5 65.9-30 93.9-6.5c31 27 32.5 74.9 4.5 103.9l-96.4 99.9z" />
    </Svg>
  )
}

export function RegularReactionIcon({
  size,
  style,
}: {
  style?: StyleProp<ViewStyle>
  size?: string | number
}) {
  return (
    <Svg
      style={style}
      width={size || 22}
      height={size || 22}
      viewBox="0 0 512 512"
      fill="#434248">
      <path d="M144 343.78a48 48 0 1 0 48 48 48 48 0 0 0-48-48zM101.74 213a37 37 0 0 0 52.36 0l78.56-78.44A79.06 79.06 0 0 0 227 17.49c-28.08-23.13-69.54-22.82-99-.86-29.45-22-71-22.3-99.05.89a79.11 79.11 0 0 0-5.77 117.08zM59.42 54.53A29.54 29.54 0 0 1 78.35 48 35.08 35.08 0 0 1 103 58.32l25 24.89 24.93-24.89c12.25-12.15 31.43-13.83 43.58-3.82a31.09 31.09 0 0 1 2.31 46.15l-70.85 70.71-70.87-70.69a31.13 31.13 0 0 1 2.32-46.14zm337.93 305.24l32.27-69.89a24 24 0 1 0-43.54-20.12l-63.7 138h109.27l-36.92 68.58A24 24 0 1 0 437 499.05l75-139.28zm-141.44-72h-27.42l-7.09-14.17a27.36 27.36 0 0 0-25.64-17.76H92.08a27.39 27.39 0 0 0-25.65 17.76l-7 14.21H32a32 32 0 0 0-32 32V480a32 32 0 0 0 32 32h223.91a32 32 0 0 0 32-32V319.79a32 32 0 0 0-32-31.98zm-16 176.23H48V335.79h41.22l13.21-26.73 2.57-5.26h77.83l2.69 5.4 13.24 26.59h41.13zm112-256V68.24L463.83 51v78.58a84 84 0 0 0-16-1.69c-35.34 0-64 21.47-64 48s28.64 48 64 48 64-21.48 64-48V32c0-17.9-13.54-32-29.64-32a28.08 28.08 0 0 0-4.26.33L329.39 23.17c-14.63 2.25-25.5 15.74-25.5 31.66V161.6a83.25 83.25 0 0 0-16-1.7c-35.33 0-64 21.55-64 48.13s28.64 48.13 64 48.13 63.98-21.55 63.98-48.16z" />
    </Svg>
  )
}

export function StarsIcon({
  fill = 'white',
}: {
  style?: StyleProp<ViewStyle>
  fill?: string
}) {
  return (
    <Svg width="22" height="22" fill={fill} viewBox="0 0 16 16">
      <path d="M7.657 6.247c.11-.33.576-.33.686 0l.645 1.937a2.89 2.89 0 0 0 1.829 1.828l1.936.645c.33.11.33.576 0 .686l-1.937.645a2.89 2.89 0 0 0-1.828 1.829l-.645 1.936a.361.361 0 0 1-.686 0l-.645-1.937a2.89 2.89 0 0 0-1.828-1.828l-1.937-.645a.361.361 0 0 1 0-.686l1.937-.645a2.89 2.89 0 0 0 1.828-1.828l.645-1.937zM3.794 1.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387A1.734 1.734 0 0 0 4.593 5.69l-.387 1.162a.217.217 0 0 1-.412 0L3.407 5.69A1.734 1.734 0 0 0 2.31 4.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387A1.734 1.734 0 0 0 3.407 2.31l.387-1.162zM10.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.156 1.156 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.156 1.156 0 0 0-.732-.732L9.1 2.137a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732L10.863.1z" />
    </Svg>
  )
}

export function CheckIcon() {
  return (
    <svg width="22" height="22" fill="#83b970" viewBox="0 0 16 16">
      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
    </svg>
  )
}

export function GiftIcon({
  style,
  size,
  strokeWidth = 1.5,
}: {
  style?: StyleProp<ViewStyle>
  size?: string | number
  strokeWidth?: number
}) {
  return (
    <Svg
      viewBox="0 0 16 16"
      width={size || 20}
      height={size || 20}
      strokeWidth={strokeWidth}
      style={style}
      fill="#434248">
      <Path d="M3 2.5a2.5 2.5 0 0 1 5 0 2.5 2.5 0 0 1 5 0v.006c0 .07 0 .27-.038.494H15a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1v7.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 14.5V7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h2.038A2.968 2.968 0 0 1 3 2.506V2.5zm1.068.5H7v-.5a1.5 1.5 0 1 0-3 0c0 .085.002.274.045.43a.522.522 0 0 0 .023.07zM9 3h2.932a.56.56 0 0 0 .023-.07c.043-.156.045-.345.045-.43a1.5 1.5 0 0 0-3 0V3zM1 4v2h6V4H1zm8 0v2h6V4H9zm5 3H9v8h4.5a.5.5 0 0 0 .5-.5V7zm-7 8V7H2v7.5a.5.5 0 0 0 .5.5H7z" />
    </Svg>
  )
}

export function GiftIconFilled({
  style,
  size,
  strokeWidth = 1.5,
}: {
  style?: StyleProp<ViewStyle>
  size?: string | number
  strokeWidth?: number
}) {
  return (
    <Svg
      viewBox="0 0 16 16"
      width={size || 20}
      height={size || 20}
      strokeWidth={strokeWidth}
      style={style}
      fill="#434248">
      <Path d="M3 2.5a2.5 2.5 0 0 1 5 0 2.5 2.5 0 0 1 5 0v.006c0 .07 0 .27-.038.494H15a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h2.038A2.968 2.968 0 0 1 3 2.506V2.5zm1.068.5H7v-.5a1.5 1.5 0 1 0-3 0c0 .085.002.274.045.43a.522.522 0 0 0 .023.07zM9 3h2.932a.56.56 0 0 0 .023-.07c.043-.156.045-.345.045-.43a1.5 1.5 0 0 0-3 0V3zm6 4v7.5a1.5 1.5 0 0 1-1.5 1.5H9V7h6zM2.5 16A1.5 1.5 0 0 1 1 14.5V7h6v9H2.5z" />
    </Svg>
  )
}

export function SolarplexLogo() {
  return (
    <svg
      width="150"
      height="25"
      viewBox="0 0 637 106"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <ellipse
        cx="42.889"
        cy="53.8916"
        rx="42.889"
        ry="42.8916"
        fill="#2E008B"
      />
      <path
        d="M30.6351 95.007C23.8619 92.9911 17.7899 89.3469 12.873 84.5284H30.6351V95.007Z"
        fill="#7173B9"
      />
      <path
        d="M30.635 84.5284H55.1277C58.5129 84.5284 61.2547 81.7864 61.2547 78.401C61.2547 75.0157 58.5129 72.2737 55.1277 72.2737H36.762C33.3768 72.2737 30.635 75.0157 30.635 78.401V84.5284Z"
        fill="#397BAD"
      />
      <path
        d="M4.12727 72.2737C2.31772 68.4642 1.05313 64.3457 0.434265 60.0189H30.6349V66.1463C30.6349 69.5317 27.8931 72.2737 24.5079 72.2737H4.12727Z"
        fill="#FEA39A"
      />
      <path
        d="M36.762 47.7643H67.397C70.7822 47.7643 73.524 50.5063 73.524 53.8917C73.524 57.277 70.7822 60.019 67.397 60.019H30.635V53.8917C30.635 50.5063 33.3768 47.7643 36.762 47.7643Z"
        fill="#FB7616"
      />
      <path
        d="M0.434265 47.7643C1.05313 43.4374 2.31772 39.3189 4.12727 35.5095H30.6349V41.6369C30.6349 45.0223 27.8931 47.7643 24.5079 47.7643H0.434265Z"
        fill="#F8D55D"
      />
      <path
        d="M30.635 35.5095H55.1277C58.5129 35.5095 61.2547 32.7675 61.2547 29.3821C61.2547 25.9968 58.5129 23.2548 55.1277 23.2548H36.762C33.3768 23.2548 30.635 25.9968 30.635 29.3821V35.5095Z"
        fill="#FFB549"
      />
      <path
        d="M122.092 81.2164C129.559 81.2164 134.339 77.9305 134.339 72.6534C134.339 68.6706 131.75 66.7787 125.676 65.2852L116.615 63.1942C106.957 61.0037 102.775 56.2244 102.775 49.2545C102.775 40.5919 109.546 34.5182 122.49 34.5182C138.222 34.5182 142.802 40.791 142.802 46.0682C142.802 48.5575 141.209 50.5489 137.724 50.5489C135.533 50.5489 133.642 49.354 133.642 47.1635V46.1678C133.642 42.5833 130.455 39.9945 123.187 39.9945C116.217 39.9945 112.433 43.1807 112.433 47.7609C112.433 51.1463 114.823 53.4364 120.2 54.6312L128.663 56.5231C139.915 59.0123 144.096 63.7916 144.096 71.2594C144.096 80.0215 137.127 86.6927 122.589 86.6927C106.758 86.6927 100.883 80.4198 100.883 73.8482C100.883 71.5581 102.476 69.4671 105.961 69.4671C108.052 69.4671 110.243 70.5624 110.243 72.9521V73.9478C110.243 78.2293 113.728 81.2164 122.092 81.2164ZM177.723 34.5182C192.758 34.5182 202.615 45.1721 202.615 60.5058C202.615 75.8396 192.758 86.4935 177.723 86.4935C162.588 86.4935 152.731 75.8396 152.731 60.6054C152.731 45.1721 162.588 34.5182 177.723 34.5182ZM177.723 80.1211C185.888 80.1211 191.265 75.043 191.265 67.874V53.4364C191.265 46.1678 185.888 40.8906 177.723 40.8906C169.359 40.8906 164.082 46.1678 164.082 53.4364V67.874C164.082 75.043 169.359 80.1211 177.723 80.1211ZM224.503 14.3055V85H214.148V20.8771H205.186V14.3055H224.503ZM269.71 78.528H269.112C265.926 83.2077 260.649 86.394 252.883 86.394C241.631 86.394 235.259 80.5194 235.259 71.5581C235.259 62.099 242.03 56.8218 253.779 56.8218C259.156 56.8218 263.736 57.917 268.316 59.6097V51.3454C268.316 44.0768 265.03 40.3928 256.865 40.3928C250.991 40.3928 247.605 42.882 247.605 46.8648V48.0596C247.605 50.748 245.913 52.2416 242.727 52.2416C239.64 52.2416 237.947 50.4493 237.947 47.1635C237.947 40.1936 244.618 34.5182 257.065 34.5182C271.9 34.5182 278.771 40.791 278.771 53.1377V71.7572C278.771 76.9349 280.264 78.7271 282.953 78.4284L287.533 78.0301V83.8052L273.792 85.7966C271.801 83.9047 270.506 81.5151 269.71 78.528ZM246.012 73.2508C246.012 77.4327 249.199 80.3202 255.571 80.3202C262.74 80.3202 268.316 76.3374 268.316 68.7701V64.2895C264.433 62.5968 260.35 61.6011 255.969 61.6011C249.398 61.6011 246.012 64.2895 246.012 68.8697V73.2508ZM294.694 85V42.6829H285.733V36.0117H305.049V44.4751H305.547C308.136 38.8992 313.314 34.7173 320.084 34.7173C327.652 34.7173 330.838 39.1979 330.838 45.5704C330.838 50.3497 328.548 53.0381 324.864 53.0381C322.175 53.0381 320.582 51.445 320.582 48.8562V45.9687C320.582 43.1807 319.089 41.9859 316.002 41.9859C310.028 41.9859 305.049 47.4622 305.049 56.2244V85H294.694ZM391.201 61.0037C391.201 78.0301 382.538 86.0953 370.291 86.0953C362.226 86.0953 357.347 82.4112 354.459 77.0344H353.961L353.862 105.213H343.507V42.6829H334.545V36.0117H353.862V43.7781H354.36C357.745 38.7001 362.724 35.016 370.291 35.016C382.638 35.016 391.201 43.4794 391.201 61.0037ZM353.862 64.6878C353.862 72.5538 358.243 78.9262 366.906 78.9262C374.971 78.9262 379.75 74.0473 379.75 65.783V55.2287C379.75 47.2631 374.871 42.185 367.005 42.185C361.429 42.185 357.546 44.8734 353.862 49.7523V64.6878ZM413.141 14.3055V85H402.786V20.8771H393.824V14.3055H413.141ZM470.794 75.043C466.214 82.7099 459.144 86.5931 449.685 86.5931C434.849 86.5931 424.992 76.5366 424.992 60.705C424.992 44.973 434.65 34.5182 449.785 34.5182C465.119 34.5182 475.076 45.2717 472.686 62.9951H436.343V67.5753C436.343 75.8396 442.516 80.3202 450.283 80.3202C457.153 80.3202 461.833 77.4327 465.318 71.8568L470.794 75.043ZM449.984 40.9902C441.819 40.9902 436.343 45.7695 436.343 53.536V57.7179H459.742C462.032 57.7179 463.227 56.3239 463.227 53.0381C463.227 45.8691 458.447 40.9902 449.984 40.9902ZM477.124 36.0117H502.116V42.6829H495.146L505.999 57.0209H506.596L517.649 42.6829H510.778V36.0117H529.398V42.6829H524.917L510.878 60.705L524.917 78.3288H530.394V85H505.7V78.3288H512.67L500.921 63.4929H500.423L488.973 78.3288H495.843V85H477.124V78.3288H481.604L496.042 59.8089L482.6 42.6829H477.124V36.0117Z"
        fill="#2E008B"
      />
      {/* <path
        d="M535.729 15.444H544.207V46.872H562.999V54H535.729V15.444ZM574.813 21.762H567.145V15.444H574.813V21.762ZM567.145 26.082H574.813V54H567.145V26.082ZM596.295 54H587.763L578.205 26.082H586.251L592.137 45.144H592.245L598.131 26.082H605.745L596.295 54ZM627.697 37.044C627.337 35.1 626.689 33.624 625.753 32.616C624.853 31.608 623.467 31.104 621.595 31.104C620.371 31.104 619.345 31.32 618.517 31.752C617.725 32.148 617.077 32.652 616.573 33.264C616.105 33.876 615.763 34.524 615.547 35.208C615.367 35.892 615.259 36.504 615.223 37.044H627.697ZM615.223 41.904C615.331 44.388 615.961 46.188 617.113 47.304C618.265 48.42 619.921 48.978 622.081 48.978C623.629 48.978 624.961 48.6 626.077 47.844C627.193 47.052 627.877 46.224 628.129 45.36H634.879C633.799 48.708 632.143 51.102 629.911 52.542C627.679 53.982 624.979 54.702 621.811 54.702C619.615 54.702 617.635 54.36 615.871 53.676C614.107 52.956 612.613 51.948 611.389 50.652C610.165 49.356 609.211 47.808 608.527 46.008C607.879 44.208 607.555 42.228 607.555 40.068C607.555 37.98 607.897 36.036 608.581 34.236C609.265 32.436 610.237 30.888 611.497 29.592C612.757 28.26 614.251 27.216 615.979 26.46C617.743 25.704 619.687 25.326 621.811 25.326C624.187 25.326 626.257 25.794 628.021 26.73C629.785 27.63 631.225 28.854 632.341 30.402C633.493 31.95 634.321 33.714 634.825 35.694C635.329 37.674 635.509 39.744 635.365 41.904H615.223Z"
        fill="#2E008B"

      /> */}
    </svg>
  )
}

/**
 * No new Solarplex Icons below this.
 */

export function GridIcon({
  style,
  solid,
}: {
  style?: StyleProp<ViewStyle>
  solid?: boolean
}) {
  const DIM = 4
  const ARC = 2
  return (
    <Svg width="24" height="24" style={style}>
      <Path
        d={`M4,1 h${DIM} a${ARC},${ARC} 0 0 1 ${ARC},${ARC} v${DIM} a${ARC},${ARC} 0 0 1 -${ARC},${ARC} h-${DIM} a${ARC},${ARC} 0 0 1 -${ARC},-${ARC} v-${DIM} a${ARC},${ARC} 0 0 1 ${ARC},-${ARC} z`}
        strokeWidth={2}
        stroke="#000"
        fill={solid ? '#000' : undefined}
      />
      <Path
        d={`M16,1 h${DIM} a${ARC},${ARC} 0 0 1 ${ARC},${ARC} v${DIM} a${ARC},${ARC} 0 0 1 -${ARC},${ARC} h-${DIM} a${ARC},${ARC} 0 0 1 -${ARC},-${ARC} v-${DIM} a${ARC},${ARC} 0 0 1 ${ARC},-${ARC} z`}
        strokeWidth={2}
        stroke="#000"
        fill={solid ? '#000' : undefined}
      />
      <Path
        d={`M4,13 h${DIM} a${ARC},${ARC} 0 0 1 ${ARC},${ARC} v${DIM} a${ARC},${ARC} 0 0 1 -${ARC},${ARC} h-${DIM} a${ARC},${ARC} 0 0 1 -${ARC},-${ARC} v-${DIM} a${ARC},${ARC} 0 0 1 ${ARC},-${ARC} z`}
        strokeWidth={2}
        stroke="#000"
        fill={solid ? '#000' : undefined}
      />
      <Path
        d={`M16,13 h${DIM} a${ARC},${ARC} 0 0 1 ${ARC},${ARC} v${DIM} a${ARC},${ARC} 0 0 1 -${ARC},${ARC} h-${DIM} a${ARC},${ARC} 0 0 1 -${ARC},-${ARC} v-${DIM} a${ARC},${ARC} 0 0 1 ${ARC},-${ARC} z`}
        strokeWidth={2}
        stroke="#000"
        fill={solid ? '#000' : undefined}
      />
    </Svg>
  )
}
export function GridIconSolid({style}: {style?: StyleProp<ViewStyle>}) {
  return <GridIcon style={style} solid />
}

export function HomeIcon({
  style,
  size,
  strokeWidth = 4,
}: {
  style?: StyleProp<ViewStyle>
  size?: string | number
  strokeWidth?: number
}) {
  return (
    <Svg
      viewBox="0 0 48 48"
      width={size || 24}
      height={size || 24}
      stroke="currentColor"
      fill="none"
      style={style}>
      <Path
        strokeWidth={strokeWidth}
        d="M 23.951 2 C 23.631 2.011 23.323 2.124 23.072 2.322 L 8.859 13.52 C 7.055 14.941 6 17.114 6 19.41 L 6 38.5 C 6 39.864 7.136 41 8.5 41 L 18.5 41 C 19.864 41 21 39.864 21 38.5 L 21 28.5 C 21 28.205 21.205 28 21.5 28 L 26.5 28 C 26.795 28 27 28.205 27 28.5 L 27 38.5 C 27 39.864 28.136 41 29.5 41 L 39.5 41 C 40.864 41 42 39.864 42 38.5 L 42 19.41 C 42 17.114 40.945 14.941 39.141 13.52 L 24.928 2.322 C 24.65 2.103 24.304 1.989 23.951 2 Z"
      />
    </Svg>
  )
}

export function HomeIconSolid({
  style,
  size,
  strokeWidth = 4,
}: {
  style?: StyleProp<ViewStyle>
  size?: string | number
  strokeWidth?: number
}) {
  return (
    <Svg
      viewBox="0 0 48 48"
      width={size || 24}
      height={size || 24}
      stroke="currentColor"
      style={style}>
      <Path
        fill="currentColor"
        strokeWidth={strokeWidth}
        d="m 23.951,2 c -0.32,0.011 -0.628,0.124 -0.879,0.322 L 8.859,13.52 C 7.055,14.941 6,17.114 6,19.41 V 38.5 C 6,39.864 7.136,41 8.5,41 h 8 c 1.364,0 2.5,-1.136 2.5,-2.5 v -12 C 19,26.205 19.205,26 19.5,26 h 9 c 0.295,0 0.5,0.205 0.5,0.5 v 12 c 0,1.364 1.136,2.5 2.5,2.5 h 8 C 40.864,41 42,39.864 42,38.5 V 19.41 c 0,-2.296 -1.055,-4.469 -2.859,-5.89 L 24.928,2.322 C 24.65,2.103 24.304,1.989 23.951,2 Z"
      />
    </Svg>
  )
}

// Copyright (c) 2020 Refactoring UI Inc.
// https://github.com/tailwindlabs/heroicons/blob/master/LICENSE
export function MagnifyingGlassIcon({
  style,
  size,
  strokeWidth = 2,
}: {
  style?: StyleProp<ViewStyle>
  size?: string | number
  strokeWidth?: number
}) {
  return (
    <Svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={strokeWidth}
      stroke="currentColor"
      width={size || 24}
      height={size || 24}
      style={style}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      />
    </Svg>
  )
}

export function MagnifyingGlassIcon2({
  style,
  size,
  strokeWidth = 2,
}: {
  style?: StyleProp<ViewStyle>
  size?: string | number
  strokeWidth?: number
}) {
  return (
    <Svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={strokeWidth}
      stroke="currentColor"
      width={size || 24}
      height={size || 24}
      style={style}>
      <Ellipse cx="12" cy="11" rx="9" ry="9" />
      <Line x1="19" y1="17.3" x2="23.5" y2="21" strokeLinecap="round" />
    </Svg>
  )
}

export function MagnifyingGlassIcon2Solid({
  style,
  size,
  strokeWidth = 2,
}: {
  style?: StyleProp<ViewStyle>
  size?: string | number
  strokeWidth?: number
}) {
  return (
    <Svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={strokeWidth}
      stroke="currentColor"
      width={size || 24}
      height={size || 24}
      style={style}>
      <Ellipse
        cx="12"
        cy="11"
        rx="7"
        ry="7"
        stroke="none"
        fill="currentColor"
      />
      <Ellipse cx="12" cy="11" rx="9" ry="9" />
      <Line x1="19" y1="17.3" x2="23.5" y2="21" strokeLinecap="round" />
    </Svg>
  )
}

// https://github.com/Remix-Design/RemixIcon/blob/master/License
export function BellIcon({
  style,
  size,
  strokeWidth = 1.5,
}: {
  style?: StyleProp<ViewStyle>
  size?: string | number
  strokeWidth?: number
}) {
  return (
    <Svg
      fill="none"
      viewBox="0 0 24 24"
      width={size || 24}
      height={size || 24}
      strokeWidth={strokeWidth}
      stroke="currentColor"
      style={style}>
      <Path d="M 11.642 2 H 12.442 A 8.6 8.55 0 0 1 21.042 10.55 V 18.1 A 1 1 0 0 1 20.042 19.1 H 4.042 A 1 1 0 0 1 3.042 18.1 V 10.55 A 8.6 8.55 0 0 1 11.642 2 Z" />
      <Line x1="9" y1="22" x2="15" y2="22" />
    </Svg>
  )
}

// https://github.com/Remix-Design/RemixIcon/blob/master/License
export function BellIconSolid({
  style,
  size,
  strokeWidth = 1.5,
}: {
  style?: StyleProp<ViewStyle>
  size?: string | number
  strokeWidth?: number
}) {
  return (
    <Svg
      viewBox="0 0 24 24"
      width={size || 24}
      height={size || 24}
      strokeWidth={strokeWidth}
      stroke="currentColor"
      style={style}>
      <Path
        d="M 11.642 2 H 12.442 A 8.6 8.55 0 0 1 21.042 10.55 V 18.1 A 1 1 0 0 1 20.042 19.1 H 4.042 A 1 1 0 0 1 3.042 18.1 V 10.55 A 8.6 8.55 0 0 1 11.642 2 Z"
        fill="currentColor"
      />
      <Line x1="9" y1="22" x2="15" y2="22" />
    </Svg>
  )
}

export function CogIcon({
  style,
  size,
  strokeWidth = 1.5,
}: {
  style?: StyleProp<ViewStyle>
  size?: string | number
  strokeWidth: number
}) {
  return (
    <Svg
      fill="none"
      viewBox="0 0 24 24"
      width={size || 32}
      height={size || 32}
      strokeWidth={strokeWidth}
      stroke="currentColor"
      style={style}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
      />
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </Svg>
  )
}

export function CogIconSolid({
  style,
  size,
  strokeWidth = 1.5,
}: {
  style?: StyleProp<ViewStyle>
  size?: string | number
  strokeWidth: number
}) {
  return (
    <Svg
      fill="none"
      viewBox="0 0 24 24"
      width={size || 32}
      height={size || 32}
      strokeWidth={strokeWidth}
      stroke="currentColor"
      style={style}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M 9.594 3.94 C 9.684 3.398 10.154 3 10.704 3 L 13.297 3 C 13.847 3 14.317 3.398 14.407 3.94 L 14.62 5.221 C 14.683 5.595 14.933 5.907 15.265 6.091 C 15.339 6.131 15.412 6.174 15.485 6.218 C 15.809 6.414 16.205 6.475 16.56 6.342 L 17.777 5.886 C 18.292 5.692 18.872 5.9 19.147 6.376 L 20.443 8.623 C 20.718 9.099 20.608 9.705 20.183 10.054 L 19.18 10.881 C 18.887 11.121 18.742 11.494 18.749 11.873 C 18.751 11.958 18.751 12.043 18.749 12.128 C 18.742 12.506 18.887 12.878 19.179 13.118 L 20.184 13.946 C 20.608 14.296 20.718 14.9 20.444 15.376 L 19.146 17.623 C 18.871 18.099 18.292 18.307 17.777 18.114 L 16.56 17.658 C 16.205 17.525 15.81 17.586 15.484 17.782 C 15.412 17.826 15.338 17.869 15.264 17.91 C 14.933 18.093 14.683 18.405 14.62 18.779 L 14.407 20.059 C 14.317 20.602 13.847 21 13.297 21 L 10.703 21 C 10.153 21 9.683 20.602 9.593 20.06 L 9.38 18.779 C 9.318 18.405 9.068 18.093 8.736 17.909 C 8.662 17.868 8.589 17.826 8.516 17.782 C 8.191 17.586 7.796 17.525 7.44 17.658 L 6.223 18.114 C 5.708 18.307 5.129 18.1 4.854 17.624 L 3.557 15.377 C 3.282 14.901 3.392 14.295 3.817 13.946 L 4.821 13.119 C 5.113 12.879 5.258 12.506 5.251 12.127 C 5.249 12.042 5.249 11.957 5.251 11.872 C 5.258 11.494 5.113 11.122 4.821 10.882 L 3.817 10.054 C 3.393 9.705 3.283 9.1 3.557 8.624 L 4.854 6.377 C 5.129 5.9 5.709 5.692 6.224 5.886 L 7.44 6.342 C 7.796 6.475 8.191 6.414 8.516 6.218 C 8.588 6.174 8.662 6.131 8.736 6.09 C 9.068 5.907 9.318 5.595 9.38 5.221 Z M 13.5 9.402 C 11.5 8.247 9 9.691 9 12 C 9 13.072 9.572 14.062 10.5 14.598 C 12.5 15.753 15 14.309 15 12 C 15 10.928 14.428 9.938 13.5 9.402 Z"
        fill="currentColor"
      />
    </Svg>
  )
}

// Copyright (c) 2020 Refactoring UI Inc.
// https://github.com/tailwindlabs/heroicons/blob/master/LICENSE
export function MoonIcon({
  style,
  size,
  strokeWidth = 1.5,
}: {
  style?: StyleProp<ViewStyle>
  size?: string | number
  strokeWidth?: number
}) {
  return (
    <Svg
      fill="none"
      viewBox="0 0 24 24"
      width={size || 32}
      height={size || 32}
      strokeWidth={strokeWidth}
      stroke="currentColor"
      style={style}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
      />
    </Svg>
  )
}

// Copyright (c) 2020 Refactoring UI Inc.
// https://github.com/tailwindlabs/heroicons/blob/master/LICENSE
export function SunIcon({
  style,
  size,
  strokeWidth = 1.5,
}: {
  style?: StyleProp<ViewStyle>
  size?: string | number
  strokeWidth?: number
}) {
  return (
    <Svg
      fill="none"
      viewBox="0 0 24 24"
      width={size || 32}
      height={size || 32}
      strokeWidth={strokeWidth}
      stroke="currentColor"
      style={style}>
      <Path
        d="M12 3V5.25M18.364 5.63604L16.773 7.22703M21 12H18.75M18.364 18.364L16.773 16.773M12 18.75V21M7.22703 16.773L5.63604 18.364M5.25 12H3M7.22703 7.22703L5.63604 5.63604M15.75 12C15.75 14.0711 14.0711 15.75 12 15.75C9.92893 15.75 8.25 14.0711 8.25 12C8.25 9.92893 9.92893 8.25 12 8.25C14.0711 8.25 15.75 9.92893 15.75 12Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

// Copyright (c) 2020 Refactoring UI Inc.
// https://github.com/tailwindlabs/heroicons/blob/master/LICENSE
export function UserIcon({
  style,
  size,
  strokeWidth = 1.5,
}: {
  style?: StyleProp<ViewStyle>
  size?: string | number
  strokeWidth?: number
}) {
  return (
    <Svg
      fill="none"
      viewBox="0 0 24 24"
      width={size || 32}
      height={size || 32}
      strokeWidth={strokeWidth}
      stroke="currentColor"
      style={style}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </Svg>
  )
}

export function UserIconSolid({
  style,
  size,
  strokeWidth = 1.5,
}: {
  style?: StyleProp<ViewStyle>
  size?: string | number
  strokeWidth?: number
}) {
  return (
    <Svg
      fill="none"
      viewBox="0 0 24 24"
      width={size || 32}
      height={size || 32}
      strokeWidth={strokeWidth}
      stroke="currentColor"
      style={style}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        d="M 15 9.75 C 15 12.059 12.5 13.503 10.5 12.348 C 9.572 11.812 9 10.822 9 9.75 C 9 7.441 11.5 5.997 13.5 7.152 C 14.428 7.688 15 8.678 15 9.75 Z"
      />
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        d="M 17.982 18.725 C 16.565 16.849 14.35 15.748 12 15.75 C 9.65 15.748 7.435 16.849 6.018 18.725 M 17.981 18.725 C 16.335 20.193 14.206 21.003 12 21 C 9.794 21.003 7.664 20.193 6.018 18.725"
      />
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M 17.981 18.725 C 23.158 14.12 21.409 5.639 14.833 3.458 C 8.257 1.277 1.786 7.033 3.185 13.818 C 3.576 15.716 4.57 17.437 6.018 18.725 M 17.981 18.725 C 16.335 20.193 14.206 21.003 12 21 C 9.794 21.003 7.664 20.193 6.018 18.725"
      />
    </Svg>
  )
}

// Copyright (c) 2020 Refactoring UI Inc.
// https://github.com/tailwindlabs/heroicons/blob/master/LICENSE
export function UserGroupIcon({
  style,
  size,
}: {
  style?: StyleProp<ViewStyle>
  size?: string | number
}) {
  return (
    <Svg
      fill="none"
      viewBox="0 0 24 24"
      width={size || 32}
      height={size || 32}
      strokeWidth={2}
      stroke="currentColor"
      style={style}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
      />
    </Svg>
  )
}

export function RepostIcon({
  style,
  size = 24,
  strokeWidth = 1.5,
}: {
  style?: StyleProp<TextStyle>
  size?: string | number
  strokeWidth: number
}) {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size} style={style}>
      <Path
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        fill="none"
        d="M 14.437 18.081 L 5.475 18.095 C 4.7 18.095 4.072 17.467 4.072 16.692 L 4.082 6.65 L 1.22 10.854 M 4.082 6.65 L 7.006 10.854 M 9.859 6.65 L 18.625 6.654 C 19.4 6.654 20.028 7.282 20.028 8.057 L 20.031 18.081 L 17.167 13.646 M 20.031 18.081 L 22.866 13.646"
      />
    </Svg>
  )
}

// Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc.
export function HeartIcon({
  style,
  size = 24,
  strokeWidth = 1.5,
}: {
  style?: StyleProp<TextStyle>
  size?: string | number
  strokeWidth: number
}) {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size} style={style}>
      <Path
        strokeWidth={strokeWidth}
        stroke="currentColor"
        fill="none"
        d="M 3.859 13.537 L 10.918 20.127 C 11.211 20.4 11.598 20.552 12 20.552 C 12.402 20.552 12.789 20.4 13.082 20.127 L 20.141 13.537 C 21.328 12.431 22 10.88 22 9.259 L 22 9.033 C 22 6.302 20.027 3.974 17.336 3.525 C 15.555 3.228 13.742 3.81 12.469 5.084 L 12 5.552 L 11.531 5.084 C 10.258 3.81 8.445 3.228 6.664 3.525 C 3.973 3.974 2 6.302 2 9.033 L 2 9.259 C 2 10.88 2.672 12.431 3.859 13.537 Z"
      />
    </Svg>
  )
}

// Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc.
export function HeartIconSolid({
  style,
  size = 24,
}: {
  style?: StyleProp<TextStyle>
  size?: string | number
}) {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size} style={style}>
      <Path
        fill="currentColor"
        stroke="currentColor"
        strokeWidth={1}
        d="M 3.859 13.537 L 10.918 20.127 C 11.211 20.4 11.598 20.552 12 20.552 C 12.402 20.552 12.789 20.4 13.082 20.127 L 20.141 13.537 C 21.328 12.431 22 10.88 22 9.259 L 22 9.033 C 22 6.302 20.027 3.974 17.336 3.525 C 15.555 3.228 13.742 3.81 12.469 5.084 L 12 5.552 L 11.531 5.084 C 10.258 3.81 8.445 3.228 6.664 3.525 C 3.973 3.974 2 6.302 2 9.033 L 2 9.259 C 2 10.88 2.672 12.431 3.859 13.537 Z"
      />
    </Svg>
  )
}

export function UpIcon({
  style,
  size,
  strokeWidth = 1.3,
}: {
  style?: StyleProp<ViewStyle>
  size?: string | number
  strokeWidth: number
}) {
  return (
    <Svg
      viewBox="0 0 14 14"
      width={size || 24}
      height={size || 24}
      style={style}>
      <Path
        strokeWidth={strokeWidth}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M 7 3 L 2 8 L 4.5 8 L 4.5 11.5 L 9.5 11.5 L 9.5 8 L 12 8 L 7 3 Z"
      />
    </Svg>
  )
}

export function UpIconSolid({
  style,
  size,
}: {
  style?: StyleProp<ViewStyle>
  size?: string | number
}) {
  return (
    <Svg
      viewBox="0 0 14 14"
      width={size || 24}
      height={size || 24}
      style={style}>
      <Path
        strokeWidth={1.3}
        stroke="currentColor"
        fill="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M 7 3 L 2 8 L 4.5 8 L 4.5 11.5 L 9.5 11.5 L 9.5 8 L 12 8 L 7 3 Z"
      />
    </Svg>
  )
}

export function DownIcon({
  style,
  size,
}: {
  style?: StyleProp<ViewStyle>
  size?: string | number
}) {
  return (
    <Svg
      viewBox="0 0 14 14"
      width={size || 24}
      height={size || 24}
      style={style}>
      <Path
        strokeWidth={1.3}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M 7 11.5 L 2 6.5 L 4.5 6.5 L 4.5 3 L 9.5 3 L 9.5 6.5 L 12 6.5 L 7 11.5 Z"
      />
    </Svg>
  )
}

export function DownIconSolid({
  style,
  size,
}: {
  style?: StyleProp<ViewStyle>
  size?: string | number
}) {
  return (
    <Svg
      viewBox="0 0 14 14"
      width={size || 24}
      height={size || 24}
      style={style}>
      <Path
        strokeWidth={1.3}
        stroke="currentColor"
        fill="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M 7 11.5 L 2 6.5 L 4.5 6.5 L 4.5 3 L 9.5 3 L 9.5 6.5 L 12 6.5 L 7 11.5 Z"
      />
    </Svg>
  )
}

// Copyright (c) 2020 Refactoring UI Inc.
// https://github.com/tailwindlabs/heroicons/blob/master/LICENSE
export function CommentBottomArrow({
  style,
  size,
  strokeWidth = 1.3,
}: {
  style?: StyleProp<TextStyle>
  size?: string | number
  strokeWidth?: number
}) {
  let color = 'currentColor'
  if (
    style &&
    typeof style === 'object' &&
    'color' in style &&
    typeof style.color === 'string'
  ) {
    color = style.color
  }
  return (
    <Svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={strokeWidth || 2.5}
      stroke={color}
      width={size || 24}
      height={size || 24}
      style={style}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-3.978c.26-.39.687-.634 1.153-.67 1.09-.086 2.17-.208 3.238-.365 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
      />
    </Svg>
  )
}

export function SquareIcon({
  style,
  size,
  strokeWidth = 1.3,
}: {
  style?: StyleProp<TextStyle>
  size?: string | number
  strokeWidth?: number
}) {
  return (
    <Svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={strokeWidth || 1}
      stroke="currentColor"
      width={size || 24}
      height={size || 24}
      style={style}>
      <Rect x="6" y="6" width="12" height="12" strokeLinejoin="round" />
    </Svg>
  )
}

export function RectWideIcon({
  style,
  size,
  strokeWidth = 1.3,
}: {
  style?: StyleProp<TextStyle>
  size?: string | number
  strokeWidth?: number
}) {
  return (
    <Svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={strokeWidth || 1}
      stroke="currentColor"
      width={size || 24}
      height={size || 24}
      style={style}>
      <Rect x="4" y="6" width="16" height="12" strokeLinejoin="round" />
    </Svg>
  )
}

export function RectTallIcon({
  style,
  size,
  strokeWidth = 1.3,
}: {
  style?: StyleProp<TextStyle>
  size?: string | number
  strokeWidth?: number
}) {
  return (
    <Svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={strokeWidth || 1}
      stroke="currentColor"
      width={size || 24}
      height={size || 24}
      style={style}>
      <Rect x="6" y="4" width="12" height="16" strokeLinejoin="round" />
    </Svg>
  )
}

export function ComposeIcon({
  style,
  size,
  strokeWidth = 1.5,
}: {
  style?: StyleProp<TextStyle>
  size?: string | number
  strokeWidth?: number
}) {
  return (
    <Svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={strokeWidth}
      stroke="currentColor"
      width={size || 24}
      height={size || 24}
      style={style}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
      />
    </Svg>
  )
}

export function ComposeIcon2({
  style,
  size,
  strokeWidth = 1.5,
}: {
  style?: StyleProp<TextStyle>
  size?: string | number
  strokeWidth?: number
}) {
  return (
    <Svg
      viewBox="0 0 24 24"
      stroke="currentColor"
      fill="none"
      width={size || 24}
      height={size || 24}
      style={style}>
      <Path
        d="M 20 9 L 20 16 C 20 18.209 18.209 20 16 20 L 8 20 C 5.791 20 4 18.209 4 16 L 4 8 C 4 5.791 5.791 4 8 4 L 15 4"
        strokeWidth={strokeWidth}
      />
      <Line
        strokeLinecap="round"
        x1="10"
        y1="14"
        x2="18.5"
        y2="5.5"
        strokeWidth={strokeWidth * 1.5}
      />
      <Line
        strokeLinecap="round"
        x1="20.5"
        y1="3.5"
        x2="21"
        y2="3"
        strokeWidth={strokeWidth * 1.5}
      />
    </Svg>
  )
}

export function SquarePlusIcon({
  style,
  size,
  strokeWidth = 1.5,
}: {
  style?: StyleProp<TextStyle>
  size?: string | number
  strokeWidth?: number
}) {
  return (
    <Svg
      viewBox="0 0 24 24"
      strokeWidth={strokeWidth}
      stroke="currentColor"
      width={size || 24}
      height={size || 24}
      style={style}>
      <Line
        strokeLinecap="round"
        strokeLinejoin="round"
        x1="12"
        y1="5.5"
        x2="12"
        y2="18.5"
        strokeWidth={strokeWidth * 1.5}
      />
      <Line
        strokeLinecap="round"
        strokeLinejoin="round"
        x1="5.5"
        y1="12"
        x2="18.5"
        y2="12"
        strokeWidth={strokeWidth * 1.5}
      />
      <Rect
        strokeWidth={strokeWidth}
        x="4"
        y="4"
        width="16"
        height="16"
        rx="4"
        ry="4"
      />
    </Svg>
  )
}

export function InfoCircleIcon({
  style,
  size,
  strokeWidth = 1.5,
}: {
  style?: StyleProp<TextStyle>
  size?: string | number
  strokeWidth?: number
}) {
  return (
    <Svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={strokeWidth}
      stroke="currentColor"
      width={size}
      height={size}
      style={style}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
      />
    </Svg>
  )
}

export function HandIcon({
  style,
  size,
  strokeWidth = 1.5,
}: {
  style?: StyleProp<TextStyle>
  size?: string | number
  strokeWidth?: number
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 76 76"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      fill="none"
      style={style}>
      <Path d="M33.5 37V11.5C33.5 8.46243 31.0376 6 28 6V6C24.9624 6 22.5 8.46243 22.5 11.5V48V48C22.5 48.5802 21.8139 48.8874 21.3811 48.501L13.2252 41.2189C10.72 38.9821 6.81945 39.4562 4.92296 42.228L4.77978 42.4372C3.17708 44.7796 3.50863 47.9385 5.56275 49.897L16.0965 59.9409C20.9825 64.5996 26.7533 68.231 33.0675 70.6201V70.6201C38.8234 72.798 45.1766 72.798 50.9325 70.6201L51.9256 70.2444C57.4044 68.1713 61.8038 63.9579 64.1113 58.5735V58.5735C65.6874 54.8962 66.5 50.937 66.5 46.9362V22.5C66.5 19.4624 64.0376 17 61 17V17C57.9624 17 55.5 19.4624 55.5 22.5V36.5" />
      <Path d="M55.5 37V11.5C55.5 8.46243 53.0376 6 50 6V6C46.9624 6 44.5 8.46243 44.5 11.5V37" />
      <Path d="M44.5 37V8.5C44.5 5.46243 42.0376 3 39 3V3C35.9624 3 33.5 5.46243 33.5 8.5V37" />
    </Svg>
  )
}

export function SatelliteDishIconSolid({
  style,
  size,
  strokeWidth = 1.5,
}: {
  style?: StyleProp<ViewStyle>
  size?: string | number
  strokeWidth?: number
}) {
  return (
    <Svg
      width={size || 24}
      height={size || 24}
      viewBox="0 0 22 22"
      style={style}
      fill="none"
      stroke="none">
      <Path
        d="M16 19.6622C14.5291 20.513 12.8214 21 11 21C5.47715 21 1 16.5229 1 11C1 9.17858 1.48697 7.47088 2.33782 6.00002C3.18867 4.52915 6 7.66219 6 7.66219L14.5 16.1622C14.5 16.1622 17.4709 18.8113 16 19.6622Z"
        fill="currentColor"
      />
      <Path
        d="M8 1.62961C9.04899 1.22255 10.1847 1 11.3704 1C16.6887 1 21 5.47715 21 11C21 12.0452 20.8456 13.053 20.5592 14"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Path
        d="M9 5.38745C9.64553 5.13695 10.3444 5 11.0741 5C14.3469 5 17 7.75517 17 11.1538C17 11.797 16.905 12.4172 16.7287 13"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Circle cx="10" cy="12" r="2" fill="currentColor" />
    </Svg>
  )
}

export function SatelliteDishIcon({
  style,
  size,
  strokeWidth = 1.5,
}: {
  style?: StyleProp<TextStyle>
  size?: string | number
  strokeWidth?: number
}) {
  return (
    <Svg
      fill="none"
      viewBox="0 0 22 22"
      strokeWidth={strokeWidth}
      stroke="currentColor"
      width={size}
      height={size}
      style={style}>
      <Path d="M 12.705346,15.777547 C 14.4635,17.5315 14.7526,17.8509 14.9928,18.1812 c 0.2139,0.2943 0.3371,0.5275 0.3889,0.6822 C 14.0859,19.5872 12.5926,20 11,20 6.02944,20 2,15.9706 2,11 2,9.4151 2.40883,7.9285 3.12619,6.63699 3.304,6.69748 3.56745,6.84213 3.89275,7.08309 4.3705644,7.4380098 4.7486794,7.8160923 6.4999995,9.5689376 8.2513197,11.321783 10.947192,14.023595 12.705346,15.777547 Z" />
      <Path
        d="M8 1.62961C9.04899 1.22255 10.1847 1 11.3704 1C16.6887 1 21 5.47715 21 11C21 12.0452 20.8456 13.053 20.5592 14"
        strokeLinecap="round"
      />
      <Path
        d="M9 5.38745C9.64553 5.13695 10.3444 5 11.0741 5C14.3469 5 17 7.75517 17 11.1538C17 11.797 16.905 12.4172 16.7287 13"
        strokeLinecap="round"
      />
      <Path
        d="M12 12C12 12.7403 11.5978 13.3866 11 13.7324L8.26756 11C8.61337 10.4022 9.25972 10 10 10C11.1046 10 12 10.8954 12 12Z"
        fill="currentColor"
        stroke="none"
      />
    </Svg>
  )
}

// Copyright (c) 2020 Refactoring UI Inc.
// https://github.com/tailwindlabs/heroicons/blob/master/LICENSE
export function ShieldExclamation({
  style,
  size,
  strokeWidth = 1.5,
}: {
  style?: StyleProp<TextStyle>
  size?: string | number
  strokeWidth?: number
}) {
  let color = 'currentColor'
  if (
    style &&
    typeof style === 'object' &&
    'color' in style &&
    typeof style.color === 'string'
  ) {
    color = style.color
  }
  return (
    <Svg
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={strokeWidth || 1.5}
      stroke={color}
      style={style}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z"
      />
    </Svg>
  )
}
