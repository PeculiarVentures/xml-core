import { Collection } from "./collection";

export class NamespaceManager extends Collection<XmlNamespace> {

    Add(item: XmlNamespace) {
        item.prefix = item.prefix || "";
        item.namespace = item.namespace || "";
        super.Add(item);
    }

    GetPrefix(prefix: string, start: number = this.Count - 1): XmlNamespace | null {
        let lim = this.Count - 1;
        prefix = prefix || "";
        if (start > lim)
            start = lim;
        for (let i = start; i >= 0; i--) {
            let item = this.items[i];
            if (item.prefix === prefix)
                return item;
        }
        return null;
    }

    GetNamespace(namespaceUrl: string, start: number = this.Count - 1): XmlNamespace | null {
        let lim = this.Count - 1;
        namespaceUrl = namespaceUrl || "";
        if (start > lim)
            start = lim;
        for (let i = start; i >= 0; i--) {
            let item = this.items[i];
            if (item.namespace === namespaceUrl)
                return item;
        }
        return null;
    }

}
