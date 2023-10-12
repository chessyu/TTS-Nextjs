import { sign } from 'jsonwebtoken';
import bcrypt from 'bcryptjs'
import { db } from '../db'
import { headers } from 'next/headers';

const User = db.User;


const authenticate = async ({ username, password }: { username: string, password: string }) => {
    const user = await User.findOne({ username });

    if (!(user && bcrypt.compareSync(password, user.hash))) {
        throw "账号或密码不正确";
    }

    const token = sign({ sub: user.id }, process.env.JWT_SECRET!, { expiresIn: "7d" });

    return {
        user: user.toJSON(),
        token
    }

}

const getAll = async () => {
    return await User.find();
}

const getById = async (id: string) => {
    try {
        return await User.findById(id);
    } catch { throw `[${id}] 该用户不存在` }
}

const getCurrentUser = async () => {
    const currentUserId = headers().get('userId');
    await getById(currentUserId!);
}

const create = async (params:any) => {
    if(await User.findOne({username: params.username})){
        throw `用户名 ${params.username} 已存在`
    }

    const user = new User(params);
    if(params.password){
        user.hash = bcrypt.hashSync(params.password, 10)
    }
    await user.save();
    return {
        message: "操作成功",
        status: 200
    }
}

const update = async (id:string, params:any) =>{
    const user = await User.findById(id);

    if(!user) throw `用户不存在`
    if(user.username !== params.username && await User.findOne({username: params.username})){
        throw '用户名 "' + params.username + '" 已存在';
    }

    Object.assign(user, params);
    await user.save();
}

const deleteUser = async (id:string) => {
    await User.findByIdAndRemove(id);
}

export const usersRepo = {
    /** 账号密码校验 */
    authenticate,
    /** 获取所有的用户数据 */
    getAll,
    /** 根据 id 查找用户 */
    getById,
    /** 获取当前登录的用户 */
    getCurrentUser,
    /** 创建一个用户 */
    create,
    /** 更新用户数据 */
    update,
    /** 删除某条数据 */
    deleteUser
}