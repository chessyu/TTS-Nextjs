
import dynamic from "next/dynamic";
import { ComponentType, Fragment } from "react";
import { Navigate, Route } from "react-router-dom";
import {Loading} from '@/components/common/base-components'

export interface IRouteItemTypes {
    label?: string;
    key: string;
    index?: boolean;
    Component: ComponentType<{ childrenList?: IRouteItemTypes[] }>
    redirect?: string
    childrenList?: Array<IRouteItemTypes>
}

export const renderRoutes = (routers: IRouteItemTypes[]) => {
    if (routers && routers.length) {
        return routers.map((item, i, array) => {
            const hasIndexRoutes = array.filter(keys => keys.index);
            const { key, Component, childrenList, index } = item;
            if (hasIndexRoutes.length) {
                return (<Fragment key={i}>
                    {
                        <Route index element={<Navigate to={hasIndexRoutes[0].key} />} />
                    }
                    {
                        childrenList && childrenList ? (
                            <Route key={key} path={key} element={<Component childrenList={childrenList} />} >
                                {renderRoutes(childrenList)}
                            </Route>
                        ) : (
                            <Route key={key} path={key} index={!!index} element={<Component />} />
                        )
                    }
                </Fragment>)
            } else {
                return childrenList && childrenList ? (
                    <Route key={key} path={key} element={<Component childrenList={childrenList} />} >
                        {renderRoutes(childrenList)}
                    </Route>
                ) : (
                    <Route key={key} path={key} index={!!index} element={<Component />} />
                )
            }
        })
    }
}

export const routers: IRouteItemTypes[] = [
    {
        label: "首页",
        key: "/",
        Component: dynamic(async () => (await import(/* webpackChunkName: "home" */ "@/components/home")), {
            loading: () => (<Loading />),
            ssr: false
        }),
        childrenList: [
            {
                label: "配音",
                key: "text-to-audio",
                index: true,
                Component: dynamic(async () => (await import(/* webpackChunkName: "text-to-audio" */ "@/components/text-to-audio")), {
                    loading: () => (<Loading />),
                    ssr: false
                }),
                childrenList: [
                    {
                        label: "单条",
                        key: "paperwork",
                        index: true,
                        Component: dynamic(async () => (await import(/* webpackChunkName: "paperwork" */ "@/components/text-to-audio/paperwork")), {
                            loading: () => (<Loading />),
                            ssr: false
                        }),
                    },
                    {
                        label: "批量",
                        key: "batch-paperwork",
                        Component: dynamic(async () => (await import(/* webpackChunkName: "batch-paperwork" */ "@/components/text-to-audio/batch-paperwork")), {
                            loading: () => (<Loading />),
                            ssr: false
                        }),
                    },
                    {
                        label: "配置",
                        key: "configpage",
                        Component: dynamic(async () => (await import(/* webpackChunkName: "configpage" */ "@/components/text-to-audio/configpage")), {
                            loading: () => (<Loading />),
                            ssr: false
                        }),
                    },
                ]
            },
            {
                label: "文案提取",
                key: "extract",
                Component: dynamic(async () => (await import(/* webpackChunkName: "extract-copy" */ "@/components/extract-copy")), {
                    loading: () => (<Loading />),
                    ssr: false
                }),
                childrenList: [

                ]
            },
            // {
            //     label: "视频",
            //     key: "video",
            //     Component: dynamic(async () => (await import(/* webpackChunkName: "video" */ "@/components/video")), {
            //         loading: () => (<Loading />),
            //         ssr: false
            //     }),
            //     childrenList: [

            //     ]
            // },
        ]
    },
]