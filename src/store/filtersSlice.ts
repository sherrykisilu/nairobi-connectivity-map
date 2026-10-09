import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { SPEED_CLASSES } from '../map/speedLayer'

export type FiltersState = {
  showSpeed: boolean
  // Indexes into SPEED_CLASSES that are currently shown.
  speedClasses: number[]
  // Hide tiles with fewer tests than this; one test is not a reliable average.
  minTests: number
}

export const initialFiltersState: FiltersState = {
  showSpeed: true,
  speedClasses: SPEED_CLASSES.map((_, i) => i),
  minTests: 1,
}

const filtersSlice = createSlice({
  name: 'filters',
  initialState: initialFiltersState,
  reducers: {
    setShowSpeed(state, action: PayloadAction<boolean>) {
      state.showSpeed = action.payload
    },
    toggleSpeedClass(state, action: PayloadAction<number>) {
      const index = action.payload
      state.speedClasses = state.speedClasses.includes(index)
        ? state.speedClasses.filter((i) => i !== index)
        : [...state.speedClasses, index].sort()
    },
    setMinTests(state, action: PayloadAction<number>) {
      state.minTests = action.payload
    },
    resetFilters() {
      return initialFiltersState
    },
  },
})

export const { setShowSpeed, toggleSpeedClass, setMinTests, resetFilters } = filtersSlice.actions
export default filtersSlice.reducer
