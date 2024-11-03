// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import filesystem from "./helpers/filesystem";
import completion from "./helpers/completion";
import parser from "./helpers/parser";
import rulechecker from './helpers/rulechecker';
import sData from './model/snipets.json';
import {Snipets} from './types';


export async function activate(context: vscode.ExtensionContext) {
	const root: vscode.Uri | undefined =
	vscode.workspace.workspaceFolders &&
	vscode.workspace.workspaceFolders.length > 0
		? vscode.workspace.workspaceFolders[0].uri
		: undefined;

	
	if (!root) {
		vscode.window.showErrorMessage("Workspace should be opened");
		return;
	}

	const detection = vscode.Uri.joinPath(root, "detection_rules");

    if (!(await filesystem.exists(detection))) {
        vscode.window.showErrorMessage("The current project is not an SIEM content");
        return;
    } else {
		vscode.window.showInformationMessage("Current project 'SIEM content'");
	}
	let snippets:Snipets[] = [];
	let snippets_correlation:Snipets[] = [];
	let onCorrelatePosStart = 0;
	let onCorrelatePosEnd = 0;


	const editor = vscode.window.activeTextEditor;
	if (editor) {
		const document = editor.document;
		if (document.fileName.endsWith(".ro")) {
			snippets = parser.getSnippets();
			snippets_correlation = parser.getCorSnippets();
			onCorrelatePosStart = parser.onCorralatePosition();
		}
	}

	vscode.workspace.onDidOpenTextDocument((document: vscode.TextDocument) => {

		snippets_correlation = parser.getCorSnippets();
		onCorrelatePosStart = parser.onCorralatePosition();
	});
	

	const disposable = vscode.commands.registerCommand('robject-help.check', async () => {
		const editor = vscode.window.activeTextEditor;

        if (editor) {
            const document = editor.document;
			
			const rules = await filesystem.readDir(detection);
			rulechecker.checkRule(document.getText(), rules);
			
			
        } else {
            vscode.window.showErrorMessage("Файл не открыт.");
        }
	});
	
	
	const roLibProvider = vscode.languages.registerCompletionItemProvider("robject", {
        provideCompletionItems(_document: vscode.TextDocument, _position: vscode.Position, _token: vscode.CancellationToken, _context: vscode.CompletionContext) {
            const completionItems : vscode.CompletionItem[] = [];
			
			const pos = _position.line;
			if (pos < onCorrelatePosStart) {
				snippets.forEach(({command, detail, snippet}) => {
					const commonSnippet = new vscode.CompletionItem(command, vscode.CompletionItemKind.Snippet);
					commonSnippet.detail = detail;
					commonSnippet.insertText = new vscode.SnippetString(snippet);
					completionItems.push(commonSnippet);
				});
				
			} else {
				snippets_correlation.forEach(({command, detail, snippet}) => {
					const commonSnippet = new vscode.CompletionItem(command, vscode.CompletionItemKind.Snippet);
					commonSnippet.detail = detail;
					commonSnippet.insertText = new vscode.SnippetString(snippet);
					completionItems.push(commonSnippet);
				});
			}
			
            return completionItems;
			
        }
    });

	const roCommonProvider = vscode.languages.registerCompletionItemProvider("robject", {
        provideCompletionItems(_document: vscode.TextDocument, _position: vscode.Position, _token: vscode.CancellationToken, _context: vscode.CompletionContext) {
            const completionItems : vscode.CompletionItem[] = [];

            completion.commonSnippets.forEach(({command, detail, snippet}) => {
                const commonSnippet = new vscode.CompletionItem(command, vscode.CompletionItemKind.Snippet);
                commonSnippet.detail = detail;
                commonSnippet.insertText = new vscode.SnippetString(snippet);
                completionItems.push(commonSnippet);
            });
            return completionItems;
        }
    });


	context.subscriptions.push(disposable,roCommonProvider);
}

// This method is called when your extension is deactivated
export function deactivate() {}
