import * as sdk from "microsoft-cognitiveservices-speech-sdk";

const SPEECH_KEY = process.env.NEXT_PUBLIC_SPEECH_KEY;
const SPEECH_REGION = process.env.NEXT_PUBLIC_SPEECH_REGION;

/** 图片识别文字 */
const charachterForImage = () => {


}

/** 音频识别文字 */
const charachterForAudio = async (params: any) =>
    new Promise<any>((resolve, reject) => {

        const autoDetectSourceLanguageConfig = sdk.AutoDetectSourceLanguageConfig.fromLanguages(["en-US", "zh-CN"]);

        const speechConfig = sdk.SpeechConfig.fromSubscription(SPEECH_KEY!, SPEECH_REGION!)
        /** 设置不雅内容 */
        speechConfig.setProfanity(sdk.ProfanityOption.Masked);
        speechConfig.setProperty("SpeechServiceResponse_PostProcessingOption", "TrueText");
        speechConfig.speechRecognitionLanguage = "zh-CN";

        // speechConfig.speechRecognitionLanguage = "en-US";
        // const audioConfig = sdk.AudioConfig.fromStreamInput(params.stream);

        const audioConfig = sdk.AudioConfig.fromWavFileInput(params.stream);

        const speechRecognizer = sdk.SpeechRecognizer.FromConfig(speechConfig, autoDetectSourceLanguageConfig, audioConfig);


        /** 识别 */
        speechRecognizer.recognizing = (s, e) => {
            console.log(`正在识别: Text=${e.result.text}`);
            if (sdk.ResultReason.RecognizingSpeech === e.result.reason && e.result.text.length) {
                console.log("识别方法触发", e.result.text);
            } else {
                console.log("无法识别该音频");
            }
        }

        /** 识别完成 */
        speechRecognizer.recognized = (s, e) => {
            console.log("识别完成", e.result.text)
            if (sdk.ResultReason.RecognizedSpeech == e.result.reason && e.result.text.length > 0) {
                console.log("完成👌🏼识别", e.result.text);
                resolve(e.result.text)
            } else {
                console.log("无法识别该音频");
            }
        }

        /** 关闭 */
        speechRecognizer.canceled = (s, e) => {
            if (e.reason == sdk.CancellationReason.Error) {
                console.log(`"CANCELED: ErrorCode=${e.errorCode}`);
                console.log(`"CANCELED: ErrorDetails=${e.errorDetails}`);
                console.log("CANCELED: Did you set the speech resource key and region values?");
            }

            speechRecognizer.stopContinuousRecognitionAsync();
        }

        /** 会话开始 */
        speechRecognizer.sessionStarted = (s, e) => {
            console.log('会话开始接口SessionId:', s, e.sessionId);
        }

        /** 会话停止 */
        speechRecognizer.sessionStopped = (s, e) => {
            console.log('会话停止识别接口:', s, e.sessionId);
            reject("无法识别该音频")
            speechRecognizer.stopContinuousRecognitionAsync();
        }
        /** 开始连续识别 */
        speechRecognizer.startContinuousRecognitionAsync();
    })


export const characterRecognitionModel = {
    charachterForImage,
    charachterForAudio
}