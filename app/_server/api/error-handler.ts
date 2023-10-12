import { cookies } from "next/headers";
import { NextResponse } from "next/server";


export const errorHandler = (err: Error | string) => {
    if(typeof err === 'string'){
        const is404 = err.toLowerCase().endsWith('not found🍎')
        const status = is404 ? 404 : 400;
        return NextResponse.json({message: err, status: 400},{ status})
    }

    if(err.name === "JsonWebTokenError"){
        cookies().delete('authorization');
        return NextResponse.json({message: 'Unauthorized', status: 401}, { status: 401 });
    }

    console.error(err);
    return NextResponse.json({message: err.message, status: 500},{status: 500})
}