import { SpeechToTextType } from "@/interface";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";

const SPEECH_KEY = process.env.NEXT_PUBLIC_SPEECH_KEY;
const SPEECH_REGION = process.env.NEXT_PUBLIC_SPEECH_REGION;

/** 图片识别文字 */
const charachterForImage = () => {


}

/** 音频识别文字 */
const charachterForAudio = async (params: SpeechToTextType) =>
    new Promise<string>((resolve, reject) => {
        let result = "";
        const autoDetectSourceLanguageConfig = sdk.AutoDetectSourceLanguageConfig.fromLanguages(["en-US", "zh-CN"]);

        const speechConfig = sdk.SpeechConfig.fromSubscription(SPEECH_KEY!, SPEECH_REGION!)
        /** 设置不雅内容 */
        speechConfig.setProfanity(sdk.ProfanityOption.Masked);
        speechConfig.setProperty("SpeechServiceResponse_PostProcessingOption", "TrueText");
        speechConfig.setProperty(sdk.PropertyId.SpeechServiceResponse_RequestSentenceBoundary, "true");
        speechConfig.speechRecognitionLanguage = params.language;

        const audioConfig = sdk.AudioConfig.fromWavFileInput(params.stream);

        const speechRecognizer = sdk.SpeechRecognizer.FromConfig(speechConfig, autoDetectSourceLanguageConfig, audioConfig);
        if(params.phrases.trim()){
            const phraseListGrammar = sdk.PhraseListGrammar.fromRecognizer(speechRecognizer);
            phraseListGrammar.addPhrases(params.phrases.split(";"));
        }

        /** 识别 */
        speechRecognizer.recognizing = (s, e) => {
            if (sdk.ResultReason.RecognizingSpeech === e.result.reason && e.result.text.length) {

            } else {
                reject("无法识别该音频")
            }
        }

        /** 识别完成 */
        speechRecognizer.recognized = (s, e) => {
            if (sdk.ResultReason.RecognizedSpeech == e.result.reason && e.result.text.length > 0) {
                result += e.result.text;
            } else {
                console.log("识别完成:  无法识别该音频", e);
            }
        }

        /** 关闭 */
        speechRecognizer.canceled = (s, e) => {
            console.log("关闭连接", e.reason)
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
            resolve(result)
            speechRecognizer.stopContinuousRecognitionAsync();
        }
        /** 开始连续识别 */
        speechRecognizer.startContinuousRecognitionAsync();
    })


export const characterRecognitionModel = {
    charachterForImage,
    charachterForAudio
}