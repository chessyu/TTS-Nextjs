import { Spin } from 'antd'
import React from 'react'


/** loading */
export const Loading = () => {
  return (
    <div style={{ width: '100%', height:"100%", display:'flex' }}>
        <Spin style={{margin: "auto"}}  />
    </div>
  )
}
