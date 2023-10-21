import React from 'react'
import { IRouteItemTypes } from '../../router'
import styles from './index.module.css'
import { Tabs, TabsProps } from 'antd'
import { useTabsHook } from '@/hooks/use-tabs-hook'
import { useNavigate, Outlet, useLocation } from "react-router-dom"
import AudioConfig from './audio-config'


export default function Audio({ childrenList }: { childrenList?: IRouteItemTypes[] }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const currentPath = pathname.split('/').filter(item => item)[1];
  const [active, onTabChange] = useTabsHook({ defaultValue: currentPath })

  return (
    <div className={styles.continar}>
      <div className={styles.contMenu}>
        <div className={styles.tabs}>
          <Tabs
            style={{ height: "100%" }}
            activeKey={active}
            size="small"
            tabPosition="left"
            items={childrenList?.map(keys => ({ ...keys, children: false })) as TabsProps["items"]}
            onChange={(value) => {
              onTabChange(value, () => navigate(value))
            }}
          />
        </div>
        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
      {
        !(active === "configpage") && (
          <div className={styles.config}>
            <AudioConfig activeType={active!}  />
          </div>
        )
      }

    </div>
  )
}
