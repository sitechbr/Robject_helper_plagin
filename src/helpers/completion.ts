import filesystem from "./filesystem";
import { FileSystemNode } from "../types";

namespace completion {
    
    export const commonSnippets = [
        {
            command: ".cs1",
            detail: "to_string",
            snippet: `cs1 = to_sting(.cs1) ?? null`
        },
        {
            command: ".cs1",
            detail: "downcases",
            snippet: `cs1 = downcase(.cs1) ?? null`
        }
    ];
}

export default completion;
