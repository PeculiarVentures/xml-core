import { XmlNodeType, DEFAULT_PREFIX, DEFAULT_NAMESPACE_URI } from "./xml";
import { XmlError, XE } from "./error";
import { SelectSingleNode } from "./utils";
import { APPLICATION_XML } from "./xml";

const DEFAULT_ROOT_NAME = "xml_root";

export abstract class XmlObject implements IXmlSerializable {

    protected element: Element | null = null;
    protected prefix = DEFAULT_PREFIX;
    protected namespaceUri = DEFAULT_PREFIX;
    protected abstract name: string;

    get Element(): Element {
        return this.element;
    }

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

    abstract GetXml(): Element;

    LoadXml(element: Element) {
        if (element == null) {
            throw new XmlError(XE.PARAM_REQUIRED, "element");
        }

        if (!((element.localName === this.name) && (element.namespaceURI === this.NamespaceURI)))
            throw new XmlError(XE.ELEMENT_MALFORMED, this.name);

        this.namespaceUri = element.namespaceURI;
        this.prefix = element.prefix;
        this.element = element;

    }

    toString(): string {
        let xml = this.GetXml();
        return new XMLSerializer().serializeToString(xml);
    }

    static GetElement(element: Element, name: string, required: boolean = true) {
        let xmlNodeList = element.getElementsByTagName(name);
        if (required && xmlNodeList.length === 0) {
            throw new XmlError(XE.ELEMENT_MISSING, name, element.localName);
        }
        return xmlNodeList[0] || null;
    }
    GetElement(name: string, required: boolean = true) {
        if (!this.element)
            throw new XmlError(XE.NULL_PARAM, this.name);
        return XmlObject.GetElement(this.element, name, required);
    }

    static GetAttribute(element: Element, attrName: string, defaultValue: string | null, required: boolean = true) {
        if (element.hasAttribute(attrName)) {
            return element.getAttribute(attrName);
        }
        else {
            if (required)
                throw new XmlError(XE.ATTRIBUTE_MISSING, attrName, element.localName);
            return defaultValue;
        }
    }
    protected GetAttribute(name: string, defaultValue: string | null, required: boolean = true) {
        if (!this.element)
            throw new XmlError(XE.NULL_PARAM, this.name);
        return XmlObject.GetAttribute(this.element, name, defaultValue, required);
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

    protected CreateElement(document: Document) {
        const xn = document.createElementNS(this.NamespaceURI, this.GetPrefix() + this.name);
        document.importNode(xn, true);
        return xn;
    }

    protected CreateDocument() {
        return XmlObject.CreateDocument(
            this.name,
            this.NamespaceURI,
            this.Prefix);
    }

    /**
     * Creates new instance of XmlDocument with given name of root element
     * @param  {string} root Name of root element
     * @param  {string} namespaceUri
     * @param  {string} prefix
     * @returns Document
     */
    static CreateDocument(root: string = DEFAULT_ROOT_NAME, namespaceUri: string = "", prefix: string = ""): Document {
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

    static GetChildren(node: Node, localName: string, nameSpace?: string): Element[] {
        node = (<Document>node).documentElement || node;
        let res: Element[] = [];
        for (let i = 0; i < node.childNodes.length; i++) {
            let child = node.childNodes[i];
            if (child.nodeType === XmlNodeType.Element && child.localName === localName && (child.namespaceURI === nameSpace || !nameSpace)) {
                res.push(child as Element);
            }
        }
        return res;
    }

    GetChildren(localName: string) {
        if (!this.element)
            throw new XmlError(XE.NULL_PARAM, this.name);
        return XmlObject.GetChildren(this.element, localName, this.NamespaceURI);
    }

    static GetFirstChild(node: Node, localName: string, nameSpace?: string): Element | null {
        node = (<Document>node).documentElement || node;
        let res: Element[] = [];
        for (let i = 0; i < node.childNodes.length; i++) {
            let child = node.childNodes[i];
            if (child.nodeType === XmlNodeType.Element && child.localName === localName && (child.namespaceURI === nameSpace || !nameSpace)) {
                return child as Element;
            }
        }
        return null;
    }
    static GetChild(node: Element, localName: string, nameSpace?: string, required = true): Element | null {
        let res: Element[] = [];
        for (let i = 0; i < node.childNodes.length; i++) {
            let child = node.childNodes[i];
            if (child.nodeType === XmlNodeType.Element && child.localName === localName && (child.namespaceURI === nameSpace || !nameSpace)) {
                return child as Element;
            }
        }
        if (required)
            throw new XmlError(XE.ELEMENT_MISSING, localName, node.localName);
        return null;
    }
    protected GetChild(localName: string, required = true): Element | null {
        return XmlObject.GetChild(this.element, localName, this.namespaceUri, required);
    }

    GetFirstChild(localName: string, namespace?: string) {
        if (!this.element)
            throw new XmlError(XE.NULL_PARAM, this.name);
        return XmlObject.GetFirstChild(this.element, localName, namespace);
    }

}