import { StroreKey } from "@/constant";
import { SSMLTYPE, SpeechConfigType } from "@/interface";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AudioConfigType = {
    autoplay: boolean;
    audition: string;
    download: string;
}

export type InitTextToSpeechConfigPropsType = SpeechConfigType & {
    blobUrl?: string,
    audioConfig: AudioConfigType
}
export const initTextToSpeechConfig = {
    isSSML: SSMLTYPE.TEXT,  // text 纯文本， ssml  
    text: "迷茫的原因有且仅此一个，在本该拼搏和奋斗的年纪，想得太多却做得太少",
    language: "zh-CN",
    voiceName: "",
    styleName: "Default",
    roleName: "Default",
    speed: 1,
    tone: 1,
    blobUrl: undefined,
    outputFormat: 3,
    audioConfig: {
        autoplay: true,
        audition: "众里寻他千百度， 蓦然回首，那人却在，灯火阑珊处",
        download: '.mp3'
    }
}



export type TextToSpeechConfigStore = InitTextToSpeechConfigPropsType & {
    reset: () => void;
    update: (updater: (config: InitTextToSpeechConfigPropsType) => void) => void;
    getSpeechParams: () => SpeechConfigType
}

export const useTextToSpeechConfig = create<TextToSpeechConfigStore>()(
    persist(
        (set, get) => ({
            ...initTextToSpeechConfig,
            reset() {
                set(() => ({ ...initTextToSpeechConfig }));
            },
            update(updater) {
                const config = { ...get() };
                updater(config);
                set(() => config);
            },
            getSpeechParams() {
                const config = { ...get() };
                return {
                    isSSML: config.isSSML,
                    text: config.text,
                    language: config.language,
                    voiceName: config.voiceName,
                    styleName: config.styleName,
                    roleName: config.roleName,
                    speed: config.speed,
                    tone: config.tone,
                    outputFormat: config.outputFormat
                }
            }
        }),
        {
            name: StroreKey.TextToSpeechConfig
        }
    )
)