
import { SSMLLable } from '@/constant';
import { SpeechConfigType } from '@/interface'
const SPEECH_KEY = process.env.NEXT_PUBLIC_SPEECH_KEY;
const SPEECH_REGION = process.env.NEXT_PUBLIC_SPEECH_REGION;


// 纯文本生成语音
const textToSpeech = async (params: SpeechConfigType) => {
    const sdk = require("microsoft-cognitiveservices-speech-sdk")

    const speechConfig = sdk.SpeechConfig.fromSubscription(SPEECH_KEY!, SPEECH_REGION!)
    speechConfig.setProperty(sdk.PropertyId.SpeechServiceResponse_RequestSentenceBoundary, "true");

    // speechConfig.speechSynthesisLanguage = params.language;
    // speechConfig.speechSynthesisVoiceName = params.voiceName;
    speechConfig.speechSynthesisOutputFormat = params.quality;

    let audio_config = null;
    if (params.playDefault) {
        audio_config = sdk.AudioConfig.fromDefaultSpeakerOutput();
    }

    let synthesizer = new sdk.SpeechSynthesizer(speechConfig, audio_config);

    const completeCb = (result: any, resolve: (value: Buffer) => void, reject: (err?: any) => void) => {
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            resolve(Buffer.from(result.audioData));
        } else {
            reject(result)
        }
        synthesizer.close();
        synthesizer = null;
    }

    const errCb = (err: string, reject: (err?: any) => void) => {
        reject(err)
        synthesizer.close();
        synthesizer = null;
    }

    return new Promise<any>((resolve, reject) => {
        console.log("生成的 SMML: ")
        console.log(SSMLLable(params))
        synthesizer.speakSsmlAsync(SSMLLable(params), (result: any) => completeCb(result, resolve, reject), (err:string, reject:any) => errCb(err, reject))
    })
}


export const aiTextToSpeeck = {
    /** 纯文本生成语音 */
    textToSpeech,

}