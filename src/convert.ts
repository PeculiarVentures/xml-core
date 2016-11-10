import { XmlError, XE } from "./error";

declare let unescape: any;
declare let escape: any;

export class Convert {

    static ToString(buffer: BufferSource, enc: XmlBufferEncoding = "utf8") {
        const buf = new Uint8Array(buffer as ArrayBuffer);
        switch (enc.toLowerCase()) {
            case "utf8":
                return this.ToUtf8String(buf);
            case "binary":
                return this.ToBinary(buf);
            case "hex":
                return this.ToHex(buf);
            case "base64":
                return this.ToBase64(buf);
            case "base64url":
                return this.ToBase64Url(buf);
            default:
                throw new XmlError(XE.CONVERTER_UNSUPPORTED);
        }
    }
    static FromString(str: string, enc: XmlBufferEncoding = "utf8"): Uint8Array {
        switch (enc.toLowerCase()) {
            case "utf8":
                return this.FromUtf8String(str);
            case "binary":
                return this.FromBinary(str);
            case "hex":
                return this.FromHex(str);
            case "base64":
                return this.FromBase64(str);
            case "base64url":
                return this.FromBase64Url(str);
            default:
                throw new XmlError(XE.CONVERTER_UNSUPPORTED);
        }
    }

    static ToBase64(buf: Uint8Array): string {
        if (typeof btoa !== "undefined") {
            let binary = this.ToString(buf, "binary");
            return btoa(binary);
        }
        else if (typeof Buffer !== "undefined") {
            return new Buffer(buf).toString("base64");
        }
        else {
            throw new XmlError(XE.CONVERTER_UNSUPPORTED);
        }
    }
    static FromBase64(base64Text: string): Uint8Array {
        // Prepare string
        base64Text = base64Text.replace(/\n/g, "").replace(/\r/g, "").replace(/\t/g, "").replace(/\s/g, "");
        if (typeof atob !== "undefined") {
            return this.FromBinary(atob(base64Text));
        }
        else if (typeof Buffer !== "undefined") {
            return new Buffer(base64Text, "base64");
        }
        else {
            throw new XmlError(XE.CONVERTER_UNSUPPORTED);
        }
    }

    protected static Base64Padding(base64: string): string {
        let padCount = 4 - (base64.length % 4);
        if (padCount < 4)
            for (let i = 0; i < padCount; i++)
                base64 += "=";
        return base64;
    }

    static FromBase64Url(base64url: string): Uint8Array {
        return this.FromBase64(this.Base64Padding(base64url.replace(/\-/g, "+").replace(/\_/g, "/")));
    }

    static ToBase64Url(data: Uint8Array): string {
        return this.ToBase64(data).replace(/\+/g, "-").replace(/\//g, "_").replace(/\=/g, "");
    }

    static FromUtf8String(text: string): Uint8Array {
        let s = unescape(encodeURIComponent(text)),
            uintArray = new Uint8Array(s.length);
        for (let i = 0; i < s.length; i++) {
            uintArray[i] = s.charCodeAt(i);
        }
        return uintArray;
    }
    static ToUtf8String(buffer: Uint8Array): string {
        let encodedString = String.fromCharCode.apply(null, buffer),
            decodedString = decodeURIComponent(escape(encodedString));
        return decodedString;
    }

    static FromBinary(text: string): Uint8Array {
        let stringLength = text.length;
        let resultView = new Uint8Array(stringLength);
        for (let i = 0; i < stringLength; i++)
            resultView[i] = text.charCodeAt(i);
        return resultView;
    }
    static ToBinary(buffer: Uint8Array): string {
        let result_string = "";
        for (let i = 0; i < buffer.length; i++)
            result_string = result_string + String.fromCharCode(buffer[i]);
        return result_string;
    }

    /**
     * Converts buffer to HEX string
     * @param  {BufferSource} buffer Incoming buffer
     * @returns string
     */
    static ToHex(buffer: Uint8Array): string {
        const splitter = "";
        let res: string[] = [];
        for (let i = 0; i < buffer.length; i++) {
            let char = buffer[i].toString(16);
            res.push(char.length === 1 ? "0" + char : char);
        }
        return res.join(splitter);
    }

    /**
     * Converts HEX string to buffer
     * 
     * @static
     * @param {string} hexString
     * @returns {Uint8Array}
     * 
     * @memberOf Convert
     */
    static FromHex(hexString: string): Uint8Array {
        const res = new Uint8Array(hexString.length / 2);
        for (let i = 0; i < hexString.length; i = i + 2) {
            let c = hexString.slice(i, i + 2);
            res[i / 2] = parseInt(c, 16);
        }
        return res;
    }

    /**
     * Converts string to Date
     * 
     * @static
     * @param {string} dateTime
     * @returns {Date}
     * 
     * @memberOf Convert
     */
    static ToDateTime(dateTime: string): Date {
        return new Date(dateTime);
    }

    /**
     * Converts Date to string
     * 
     * @static
     * @param {Date} dateTime
     * @returns {string}
     * 
     * @memberOf Convert
     */
    static FromDateTime(dateTime: Date): string {
        let str = dateTime.toISOString();
        return str;
    }
}