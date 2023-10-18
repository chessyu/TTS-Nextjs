import { StroreKey } from "@/constant";
import { create } from "zustand";
import { persist } from "zustand/middleware";


export type initTextToSpeechConfigPropsType  = {
    isSSML: string,
    text: string,
    language: string,
    voice: string,
    style?: string
    role?: string
    speed: number
    tone: number,
    blobUrl?: string,
    blobUrlList?: string[]
}
export const initTextToSpeechConfig = {
    isSSML: "text",  // text 纯文本， ssml  
    text: "迷茫的原因有且仅此一个，在本该拼搏和奋斗的年纪，想得太多却做得太少",
    language: "zh-CN",
    voice: "",
    style: undefined,
    role: undefined,
    speed: 1,
    tone: 1,
    blobUrl: undefined,
    blobUrlList: []
}



export type TextToSpeechConfigStore = initTextToSpeechConfigPropsType & {
    reset: () => void;
    update: (updater: (config: initTextToSpeechConfigPropsType) => void) => void;
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
        }),
        {
            name: StroreKey.TextToSpeechConfig
        }
    )
)