import path from 'node:path';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import gm from 'gm';
import type { BunFile } from 'bun';
import fs from 'fs';


const FILE_TYPES = ['.png', '.jpeg', '.jpg'];

export type FileAnalyticResult = {
    name: string,
    size: number,
    path: string,
    type: string
};

export type FileConversionResult = {
    name: string,
    beforeSize: number,
    afterSize: number,
    beforeType: string,
    afterType: string,
    result: number,
    equality: number
}

/**
 * @param {string | Buffer | URL} directoryPath
 * @returns {Promise<string[]>} - Array of long file paths
 */
export async function getFiles( directoryPath:string ): Promise<FileAnalyticResult[] | undefined> {
    try {
        const fileNames = (await readdir(directoryPath)).filter(f => {
            return FILE_TYPES.indexOf(path.extname(f).toLowerCase()) >= 0;
        });
        const filePaths = fileNames.map(fn => join(directoryPath, fn));
        const files = filePaths.map(p => Bun.file(p));
        const result: FileAnalyticResult[] = fileNames.map((f, index) => {
            return {
                name: f,
                path: filePaths[index],
                size: files[index].size,
                type: files[index].type
            };
        });

        return result;
    }
    catch (err) {
        console.error(err);
    }
}

export async function getAndConvertFiles( directoryPath:string, fileType: string = 'webp' ): Promise<FileConversionResult[] | undefined> {
    try {
        return new Promise(async (resolve) => {
            const fileNames = (await readdir(directoryPath)).filter(f => {
                return FILE_TYPES.indexOf(path.extname(f).toLowerCase()) >= 0;
            });
            const filePaths = fileNames.map(fn => join(directoryPath, fn));
            const files: BunFile[] = [];
            const convertedFilePaths: string[] = [];
            let convertedSizes: number[] = [];
            let convertedFiles: BunFile[] = [];
            const writeFilesPromise: Promise<any>[] = [];
            filePaths.forEach((f) => {
                files.push(Bun.file(f));
                const newFile = `${directoryPath}/${path.parse(f).name}.${fileType}`;
                convertedFilePaths.push(newFile);
                writeFilesPromise.push(convertFile(f, newFile));
            });
    
            Promise.all(writeFilesPromise).then(() => {
                convertedFiles = convertedFilePaths.map(f => Bun.file(f));
                convertedSizes = convertedFiles.map(f => f.size);
                const equalities: number[] = filePaths.map((f, index) => {
                    let result = 0;
                    gm.compare(f, convertedFilePaths[index], (err, isEqual, equality) => {
                        result = equality;
                    });
                    return result;
                });
                const result: FileConversionResult[] = fileNames.map((f, index) => {
                    return {
                        name: f,
                        beforeSize: files[index].size,
                        afterSize: convertedSizes[index],
                        beforeType: files[index].type,
                        afterType: convertedFiles[index].type,
                        result: files[index].size - convertedSizes[index],
                        equality: equalities[index]
                    };
                });
        
                resolve(result);
            });
        })
    }
    catch (err) {
        console.error(err);
    }
}

function convertFile(file: string, newFile: string): Promise<null> {
    return new Promise((resolve) => { 
        gm(file).write(newFile, (err) => {
            if (err) {
                console.log(err);
            }
            else {
                resolve(null);
            }
        });
    });
}