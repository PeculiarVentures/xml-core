let _w: any;
if (typeof self === "undefined")
    _w = global;
else
    _w = self;
_w.XMLSerializer = XMLSerializer || require("xmldom-alpha").XMLSerializer;
_w.DOMParser = DOMParser || require("xmldom-alpha").DOMParser;
_w.DOMImplementation = DOMImplementation || require("xmldom-alpha").DOMImplementation;
_w.document = document || new DOMImplementation().createDocument("http://www.w3.org/1999/xhtml", "html", null!);

function SelectNodesEx(node: Node, xpath: string): Node[] {
    let doc: Document = node.ownerDocument == null ? node as Document : node.ownerDocument;
    let nsResolver = document.createNSResolver(node.ownerDocument == null ? (node as Document).documentElement : node.ownerDocument.documentElement);
    let personIterator = doc.evaluate(xpath, node, nsResolver, XPathResult.ANY_TYPE, null!);
    let ns: Node[] = [];
    let n: Node;
    while (n = personIterator.iterateNext())
        ns.push(n);
    return ns;
}

_w.select = (typeof module === "undefined") ? SelectNodesEx : require("xpath.js");

export {};