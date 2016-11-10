export class Collection<I> implements IterableIterator<I> {

    protected items: Array<I> = new Array();

    constructor(items?: Array<I>) {
        if (items)
            this.items = items;
    }

    public get Count() {
        return this.items.length;
    }

    public Item(index: number): I | null {
        return this.items[index] || null;
    }

    public Add(item: I) {
        this.items.push(item);
    }

    public Pop() {
        return this.items.pop();
    }

    public RemoveAt(index: number) {
        this.items = this.items.filter((item, _index) => _index !== index);
    }

    public Clear() {
        this.items = new Array();
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
