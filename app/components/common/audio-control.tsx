
import React, { CSSProperties } from 'react'
import { DownloadOutlined } from '@ant-design/icons'
import { Button } from 'antd'

type AudioControlProps = {
    style?: CSSProperties
    src?: string;
}

function AudioControl(props: AudioControlProps) {

    console.log("YYYYYYYYYYYY", props)
    const downloadFile = () => {
        if (props.src) {
            let a = document.createElement('a');
            a.href = props.src;
            a.download = 'xxxx.mp3';
            document.body.appendChild(a);
            a.click();
            setTimeout( () => {
                document.body.removeChild(a);
            },0)
        }
    }

    return (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Button disabled={!props.src} type="primary" onClick={downloadFile} shape="circle" icon={<DownloadOutlined />} />
            <audio
                src={props.src}
                // src="/assets/audio/currMp3Url.mp3"
                controls
                controlsList="nodownload"
                style={{
                    width: '100%',
                    height: '40px',
                    ...props.style
                }}
            >
            </audio>
        </div>
    )
}

export default AudioControl