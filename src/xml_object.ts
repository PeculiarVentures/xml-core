import { XmlNodeType, DEFAULT_PREFIX, DEFAULT_NAMESPACE_URI } from "./xml";
import { SelectSingleNode } from "./utils";

export abstract class XmlObject implements IXmlSerializable {

    protected prefix = DEFAULT_PREFIX;
    protected namespaceUri = DEFAULT_PREFIX;

    get Prefix(): string {
        return this.prefix;
    }
    set Prefix(value: string) {
        this.prefix = value;
    }

    get NamespaceURI() {
        return this.namespaceUri;
    }

    HasChanged(): boolean {
        return true;
    }

    protected GetPrefix(): string {
        return (this.Prefix) ? this.prefix + ":" : "";
    }

    abstract GetXml(): Node;
    abstract GetXml(document: Document): Node;

    abstract LoadXml(node: Node): void;

    toString(): string {
        let xml = this.GetXml();
        return new XMLSerializer().serializeToString(xml);
    }

    protected getAttribute(xel: Element, attribute: string) {
        if (xel.hasAttribute(attribute))
            return xel.getAttribute(attribute);
        return null;
    }

    protected GetElementById(document: Document, idValue: string): Element | null;
    protected GetElementById(element: Element, idValue: string): Element | null;
    protected GetElementById(node: Node, idValue: string) {
        if ((node == null) || (idValue == null))
            return null;

        // this works only if there's a DTD or XSD available to define the ID
        let xel: Node | null = null;
        if (node.nodeType === XmlNodeType.Document)
            xel = (node as Document).getElementById(idValue);
        if (xel == null) {
            // search an "undefined" ID
            xel = SelectSingleNode(node, `//*[@Id='${idValue}']`);
            if (xel == null) {
                xel = SelectSingleNode(node, `//*[@ID='${idValue}']`);
                if (xel == null) {
                    xel = SelectSingleNode(node, `//*[@id='${idValue}']`);
                }
            }
        }
        return xel as Element;
    }

}