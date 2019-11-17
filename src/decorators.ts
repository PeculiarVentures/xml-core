import * as CONST from "./const";
import { XmlAttributeType, XmlChildElementType, XmlContentType, XmlElementType, XmlSchema } from "./types";

const MAX = 1e9;

function assign(target: any, ...sources: any[]) {
    const res = arguments[0];
    for (let i = 1; i < arguments.length; i++) {
        const obj = arguments[i];
        for (const prop in obj) {
            if (!obj.hasOwnProperty(prop)) {
                continue;
            }
            res[prop] = obj[prop];
        }
    }
    return res;
}

export function XmlElement(params: XmlElementType) {
    return <TFunction extends Function>(target: TFunction) => {
        const t = target as XmlSchema;

        t.localName = params.localName || (t as any).name;
        t.namespaceURI = params.namespaceURI || t.namespaceURI || null;
        t.prefix = params.prefix || t.prefix || null;
        t.parser = params.parser || t.parser;
        if (t.target !== t) {
            t.items = assign({}, t.items);
        }
        t.target = target;
    };
}

export function XmlChildElement<T>(params: XmlChildElementType<T> = {}) {
    return (target: Object, propertyKey: string | symbol) => {
        const t = target.constructor as XmlSchema;
        const key = propertyKey as string;

        if (!t.items) {
            t.items = {};
        }

        if (t.target !== t) {
            t.items = assign({}, t.items);
        }
        t.target = target;

        if (params.parser) {
            t.items![key] = {
                parser: params.parser,
                required: params.required || false,
                maxOccurs: params.maxOccurs || MAX,
                minOccurs: params.minOccurs === void 0 ? 0 : params.minOccurs,
                noRoot: params.noRoot || false,
            };
        } else {
            t.items![key] = {
                namespaceURI: params.namespaceURI || null,
                required: params.required || false,
                prefix: params.prefix || null,
                defaultValue: params.defaultValue,
                converter: params.converter,
            };
        }
        params.localName = params.localName || (params.parser && (params.parser as any).localName) || key;
        t.items![key].namespaceURI = params.namespaceURI || (params.parser && (params.parser as any).namespaceURI) || null;
        t.items![key].prefix = params.prefix || (params.parser && (params.parser as any).prefix) || null;
        t.items![key].localName = params.localName;
        t.items![key].type = CONST.ELEMENT;

        defineProperty(target, key, params);
    };
}

export function XmlAttribute<T>(params: XmlAttributeType<T> = { required: false, namespaceURI: null }) {
    return (target: Object, propertyKey: string) => {
        const t = target.constructor as XmlSchema;
        const key = propertyKey as string;

        if (!params.localName) {
            params.localName = propertyKey as string;
        }

        if (!t.items) {
            t.items = {};
        }

        if (t.target !== t) {
            t.items = assign({}, t.items);
        }
        t.target = target;

        t.items![propertyKey] = params;
        t.items![propertyKey].type = CONST.ATTRIBUTE;

        defineProperty(target, key, params);
    };
}

export function XmlContent<T>(params: XmlContentType<T> = { required: false }) {
    return (target: Object, propertyKey: string) => {
        const t = target.constructor as XmlSchema;
        const key = propertyKey as string;

        if (!t.items) {
            t.items = {};
        }

        if (t.target !== t) {
            t.items = assign({}, t.items);
        }
        t.target = target;

        t.items![propertyKey] = params;
        t.items![propertyKey].type = CONST.CONTENT;

        defineProperty(target, key, params);
    };
}

function defineProperty(target: any, key: string, params: any) {
    const key2 = `_${key}`;

    const opt = {
        set: function (this: any, v: any) {
            if (this[key2] !== v) {
                this.element = null;
                this[key2] = v;
            }
        },
        get: function (this: any) {
            if (this[key2] === void 0) {
                let defaultValue = params.defaultValue;
                if (params.parser) {
                    defaultValue = new params.parser();
                    defaultValue.localName = params.localName;
                }
                this[key2] = defaultValue;
            }
            return this[key2];
        },
    };

    // private property
    Object.defineProperty(target, key2, { writable: true, enumerable: false });
    // public property
    Object.defineProperty(target, key, opt);
}
