import { serverApiHandler } from "@/_server/api"
import { aiTextToSpeeck } from "@/_server/speechModel";
import { NextRequest } from "next/server"
import joi from 'joi'


const textToSpeech = async (req: NextRequest) => {
    const body: any = req.json();
    return await aiTextToSpeeck.textToSpeech(body)
}

const getVoiceOptions = async (req:NextRequest) => {
    return aiTextToSpeeck.getVoiceOptions();
}

textToSpeech.schema = joi.object({
    text: joi.string().required(),
    outputFileName: joi.string().required(),
    language: joi.string().required(),
    voiceName: joi.string().required(),
    outputFormat: joi.string().required(),
})

module.exports = serverApiHandler({
    POST: textToSpeech,
    GET: getVoiceOptions
})