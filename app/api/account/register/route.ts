import { usersRepo } from "@/_server/userModel/api-repo";
import { NextRequest } from "next/server";
import joi from 'joi'
import { serverApiHandler } from "@/_server/api";

const register = async (req: NextRequest) => {
    const body = await req.json();
    return await usersRepo.create(body);
}

register.schema = joi.object({
    username: joi.string().required(),
    password: joi.string().min(6).required()
})

module.exports = serverApiHandler({
    POST: register
})