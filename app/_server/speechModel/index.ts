
import { SSMLLable } from '@/constant';
import { SpeechConfigType } from '@/interface'
import * as sdk  from  "microsoft-cognitiveservices-speech-sdk";
import { SpeechSynthesizer } from 'microsoft-cognitiveservices-speech-sdk';

const SPEECH_KEY = process.env.NEXT_PUBLIC_SPEECH_KEY;
const SPEECH_REGION = process.env.NEXT_PUBLIC_SPEECH_REGION;


// 纯文本生成语音
const textToSpeech = async (params: SpeechConfigType) => {

    const speechConfig = sdk.SpeechConfig.fromSubscription(SPEECH_KEY!, SPEECH_REGION!)
    speechConfig.setProperty(sdk.PropertyId.SpeechServiceResponse_RequestSentenceBoundary, "true");

    speechConfig.speechSynthesisOutputFormat = params.quality;

    const player = new sdk.SpeakerAudioDestination();

    const audioConfig = sdk.AudioConfig.fromSpeakerOutput(player);

    let synthesizer: SpeechSynthesizer | null = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

    const completeCb = (result: any, resolve: (value: Buffer) => void, reject: (err?: any) => void) => {
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            resolve(Buffer.from(result.audioData));
        } else {
            reject(result)
        }
        synthesizer!.close();
        synthesizer = null;
    }

    const errCb = (err: string, reject: (err?: any) => void) => {
        reject(err)
        synthesizer!.close();
        synthesizer = null;
    }

    return new Promise<any>((resolve, reject) => {
        console.log("生成的 SMML: ")
        console.log(SSMLLable(params))
        if(!params.playDefault) player.pause();
        synthesizer!.speakSsmlAsync(SSMLLable(params), (result: any) => completeCb(result, resolve, reject),(err:string) => errCb(err, reject))
    })
}


export const speechModel = {
    /** 纯文本生成语音 */
    textToSpeech,

}