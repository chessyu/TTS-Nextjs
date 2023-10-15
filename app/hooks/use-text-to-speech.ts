import { SpeechConfigType } from "@/interface";
import { useFetch } from "./use-fetch";


type UseTextToSpeechProps = {
    plainText: (params: SpeechConfigType) => Promise<any>

}

export const useTextToSpeech = (): UseTextToSpeechProps => {
    const fetch = useFetch();


    const plainText = async (params: SpeechConfigType) => {
        try{
            return await fetch.post('/api/text-to-speech/text', params)
        }catch(error){
            console.error(error)
        }
    }



    return {
        plainText,
    }
}