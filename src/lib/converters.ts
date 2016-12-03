import { Convert } from "./convert";

export const XmlBase64Converter: IConverter<Uint8Array> = {
    get: (value: Uint8Array) => {
        if (value)
            return Convert.ToBase64(value);
        return void 0;
    },
    set: (value: string) => {
        return Convert.FromBase64(value);
    }
};

export const XmlNumberConverter: IConverter<number> = {
    get: (value: number) => {
        return value.toString();
    },
    set: (value: string) => {
        return Number(value);
    }
};