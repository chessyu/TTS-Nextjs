import React, { ForwardedRef, forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import styles from './index.module.css'
import { useTextToSpeechConfig } from '@/store/text-to-speech-config';
import { SSMLTYPE, SSMLTextType } from '@/interface';
import { Spin } from 'antd';

type SsmlConfigPageProps = {
    setItemConfig: (config: SSMLTextType[]) => void
    saveItemConfig?: SSMLTextType[]
}

export type SsmlConfigRef = {
    getInnerText: () => string | undefined;
}

const SsmlConfigPage = forwardRef(({ setItemConfig, saveItemConfig}: SsmlConfigPageProps, ref: ForwardedRef<SsmlConfigRef>) => {
    const divAreaRef = useRef<HTMLTextAreaElement & HTMLDivElement>(null);
    const [ssmlText, setSsmlText] = useState<SSMLTextType[]>([]);
    const actionRef = useRef({
        bossFocus: false,
    })
    const textToSpeechConfig = useTextToSpeechConfig();
    const { text, isSSML } = textToSpeechConfig;
    // const [loading, setLoading] = useState(false)

    // 将text数据转成 List 列表
    const initSSMLText = () => {
        const mapList = text.split('\n').filter(keys => keys).map((item, index) => (
            {
                language: "zh-CN",
                voiceName: "【云希】",
                voice: "Microsoft Server Speech Text to Speech Voice (zh-CN, YunxiNeural)",
                textNode: item + "&nbsp;",
            }
        ));
        setSsmlText(mapList)
    }

    /** 从其它网址粘贴过来的文字 */
    const textCopy = (event: any) => {
        event.preventDefault();
        let paste = (event.clipboardData || window.Clipboard).getData("text/plain");
        // paste = paste.toUpperCase();
        // .replace(/</g, "&lt;")
        // .replace(/>/g, "&gt;")
        const selection = window.getSelection();
        if (!selection?.rangeCount) return;
        var range = selection.getRangeAt(0);

        selection.deleteFromDocument();
        if (event.target.innerText) {
            range.insertNode(document.createTextNode(paste));
        } else {
            // 获取当前节点的最里面的节点
            var innermostNode = event.target;
            while (innermostNode.lastChild) {
                innermostNode = innermostNode.lastChild as any;
            }
            // 将文本插入到最里面的节点
            innermostNode.textContent += paste;
        }

        selection.collapseToEnd();
    }

    //添加选中文本
    const appendChildForSpan = (text: string, substring: string) => {
        const array = text.split(substring);
        return `
            ${array[0] && "<span>" + array[0] + "</span>"}
            <span class=${styles['text-selection']}>${substring}</span>
            ${array[1] && "<span>" + array[1] + "</span>"}
        `
    }

    // 父节点失焦
    const parentBlur = (event: FocusEvent) => {
        event.preventDefault()
        const selection = window.getSelection();
        const selectionText = selection?.toString();
 
        if ((selectionText?.trim())) { // 有划词
            if ((selection?.anchorNode as Text).data === (selection?.focusNode as Text).data) {
                if (selection && selection.anchorNode && selection.anchorNode.parentElement) {
                    const textData = (selection.anchorNode as Text).data
                    selection.anchorNode.parentElement.innerHTML = appendChildForSpan(textData, selectionText)
                    const nodeAttr =  getNodeAttrData(selection!.anchorNode as HTMLElement, {start: selection?.anchorOffset!, end: selection?.focusOffset!}, 2)
                    setItemConfig && setItemConfig([nodeAttr]);
                }
            } else {
                const startNode = deepUpGetParentNode(selection?.anchorNode?.parentElement, 'tableItem')
                const endNode = deepUpGetParentNode(selection?.focusNode?.parentElement, 'tableItem')
                const startNodeIndex: number = [].indexOf.call(startNode?.parentElement?.childNodes, startNode as never)
                const endNodeIndex: number = [].indexOf.call(startNode?.parentElement?.childNodes, endNode as never)
                let array = [startNodeIndex, endNodeIndex];
                let downUp = false;
                if (startNodeIndex > endNodeIndex) { //从下住上
                    array = [endNodeIndex, startNodeIndex];
                    downUp = true;
                }

                /** 开始选择的文本 */
                if (selection && selection.anchorNode && selection.anchorNode.parentElement) {
                    const textData = (selection.anchorNode as Text).data
                    selection.anchorNode.parentElement.innerHTML = appendChildForSpan(textData, downUp ?
                        textData.substring(0, selection.anchorOffset) :
                        textData.substring(selection.anchorOffset)
                    )
                }

                /** 结束选择的文本 */
                if (selection && selection.focusNode && selection.focusNode.parentElement) {
                    const textData = (selection.focusNode as Text).data
                    selection.focusNode.parentElement.innerHTML = appendChildForSpan(textData, downUp ?
                        textData.substring(selection.focusOffset) :
                        textData.substring(0, selection.focusOffset)
                    )
                }

                const parentNode = startNode?.parentNode?.childNodes;
                for (let i = array[0] + 1; i <= array[1] - 1; i++) {
                    if (parentNode?.[i]) {
                        let innermostNode = parentNode[i];
                        while (innermostNode.lastChild) {
                            innermostNode = innermostNode.lastChild
                        }
                        let textData: string = (innermostNode as Text).data;
                        (innermostNode as Element)!.parentElement!.innerHTML = `<span class=${styles['text-selection']}>${textData}</span>`
                    }
                }


            }
        } else {//没有划词
            const nodeAttr = getNodeAttrData(selection!.anchorNode!.parentElement as HTMLElement, {start: selection?.anchorOffset!, end: selection?.focusOffset!});
            setItemConfig && setItemConfig([nodeAttr]);
        }
    }

    // 子节点聚集
    const handleFocusChild = (event: FocusEvent) => {
        actionRef.current.bossFocus = true;
        const classNames = divAreaRef.current!.getElementsByClassName(styles["text-selection"]);
        const length = classNames.length;
        if (classNames && classNames.length) {
            for (let index = 0; index < length; index++) {
                if (classNames[0].parentElement) {
                    (classNames[0].parentElement as HTMLElement).innerHTML = (classNames[0].parentElement as HTMLElement).innerText
                }
            }
        }
    }

    //处理回车事件，新增节点
    const handleEnter = () => {
        // 获取当前选区
        const selection = document.getSelection();
        // 检查选区是否存在并且有范围
        if (selection && selection.rangeCount > 0) {
            // 获取选区的起始节点
            const anchorNode = selection.anchorNode;
            // 检查起始节点是否存在
            if (anchorNode && anchorNode.nodeType === 3) {
                // 输出光标所在的节点
                const currentItem: HTMLElement = deepUpGetParentNode(anchorNode?.parentElement, 'tableItem')! as HTMLElement;
                setTimeout(() => {
                    const nextVoice = deepDownGetChildNode(currentItem.nextSibling as HTMLElement, styles["voice"]) as HTMLElement;
                    nextVoice.innerHTML = "&nbsp;" + (nextVoice?.innerText || '') + "&nbsp;";
                }, 10)
            }
        }
    }

    //处理删除事件，删除节点
    const handleBackspace = (event: KeyboardEvent) => {
        // 获取当前选区
        const selection = document.getSelection();

        // 检查选区是否存在并且有范围
        if (selection && selection.rangeCount > 0) {
            // 获取选区的起始节点
            const anchorNode = selection.anchorNode;
            // 检查起始节点是否存在
            if (anchorNode) {

                const voiceNode = anchorNode?.parentElement;
                // const voiceNode = anchorNode.nodeType === 3 ? anchorNode?.parentElement : anchorNode as HTMLElement;
                if (!voiceNode?.innerText.trim()) {
                    const tableItem = deepUpGetParentNode(voiceNode, "tableItem");
                    tableItem?.parentElement?.removeChild(tableItem);
                    event.preventDefault();
                }

            }
        }
    }

    //向上递归查找父节点
    const deepUpGetParentNode = (currentNode: Node | null | undefined, className: string): Node | undefined => {
        if (!currentNode) return;
        // 获取当前节点的最里面的节点
        var parentNode = currentNode;
        while ((parentNode as Element).getAttribute('class') !== className) {
            parentNode = parentNode.parentElement as Node;
        }
        return parentNode;
    }

    //向下递归查找子节点
    const deepDownGetChildNode = (currentNode: Element | null | undefined, className?: string): Element | undefined => {
        if (!currentNode) return;
        // 获取当前节点的最里面的节点
        var childrenNode = currentNode;
        while ((childrenNode as Element).getAttribute('class') !== className && childrenNode.lastChild) {
            childrenNode = childrenNode.lastChild as any
        }
        return childrenNode;
    }

    //获取节点上的数据
    const getNodeAttrData = (current: HTMLElement, selection?: SSMLTextType["selection"], selectNodeType?: number) => {
        const dataObj: SSMLTextType = {
            language: current.getAttribute("data-language")!, //语言
            voiceName: '',
            textNode: current.innerText, //文本内容
            voice: current.getAttribute("data-voice")!, //语音
            elementNode: current,
            selection,
            selectNodeType
        }
        return dataObj;
    }

    // 将配置数据转成 html
    const setConfigToHtml = (data: SSMLTextType[]) => {
        // setLoading(true);
        data.forEach(item => {
            const fragment = new DocumentFragment();
            const currentNode = item.elementNode;
            let str = ``
            
            // 停顿
            if (item.stop) {
                
                // str += `
                //     <span class="${styles['stop']}" data-content=${item.stopName} ></span>
                // `
            }
            if (item.pronunciation) {

            }
            if (item.speed) {

            }
            if (item.voice || item.role || item.style || item.tone) {

            }

            currentNode!.innerHTML = str;
        })
    }

    useImperativeHandle(ref, () => ({
        getInnerText: () => divAreaRef.current?.innerText
    }), [])

    useEffect(() => {
        if (isSSML === SSMLTYPE.SSML) initSSMLText()
    }, [text])

    useEffect(() => {
        if (saveItemConfig?.length) {
            console.log("保存了配置项。。", saveItemConfig);
            setConfigToHtml(saveItemConfig)
        }
    }, [saveItemConfig])

    useEffect(() => {
        divAreaRef.current?.addEventListener('focusin', function (event) {
            if ((event.target as HTMLElement)?.getAttribute('class') === "tableItem" && !actionRef.current.bossFocus) {
                console.log("子节点聚焦")
                handleFocusChild(event)
            }
        }, false)

        divAreaRef.current?.addEventListener("focusout", function (event) {
            if (!event.relatedTarget) {
                console.log("父节点失焦")
                parentBlur(event)
                actionRef.current.bossFocus = false;
            }
        }, false)

        divAreaRef.current?.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                handleEnter()
            }
            if (event.key === "Backspace") {
                handleBackspace(event)
            }
        }, false)

        // divAreaRef.current?.addEventListener("keyup", function (event) {
        //     if (event.key === "Backspace") {
        //         handleBackspace(event)
        //     }
        // })

        /** 文本粘贴 */
        divAreaRef.current?.addEventListener("paste", textCopy, false)

    }, [])

    return (
        <div className={`flex-1 ${styles["outerbox"]} `} >
            {/* { loading && <Spin className={styles["loading"]} />} ${loading && styles["loading-box"]} */}
            <div className={`${styles["configbox"]} `} contentEditable={true} suppressContentEditableWarning
                ref={divAreaRef}
            >
                {ssmlText?.map((keys: any, index: number) => (
                    <div
                        key={index}
                        tabIndex={index + 1}
                        className='tableItem'
                    >
                        <a className={styles["div-a"]}>
                            <span
                                className={styles.voice}
                                data-language={keys.language}
                                data-voice={keys.voice}
                                data-content={keys.voiceName}
                                title={keys.voiceName}
                                spellCheck={false}
                                dangerouslySetInnerHTML={{ __html: keys.textNode }}
                            >
                            </span>
                        </a>
                    </div>
                ))}
            </div>
        </div>
    )
})

export default React.memo(SsmlConfigPage);