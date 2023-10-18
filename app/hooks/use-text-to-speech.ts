import { SpeechConfigType } from "@/interface";
import { useFetch } from "./use-fetch";
import { arrayBufferToAudio } from "@/utils/read-file";


type UseTextToSpeechProps = {
    plainText: (params: SpeechConfigType) => Promise<any>

}

export const useTextToSpeech = (): UseTextToSpeechProps => {
    const fetch = useFetch();


    const plainText = async (params: SpeechConfigType) => {
        try {
            // return await fetch.post('/api/text-to-speech/text', params);
            const result = await fetch.post('/api/text-to-speech/text', params);
            if (result.status === 200) {
                const buffer = Buffer.from(result.data.data)
                const svlob = new Blob([buffer], { type: 'audio/wav' });
                const url = URL.createObjectURL(svlob);

                result.data = url;
                return Promise.resolve(result);
            }

            // return 
            // let result = await fetch.post('/api/text-to-speech/text', params)
            // console.log("接口返回：", result)
            // if(result.status == 200){
            //     result.data = await arrayBufferToAudio(result.data)
            //     return Promise.resolve(result);
            // }
        } catch (error) {
            console.error(error)
            return Promise.resolve({ status: 401 })
        }
    }



    return {
        plainText,
    }
}