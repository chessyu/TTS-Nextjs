import { SpeechConfigType } from "./interface"

/** 默认路由 */
export const basePathname = "text-to-audio"
/** 成功返回参数 */
export const RESPONSEOK = {
    status: 200,
    success: true,
    data: {},
    message: "操作成功",
}
/** 失败返回参数 */
export const REQUESTERR = {
    status: 401,
    success: false,
    data: null,
    message: "操作失败",
}
/** 提取模块 tabs */
export const extractTabs = [
    { label: "图片识别", value: 'image', icon: "" },
    { label: "语音识别", value: 'audio', icon: "" },
    { label: "视频识别", value: 'video', icon: "" },
]
/** store Key */
export enum StoreKey {
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
                <mstts:express-as style="${params.styleName}" role="${params.roleName}">
                    <prosody rate="${params.speed >= 1 ? `+${rate}%` : `${rate}%`}" pitch="${params.tone >= 1 ? `+${pitch}%` : `${pitch}%`}">
                        ${params.text}
                    </prosody>
                </mstts:express-as>
            </voice>
        </speak>
    `
    return base;
}