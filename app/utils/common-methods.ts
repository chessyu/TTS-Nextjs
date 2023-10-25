import JSZip from 'jszip'
import FileSaver from 'file-saver'


/** 将多文件打包在 zip 文件 */
export const zipFileByBlobUrl = (downloadList: any[], format: string) => {
    return new Promise(async (resolve) => {
        if (!downloadList.length) return console.error("请传入数组");
        const zip = new JSZip();
        // 使用 Promise.all 来并行获取所有的 Blob 数据
        const blobs = await Promise.all(downloadList.map((item) => fetch(item.blobUrl).then((res) => res.blob())));
        // 将每个 Blob 数据添加到 zip 文件中
        blobs.forEach((blob, index) => {
            zip.file(`${downloadList[index].fileName.replace(/\.txt/, format)}`, blob);
        });
        zip.generateAsync({ type: 'blob' }).then(content => {
            const date = new Date().getTime()
            FileSaver.saveAs(content, `合成语音批量下载_${date}.zip`)
            resolve(undefined)
        })
    })
}

/** 下载音频文件 */
export const downloadAudioFile = (src: string, fileName: string) => {
    if (src) {
        let a = document.createElement('a');
        a.href = src;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
        }, 0)
    }
}

/** 文案进行分片 */
export const splitText = (text: string, length = 400) => {
    const punctuation = [",", ".", "...", "?", "!", "，", "。", "？", "！", "”", "\n"];
    const result = [];
    let start = 0;
    let end = length;
    while (start < text.length) {
        let content = text.substring(start, end);
        let lastChar = content.charAt(content.length - 1);
        if (!punctuation.includes(lastChar)) {
            let lastIndex = -1;
            for (let i = content.length - 1; i >= 0; i--) {
                if (punctuation.includes(content.charAt(i))) {
                    lastIndex = i;
                    break;
                }
            }
            if (lastIndex !== -1) {
                content = content.substring(0, lastIndex + 1);
                end = start + lastIndex + 1;
            } else {
                let nextChar = text.charAt(end);
                if (punctuation.includes(nextChar)) {
                    content = content + nextChar;
                    end++;
                }
            }
        }
        result.push({
            buffer: Array.from(content),
            content: content,
            start: start,
            end: end
        });
        start = end;
        end += length;
    }
    return result;
}


/**
 * 随机生成 11 位字符串
 */
export const randomStr = () => {
    return Math.random().toString(36).substring(2);
};