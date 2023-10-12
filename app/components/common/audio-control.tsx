import React, { CSSProperties } from 'react'

type AudioControlProps = {
    style?: CSSProperties
}

function AudioControl(props: AudioControlProps) {
    return (
        <audio
            src="/assets/audio/currMp3Url.mp3"
            controls
            style={{ width: '100%', ...props.style }}
        >
        </audio>
    )
}

export default AudioControl