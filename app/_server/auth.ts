import { cookies } from 'next/headers'
import jwt from "jsonwebtoken"

const isAuthenticated = () => {
    try{
        verifyToken();
        return true;
    }catch{
        return false;
    }
}

const verifyToken = () => {
    const token = cookies().get("authorization")?.value ?? "";
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return decoded.sub as string;
}

export const auth = {
    isAuthenticated,
    verifyToken
}