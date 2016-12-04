import { XmlAttribute, XmlElement, XmlChildElement, XmlObject, XmlError, XmlNumberConverter, XmlBase64Converter } from "../lib/index";
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

            context("simple child", () => {

                it("default value", () => {
                    @XmlElement({ localName: "test" })
                    class Test extends XmlObject {
                        @XmlChildElement({ defaultValue: "" })
                        Child: string;
                    }

                    const test = new Test();

                    assert.equal(test.toString(), `<test/>`);
                    test.Child = "Hello";
                    assert.equal(test.toString(), `<test><Child>Hello</Child></test>`);
                });

                it("default value and required", () => {
                    @XmlElement({ localName: "test" })
                    class Test extends XmlObject {
                        @XmlChildElement({ defaultValue: "1", required: true })
                        Child: string;
                    }

                    const test = new Test();

                    assert.equal(test.toString(), `<test><Child>1</Child></test>`);
                });

                it("changed name", () => {
                    @XmlElement({ localName: "test" })
                    class Test extends XmlObject {
                        @XmlChildElement({ localName: "ch", defaultValue: "1" })
                        Child: string;
                    }

                    const test = new Test();

                    assert.equal(test.toString(), `<test/>`);
                    test.Child = "Hello";
                    assert.equal(test.toString(), `<test><ch>Hello</ch></test>`);
                });

                it("namespace", () => {
                    @XmlElement({ localName: "test" })
                    class Test extends XmlObject {
                        @XmlChildElement({ localName: "ch", defaultValue: "1", namespaceUri: "http://some.com" })
                        Child: string;
                    }

                    const test = new Test();

                    assert.equal(test.toString(), `<test/>`);
                    test.Child = "Hello";
                    assert.equal(test.toString(), `<test><ch xmlns="http://some.com">Hello</ch></test>`);
                });

                it("prefix", () => {
                    @XmlElement({ localName: "test" })
                    class Test extends XmlObject {
                        @XmlChildElement({ localName: "ch", defaultValue: "1", namespaceUri: "http://some.com", prefix: "px" })
                        Child: string;
                    }

                    const test = new Test();

                    assert.equal(test.toString(), `<test/>`);
                    test.Child = "Hello";
                    assert.equal(test.toString(), `<test><px:ch xmlns:px="http://some.com">Hello</px:ch></test>`);
                });
            });

            context("Child", () => {

                @XmlElement({ localName: "base" })
                class XmlBase extends XmlObject {
                    @XmlAttribute({ localName: "id", defaultValue: "" })
                    Id: string;
                }

                @XmlElement({ localName: "child1" })
                class Child1 extends XmlBase {
                    @XmlChildElement({ localName: "text", defaultValue: 5, converter: XmlNumberConverter })
                    public Value: number;
                }
                @XmlElement({ localName: "child2", namespaceUri: "http://number.com" })
                class Child2 extends XmlBase {
                    @XmlChildElement({ localName: "text", defaultValue: new Uint8Array([1, 0, 1]), converter: XmlBase64Converter })
                    public Value: Uint8Array;
                }

                @XmlElement({ localName: "root" })
                class Root extends XmlBase {
                    @XmlChildElement({ localName: "name", required: true })
                    public Name: string;

                    @XmlChildElement({ parser: Child1 })
                    public ChildOptional: Child1;
                    @XmlChildElement({ parser: Child2, required: true })
                    public ChildRequired: Child2;
                }

                it("default", () => {
                    let root = new Root();
                    assert.throws(() => root.toString(), XmlError);
                    root.Name = "MyName";

                    root.ChildRequired = new Child2();

                    assert.equal(root.toString(), `<root><name>MyName</name><child2 xmlns="http://number.com"/></root>`);

                    root.ChildOptional = new Child1();
                    root.ChildOptional.Id = "10";
                    root.ChildOptional.Value = 12;
                    root.ChildRequired.Value = new Uint8Array([1, 1, 1]);

                    assert.equal(root.toString(), `<root id="10"><name>MyName</name><child1 id="10"><text>12</text></child1><child2 id="10" xmlns="http://number.com"><text>AQEB</text></child2></root>`);
                });

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

                @XmlAttribute({ localName: "num", defaultValue: 0, converter: XmlNumberConverter })
                public ConvertNumber?: number;

                @XmlAttribute({ localName: "b64", converter: XmlBase64Converter })
                public ConvertB64?: Uint8Array;

                @XmlAttribute({ defaultValue: "none" })
                public Attr1?: string;

                @XmlAttribute({ required: true, localName: "required" })
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