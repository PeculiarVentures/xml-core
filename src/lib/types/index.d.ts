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

interface XmlAttributeType<T> {
    localName?: string;
    required?: boolean;
    defaultValue?: T;
    namespaceUri?: string | null;
    converter?: IConverter<T>; 
}

interface XmlElementType {
    localName: string;
    namespaceUri?: string | null;
    prefix?: string | null; 
} 

interface XmlChildElementType<T> {
    localName?: string;
    namespaceUri?: string | null;
    prefix?: string | null;
    required?: boolean;
    defaultValue?: T; 
    converter?: IConverter<T>;
    parser?: any;
} 

interface IConverter<T> {
    set: (value: string) => T;
    get: (value: T) => string | undefined;
}