import * as vscode from 'vscode';
import * as bluebird from 'bluebird';
import * as fs from 'fs';


export class FileManagement {

    authFileName = '/taskManagerAuth.js';

    async saveAuthFile(path: string, data: string) {
        let writeFile: any = bluebird.promisify(fs.writeFile);
        try {
            let result = writeFile(path + this.authFileName, data);
        } catch (err) {
            console.error(err);
        }
    }

    async checkAuthFileExist(path: string) {
        let readFile: any = bluebird.promisify(fs.readFile);
        let result = await readFile(path + this.authFileName, 'utf-8');
        if (result)
            return await this.getUsernamePasswordData(result);

        return false;
    }

    async getUsernamePasswordData(data: string) {
        let dataSplitted = data.split(',');
        return { username: dataSplitted[0], password: dataSplitted[1] };
    }

}