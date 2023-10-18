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
    isSSML: string;
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
    /** 生成格式 */
    outputFormat: string;
    /** 语速 */
    speed: number;
    /** 音调 */
    tone: number;
}