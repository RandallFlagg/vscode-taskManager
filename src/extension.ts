'use strict';
import * as vscode from 'vscode';
import * as uid from 'uuid';
var uuid = uid.v1;
import * as mkdirp from 'mkdirp';
import { FileManagement } from './FileManagement';
import { ServerManagement } from './ServerManagement';

export async function activate(context: vscode.ExtensionContext) {

    let sessionId = uuid();
    let path = vscode.workspace.workspaceFolders[0].uri.fsPath + '/.vscode';

    let fileManager = new FileManagement();
    let serverManager = new ServerManagement();

    console.log('Congratulations, your extension "taskmanager" is now active!');
    vscode.window.showInformationMessage('Task Manager Started...');

    //validating that user is authenticated
    let creds: any = await fileManager.checkAuthFileExist(path);
    if (!creds)
        await vscode.window.showInformationMessage('To use task manager please authenticate through pressing Ctrl + Shift + p then type "task manager" and then click enter');

    let timeoutTime = 900000;
    let timeoutClosure = async () => {
        vscode.window.showInformationMessage('You have been inactive for 15 minutes now');
        await serverManager.sendRequest(sessionId);
    };

    let lastTimer = setInterval(timeoutClosure, timeoutTime);

    // happens on tab change
    vscode.window.onDidChangeActiveTextEditor((e: vscode.TextEditor) => {
        clearInterval(lastTimer);
        lastTimer = null;
        lastTimer = setInterval(timeoutClosure, timeoutTime);
    });

    // happens on windows change
    vscode.window.onDidChangeWindowState(() => {
        clearInterval(lastTimer);
        lastTimer = null;
        lastTimer = setInterval(timeoutClosure, timeoutTime);
    });


    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.taskManager', async () => {

        // taking username and password from user
        let username = await vscode.window.showInputBox({ placeHolder: 'Please Enter Username', ignoreFocusOut: true });
        let password = await vscode.window.showInputBox({ placeHolder: 'Please Enter Password', ignoreFocusOut: true, password: true });

        // saving data to file 
        mkdirp(path, async () => {
            await fileManager.saveAuthFile(path, `${username},${password}`);
        });

    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export async function deactivate() {
    vscode.window.showInformationMessage(`Task Manager Saving Progress...`);
}