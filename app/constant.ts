import { SpeechConfigType } from "./interface"


export const basePathname = "text-to-audio"


export const extractTabs = [
    { label: "图片识别", value: 'image', icon: "" },
    { label: "语音识别", value: 'audio', icon: "" },
]

export enum StroreKey {
    /** 整个app状态管理 */
    AppConfig = 'app-config',
    /** 文本转语音状态 */
    TextToSpeechConfig = "text-to-speech-config",
}

/** 生成 SSML 格式 */
export const SSMLLable = (params: SpeechConfigType) => {
    const rate = ((params.speed-1)*100).toFixed(2);
    const pitch = ((params.tone-1)*50).toFixed(2);

    const base = `
        <speak xmlns="http://www.w3.org/2001/10/synthesis"
            xmlns:mstts="http://www.w3.org/2001/mstts"
            xmlns:emo="http://www.w3.org/2009/10/emotionml" version="1.0" xml:lang="${params.language}">
            <voice name="${params.voiceName}">
                <mstts:express-as ${ params.styleName === 'default' ? `style="${params.styleName}"` : ''  } ${ params.roleName === 'default' ? `style="${params.roleName}"` : ''  }>
                    <prosody rate="${params.speed > 1 ? `+${rate}%` : `${rate}%`}" pitch="${params.tone > 1 ? `+${pitch}%` : `${pitch}%`}">
                        ${params.text}
                    </prosody>
                </mstts:express-as>
            </voice>
        </speak>
    `
    return base;
}