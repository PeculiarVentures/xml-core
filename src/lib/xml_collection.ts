import { XmlObject } from "./xml_object";
import { Collection } from "./collection";
import { XmlNodeType } from "./xml";

export abstract class XmlCollection<I extends XmlObject> extends XmlObject implements ICollection<I> {

    public static parser: any;

    /**
     * The maximum number of elements
     */
    MaxOccurs: number;

    /**
     * The minimum number of elements
     */
    MinOccurs: number;

    protected OnGetXml(element: Element) {
        for (let item of this.GetIterator()) {
            const el = item.GetXml();
            element.appendChild(el);
        }
    }

    protected OnLoadXml(element: Element) {
        const self = this.GetStatic();
        for (let i = 0; i < element.childNodes.length; i++) {
            const node = element.childNodes.item(i);
            if (node.nodeType !== XmlNodeType.Element &&
                node.localName === self.parser.localName &&
                // tslint:disable-next-line:triple-equals
                node.namespaceURI == self.namespaceURI)
                break;
            const el = node as Element;

            let item = new self.parser() as IXmlSerializable;
            item.LoadXml(el);
            this.Add(item as any);
        }
    }

    // Collection
    protected items: Array<I> = new Array();

    public get Count() {
        return this.items.length;
    }

    public Item(index: number): I | null {
        return this.items[index] || null;
    }

    public Add(item: I) {
        this.items.push(item);
        this.element = null;
    }

    public Pop() {
        this.element = null;
        return this.items.pop();
    }

    public RemoveAt(index: number) {
        this.items = this.items.filter((item, _index) => _index !== index);
        this.element = null;
    }

    public Clear() {
        this.items = new Array();
        this.element = null;
    }

    public GetIterator() {
        return this.items;
    }

    public ForEach(cb: (item: I, index: number, array: Array<I>) => void) {
        this.GetIterator().forEach(cb);
    }

    public Map<U>(cb: (item: I, index: number, array: Array<I>) => U) {
        return new Collection(this.GetIterator().map<U>(cb));
    }

    public Filter(cb: (item: I, index: number, array: Array<I>) => boolean) {
        return new Collection(this.GetIterator().filter(cb));
    }

    public Sort(cb: (a: I, b: I) => number) {
        return new Collection(this.GetIterator().sort(cb));
    }

    public Every(cb: (value: I, index: number, array: I[]) => boolean) {
        return this.GetIterator().every(cb);
    }

    public Some(cb: (value: I, index: number, array: I[]) => boolean) {
        return this.GetIterator().some(cb);
    }

    IsEmpty() {
        return this.Count === 0;
    }

}
