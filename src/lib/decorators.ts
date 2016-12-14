/// <reference path="./types/index.d.ts" />

import * as CONST from "./const";

const MAX = 1e9;

function assign(target: any, ...sources: any[]) {
    let res = arguments[0];
    for (let i = 1; i < arguments.length; i++) {
        let obj = arguments[i];
        for (let prop in obj) {
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
        if (t.target !== t )
            t.items = assign({}, t.items);
        t.target = target;
    };
}

export function XmlChildElement<T>(params: XmlChildElementType<T> = {}) {
    return (target: Object, propertyKey: string | symbol) => {
        const t = target.constructor as XmlSchema;
        const key = propertyKey as string;

        if (!t.items)
            t.items = {};

        if (t.target !== t)
            t.items = assign({}, t.items);
        t.target = target;

        if (params.parser) {
            t.items![key] = {
                parser: params.parser,
                required: params.required || false,
                maxOccurs: params.maxOccurs || MAX,
                minOccurs: params.minOccurs === void 0 ? 0 : params.minOccurs,
                noRoot: params.noRoot || false,
            };
        }
        else {
            t.items![key] = {
                namespaceURI: params.namespaceURI || null,
                required: params.required || false,
                prefix: params.prefix || null,
                defaultValue: params.defaultValue,
                converter: params.converter,
            };
        }
        if (!params.localName)
            params.localName = params.parser ? (params.parser as any).localName : key;
        t.items![key].localName = params.localName;
        t.items![key].type = CONST.ELEMENT;

        defineProperty(target, key, params);
    };
}

export function XmlAttribute<T>(params: XmlAttributeType<T> = { required: false, namespaceURI: null }) {
    return (target: Object, propertyKey: string | symbol) => {
        const t = target.constructor as XmlSchema;
        const key = propertyKey as string;

        if (!params.localName)
            params.localName = propertyKey as string;

        if (!t.items)
            t.items = {};

        if (t.target !== t)
            t.items = assign({}, t.items);
        t.target = target;

        t.items![propertyKey] = params;
        t.items![propertyKey].type = CONST.ATTRIBUTE;

        defineProperty(target, key, params);
    };
};

function defineProperty(target: any, key: string, params: any) {
    const _key = `_${key}`;

    const opt = {
        set: function (v: any) {
            if (this[_key] !== v) {
                this.element = null;
                this[_key] = v;
            }
        },
        get: function () {
            return this[_key];
        }
    };

    let defaultValue = params.defaultValue;
    if (params.parser) {
        defaultValue = new params.parser();
        defaultValue.localName = params.localName;
    }

    // private property
    Object.defineProperty(target, _key, { writable: true, value: defaultValue, enumerable: false });
    // public property
    Object.defineProperty(target, key, opt);
}