/** file type */
export enum FileTypes {
    /** images */
    IMAGE = "image/*",
    /** video  */
    VIDEO = "video/*",
    /** audio */
    AUDIO = "audio/*",
    /** txt */
    TEXT = 'text/plain'
}


/** 语音识别类型 调用 SDK 所需要的参数 */
export type SpeechToTextType = {
    stream: File | Buffer;
    language: string;
    phrases: string;
}

/** 文本合成语音时 调用 SDK 所需的参数 */
export type SpeechConfigType = {
    /** 是否SSML */
    isSSML: SSMLTYPE;
    /** SSML/文本 */
    text: string;
    // outputFileName: string;
    /** 语言 */
    language: string;
    /** 嗓音 */
    voice: string;
    /** 风格 */
    style?: string;
    /** 情感 */
    role?: string;
    /** 音质 */
    quality: number;
    /** 语速 */
    speed: number;
    /** 音调 */
    tone: number;
    /** 是否调用默认播放 */
    playDefault?: boolean
}

/** 文本类型 */
export enum SSMLTYPE {
    /** 纯文本 */
    TEXT = "text",
    /** ssml */
    SSML = 'ssml'
}

/** 文本合成语音时， 相关按钮配置 */
export enum AudioBtnConfig {
    /** 文案合成语音 */
    SYNTHESIS = 'synthesis',

    /** 文件内容合成语音 */
    FILESYTHESIS = 'fileSynthesis',

    /** 情景对话 */
    SCENETALK = 'sceneTalk',
}

export type SSMLTextType = {
    /** 语言 */
    language: string;
    /** 嗓音 */
    voice?: string;
    /** 嗓音注解 */
    voiceName?: string;
    /** 风格 */
    style?: string;
    /** 风格注解 */
    styleName?: string;
    /** 情感 */
    role?: string;
    /** 情感注解 */
    roleName?: string;
    /** 语速 */
    speed?: number;
    /** 音调 */
    tone?: number;
    /** 停顿 */
    stop?: number
    /** 停顿注解 */
    stopName?: number
    /** 发音 */
    pronunciation?: string;
    /** 发音注解 */
    pronunciationName?: string;

    /** 文本 */
    textNode: string;
    /** 元素 */
    elementNode?: HTMLElement;

    selectNodeType?: number; // 1 | undefault - 整行, 2 单行选取 3 多行
    selection?: {
        start: number;
        end: number
    };
}