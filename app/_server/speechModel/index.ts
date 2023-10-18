
import { SSMLLable } from '@/constant';
import { SpeechConfigType } from '@/interface'
const SPEECH_KEY = process.env.SPEECH_KEY;
const SPEECH_REGION = process.env.SPEECH_REGION;
// import SDK from 'microsoft-cognitiveservices-speech-sdk'

// 纯文本生成语音
const textToSpeech = async (params: SpeechConfigType) => {
    const sdk = require("microsoft-cognitiveservices-speech-sdk")

    const audio_config = sdk.AudioConfig.fromDefaultSpeakerOutput();
    const speechConfig = sdk.SpeechConfig.fromSubscription(SPEECH_KEY!, SPEECH_REGION!)
    speechConfig.setProperty(sdk.PropertyId.SpeechServiceResponse_RequestSentenceBoundary, "true");

    // speechConfig.speechSynthesisLanguage = params.language;
    // speechConfig.speechSynthesisVoiceName = params.voiceName;
    // speechConfig.speechSynthesisOutputFormat = params.outputFormat;


    let synthesizer = new sdk.SpeechSynthesizer(speechConfig, audio_config);

    const completeCb = (result: any, resolve: (value: unknown) => void, reject: (err?: any) => void) => {
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            // var blob = new Blob([result.audioData], { type: "audio/wav" });
            // var url = URL.createObjectURL(blob);
            // resolve(url)

            // const compressed = lz.compressToUTF16(result.audioData); // 使用 lz-string 压缩数据
            // const base64 = btoa(compressed);
            // console.log("RRRRRRRRR", base64)
            // resolve(base64)


            console.log("后端返回:", result.audioData);
            resolve(Buffer.from(result.audioData));

        } else {
            reject(result)
        }
        synthesizer.close();
        synthesizer = null;
    }

    const errCb = (err: string) => {
        synthesizer.close();
        synthesizer = null;
    }

    return new Promise((resolve, reject) => {
        synthesizer.speakSsmlAsync(SSMLLable(params), (result: any) => completeCb(result, resolve, reject), errCb)
    })
}


export const aiTextToSpeeck = {
    /** 纯文本生成语音 */
    textToSpeech,

}