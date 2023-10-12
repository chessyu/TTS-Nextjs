import { useState } from "react"


export const useTabsHook = ({
    defaultValue
}:{
    defaultValue: string
}):[string | undefined, (activeKey: string, call?: () => void) => void] => {
    const [active, setActive] = useState(defaultValue);

    const onChange = (value:string, callback?:() => void) => {
        setActive(value);
        callback && callback();
    }


    return [active, onChange]
}