import { NextRequest, NextResponse } from "next/server";
import { errorHandler } from "./error-handler";
import { jwtMiddleware } from "./jwt-middleware";
import { paramsValidateMiddleware } from "./params-validate-middleware";


export function serverApiHandler (handler: any) {
    const warppendHandle: any = {}
    const httpMethods = ["GET", "POST", "PUT", "DELETE"];
    console.log("第二步执行 serverApiHandler 公共方法", handler)

    httpMethods.forEach( method => {
        if(typeof handler[method] !== 'function') return;

        warppendHandle[method] = async (req:NextRequest, ...args: any) => {
            try{
                const json = await req.json();
                req.json = () => json;
            }catch{};

            try{
                await jwtMiddleware(req);
                await paramsValidateMiddleware(req, handler[method].schema);

                const responseBody = await handler[method](req, ...args);
                return NextResponse.json({
                    message: "操作成功",
                    status: 200,
                    data: responseBody ?? null
                })
            }catch(err){
                return errorHandler(err as Error);
            }
        }
    })
    return warppendHandle;
}