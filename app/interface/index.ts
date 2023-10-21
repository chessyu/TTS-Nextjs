/** file type */
export enum FileTypes {
    /** images */
    IMAGE = "image/*",
    /** video  */
    VIDEO = "video/*",
    /** audio */
    AUDIO = "audio/*"

} 


/** 文本转语音类型 */
export type TextToSpeechType = {

}

export type SpeechConfigType = {
    /** 是否SSML */
    isSSML: SSMLTYPE;
    /** SSML/文本 */
    text: string;
    // outputFileName: string;
    /** 语言 */
    language: string;
    /** 嗓音 */
    voiceName: string;
    /** 风格 */
    styleName?: string;
    /** 情感 */
    roleName?: string;
    /** 音质 */
    outputFormat: number;
    /** 语速 */
    speed: number;
    /** 音调 */
    tone: number;
    /** 是否调用默认播放 */
    playDefault?: boolean
}


export enum SSMLTYPE  {
    /** 纯文本 */
    TEXT = "text",
    /** ssml */
    SSML = 'ssml'
}