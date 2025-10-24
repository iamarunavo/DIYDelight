import React from 'react'
import { useRoutes } from 'react-router-dom'
import Navigation from './components/Navigation'
import ViewBuilds from './pages/ViewBuilds'
import EditBuild from './pages/EditBuild'
import CreateBuild from './pages/CreateBuild'
import BuildDetails from './pages/BuildDetails'
import PCHeroBackground from './components/PCHeroBackground'
import './App.css'

const App = () => {
  let element = useRoutes([
    {
      path: '/',
      element: <CreateBuild title='PC FORGE | Customize PC' />
    },
    {
      path:'/custombuilds',
      element: <ViewBuilds title='PC FORGE | My PC Builds' />
    },
    {
      path: '/custombuilds/:id',
      element: <BuildDetails title='PC FORGE | Build Details' />
    },
    {
      path: '/edit/:id',
      element: <EditBuild title='PC FORGE | Edit Build' />
    }
  ])

  return (
    <div className='app'>
      <PCHeroBackground />
      <Navigation />

      { element }

    </div>
  )
}

export default App