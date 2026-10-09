import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Paper,
  Slider,
  Switch,
  Typography,
} from '@mui/material'
import { SPEED_CLASSES } from '../map/speedLayer'
import {
  resetFilters,
  setMinTests,
  setShowSpeed,
  toggleSpeedClass,
} from '../store/filtersSlice'
import { useAppDispatch, useAppSelector } from '../store/store'

export function FilterPanel() {
  const filters = useAppSelector((state) => state.filters)
  const dispatch = useAppDispatch()

  return (
    <Paper
      component="aside"
      aria-labelledby="filters-heading"
      elevation={3}
      sx={{
        position: 'absolute',
        top: 16,
        left: 16,
        width: 280,
        maxWidth: 'calc(100% - 32px)',
        maxHeight: 'calc(100% - 32px)',
        overflowY: 'auto',
        p: 2,
      }}
    >
      <Typography id="filters-heading" variant="h6" component="h2" gutterBottom>
        Mobile download speed
      </Typography>

      <FormControlLabel
        control={
          <Switch
            checked={filters.showSpeed}
            onChange={(e) => dispatch(setShowSpeed(e.target.checked))}
          />
        }
        label="Show speed layer"
      />

      <FormGroup
        role="group"
        aria-labelledby="speed-classes-label"
        sx={{ mt: 1 }}
      >
        <Typography id="speed-classes-label" variant="subtitle2">
          Speed classes
        </Typography>
        {SPEED_CLASSES.map((speedClass, index) => (
          <FormControlLabel
            key={speedClass.label}
            disabled={!filters.showSpeed}
            control={
              <Checkbox
                checked={filters.speedClasses.includes(index)}
                onChange={() => dispatch(toggleSpeedClass(index))}
              />
            }
            label={
              <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  component="span"
                  aria-hidden="true"
                  sx={{
                    width: 16,
                    height: 16,
                    bgcolor: speedClass.color,
                    border: '1px solid rgba(0, 0, 0, 0.3)',
                  }}
                />
                {speedClass.label}
              </Box>
            }
          />
        ))}
      </FormGroup>

      {/* Side padding keeps the slider thumb and its value label inside the panel. */}
      <Box sx={{ mt: 2, px: 1.5 }}>
        <Typography id="min-tests-label" variant="subtitle2">
          Minimum tests per tile: {filters.minTests}
        </Typography>
        <Slider
          aria-labelledby="min-tests-label"
          disabled={!filters.showSpeed}
          value={filters.minTests}
          min={1}
          max={20}
          marks={[{ value: 1, label: '1' }, { value: 20, label: '20' }]}
          valueLabelDisplay="auto"
          onChange={(_, value) => dispatch(setMinTests(value as number))}
        />
      </Box>

      <Button size="small" onClick={() => dispatch(resetFilters())}>
        Reset filters
      </Button>
    </Paper>
  )
}
