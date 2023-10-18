import { serverApiHandler } from "@/_server/api"
import { aiTextToSpeeck } from "@/_server/speechModel";
import { NextRequest } from "next/server"
import joi from 'joi'


const textToSpeech = async (req: NextRequest) => {
    const body: any = req.json();
    const data = await aiTextToSpeeck.textToSpeech(body)
    console.log("PPPPPPPPPP", data)
    return data;
}



textToSpeech.schema = joi.object({
    isSSML: joi.string().required(),
    text: joi.string().required(),
    language: joi.string().required(),
    voiceName: joi.string().required(),
    styleName: joi.string(),
    roleName: joi.string(),
    outputFormat: joi.number().required(),
    speed: joi.number().required(),
    tone: joi.number().required(),
})

module.exports = serverApiHandler({
    POST: textToSpeech,
})