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

/**
 * Base type for associated arrays
 * 
 * @interface AssocArray
 * @template T
 */
interface AssocArray<T> {
    [index: string]: T;
}

declare type XmlBufferEncoding = string | "utf8" | "binary" | "hex" | "base64" | "base64url";

declare type ISelectResult = Array<Node> | Node | boolean | number | string;

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

interface XmlAttributeType<T> {
    /**
     * Local name of attribute
     * 
     * @type {string}
     * @memberOf XmlAttributeType
     */
    localName?: string;
    /**
     * Determine where attribute is required
     * 
     * @type {boolean}
     * @memberOf XmlAttributeType
     */
    required?: boolean;
    /**
     * Default value for attribute
     * 
     * @type {(T |)}
     * @memberOf XmlAttributeType
     */
    defaultValue?: T | null;
    /**
     * Namespace URI of attribute
     * 
     * @type {(string |)}
     * @memberOf XmlAttributeType
     */
    namespaceURI?: string | null;
    /**
     * Custom converter for attribute value
     * 
     * @type {IConverter<T>}
     * @memberOf XmlAttributeType
     */
    converter?: IConverter<T>;
}

interface XmlElementType {
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
    /**
     * Default prefix for Xml element 
     * 
     * @type {(string |)}
     * @memberOf XmlElementType
     */
    prefix?: string | null;
    /**
     * Xml parser for XmlCollection
     * 
     * @type {*}
     * @memberOf XmlElementType
     */
    parser?: any;
}

interface XmlChildElementType<T> {
    /**
     * local name for simple elements
     * 
     * @type {string}
     * @memberOf XmlChildElementType
     */
    localName?: string;
    /**
     * NamespaceURI for simple elements
     * 
     * @type {(string |)}
     * @memberOf XmlChildElementType
     */
    namespaceURI?: string | null;
    /**
     * Default prefix value for elements 
     * 
     * @type {(string |)}
     * @memberOf XmlChildElementType
     */
    prefix?: string | null;
    /**
     * Determine where element is required
     * 
     * @type {boolean}
     * @memberOf XmlChildElementType
     */
    required?: boolean;
    /**
     * Default value for simple element text content
     * 
     * @type {(T |)}
     * @memberOf XmlChildElementType
     */
    defaultValue?: T | null;
    /**
     * Custom converter for simple elements with text content 
     * 
     * @type {IConverter<T>}
     * @memberOf XmlChildElementType
     */
    converter?: IConverter<T>;
    /**
     * Static class of XmlObject 
     * 
     * @type {*}
     * @memberOf XmlChildElementType
     */
    parser?: any;
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