import { XmlNodeType } from "./xml";
import { XmlError, XE } from "./error";
import { SelectSingleNode } from "./utils";
import { APPLICATION_XML } from "./xml";

const DEFAULT_ROOT_NAME = "xml_root";


export abstract class XmlObject implements IXmlSerializable {

    protected static attributes: AssocArray<XmlAttributeType<any>>;
    protected static elements: AssocArray<XmlChildElementType<any>>;
    protected static prefix: string | null;
    protected static namespaceUri: string | null;
    protected static localName: string;

    protected element: Element | null = null;
    protected prefix = this.GetStatic().prefix;

    get Element() {
        return this.element;
    }

    get Prefix(): string {
        return this.prefix;
    }
    set Prefix(value: string) {
        this.prefix = value;
    }

    get LocalName(): string {
        return this.GetStatic().localName;
    }
    get NamespaceURI(): string | null {
        return this.GetStatic().namespaceUri;
    }

    protected GetStatic(): any {
        return this.constructor;
    }

    protected GetPrefix(): string {
        return (this.Prefix) ? this.prefix + ":" : "";
    }

    HasChanged() {
        return !!this.element;
    }


    protected OnGetXml(element: Element) {

    }

    GetXml(): Element {
        let doc = this.CreateDocument();
        let el = this.CreateElement();

        const localName: string = this.GetStatic().localName;

        // Add attributes
        for (let key in this.GetStatic().attributes) {
            let attr: XmlAttributeType<any> = this.GetStatic().attributes[key];
            let value = (attr.converter) ? attr.converter.get((this as any)[key]) : (this as any)[key];
            if (attr.required && (value === null || value === void 0))
                throw new XmlError(XE.ATTRIBUTE_MISSING, attr.localName, localName);

            // attr value
            if (attr.defaultValue !== (this as any)[key] || attr.required)
                if (!attr.namespaceUri)
                    el.setAttribute(attr.localName!, value);
                else
                    el.setAttributeNS(attr.namespaceUri, attr.localName!, value);
        }

        // Add elements
        for (let key in this.GetStatic().elements) {
            let item = this.GetStatic().elements[key];
            let node: Element | null = null;

            if (item.parser) {
                if (item.required && !(this as any)[key])
                    throw new XmlError(XE.ELEMENT_MISSING, item.parser.localName, localName);

                if ((this as any)[key])
                    node = (this as any)[key].GetXml();
            }
            else {
                let value = (item.converter) ? item.converter.get((this as any)[key]) : (this as any)[key];
                if (item.required && (value === null || value === void 0))
                    throw new XmlError(XE.ELEMENT_MISSING, item.localName, localName);
                if ((this as any)[key] !== item.defaultValue || item.required) {
                    if (!item.namespaceUri)
                        node = doc.createElement(`${item.prefix ? item.prefix + ":" : ""}${item.localName}`);
                    else {
                        node = doc.createElementNS(item.namespaceUri, `${item.prefix ? item.prefix + ":" : ""}${item.localName}`);
                    }
                    node.textContent = value;
                }
            }

            if (node)
                el.appendChild(node);
        }

        this.OnGetXml(el);

        // Cache compiled elements
        this.element = el;
        return el;
    }

    protected OnLoadXml(element: Element) {
    }

    LoadXml(element: Element) {
        if (element == null) {
            throw new XmlError(XE.PARAM_REQUIRED, "element");
        }

        const localName: string = this.GetStatic().localName;

        if (!((element.localName === localName) && (element.namespaceURI === this.NamespaceURI)))
            throw new XmlError(XE.ELEMENT_MALFORMED, localName);

        this.OnLoadXml(element);

        this.prefix = element.prefix || "";
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
            throw new XmlError(XE.NULL_PARAM, this.LocalName);
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
            throw new XmlError(XE.NULL_PARAM, this.LocalName);
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

    protected CreateElement(document?: Document, localName?: string, namespaceUri?: string, prefix?: string) {
        if (!document)
            document = this.CreateDocument();
        if (!localName)
            localName = this.LocalName;
        if (!namespaceUri)
            namespaceUri = this.NamespaceURI!;
        if (prefix === void 0)
            prefix = this.prefix;
        const xn = document!.createElementNS(this.NamespaceURI, (prefix ? `${prefix}:` : "") + this.LocalName);
        document!.importNode(xn, true);
        return xn;
    }

    protected CreateDocument() {
        return XmlObject.CreateDocument(
            this.LocalName,
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
    static CreateDocument(root: string = DEFAULT_ROOT_NAME, namespaceUri: string | null = null, prefix: string = ""): Document {
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

    GetChildren(localName: string, nameSpace?: string) {
        if (!this.element)
            throw new XmlError(XE.NULL_PARAM, this.LocalName);
        return XmlObject.GetChildren(this.element, localName, nameSpace || this.NamespaceURI || undefined);
    }

    static GetFirstChild(node: Node, localName: string, nameSpace?: string): Element | null {
        node = (<Document>node).documentElement || node;
        for (let i = 0; i < node.childNodes.length; i++) {
            let child = node.childNodes[i];
            if (child.nodeType === XmlNodeType.Element && child.localName === localName && (child.namespaceURI === nameSpace || !nameSpace)) {
                return child as Element;
            }
        }
        return null;
    }
    static GetChild(node: Element, localName: string, nameSpace?: string, required = true): Element | null {
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
        if (!this.element)
            throw new XmlError(XE.NULL_PARAM, this.LocalName);
        return XmlObject.GetChild(this.element, localName, this.NamespaceURI || undefined, required);
    }

    GetFirstChild(localName: string, namespace?: string) {
        if (!this.element)
            throw new XmlError(XE.NULL_PARAM, this.LocalName);
        return XmlObject.GetFirstChild(this.element, localName, namespace);
    }

}