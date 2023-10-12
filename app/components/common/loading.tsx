import { Spin } from 'antd'
import React from 'react'

function Loading() {
  return (
    <div style={{ width: '100%', height:"100%", display:'flex' }}>
        <Spin style={{margin: "auto"}}  />
    </div>
  )
}

export default Loading