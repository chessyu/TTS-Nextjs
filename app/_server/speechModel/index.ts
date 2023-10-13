
import { SpeechConfigType } from '@/interface'
const sdk = require("microsoft-cognitiveservices-speech-sdk")
const SPEECH_KEY = process.env.SPEECH_KEY;
const SPEECH_REGION = process.env.SPEECH_REGION;

// 纯文本生成语音
const textToSpeech = async (params: SpeechConfigType) => {
    const audioConfig = sdk.AudioConfig.fromAudioFileOutput(params.outputFileName);
    const speechConfig = sdk.SpeechConfig.fromSubscription(SPEECH_KEY!, SPEECH_REGION!)

    speechConfig.speechSynthesisLanguage = "en-US";
    speechConfig.speechSynthesisVoiceName = "en-US-JennyNeural";
    speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;


    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

    synthesizer.speakTextAsync(params.text)

}

/* 获取嗓音列表 */
const getVoiceOptions = async () => {
    if(!SPEECH_KEY || !SPEECH_REGION) return Promise.reject("未找到 key 值")
    const result = await fetch(
        //https://eastasia.api.speech.microsoft.com/texttospeech/acc/v3.0-beta1/vcg/voices
        // `https://${SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/voices/list`,
        `https://${SPEECH_REGION}.api.speech.microsoft.com/texttospeech/acc/v3.0-beta1/vcg/voices`,
        {
            method: "GET",
            headers: {
                "Ocp-Apim-Subscription-Key": SPEECH_KEY!
            },
            body:JSON.stringify({"queryCondition":{"items":[{"name":"VoiceTypeList","value":"StandardVoice","operatorKind":"Contains"}]}})
        }
    )
    const data = result.json();
    return Promise.resolve(data)
}

export const aiTextToSpeeck = {
    /** 纯文本生成语音 */
    textToSpeech,
    /** 获取所有的噪音列表 */
    getVoiceOptions,
}