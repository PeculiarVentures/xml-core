declare namespace XmlCore {

    // types

    /**
     * Base interface for collections
     * 
     * @interface ICollection
     * @template I
     */
    interface ICollection<I> {
        readonly Count: number;
        Item(index: number): I | null;
        Add(item: I): void;
        Pop(): I | undefined;
        RemoveAt(index: number): void;
        Clear(): void;
        GetIterator(): I[];
        ForEach(cb: (item: I, index: number, array: Array<I>) => void): void;
        Map<U>(cb: (item: I, index: number, array: Array<I>) => U): ICollection<U>;
        Filter(cb: (item: I, index: number, array: Array<I>) => boolean): ICollection<I>;
        Sort(cb: (a: I, b: I) => number): ICollection<I>;
        Every(cb: (value: I, index: number, array: I[]) => boolean): boolean;
        Some(cb: (value: I, index: number, array: I[]) => boolean): boolean;
        IsEmpty(): boolean;
    }

    interface IXmlSerializable {

        /**
         * Writes object to XML node
         * - if class was initialized and it has no one change, GetXml returns null
         * @returns Node
         */
        GetXml(): Node | null;
        /**
         * Reads XML from string
         * @param  {Node} node
         * @returns void
         */
        LoadXml(node: Node | string): void;
    }

    interface IXmlSerializableConstructor {
        new (): IXmlSerializable
    }

    /**
     * Base type for associated arrays
     * 
     * @interface AssocArray
     * @template T
     */
    interface AssocArray<T> {
        [index: string]: T;
    }

    type XmlBufferEncoding = string | "utf8" | "binary" | "hex" | "base64" | "base64url";

    type ISelectResult = Array<Node> | Node | boolean | number | string;

    interface XmlNamespace {
        /**
         * Prefix
         * 
         * @type {(string |)}
         * @memberOf XmlNamespace
         */
        prefix: string | null;
        /**
         * Namespace URI
         * 
         * @type {(string |)}
         * @memberOf XmlNamespace
         */
        namespace: string | null;
    }

    interface XmlSchemaItemBase {
        /**
         * Local name of item
         * 
         * @type {string}
         * @memberOf XmlSchemaItemBase
         */
        localName?: string;
        /**
         * Namespace URI of attribute
         * 
         * @type {(string |)}
         * @memberOf XmlSchemaItemBase
         */
        namespaceURI?: string | null;

        /**
         * Default prefix for Xml element 
         * 
         * @type {(string |)}
         * @memberOf XmlSchemaItemBase
         */
        prefix?: string | null;
    }

    interface XmlSchemaItem<T> extends XmlSchemaItemBase {
        /**
         * Default value for item
         * 
         * @type {(T |)}
         * @memberOf XmlSchemaItem
         */
        defaultValue?: T | null;
        /**
         * Determine where item is required
         * 
         * @type {boolean}
         * @memberOf XmlSchemaItem
         */
        required?: boolean;
        /**
         * Custom converter for item value
         * 
         * @type {IConverter<T>}
         * @memberOf XmlAttributeType
         */
        converter?: IConverter<T>;
    }

    interface XmlSchemaItemParser {
        /**
         * Xml parser for item
         * 
         * @type {*}
         * @memberOf XmlSchemaItemParser
         */
        parser?: IXmlSerializableConstructor;
    }

    interface XmlAttributeType<T> extends XmlSchemaItem<T> {
    }

    interface XmlElementType extends XmlSchemaItemBase, XmlSchemaItemParser {
        /**
         * Local name for Xml element
         * 
         * @type {string}
         * @memberOf XmlElementType
         */
        localName: string;
        /**
         * Namespace URI fro Xml element
         * 
         * @type {(string |)}
         * @memberOf XmlElementType
         */
        namespaceURI?: string | null;
    }

    interface XmlChildElementType<T> extends XmlSchemaItem<T>, XmlSchemaItemParser {
        /**
         * max occurs of items in collection
         * 
         * @type {number}
         * @memberOf XmlChildElementType
         */
        maxOccurs?: number;
        /**
         * min occurs of items in collection
         * 
         * @type {number}
         * @memberOf XmlChildElementType
         */
        minOccurs?: number;
        /**
         * Don't add root element of XmlCollection to compiled element
         * 
         * @type {boolean}
         * @memberOf XmlChildElementType
         */
        noRoot?: boolean;
    }

    type XmlSchema = {
        localName?: string;
        namespaceURI?: string | null;
        prefix?: string | null;
        parser?: IXmlSerializableConstructor;
        items?: { [key: string]: (XmlChildElementType<any> | XmlAttributeType<any>) & { type?: string } };
        target?: any;
    };

    interface IConverter<T> {
        /**
         * Converts value from Xml element to Object
         * 
         * @memberOf IConverter
         */
        set: (value: string) => T;
        /**
         * Converts value from Object to Xmml element
         * 
         * @memberOf IConverter
         */
        get: (value: T) => string | undefined;
    }

    // collection

    export class Collection<I> implements ICollection<I> {
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

    // convert

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
        static ToHex(buffer: Uint8Array): string;
        static FromHex(hexString: string): Uint8Array;
        static ToDateTime(dateTime: string): Date;
        static FromDateTime(dateTime: Date): string;
    }

    // converters

    export const XmlBase64Converter: IConverter<Uint8Array>;
    export const XmlNumberConverter: IConverter<number>;

    // decorators

    export function XmlElement(params: XmlElementType): <TFunction extends Function>(target: TFunction) => void;
    export function XmlChildElement<T>(params?: XmlChildElementType<T>): (target: Object, propertyKey: string | symbol) => void;
    export function XmlAttribute<T>(params?: XmlAttributeType<T>): (target: Object, propertyKey: string | symbol) => void;

    // error

    export class XmlError implements Error {
        stack: any;
        code: number;
        name: string;
        message: string;
        protected readonly prefix: string;
        constructor(code: XE, ...args: any[]);
    }
    export enum XE {
        NONE = 0,
        NULL_REFERENCE = 1,
        NULL_PARAM = 2,
        DECORATOR_NULL_PARAM = 3,
        COLLECTION_LIMIT = 4,
        METHOD_NOT_IMPLEMENTED = 5,
        METHOD_NOT_SUPPORTED = 6,
        PARAM_REQUIRED = 7,
        CONVERTER_UNSUPPORTED = 8,
        ELEMENT_MALFORMED = 9,
        ELEMENT_MISSING = 10,
        ATTRIBUTE_MISSING = 11,
        CRYPTOGRAPHIC = 12,
        CRYPTOGRAPHIC_NO_MODULE = 13,
        CRYPTOGRAPHIC_UNKNOWN_TRANSFORM = 14,
        ALGORITHM_NOT_SUPPORTED = 15,
        ALGORITHM_WRONG_NAME = 16,
        XML_EXCEPTION = 17,
    }

    // namespace_manager

    export class NamespaceManager extends Collection<XmlNamespace> {
        Add(item: XmlNamespace): void;
        GetPrefix(prefix: string, start?: number): XmlNamespace | null;
        GetNamespace(namespaceUrl: string, start?: number): XmlNamespace | null;
    }

    // utils

    type SelectNodes = (node: Node, xpath: string) => Node[];
    export const Select: SelectNodes;
    export function SelectSingleNode(node: Node, path: string): Node | null;
    export function SelectNamespaces(node: Element): AssocArray<string>;

    // xml

    export const APPLICATION_XML = "application/xml";
    export const DEFAULT_PREFIX = "";
    export const DEFAULT_NAMESPACE_URI = "";
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

    // xml_collection

    export class XmlCollection<I extends XmlObject> extends XmlObject implements ICollection<I> {
        static parser: any;
        MaxOccurs: number;
        MinOccurs: number;
        HasChanged(): boolean;
        protected OnGetXml(element: Element): void;
        protected OnLoadXml(element: Element): void;
        protected items: Array<I>;
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

    // xml_object

    export class XmlObject implements IXmlSerializable {
        protected static attributes: AssocArray<XmlAttributeType<any>>;
        protected static elements: AssocArray<XmlChildElementType<any>>;
        protected static prefix: string | null;
        protected static namespaceURI: string | null;
        protected static localName: string;
        protected element?: Element | null;
        protected prefix: string | null;
        protected localName: string | undefined;
        readonly Element: Element | null | undefined;
        Prefix: string | null;
        readonly LocalName: string;
        readonly NamespaceURI: string | null;
        protected GetStatic(): XmlSchema;
        protected GetPrefix(): string;
        HasChanged(): boolean;
        protected OnGetXml(element: Element): void;
        GetXml(hard?: boolean): Element | null;
        protected OnLoadXml(element: Element): void;
        static LoadXml<T extends XmlObject>(this: {
            new (): T;
        }, param: string | Element): T;
        LoadXml(param: string | Element): void;
        toString(): string;
        static Parse(xmlstring: string): Document;
        static GetElement(element: Element, name: string, required?: boolean): Element;
        GetElement(name: string, required?: boolean): Element;
        static GetAttribute(element: Element, attrName: string, defaultValue: string | null, required?: boolean): string | null;
        protected GetAttribute(name: string, defaultValue: string | null, required?: boolean): string | null;
        static GetElementById(document: Document, idValue: string): Element | null;
        static GetElementById(element: Element, idValue: string): Element | null;
        protected CreateElement(document?: Document, localName?: string, namespaceUri?: string | null, prefix?: string | null): Element;
        protected CreateDocument(): Document;
        static CreateDocument(root?: string, namespaceUri?: string | null, prefix?: string | null): Document;
        static GetChildren(node: Node, localName: string, nameSpace?: string): Element[];
        GetChildren(localName: string, nameSpace?: string): Element[];
        static GetFirstChild(node: Node, localName: string, nameSpace?: string): Element | null;
        static GetChild(node: Element, localName: string, nameSpace?: string, required?: boolean): Element | null;
        protected GetChild(localName: string, required?: boolean): Element | null;
        GetFirstChild(localName: string, namespace?: string): Element | null;
    }

}

export = XmlCore;
export as namespace XmlCore;