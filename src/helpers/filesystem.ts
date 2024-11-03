import * as vscode from "vscode";
import {FileSystemNode} from "../types";

namespace filesystem {
    export async function exists(uri: vscode.Uri): Promise<boolean> {
        try {
            await vscode.workspace.fs.stat(uri);
            return true;
        } catch (e) {
            return false;
        }
    }

    export async function readDir(uri: vscode.Uri): Promise<FileSystemNode[]> {
        const content: FileSystemNode[] = [];
        const dirContents = await vscode.workspace.fs.readDirectory(uri);
    
        for (const item of dirContents) {
            const fileName = item[0];
            const fileType = item[1];
            const itemUri = vscode.Uri.joinPath(uri, fileName);
            const filePath = itemUri.fsPath;
    
            content.push({
                path: filePath,
                name: fileName,
                type: fileType,
                uri: itemUri,
            });
    
            if (fileType === vscode.FileType.Directory) {
                content.push(...(await readDir(itemUri)));
            }
        }
        return content;
    }


    export async function isFile(item: FileSystemNode): Promise<boolean> {
        if (item.type != vscode.FileType.File || !(await exists(item.uri))) {
            return false;
        }
        return true;
    }

    export async function readFile(uri: vscode.Uri): Promise<string> {
        const bytes = await vscode.workspace.fs.readFile(uri);
        return bytes.toString();
    }
}

export default filesystem;

