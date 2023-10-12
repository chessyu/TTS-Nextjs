import Joi from "joi";
import { NextRequest } from "next/server";

export const paramsValidateMiddleware = async (req: NextRequest, schema: Joi.ObjectSchema) => {
    if(!schema) return;
    console.log("第四步执行 paramsValidateMiddleware 全局中间件")
    const options = {
        abortEarly: false, // include all errors
        allowUnknown: true, // ignore unknown props
        stripUnknown: true // remove unknown props
    }

    const body = await req.json();
    const {error, value} = schema.validate(body,options);

    if(error) throw `验证失败: ${ error.details.map(x => x.message).join(',')}`;

    req.json = () => value;
}