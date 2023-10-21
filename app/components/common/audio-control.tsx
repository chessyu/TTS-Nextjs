
import React, { CSSProperties } from 'react'
import { DownloadOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { useTextToSpeechConfig } from '@/store/text-to-speech-config'
import { downloadAudioFile } from '@/utils/common-methods'

type AudioControlProps = {
    style?: CSSProperties
    src?: string;
    autoPlay?: boolean;
    showDownBtn?: boolean;
    audioError?: () => void;
}

function AudioControl(props: AudioControlProps) {
    const { audioConfig, text } = useTextToSpeechConfig();
    const SHOWDOWNBTN = props.showDownBtn ?? true

    const downloadFile = () => {
        if (props.src) {
            let a = document.createElement('a');
            a.href = props.src;
            a.download = 'xxxx.wav';
            document.body.appendChild(a);
            a.click();
            setTimeout( () => {
                document.body.removeChild(a);
            },0)
        }
    }

    return (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            { SHOWDOWNBTN && <Button disabled={!props.src} type="primary" onClick={() => downloadAudioFile(props.src!, audioConfig.download)} shape="circle" icon={<DownloadOutlined />} />}
            <audio
                src={props.src}
                controls
                controlsList="nodownload"
                autoPlay={props.autoPlay ?? audioConfig.autoplay}
                style={{
                    width: '100%',
                    height: '40px',
                    ...props.style
                }}
                onError={ props.audioError }
            >
            </audio>
        </div>
    )
}

export default AudioControl