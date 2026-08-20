import './App.css'
import { Routes, Route } from 'react-router-dom'
import Searching from './searching'

function App() {
    return (
        <Routes>
            <Route path="/" element={<Searching />} />
        </Routes>
    )
}

export default App