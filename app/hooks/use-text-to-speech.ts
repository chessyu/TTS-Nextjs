import { SpeechConfigType } from "@/interface";
import { aiTextToSpeeck } from "@/_server/speechModel";
import { REQUESTERR, RESPONSEOK } from "@/constant";


type UseTextToSpeechProps = {
    plainText: (params: SpeechConfigType) => Promise<any>

}

export const useTextToSpeech = (): UseTextToSpeechProps => {
    const plainText = async (params: SpeechConfigType) => {
        try {
            const result: Buffer = await aiTextToSpeeck.textToSpeech(params)
            const svlob = new Blob([result], { type: 'audio/wav' });
            const url = URL.createObjectURL(svlob);
            return Promise.resolve({
                ...RESPONSEOK,
                data: url
            });
        } catch (error) {
            console.error("调用SDK失败", error)
            return Promise.resolve({ ...REQUESTERR, message: error })
        }
    }
    return {
        plainText,
    }
}