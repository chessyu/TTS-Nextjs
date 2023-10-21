import { createWorker } from 'tesseract.js';


/**
 * 读取文件内容方法
 * @param file 
 */
export const readTxtContent = (file: File) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsText(file, 'UTF-8')
        let txt = "";

        reader.onload = (ev) => {
            const content = ev.target?.result;
            txt += content;
            resolve(txt);
        }
    })

/**
 * 使用 tesseract 识别文字
 * @param file 
 * @returns 
 */
export const readImageToText = (file: any) =>
    new Promise(async (resolve, reject) => {
        const worker = await createWorker({
            logger: m => console.log(m),
            langPath: "/assets/model",
            gzip: false
        })

        await worker.loadLanguage('chi_sim');
        await worker.initialize('chi_sim');

        const { data: { text } } = await worker.recognize(file.originFileObj);
        console.log(text);
        await worker.terminate();

    })
