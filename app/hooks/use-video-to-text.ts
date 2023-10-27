import { characterRecognitionModel } from "@/_server/characterRecognitionModel"

type UseVideoToTextProps = {
    videoRecognizer: (params: any) => Promise<any>

}

export const useVideoToText = (): UseVideoToTextProps => {
    
    const videoRecognizer = async (stream: any) => {
        const result = characterRecognitionModel.charachterForAudio({stream})
    }

    return {
        videoRecognizer
    }
}