import { useRouter } from "next/router"

export const useFetch = () => {
    // const router = useRouter();

    const request = (method: string) => 
        (url: string, body?: any) => {
            const headers : any = {
                method
            };

            if(body){
                headers.headers = { 'Content-Type': 'application/json'};
                headers.body = JSON.stringify(body);
            }
            return fetch(url, headers).then(handleResponse);
        }

    const handleResponse = async(response:any) => {
        const isJson = response.headers.get("content-type").includes('application/json')
        const data = isJson ? await response.json() : null;

        if(!response.ok){
            if(response.status === 401){
                console.log("未登录！")
            }

            const  error = (data && data.message) || response.statusText;
            return Promise.reject(error)
        }

        return data;
    }

    return{
        get: request("GET"),
        post: request("POST"),
        put: request("PUT"),
        delete: request("DELETE"),
    }
}