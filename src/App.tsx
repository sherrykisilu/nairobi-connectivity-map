import { FilterPanel } from './filters/FilterPanel'
import { NairobiMap } from './map/NairobiMap'

function App() {
  return (
    <main className="app">
      <h1 className="visually-hidden">Nairobi Connectivity Map</h1>
      <NairobiMap />
      <FilterPanel />
    </main>
  )
}

export default App
