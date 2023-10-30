import { characterRecognitionModel } from "@/_server/characterRecognitionModel"
import { REQUESTERR, RESPONSEOK } from "@/constant"

type UseVideoToTextProps = {
    videoRecognizer: (params: any) => Promise<any>

}

export const useVideoToText = (): UseVideoToTextProps => {
    
    const videoRecognizer = async (stream: any) => {
        try{
            const result = await characterRecognitionModel.charachterForAudio({stream})
            return Promise.resolve({
                ...RESPONSEOK,
                data: result
            });
        }catch(error:any) {
            return Promise.resolve({ ...REQUESTERR, message: '调用SDK失败：' + error })
        }
        
    }

    return {
        videoRecognizer
    }
}