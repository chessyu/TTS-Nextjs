import { useSearchParams } from "react-router-dom";
import { useFetch } from "./use-fetch"
import { IUser, userStore } from "@/store/user-data";
import { message } from "antd";


type UseUserServiceReturnType = {
    currentUser?: IUser
    login: (username: string, password: string) => Promise<any>
    register: (params:any) => Promise<any>
}

export const useUserService = (): UseUserServiceReturnType => {
    const fetch = useFetch();
    const searchParams = useSearchParams();
    const { currentUser } = userStore();
    
    const login = async (username: string, password: string) => {
        try{
            console.log("第一步调接口", searchParams)
            return  await fetch.post('/api/account/login', { username, password})
        }catch(error){ console.error(error)}
    }

    const register = async (params:any) => {
        console.log("第一步调接口", searchParams)
        try{
          return await fetch.post('/api/account/register', params);
        }catch(error) {
            message.error(`error: ${error}`)
        }
    }

    return {
        currentUser,
        login,
        register
    }
}