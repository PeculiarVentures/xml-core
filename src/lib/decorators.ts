/// <reference path="./types/index.d.ts" />

export function XmlChildElement<T>(params: XmlChildElementType<T> = {}) {
    return (target: Object, propertyKey: string | symbol) => {
        const t = target.constructor as any;

        if (!t.elements)
            t.elements = {};
        t.elements[propertyKey] = params;

        const keyName = propertyKey as string;
        let value: any;
        if (params.parser) {
            t.elements[keyName] = {
                parser: params.parser,
                required: params.required || false,
            };
        }
        else {
            if (!params.localName)
                params.localName = keyName;

            t.elements[keyName] = {
                localName: params.localName,
                namespaceURI: params.namespaceURI || null,
                required: params.required || false,
                prefix: params.prefix || null,
                defaultValue: params.defaultValue,
                converter: params.converter,
            };
            value = params.defaultValue;
        }


        Object.defineProperty(target, keyName, {
            set: function (v: any) {
                this.element = null;
                value = v;
            },
            get: function () {
                return value;
            }
        });
    };
}

export function XmlElement(params: XmlElementType) {
    return <TFunction extends Function>(target: TFunction) => {
        const t = target as any;

        t.localName = params.localName;
        t.namespaceURI = params.namespaceURI || null;
        t.prefix = params.prefix || null;
    };
}

export function XmlAttribute<T>(params: XmlAttributeType<T> = { required: false, namespaceURI: null }) {
    return (target: Object, propertyKey: string | symbol) => {
        const t = target.constructor as any;

        if (!params.localName)
            params.localName = propertyKey as string;

        let value: any = params.defaultValue;
        if (!t.attributes)
            t.attributes = {};
        t.attributes[propertyKey] = params;

        Object.defineProperty(target, propertyKey as string, {
            set: function (v: any) {
                this.element = null;
                value = v;
            },
            get: function () {
                return value;
            }
        });
    };
};
