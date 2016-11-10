import { XmlError, XE } from "./error";
import { CreateDocument, SelectSingleNode } from "./utils";
import { XmlNodeType, DEFAULT_PREFIX, DEFAULT_NAMESPACE_URI } from "./xml";
import { XmlObject } from "./xml_object";
import { Collection } from "./collection";

export const MAX = Number.MAX_VALUE;
export const MIN = 0;

export abstract class XmlCollection<I extends XmlObject> extends Collection<I> implements IXmlSerializable {

    // Public properties

    prefix = DEFAULT_PREFIX;
    namespaceUri = DEFAULT_NAMESPACE_URI;

    get Prefix(): string {
        return this.prefix;
    }
    set Prefix(value: string) {
        this.prefix = value;
    }

    get NamespaceURI() {
        return this.namespaceUri;
    }

    /**
     * The maximum number of elements
     */
    MaxOccurs: number;

    /**
     * The minimum number of elements
     */
    MinOccurs: number;

    constructor(minOccurs: number = MIN, maxOccurs: number = MAX) {
        super();
        this.MinOccurs = minOccurs;
        this.MaxOccurs = maxOccurs;
    }

    // Protetced methods
    protected abstract GetXmlObjectName(): string;

    protected GetPrefix(): string {
        return this.Prefix ? this.Prefix + ":" : "";
    }

    protected abstract OnLoadChildElement(element: Element): any;

    // Public methods
    /**
     * Check to see if something has changed in this instance and needs to be serialized
     * @returnsFlag indicating if a member needs serialization</returns>
     */
    public HasChanged(): boolean {
        let retVal = false;

        if (this.Count > 0) {
            retVal = true;
        }

        return retVal;
    }


    /**
     * Load state from an XML element
     * @param {Element} element XML element containing new state
     */
    public LoadXml(element: Element): void {
        if (element == null) {
            throw new XmlError(XE.PARAM_REQUIRED, "element");
        }

        if (!((element.localName === this.GetXmlObjectName()) && (element.namespaceURI === this.NamespaceURI)))
            throw new XmlError(XE.ELEMENT_MALFORMED, this.GetXmlObjectName());

        this.Clear();
        let xmlNodeList = element.childNodes;
        try {
            for (let i = 0; i < xmlNodeList.length; i++) {
                let node = xmlNodeList.item(i) as Element;
                if (node.nodeType !== XmlNodeType.Element)
                    continue;
                let item = this.OnLoadChildElement(node);
                if (item)
                    this.Add(item);
            }
        }
        catch (e) { console.error(e); }
        if (!(this.MinOccurs <= this.Count && this.Count <= this.MaxOccurs))
            throw new XmlError(XE.CRYPTOGRAPHIC, `${this.GetXmlObjectName()} has wrong items number '${this.Count}', should be [${this.MinOccurs},${this.MaxOccurs === MAX ? "unbounded" : this.MaxOccurs}]`);
    }

    /**
     * Returns the XML representation of the this object
     * @returns XML element containing the state of this object
     */
    public GetXml(): Element {
        let document = this.CreateDocument();
        let element = this.CreateElement(document);

        let appendedCount = 0;
        for (let item of this.GetIterator()) {
            if (item.HasChanged()) {
                element.appendChild(document.importNode(item.GetXml(), true));
                appendedCount++;
            }
        }
        if (!(this.MinOccurs <= appendedCount && appendedCount <= this.MaxOccurs))
            throw new XmlError(XE.CRYPTOGRAPHIC, `${this.GetXmlObjectName()} has wrong items number '${appendedCount}', should be [${this.MinOccurs},${this.MaxOccurs === MAX ? "unbounded" : this.MaxOccurs}]`);

        return element;
    }

    protected CreateDocument() {
        return CreateDocument(
            this.GetXmlObjectName(),
            this.NamespaceURI,
            this.Prefix);
    }

    protected CreateElement(document: Document) {
        return document.createElementNS(this.NamespaceURI, this.GetPrefix() + this.GetXmlObjectName());
    }

    /**
     * Returns Element by tag name and default namespace uri.
     * If element is required and not founded, throws exception
     * @param  {Element} element
     * @param  {string} name
     * @param  {boolean=true} required
     */
    protected GetElement(element: Element, name: string, required: boolean = true) {
        let xmlNodeList = element.getElementsByTagNameNS(this.NamespaceURI, name);
        if (required && xmlNodeList.length === 0) {
            throw new XmlError(XE.CRYPTOGRAPHIC, `${name} missing`);
        }
        return xmlNodeList[0] || null;
    }

    toString(): string {
        let xml = this.GetXml();
        return new XMLSerializer().serializeToString(xml);
    }
}
