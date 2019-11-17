import { AssocArray } from "./types";
import { APPLICATION_XML, XmlNodeType } from "./xml";

export type SelectNodes = (node: Node, xPath: string) => Node[];

let xpath: SelectNodes = (node: Node, xPath: string) => {
    throw new Error("Not implemented");
};

// Fix global
let sWindow: any;
if (typeof self === "undefined") {
    sWindow = global;
    const xmldom = require("xmldom-alpha");
    xpath = require("xpath.js");
    sWindow.XMLSerializer = xmldom.XMLSerializer;
    sWindow.DOMParser = xmldom.DOMParser;
    sWindow.DOMImplementation = xmldom.DOMImplementation;
    sWindow.document = new DOMImplementation().createDocument("http://www.w3.org/1999/xhtml", "html", null!);
} else {
    sWindow = self;
}

function SelectNodesEx(node: Node, xPath: string): Node[] {
    const doc: Document = node.ownerDocument == null ? node as Document : node.ownerDocument;
    const nsResolver = document.createNSResolver(node.ownerDocument == null ? (node as Document).documentElement : node.ownerDocument.documentElement);
    const personIterator = doc.evaluate(xPath, node, nsResolver, XPathResult.ANY_TYPE, null!);
    const ns: Node[] = [];
    let n: Node | null;
    while (n = personIterator.iterateNext()) {
        ns.push(n);
    }
    return ns;
}

export const Select: SelectNodes = (typeof self !== "undefined") ? SelectNodesEx : xpath;

export function Parse(xmlString: string) {
    /**
     * NOTE: https://www.w3.org/TR/REC-xml/#sec-line-ends
     * The XML processor must behave as if it normalized all line breaks in external parsed
     * entities (including the document entity) on input, before parsing, by translating both
     * the two-character sequence #xD #xA and any #xD that is not followed by #xA to a single #xA character.
     */
    xmlString = xmlString
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n");
    return new DOMParser().parseFromString(xmlString, APPLICATION_XML);
}

export function Stringify(target: Node) {
    return new XMLSerializer().serializeToString(target);
}

/**
 * Returns single Node from given Node
 *
 * @export
 * @param {Node} node
 * @param {string} path
 * @returns
 */
export function SelectSingleNode(node: Node, path: string) {
    const ns = Select(node, path);
    if (ns && ns.length > 0) {
        return ns[0];
    }
    return null;
}

function _SelectNamespaces(node: Node, selectedNodes: AssocArray<string> = {}) {
    if (node && node.nodeType === XmlNodeType.Element) {
        const el = node as Element;
        if (el.namespaceURI && el.namespaceURI !== "http://www.w3.org/XML/1998/namespace" && !selectedNodes[el.prefix || ""]) {
            selectedNodes[el.prefix ? el.prefix : ""] = node.namespaceURI!;
        }
        for (let i = 0; i < node.childNodes.length; i++) {
            const childNode = node.childNodes.item(i);
            if (childNode && childNode.nodeType === XmlNodeType.Element) {
                _SelectNamespaces(childNode, selectedNodes);
            }
        }
    }
}

export function SelectNamespaces(node: Element) {
    const attrs: AssocArray<string> = {};
    _SelectNamespaces(node, attrs);
    return attrs;
}

export function assign(target: any, ...sources: any[]) {
    const res = arguments[0];
    for (let i = 1; i < arguments.length; i++) {
        const obj = arguments[i];
        for (const prop in obj) {
            if (!obj.hasOwnProperty(prop)) {
                continue;
            }
            res[prop] = obj[prop];
        }
    }
    return res;
}

/**
 * Returns true if object is a XML of specified type
 * @param obj Object to test
 * @param type XML Node type
 */
function isNodeType(obj: any, type: XmlNodeType) {
    return obj && obj.nodeType === type;
}

/**
 * Returns true if object is a XML Element
 * @param obj Object to test
 */
export function isElement(obj: any): obj is Element {
    return isNodeType(obj, XmlNodeType.Element);
}

/**
 * Returns true if object is a XML Document
 * @param obj Object to test
 */
export function isDocument(obj: any): obj is Document {
    return isNodeType(obj, XmlNodeType.Document);
}
