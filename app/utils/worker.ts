import { pipeline } from '@xenova/transformers';

export const imageToText = async () => {
    let captioner = await pipeline('image-to-text', 'Xenova/vit-gpt2-image-captioning');


    // console.log("FFFFFFFFFF", output)
}

