import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import { SpeechSynthesizer } from 'microsoft-cognitiveservices-speech-sdk';

const SPEECH_KEY = process.env.NEXT_PUBLIC_SPEECH_KEY;
const SPEECH_REGION = process.env.NEXT_PUBLIC_SPEECH_REGION;

/** 图片识别文字 */
const charachterForImage = () => {


}

/** 音频识别文字 */
const charachterForAudio = (params: any) => {

    const speechConfig = sdk.SpeechConfig.fromSubscription(SPEECH_KEY!, SPEECH_REGION!)
    /** 设置不雅内容 */
    speechConfig.setProfanity(sdk.ProfanityOption.Masked);
    speechConfig.setProperty("SpeechServiceResponse_PostProcessingOption", "TrueText");
    // speechConfig.speechRecognitionLanguage = "zh-CN";
    // speechConfig.speechRecognitionLanguage = "en-US";
    console.log("RROOOOOOOOOOO", params)
    // const audioConfig = sdk.AudioConfig.fromStreamInput(params.stream);
    const audioConfig = sdk.AudioConfig.fromWavFileInput(params.stream);

    const speechRecognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);


    /** 识别 */
    speechRecognizer.recognizing = (s, e) => {
        if(sdk.ResultReason.RecognizingSpeech === e.result.reason && e.result.text.length){
            console.log("识别方法触发", e.result.text);
        }
    }

    /** 识别完成 */
    speechRecognizer.recognized = (s, e) => {
        if (sdk.ResultReason.RecognizedSpeech == e.result.reason && e.result.text.length > 0) {
            console.log("完成👌🏼识别", e.result.text);
        }
    }

    /** 关闭 */
    speechRecognizer.canceled = (s, e) => {
        console.log("关闭识别接口", s, e.errorDetails)
        speechRecognizer.stopContinuousRecognitionAsync();
    }
    /** 停止识别 */
    speechRecognizer.sessionStopped = (s, e) => {
        console.log('停止识别接口:', s, e);
        speechRecognizer.stopContinuousRecognitionAsync();
    }
    /** 开始连续识别 */
    speechRecognizer.startContinuousRecognitionAsync();
}

export const characterRecognitionModel = {
    charachterForImage,
    charachterForAudio
}