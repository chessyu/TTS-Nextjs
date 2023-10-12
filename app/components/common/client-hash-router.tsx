'use client'

import { HashRouter, Routes } from 'react-router-dom'
import { renderRoutes, routers } from '../../router'

function ClientHashRouter() {
    return (
        <HashRouter>
            <Routes>
                {
                    renderRoutes(routers)
                }
            </Routes>
        </HashRouter>
    )
}

export default ClientHashRouter