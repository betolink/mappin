import { NavigateOptions, URLSearchParamsInit } from 'react-router-dom'

enum ColorByHex {
  '#2660a4ff',// 'lapis-lazuli'
  '#55dde0ff',// 'robin-egg-blue'
  '#28502eff',// 'cal-poly-green
  '#c47335ff',// 'copper'
  '#7b7263ff',// 'dim-gray'
  "#A1C181", // 'olivine'
  "#233D4D", // 'charcoal'
  "#391D0C", // 'dark brown'
  "#C60F7B", // 'magenta dye'
  "#FE4A49", // 'tomato'
  "#F17300", // 'safety-orange'
}
export type IColor = keyof typeof ColorByHex
export const colorHexArr = Object.values(ColorByHex) as Array<IColor> // ew TS enums


export type ICoordinate = {
  lat: number
  lon: number
}
export type IMarker = {
  id: string
  color: IColor
  latLon: ICoordinate
}

export type ITimeseries = {
  marker: IMarker
  data: {
    midDateArray: Date[]
    dateDeltaArray: Date[]
    velocityArray: number[]
  }
}

export type ISetSearchParams = (nextInit?: URLSearchParamsInit | ((prev: URLSearchParams) => URLSearchParamsInit), navigateOpts?: NavigateOptions) => void;