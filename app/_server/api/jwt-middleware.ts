import { auth } from "_server/auth";
import { NextRequest } from "next/server";


// jwt 中间件 验证
export const jwtMiddleware = async (req: NextRequest) => {

    if(isPublicPath(req)) return;
    const id = auth.verifyToken();
    req.headers.set('userId', id);
}

function isPublicPath(req: NextRequest){
    const publicPaths = [
        'POST:/api/account/login',
        'POST:/api/account/logout',
        'POST:/api/account/register',
    ]

    return publicPaths.includes(`${req.method}:${req.nextUrl.pathname}`);
}