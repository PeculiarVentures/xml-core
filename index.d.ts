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
        new(): IXmlSerializable
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

    interface XmlContentType<T> {
        /**
         * Default value for item
         * 
         * @type {(T |)}
         * @memberOf XmlContentType
         */
        defaultValue?: T | null;
        /**
         * Determine where item is required
         * 
         * @type {boolean}
         * @memberOf XmlContentType
         */
        required?: boolean;
        /**
         * Custom converter for item value
         * 
         * @type {IConverter<T>}
         * @memberOf XmlContentType
         */
        converter?: IConverter<T>;
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
        public readonly Count: number;
        constructor(items?: Array<I>);
        public Item(index: number): I | null;
        public Add(item: I): void;
        public Pop(): I | undefined;
        public RemoveAt(index: number): void;
        public Clear(): void;
        public GetIterator(): I[];
        public ForEach(cb: (item: I, index: number, array: Array<I>) => void): void;
        public Map<U>(cb: (item: I, index: number, array: Array<I>) => U): Collection<U>;
        public Filter(cb: (item: I, index: number, array: Array<I>) => boolean): Collection<I>;
        public Sort(cb: (a: I, b: I) => number): Collection<I>;
        public Every(cb: (value: I, index: number, array: I[]) => boolean): boolean;
        public Some(cb: (value: I, index: number, array: I[]) => boolean): boolean;
        public IsEmpty(): boolean;
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
    export const XmlBooleanConverter: IConverter<boolean>;

    // decorators

    export function XmlElement(params: XmlElementType): <TFunction extends Function>(target: TFunction) => void;
    export function XmlChildElement<T>(params?: XmlChildElementType<T>): (target: Object, propertyKey: string | symbol) => void;
    export function XmlAttribute<T>(params?: XmlAttributeType<T>): (target: Object, propertyKey: string | symbol) => void;
    export function XmlContent<T>(params?: XmlContentType<T>): (target: Object, propertyKey: string | symbol) => void;

    // error

    export class XmlError implements Error {
        public stack: any;
        public code: number;
        public name: string;
        public message: string;
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
        public Add(item: XmlNamespace): void;
        public GetPrefix(prefix: string, start?: number): XmlNamespace | null;
        public GetNamespace(namespaceUrl: string, start?: number): XmlNamespace | null;
    }

    // utils

    type SelectNodes = (node: Node, xpath: string) => Node[];
    export const Select: SelectNodes;
    export function Parse(xmlString: string): Document;
    export function Stringify(target: Node): string;
    export function SelectSingleNode(node: Node, path: string): Node | null;
    export function SelectNamespaces(node: Element): AssocArray<string>;
    export function assign(target: any, ...sources: any[]): any;

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
        public MaxOccurs: number;
        public MinOccurs: number;
        public readonly Count: number;
        protected items: Array<I>;
        public HasChanged(): boolean;
        public Item(index: number): I | null;
        public Add(item: I): void;
        public Pop(): I | undefined;
        public RemoveAt(index: number): void;
        public Clear(): void;
        public GetIterator(): I[];
        public ForEach(cb: (item: I, index: number, array: Array<I>) => void): void;
        public Map<U>(cb: (item: I, index: number, array: Array<I>) => U): Collection<U>;
        public Filter(cb: (item: I, index: number, array: Array<I>) => boolean): Collection<I>;
        public Sort(cb: (a: I, b: I) => number): Collection<I>;
        public Every(cb: (value: I, index: number, array: I[]) => boolean): boolean;
        public Some(cb: (value: I, index: number, array: I[]) => boolean): boolean;
        public IsEmpty(): boolean;
        protected OnGetXml(element: Element): void;
        protected OnLoadXml(element: Element): void;
    }

    // xml_object

    export class XmlObject implements IXmlSerializable {
        public static GetElement(element: Element, name: string, required?: boolean): Element;
        public static GetAttribute(element: Element, attrName: string, defaultValue: string | null, required?: boolean): string | null;
        public static GetElementById(document: Document, idValue: string): Element | null;
        public static GetElementById(element: Element, idValue: string): Element | null;
        public static CreateDocument(root?: string, namespaceUri?: string | null, prefix?: string | null): Document;
        public static GetChildren(node: Node, localName: string, nameSpace?: string): Element[];
        public static GetChild(node: Element, localName: string, nameSpace?: string, required?: boolean): Element | null;
        public static GetFirstChild(node: Node, localName: string, nameSpace?: string): Element | null;
        static LoadXml<T extends XmlObject>(this: {
            new(): T;
        }, param: string | Element): T;
        protected static attributes: AssocArray<XmlAttributeType<any>>;
        protected static elements: AssocArray<XmlChildElementType<any>>;
        protected static prefix: string | null;
        protected static namespaceURI: string | null;
        protected static localName: string;

        public readonly Element: Element | null | undefined;
        public Prefix: string | null;
        public readonly LocalName: string;
        public readonly NamespaceURI: string | null;
        protected element?: Element | null;
        protected prefix: string | null;
        protected localName: string | undefined;

        public HasChanged(): boolean;
        public GetXml(hard?: boolean): Element | null;
        public LoadXml(param: string | Element): void;
        public toString(): string;
        public GetElement(name: string, required?: boolean): Element;
        public GetChildren(localName: string, nameSpace?: string): Element[];
        public GetChild(localName: string, required?: boolean): Element | null;
        public GetFirstChild(localName: string, namespace?: string): Element | null;
        public GetAttribute(name: string, defaultValue: string | null, required?: boolean): string | null;
        public IsEmpty(): boolean;
        protected GetStatic(): XmlSchema;
        protected GetPrefix(): string;
        protected OnGetXml(element: Element): void;
        protected OnLoadXml(element: Element): void;
        protected CreateElement(document?: Document, localName?: string, namespaceUri?: string | null, prefix?: string | null): Element;
        protected CreateDocument(): Document;
    }

}

export = XmlCore;
export as namespace XmlCore;