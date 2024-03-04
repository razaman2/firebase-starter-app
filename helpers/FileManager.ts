import {
    ref,
    getDownloadURL,
    deleteObject,
    uploadBytesResumable,
} from "firebase/storage";
import type {StorageReference, UploadTaskSnapshot} from "firebase/storage";

type FileOptions = {
    path: string;
    handler: (snapshot: UploadTaskSnapshot) => void;
    public: boolean;
};

export default class FileManager {
    constructor(private storage: StorageReference, private options?: Partial<FileOptions>) { }

    static getFilename(name: string) {
        return name.replace(/(\.\w+$)/, ($1: string) => `-${Date.now()}${$1}`);
    }

    addFiles(files: Array<File>, metadata: (file: File) => Promise<Record<string, any>> = () => Promise.resolve({})) {
        return new Promise(async (resolve) => {
            const promises = files.map((file) => {
                return new Promise(async (resolve) => {
                    const path = `${this.options?.path ?? ""}/${FileManager.getFilename(file.name)}`;
                    const task = uploadBytesResumable(ref(this.storage, path), file, {customMetadata: await metadata(file)});

                    task.on("state_changed", (snapshot) => {
                        this.options?.handler?.(snapshot);
                    }, (error) => {
                        console.log(`Storage Error: ${file.name}`, error);
                    }, async () => {
                        resolve(
                            await task.then((snapshot) => {
                                const data = {
                                    name: file.name,
                                    path: snapshot.ref.fullPath,
                                    type: file.type,
                                    size: file.size,
                                    metadata: snapshot.metadata.customMetadata,
                                };

                                if (this.options?.public) {
                                    return getDownloadURL(snapshot.ref).then((url) => {
                                        return Object.assign(data, {url});
                                    });
                                } else {
                                    return data;
                                }
                            }),
                        );
                    });
                });
            });

            resolve(await Promise.all(promises));
        });
    }

    deleteFile({path, url}: {path?: string; url?: string;}) {
        return deleteObject(ref(this.storage, path ?? url));
    }

    getFileUrl({path}: {path: string;}) {
        return getDownloadURL(ref(this.storage, path));
    }
}

