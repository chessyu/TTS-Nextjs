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
    text: string;
    outputFileName: string;
    language: string;
    voiceName: string;
    outputFormat: string;

    // speechSynthesisLanguage: string;
    // speechSynthesisVoiceName: string;
    // speechSynthesisOutputFormat: string;
}