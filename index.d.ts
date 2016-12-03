declare type SelectNodes = (node: Node, xpath: string) => Node[];

interface IXmlSerializable {

    Prefix: string;
    /**
     * Writes object to XML node
     * @returns Node
     */
    GetXml(): Node;
    /**
     * Reads XML from string
     * @param  {Node} node
     * @returns void
     */
    LoadXml(node: Node): void;
}

interface AssocArray<T> {
    [index: string]: T;
}


declare type XmlBufferEncoding = string | "utf8" | "binary" | "hex" | "base64" | "base64url";

declare type ISelectResult = Array<Node> | Node | boolean | number | string;

interface XmlNamespace {
    prefix: string | null;
    namespace: string | null;
}

declare const select: SelectNodes;

declare namespace XmlJs {

    export class Collection<I> {
        protected items: Array<I>;
        constructor(items?: Array<I>);
        readonly Count: number;
        Item(index: number): I | null;
        Add(item: I): void;
        Pop(): I | undefined;
        RemoveAt(index: number): void;
        Clear(): void;
        GetIterator(): I[];
        ForEach(cb: (item: I, index: number, array: Array<I>) => void): void;
        Map<U>(cb: (item: I, index: number, array: Array<I>) => U): Collection<U>;
        Filter(cb: (item: I, index: number, array: Array<I>) => boolean): Collection<I>;
        Sort(cb: (a: I, b: I) => number): Collection<I>;
        Every(cb: (value: I, index: number, array: I[]) => boolean): boolean;
        Some(cb: (value: I, index: number, array: I[]) => boolean): boolean;
        IsEmpty(): boolean;
    }

    export class Convert {
        static ToString(buffer: BufferSource, enc?: XmlBufferEncoding): string;
        static FromString(str: string, enc?: XmlBufferEncoding): Uint8Array;
        static ToBase64(buf: Uint8Array): string;
        static FromBase64(base64Text: string): Uint8Array;
        protected static Base64Padding(base64: string): string;
        static FromBase64Url(base64url: string): Uint8Array;
        static ToBase64Url(data: Uint8Array): string;
        static FromUtf8String(text: string): Uint8Array;
        static ToUtf8String(buffer: Uint8Array): string;
        static FromBinary(text: string): Uint8Array;
        static ToBinary(buffer: Uint8Array): string;
        /**
         * Converts buffer to HEX string
         * @param  {BufferSource} buffer Incoming buffer
         * @returns string
         */
        static ToHex(buffer: Uint8Array): string;
        /**
         * Converts HEX string to buffer
         *
         * @static
         * @param {string} hexString
         * @returns {Uint8Array}
         *
         * @memberOf Convert
         */
        static FromHex(hexString: string): Uint8Array;
        /**
         * Converts string to Date
         *
         * @static
         * @param {string} dateTime
         * @returns {Date}
         *
         * @memberOf Convert
         */
        static ToDateTime(dateTime: string): Date;
        /**
         * Converts Date to string
         *
         * @static
         * @param {Date} dateTime
         * @returns {string}
         *
         * @memberOf Convert
         */
        static FromDateTime(dateTime: Date): string;
    }


    export class XmlError extends Error {
        stack: any;
        code: number;
        protected readonly prefix: string;
        constructor(code: XE, ...args: any[]);
    }
    export enum XE {
        NONE = 0,
        NULL_REFERENCE = 1,
        NULL_PARAM = 2,
        METHOD_NOT_IMPLEMENTED = 3,
        METHOD_NOT_SUPPORTED = 4,
        PARAM_REQUIRED = 5,
        CONVERTER_UNSUPPORTED = 6,
        ELEMENT_MALFORMED = 7,
        ELEMENT_MISSING = 8,
        ATTRIBUTE_MISSING = 9,
        CRYPTOGRAPHIC = 10,
        CRYPTOGRAPHIC_NO_MODULE = 11,
        CRYPTOGRAPHIC_UNKNOWN_TRANSFORM = 12,
        ALGORITHM_NOT_SUPPORTED = 13,
        ALGORITHM_WRONG_NAME = 14,
        XML_EXCEPTION = 15,
    }

    export class NamespaceManager extends Collection<XmlNamespace> {
        Add(item: XmlNamespace): void;
        GetPrefix(prefix: string, start?: number): XmlNamespace | null;
        GetNamespace(namespaceUrl: string, start?: number): XmlNamespace | null;
    }

    export function IsEqualsEmptyStrings(s1: string, s2: string): boolean;
    /**
     * Returns signle Node from given Node
     *
     * @export
     * @param {Node} node
     * @param {string} path
     * @returns
     */
    export function SelectSingleNode(node: Node, path: string): Node | null;
    export function FindAttr(node: Node, localName: string, nameSpace?: string): Attr | null;
    export function FindFirst(doc: Node, xpath: string): Node;
    export function EncodeSpecialCharactersInAttribute(attributeValue: string): string;
    export function EncodeSpecialCharactersInText(text: string): string;
    export function SelectNamespaces(node: Element): AssocArray<string>;

    export const APPLICATION_XML: string;
    export const DEFAULT_PREFIX: string;
    export const DEFAULT_NAMESPACE_URI: string;
    export enum XmlNodeType {
        None = 0,
        Element = 1,
        Attribute = 2,
        Text = 3,
        CDATA = 4,
        EntityReference = 5,
        Entity = 6,
        ProcessingInstruction = 7,
        Comment = 8,
        Document = 9,
        DocumentType = 10,
        DocumentFragment = 11,
        Notation = 12,
        Whitespace = 13,
        SignificantWhitespace = 14,
        EndElement = 15,
        EndEntity = 16,
        XmlDeclaration = 17,
    }

    export const MAX: number;
    export const MIN: number;

    export abstract class XmlCollection<I extends XmlObject> extends Collection<I> implements IXmlSerializable {
        protected element: Element | null;
        protected prefix: string;
        protected namespaceUri: string;
        protected abstract name: string;
        readonly Element: Element | null;
        Prefix: string;
        readonly NamespaceURI: string;
        /**
         * The maximum number of elements
         */
        MaxOccurs: number;
        /**
         * The minimum number of elements
         */
        MinOccurs: number;
        constructor(minOccurs?: number, maxOccurs?: number);
        protected GetPrefix(): string;
        protected abstract OnLoadChildElement(element: Element): any;
        /**
         * Check to see if something has changed in this instance and needs to be serialized
         * @returnsFlag indicating if a member needs serialization</returns>
         */
        HasChanged(): boolean;
        /**
         * Load state from an XML element
         * @param {Element} element XML element containing new state
         */
        LoadXml(element: Element): void;
        /**
         * Returns the XML representation of the this object
         * @returns XML element containing the state of this object
         */
        GetXml(): Element;
        protected CreateDocument(): Document;
        protected CreateElement(document: Document): Element;
        /**
         * Returns Element by tag name and default namespace uri.
         * If element is required and not founded, throws exception
         * @param  {Element} element
         * @param  {string} name
         * @param  {boolean=true} required
         */
        protected GetElement(element: Element, name: string, required?: boolean): Element;
        toString(): string;
    }

    export abstract class XmlObject implements IXmlSerializable {
        protected element: Element | null;
        protected prefix: string;
        protected namespaceUri: string;
        protected abstract name: string;
        readonly Element: Element | null;
        Prefix: string;
        readonly NamespaceURI: string;
        HasChanged(): boolean;
        protected GetPrefix(): string;
        abstract GetXml(): Element;
        LoadXml(element: Element): void;
        toString(): string;
        static GetElement(element: Element, name: string, required?: boolean): Element;
        GetElement(name: string, required?: boolean): Element;
        static GetAttribute(element: Element, attrName: string, defaultValue: string | null, required?: boolean): string | null;
        protected GetAttribute(name: string, defaultValue: string | null, required?: boolean): string | null;
        protected GetElementById(document: Document, idValue: string): Element | null;
        protected GetElementById(element: Element, idValue: string): Element | null;
        protected CreateElement(document?: Document, localName?: string, namespaceUri?: string, prefix?: string): Element;
        protected CreateDocument(): Document;
        /**
         * Creates new instance of XmlDocument with given name of root element
         * @param  {string} root Name of root element
         * @param  {string} namespaceUri
         * @param  {string} prefix
         * @returns Document
         */
        static CreateDocument(root?: string, namespaceUri?: string, prefix?: string): Document;
        static GetChildren(node: Node, localName: string, nameSpace?: string): Element[];
        GetChildren(localName: string, nameSpace?: string): Element[];
        static GetFirstChild(node: Node, localName: string, nameSpace?: string): Element | null;
        static GetChild(node: Element, localName: string, nameSpace?: string, required?: boolean): Element | null;
        protected GetChild(localName: string, required?: boolean): Element | null;
        GetFirstChild(localName: string, namespace?: string): Element | null;
    }

}

declare module "xmljs" {
    export = XmlJs
}