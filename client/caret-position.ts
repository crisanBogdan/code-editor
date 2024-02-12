import { IParser } from "./iparser.js";
import { Token } from "./token.js";

export class CaretPosition {
    private lastTyped: Token[] = [];

    constructor(private container: HTMLElement, private jsParser: IParser) { }

    save() {
        const selection = window.getSelection()
        if (!selection) return
        if (selection.type === 'Range') {
            selection.collapseToEnd()
        }
        console.log(selection.anchorNode?.textContent, selection.anchorNode?.nodeType)
        if (selection.anchorNode?.nodeType === 3) {
            this.lastTyped = this.jsParser.getTokens(selection.anchorNode.textContent ?? '')
        } else {
            this.lastTyped = []
        }
    }

    restore() {
        if (this.lastTyped.length === 0) {
            return
        }
        const selection = window.getSelection()
        if (!selection) {
            console.trace('No selection')
            return
        }
        for (let i = 0; i<this.container.children.length;i++) {
            if (this.container.children[i].textContent == this.lastTyped[0].value) {
                let found = true
                let j
                for (j=0;j<this.lastTyped.length;j++) {
                    if (this.lastTyped[j].value !== this.container.children[i + j]?.textContent) {
                        found = false
                    }
                }
                if (found) {
                    const range = document.createRange()
                    range.selectNode(this.container.children[i+j-1])
                    console.log(range)
                    selection.removeAllRanges()
                    selection.addRange(range)
                    selection.collapseToEnd()
                    return
                }
            }
        }
    }
}
