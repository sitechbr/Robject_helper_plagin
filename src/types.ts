import { FileType, Uri } from "vscode";

export type RulesList = Map<string, string>;
export type IdList = Array<String>;

export type FileSystemNode = {
    path: string;
    name: string;
    type: FileType;
    uri: Uri;
};

export type MFields = Map<string, string>;

export type Snipets = {
    command: string;
    detail: string;
    snippet: string
};
