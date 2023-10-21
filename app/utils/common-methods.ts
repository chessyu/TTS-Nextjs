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

/** 随机生成进度条 */
export const generateRandomProgress = (setPercent: React.Dispatch<React.SetStateAction<number>>) => {
    var randomPercent = 0;
    const timer = setInterval(() => {
        randomPercent += Math.floor(Math.random() * 10);
        if (randomPercent >= 95) clearInterval(timer);
        setPercent(randomPercent);
    }, 500);
    return timer;
}
