import './App.css'
import { Router, Route } from 'react-router-dom'
import Searching from './searching'

function App() {


  return (
   
  <>
    <Route>

        <Route path='/' element={Searching}/>

    </Route>
  </>

  )
}

export default App
