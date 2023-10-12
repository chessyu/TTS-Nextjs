import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AppConfigStore = {
    
}

export const initAppConfig = {

}

export const useAppConfig = create<AppConfigStore>()(
    persist(
        (set, get) => ({
            ...initAppConfig
        }),
        {
            name: "app-config"
        }
    )
)