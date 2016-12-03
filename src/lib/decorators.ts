/// <reference path="./types/index.d.ts" />

export function XmlElement(params: XmlElementType) {
    return <TFunction extends Function>(target: TFunction) => {
        const t = target as any;

        t.localName = params.localName;
        t.namespaceUri = params.namespaceUri || null;
        t.prefix = params.prefix || null;
    };
}

export function XmlAttribute<T>(params: XmlAttributeType<T> = { required: false, namespaceUri: null }) {
    return (target: Object, propertyKey: string | symbol) => {
        const t = target.constructor as any;

        let value: any = params.defaultValue;
        if (!t.attributes)
            t.attributes = {};
        t.attributes[propertyKey] = params;

        Object.defineProperty(target, propertyKey as string, {
            set: (v: any) => {
                // Add attribute description
                if (!params.name)
                    params.name = propertyKey as string;

                this.element = null;
                value = v;
            },
            get: () => {
                return value;
            }
        });
    };
};
