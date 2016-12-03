import { XmlAttribute, XmlElement, XmlObject, XmlError, XmlNumberConverter, XmlBase64Converter } from "../lib/index";
import * as assert from "assert";

// const xmldom = require("xmldom-alpha");
// const DOMParser = xmldom.DOMParser;

describe("Decorators", () => {

    context("Element", () => {

        context("GetXml", () => {
            it("simple", () => {
                @XmlElement({ localName: "test" })
                class Test extends XmlObject {
                }

                const test = new Test();

                assert.equal(test.toString(), "<test/>");
            });

            it("namespace", () => {
                @XmlElement({ localName: "test", namespaceUri: "http://some.com" })
                class Test extends XmlObject {
                }

                const test = new Test();

                assert.equal(test.toString(), `<test xmlns="http://some.com"/>`);
            });

            it("prefix with namespace", () => {
                @XmlElement({ localName: "test", prefix: "sm", namespaceUri: "http://some.com" })
                class Test extends XmlObject {
                }

                const test = new Test();

                assert.equal(test.toString(), `<sm:test xmlns:sm="http://some.com"/>`);
            });

            it("prefix without namespace", () => {
                @XmlElement({ localName: "test", prefix: "sm" })
                class Test extends XmlObject {
                }

                const test = new Test();

                assert.equal(test.toString(), `<sm:test xmlns:sm=""/>`);
            });
        });
    });

    context("Attribute", () => {

        context("GetXml", () => {

            @XmlElement({ localName: "test" })
            class Test extends XmlObject {
                protected name = "test";

                @XmlAttribute()
                public Id?: string;

                @XmlAttribute({ name: "num", defaultValue: 0, converter: XmlNumberConverter })
                public ConvertNumber?: number;

                @XmlAttribute({ name: "b64", converter: XmlBase64Converter })
                public ConvertB64?: Uint8Array;

                @XmlAttribute({ defaultValue: "none" })
                public Attr1?: string;

                @XmlAttribute({ required: true, name: "required" })
                public Required: string;
            }

            let test = new Test();

            it("with required empty attribute", () => {
                assert.throws(() => {
                    test.toString();
                }, XmlError);

            });

            it("with filled empty attribute and lower case name", () => {
                test.Required = "some";
                assert.equal(test.toString(), `<test required="some"/>`);
            });

            it("with different default value", () => {
                assert.equal(test.Attr1, "none", "Doesn't have default value for decoration setting");
                test.Attr1 = "wow";
                assert.equal(test.Attr1, "wow");
                assert.equal(test.toString(), `<test Attr1="wow" required="some"/>`);
            });

            it("with default value", () => {
                test.Attr1 = "none";
                assert.equal(test.Attr1, "none");
                assert.equal(test.toString(), `<test required="some"/>`);
            });

            it("with number converter value", () => {
                test.ConvertNumber = 1;
                assert.equal(test.toString(), `<test num="1" required="some"/>`);
            });

            it("with base64 converter value", () => {
                test.ConvertNumber = 0;
                test.ConvertB64 = new Uint8Array([1, 0, 1]);
                assert.equal(test.toString(), `<test b64="AQAB" required="some"/>`);
            });

            it("witd Id", () => {
                test.ConvertB64 = undefined; // remove value
                test.Id = "123";
                assert.equal(test.toString(), `<test Id="123" required="some"/>`);
            });

        });

    });

});