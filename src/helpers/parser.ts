import mData from '../model/model.json';
import sData from '../model/snipets.json';
import {Snipets} from '../types';
import * as vscode from "vscode";

namespace parser {
    export function extractId(fileContent: string)  {
        const idRegex = /^id: ([0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12})\r\n/gm;
        let match;
        match = idRegex.exec(fileContent);
        if (match?.length) {
            return match[1];
        }
        else {
            return "";
        }
    }

    export function extractName(fileContent: string)  {
        const idRegex = /^name: (.+?)\r\n/gm;
        let match;
        match = idRegex.exec(fileContent);
        if (match?.length) {
            return match[1];
        }
        else {
            return "";
        }
    }

    export function isGroup(): boolean  {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            for (let i = 0; i < document.lineCount; i++) {
                const line = document.lineAt(i).text.trim();
                if (line === "group:") {
                    return true;
                }
            }
        }    
        return false;
    }

    export function extractAliasName()  {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            for (let i = 0; i < document.lineCount; i++) {
                const line = document.lineAt(i).text.trim();
                if (line === "aliases:") {
                    return document.lineAt(i+1).text.trim().replace(":","");
                }
            }
        }   
        return "event";
    }

    export function onCorralatePosition(): number {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            for (let i = 0; i < document.lineCount; i++) {
                const line = document.lineAt(i).text.trim();
                if (line.includes("on_correlate:")) {
                    return i;
                }
            }
        }   
        return 0;
    }

    export function mapsFieds(): Array<string>{
        const fields: Array<string>= [];
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            const pos = onCorralatePosition()+1;
            for (let i = pos; i < document.lineCount; i++) {
                const line = document.lineAt(i).text;
                const clearLine = line.trim();
                if (clearLine.startsWith(".") && !clearLine.startsWith(".msg")){
                    const index = Math.min(clearLine.indexOf(" "), clearLine.indexOf("="));
                    fields.push(clearLine.slice(0,index));    
                }
                if (!line.startsWith(" ")) {
                    return fields;
                }
            }
        }   
        return fields;
    }

    export function getSnippets()  {
        const snippets:Snipets[] = [];
        if (mData.length === 1) {
            const fileFields = mData[0].fields;
            for (const field of fileFields) {
                if (field.type && typeof field.type?.type.$case === 'string') {
                    const typeName  = field.type?.type.$case;
                    const command = field.key;
                    sData.forEach(snippet => {
                        if (typeName === snippet.type) {
                            const customSnippet = snippet.snippet.replace("$0",command).replace("$1","."+command);
                            snippets.push({
                                command: command,
                                detail: snippet.detail,
                                snippet: customSnippet
                            });
                        }
                    });
                }
            }
        }
        return snippets;
        
    }

    export function getCorSnippets()  {
        const snippets:Snipets[] = [];
        const group: boolean = isGroup();
        const aliasName = extractAliasName() + (group ? "[0]" : "");

        if (mData.length === 1) {
            const fileFields = mData[0].fields;
            for (const field of fileFields) {
                if (field.type && typeof field.type?.type.$case === 'string') {
                    const typeName  = field.type?.type.$case;
                    const command = "."+field.key;
                    sData.forEach(snippet => {
                        if (typeName === snippet.type) {
                            const customSnippet = snippet.snippet.replace("$0",command).replace("$1","%"+aliasName+command);
                            snippets.push({
                                command: command,
                                detail: snippet.detail,
                                snippet: customSnippet
                            });
                        }
                    });
                }
            } 
        }
        const fields = mapsFieds();
        let assert_snippet = ""; 
        
        fields.forEach(element => {
            let text = `assert_eq!(.[0]${element}, null)\n`;
            assert_snippet += text;
        }); 
        snippets.push({
            command: "assert",
            detail: "Генерация тестов",
            snippet: assert_snippet
        });
        return snippets;
        
    }

} 
export default parser;