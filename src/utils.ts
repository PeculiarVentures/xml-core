import { XmlNodeType, APPLICATION_XML } from "./xml";

export const DEFAULT_ROOT_NAME = "xml_root";

export function IsEqualsEmptyStrings(s1: string, s2: string): boolean {
    // If values is null or undefined, set valute to ""
    let _s1 = (s1) ? s1 : "";
    let _s2 = (s2) ? s2 : "";
    return _s1 === _s2;
}

/**
 * Creates new instance of XmlDocument with given name of root element
 * @param  {string} root Name of root element
 * @param  {string} namespaceUri
 * @param  {string} prefix
 * @returns Document
 */
export function CreateDocument(root: string = DEFAULT_ROOT_NAME, namespaceUri: string = "", prefix: string = ""): Document {
    let name_prefix = "",
        ns_prefix = "",
        namespace_uri = "";
    if (prefix) {
        name_prefix = prefix + ":";
        ns_prefix = ":" + prefix;
    }
    if (namespaceUri) {
        namespace_uri = ` xmlns${ns_prefix}="${namespaceUri}"`;
    }
    let name = `${name_prefix}${root}`;
    let doc = new DOMParser().parseFromString(`<${name}${namespace_uri}></${name}>`, APPLICATION_XML);
    return doc;
}

/**
 * Returns signle Node from given Node
 * 
 * @export
 * @param {Node} node
 * @param {string} path
 * @returns
 */
export function SelectSingleNode(node: Node, path: string) {
    let ns = select(node, path);
    if (ns && ns.length > 0)
        return ns[0];
    return null;
}

export function FindAttr(node: Node, localName: string, nameSpace?: string) {
    for (let i = 0; i < node.attributes.length; i++) {
        let attr = node.attributes[i];

        if (attrEqualsExplicitly(attr, localName, nameSpace) || attrEqualsImplicitly(attr, localName, nameSpace, node)) {
            return attr;
        }
    }
    return null;
}

export function FindFirst(doc: Node, xpath: string): Node {
    let nodes: Node[] = <Node[]>select(doc, xpath);
    if (nodes.length === 0) throw `could not find xpath ${xpath}`;
    return nodes[0];
}

export function FindChildren(node: Node, localName: string, nameSpace?: string): Node[] {
    node = (<Document>node).documentElement || node;
    let res: Node[] = [];
    for (let i = 0; i < node.childNodes.length; i++) {
        let child = node.childNodes[i];
        if (child.localName === localName && (child.namespaceURI === nameSpace || !nameSpace)) {
            res.push(child);
        }
    }
    return res;
}

function attrEqualsExplicitly(attr: Attr, localName: string, nameSpace?: string): boolean {
    return attr.localName === localName && (attr.namespaceURI === nameSpace || !nameSpace);
}

function attrEqualsImplicitly(attr: Attr, localName: string, nameSpace: string | undefined, node: Node) {
    return attr.localName === localName && ((!attr.namespaceURI && node.namespaceURI === nameSpace) || !nameSpace);
}

const xml_special_to_encoded_attribute: AssocArray<string> = {
    "&": "&amp;",
    "<": "&lt;",
    "\"": "&quot;",
    "\r": "&#xD;",
    "\n": "&#xA;",
    "\t": "&#x9;"
};

const xml_special_to_encoded_text: AssocArray<string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\r": "&#xD;"
};

export function EncodeSpecialCharactersInAttribute(attributeValue: string) {
    return attributeValue
        .replace(/[\r\n\t ]+/g, " ") // White space normalization (Note: this should normally be done by the xml parser) See: https://www.w3.org/TR/xml/#AVNormalize
        .replace(/([&<"\r\n\t])/g, (str, item) =>
            // Special character normalization. See:
            // - https://www.w3.org/TR/xml-c14n#ProcessingModel (Attribute Nodes)
            // - https://www.w3.org/TR/xml-c14n#Example-Chars
            xml_special_to_encoded_attribute[item]
        );
}

export function EncodeSpecialCharactersInText(text: string) {
    return text
        .replace(/\r\n?/g, "\n")  // Line ending normalization (Note: this should normally be done by the xml parser). See: https://www.w3.org/TR/xml/#sec-line-ends
        .replace(/([&<>\r])/g, (str, item) =>
            // Special character normalization. See:
            // - https://www.w3.org/TR/xml-c14n#ProcessingModel (Text Nodes)
            // - https://www.w3.org/TR/xml-c14n#Example-Chars
            xml_special_to_encoded_text[item]
        );
}

function _SelectNamespaces(node: Node, selectedNodes: AssocArray<string> = {}) {
    if (node && node.nodeType === XmlNodeType.Element) {
        const el = node as Element;
        if (el.namespaceURI && el.namespaceURI !== "http://www.w3.org/XML/1998/namespace" && !selectedNodes[el.prefix || ""])
            selectedNodes[el.prefix ? el.prefix : ""] = node.namespaceURI!;
        if (node.nodeType === XmlNodeType.Element)
            _SelectNamespaces(node.parentElement, selectedNodes);
    }
}

export function SelectNamespaces(node: Element) {
    let attrs: AssocArray<string> = {};
    _SelectNamespaces(node, attrs);
    return attrs;
}