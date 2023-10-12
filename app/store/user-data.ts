import { create } from "zustand"


export type IUser = {
    id: string;
    username: string;
    password: string;
}

 type IUserStore = {
    currentUser?: IUser
}

const initialState = {
    currentUser: undefined
}

export const userStore = create<IUserStore>(() => initialState)
