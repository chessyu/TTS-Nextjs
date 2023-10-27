import { SpeechConfigType } from "@/interface";
import { speechModel } from "@/_server/speechModel";
import { REQUESTERR, RESPONSEOK } from "@/constant";
import { splitText } from "@/utils/common-methods";
import { useTextToSpeechConfig } from "@/store/text-to-speech-config";



type UseTextToSpeechProps = {
    plainText: (params: SpeechConfigType) => Promise<any>

}

export const useTextToSpeech = (): UseTextToSpeechProps => {
    const { audioConfig } = useTextToSpeechConfig()
    const plainText = async (params: SpeechConfigType) => {
        try {
            if (params.text.length > 2000) {
                const handleObj = splitText(params.text)
                const fetchArr = handleObj.map(item => speechModel.textToSpeech({ ...params, text: item.content }))
                let blobSearm = Buffer.alloc(0);
                const values = await Promise.allSettled(fetchArr)
                values.forEach((item: any) => blobSearm = Buffer.concat([blobSearm, item.value]))
                const svlob = new Blob([blobSearm], { type: 'audio/'+ audioConfig.download.substring(1,audioConfig.download.length) });
                const url = URL.createObjectURL(svlob);
                return Promise.resolve({
                    ...RESPONSEOK,
                    data: url
                });
            } else {
                /** 文案字数少的直接生成配音 */
                const result: Buffer = await speechModel.textToSpeech(params)
                const svlob = new Blob([result], { type: 'audio/'+ audioConfig.download.substring(1,audioConfig.download.length) });
                const url = URL.createObjectURL(svlob);
                return Promise.resolve({
                    ...RESPONSEOK,
                    data: url
                });
            }
        } catch (error:any) {
            return Promise.resolve({ ...REQUESTERR, message: '调用SDK失败：' + error.privErrorDetails })
        }
    }
    return {
        plainText,
    }
}
