import filesystem from "./filesystem";
import parser from "./parser";
import { FileSystemNode, IdList, RulesList } from "../types";
import * as vscode from 'vscode';

namespace rulechecker {
    export async function CheckId(roContent: FileSystemNode[], id: string) : Promise<number> {
        const rulesList = await getRulesList(roContent);
        return rulesList.filter(x => x===id).length;
    }

    export async function getRulesList(roContent: FileSystemNode[]) : Promise<IdList> {
        const rulesList: RulesList = new Map();
        const idList: IdList = [];
        for (const item of roContent) {
            if (item.name.endsWith(".ro") && (await filesystem.isFile(item))) {
                const libName = item.name;
                const contentOfFile = await filesystem.readFile(item.uri);
                const id = parser.extractId(contentOfFile);
                if (id) {
                    idList.push(id);
                }   
            }
        }
        return idList;
    }

    export function checkName(name: string ) {
        const lenName = name.split(" ").filter(x => x.length>3).length;
        if (lenName > 5) {
            vscode.window.showErrorMessage("В названии больше 5 слов");
            return true;
        } else if (name.length>50) {
            vscode.window.showErrorMessage("Название больше 50 символов");
            return true;
        } else {
            return false;
        }
    }

    export async function checkRule(document: string, rules: FileSystemNode[]) {
        const id = parser.extractId(document);
		if (await CheckId(rules,id) > 1) {
			vscode.window.showErrorMessage("Такой UUID уже используется");
		} else if (checkName(parser.extractName(document))) {
            vscode.window.showErrorMessage("Слишком длинное имя");
        } else {
			vscode.window.showInformationMessage("Ошибки не обнаружены");
		}
    }
}

export default rulechecker;