
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


export const aiTextToSpeeck = {
    /** 纯文本生成语音 */
    textToSpeech,

}