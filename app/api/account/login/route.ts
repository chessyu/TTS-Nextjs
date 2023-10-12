import { serverApiHandler } from "_server/api";
import { usersRepo } from "_server/userModel/api-repo";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import joi from 'joi'


const login = async (req: NextRequest) => {
    const body = await req.json();
    const { user, token} = await usersRepo.authenticate(body);
    console.log("第五步执行路由 /api/account/login ")
    cookies().set('authorization', token, { httpOnly: true});

    return user;
}

module.exports = serverApiHandler({
    POST: login
})

login.schema = joi.object({
    username: joi.string().required(),
    password: joi.string().required()
})