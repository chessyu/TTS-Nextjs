import { Button, ConfigProvider, Tabs, TabsProps } from "antd"
import styles from "./index.module.css"
import { useNavigate, Outlet, useLocation } from "react-router-dom"
import { useTabsHook } from "@/hooks/use-tabs-hook"
import { IRouteItemTypes } from "@/router"
import 'dayjs/locale/zh-cn';
import zhCN from 'antd/locale/zh_CN';
import Login from "../common/login"
import { useState } from "react"

export default function Home({ childrenList }: { childrenList?: IRouteItemTypes[] }) {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const currentPath = pathname.split('/').filter(item => item)[0];
    const [active, onTabChange] = useTabsHook({ defaultValue:  currentPath})
    const [open, setOpen] = useState(false)

    return (
        <ConfigProvider locale={zhCN}>
            <main className={styles.main}>
                <div className={styles.continar}>
                    <div className={styles.menu}>
                        <Tabs
                            activeKey={active} centered
                            size="small"
                            onChange={(value) => {
                                onTabChange(value, () => navigate(value))
                            }}
                            items={childrenList as TabsProps["items"]}
                            // tabBarExtraContent={{
                            //     right: <Button type="link" onClick={() =>  setOpen(true)}>登录</Button>
                            // }}
                        />
                    </div>
                    <div className={styles.view}>
                        <Outlet />
                    </div>
                </div>
            </main>
            {/* <Login open={open} title="登录" width={450} onCancel={() => {setOpen(false)}} footer={null} /> */}
        </ConfigProvider>
    )
}
