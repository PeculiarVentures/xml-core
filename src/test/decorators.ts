import { XmlAttribute, XmlElement, XmlChildElement, XmlObject, XmlCollection, XmlNumberConverter, XmlBase64Converter } from "../lib/index";
import * as assert from "assert";

// const xmldom = require("xmldom-alpha");
// const DOMParser = xmldom.DOMParser;

describe("Decorators", () => {

    it("malformed", () => {

        @XmlElement({ localName: "test" })
        class XmlTest extends XmlObject {
        }

        const doc = XmlObject.Parse(`<wronName/>`);

        let test = new XmlTest();
        assert.throws(() => {
            test.LoadXml(doc.documentElement);
        });
    });

    context("Element", () => {

        context("GetXml", () => {

            it("simple", () => {
                // Need some changes for changing element to null, otherwise empty answer 
                @XmlElement({ localName: "test" })
                class Test extends XmlObject {

                    @XmlAttribute({ localName: "id" })
                    Id: string;

                }

                const test = new Test();

                assert.equal(test.toString(), "");

                test.Id = "123";
                assert.equal(test.toString(), `<test id="123"/>`);
            });

            it("namespace", () => {
                @XmlElement({ localName: "test", namespaceURI: "http://some.com" })
                class Test extends XmlObject {
                    @XmlAttribute({ localName: "id", defaultValue: "1" })
                    Id: string = "test";
                }

                const test = new Test();

                assert.equal(test.toString(), `<test id="test" xmlns="http://some.com"/>`);
                test.Id = "1";
                assert.equal(test.toString(), `<test xmlns="http://some.com"/>`);
            });

            it("prefix with namespace", () => {
                @XmlElement({ localName: "test", prefix: "sm", namespaceURI: "http://some.com" })
                class Test extends XmlObject {
                    @XmlAttribute({ localName: "id" })
                    Id: string = "test";
                }

                const test = new Test();

                assert.equal(test.toString(), `<sm:test id="test" xmlns:sm="http://some.com"/>`);
            });

            it("prefix without namespace", () => {
                @XmlElement({ localName: "test", prefix: "sm" })
                class Test extends XmlObject {
                    @XmlAttribute({ localName: "id", defaultValue: "" })
                    Id: string = "test";
                }

                const test = new Test();

                test.Id = "";
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

                    test.Child = "Hello";
                    assert.equal(test.toString(), `<test><Child>Hello</Child></test>`);
                });

                it("default value and required", () => {
                    @XmlElement({ localName: "test" })
                    class Test extends XmlObject {
                        @XmlChildElement({ required: true })
                        Child: string = "1";
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

                    test.Child = "Hello";
                    assert.equal(test.toString(), `<test><ch>Hello</ch></test>`);
                });

                it("namespace", () => {
                    @XmlElement({ localName: "test" })
                    class Test extends XmlObject {
                        @XmlChildElement({ localName: "ch", defaultValue: "1", namespaceURI: "http://some.com" })
                        Child: string;
                    }

                    const test = new Test();

                    test.Child = "Hello";
                    assert.equal(test.toString(), `<test><ch xmlns="http://some.com">Hello</ch></test>`);
                });

                it("prefix", () => {
                    @XmlElement({ localName: "test" })
                    class Test extends XmlObject {
                        @XmlChildElement({ localName: "ch", defaultValue: "1", namespaceURI: "http://some.com", prefix: "px" })
                        Child: string;
                    }

                    const test = new Test();

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
                @XmlElement({ localName: "child2", namespaceURI: "http://number.com" })
                class Child2 extends XmlBase {
                    @XmlChildElement({ localName: "text", defaultValue: new Uint8Array([1, 0, 1]), converter: XmlBase64Converter, required: true })
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
                    root.Name = "MyName";

                    root.ChildRequired = new Child2();

                    assert.equal(root.toString(), `<root><name>MyName</name><child1/><child2 xmlns="http://number.com"><text>AQAB</text></child2></root>`);

                    root.ChildOptional = new Child1();
                    root.ChildOptional.Id = "10";
                    root.ChildOptional.Value = 12;
                    root.ChildRequired.Value = new Uint8Array([1, 1, 1]);

                    assert.equal(root.toString(), `<root><name>MyName</name><child1 id="10"><text>12</text></child1><child2 xmlns="http://number.com"><text>AQEB</text></child2></root>`);
                });

            });
        });

        context("LoadXml", () => {

            context("simple", () => {

                it("value", () => {

                    @XmlElement({ localName: "test" })
                    class XmlTest extends XmlObject {

                        @XmlChildElement({ localName: "value", defaultValue: "" })
                        public Value: string;

                    }

                    const doc = XmlObject.Parse(`<test><value>123</value></test>`);

                    let test = new XmlTest();
                    test.LoadXml(doc.documentElement);

                    assert.equal(test.Value, "123");

                });

                it("required with error", () => {

                    @XmlElement({ localName: "test" })
                    class XmlTest extends XmlObject {

                        @XmlChildElement({ localName: "value", defaultValue: "", required: true })
                        public Value: string;

                    }

                    const doc = XmlObject.Parse(`<test/>`);

                    let test = new XmlTest();

                    assert.throws(() => {
                        test.LoadXml(doc.documentElement);
                    });

                });

                it("required", () => {

                    @XmlElement({ localName: "test" })
                    class XmlTest extends XmlObject {

                        @XmlChildElement({ localName: "value", defaultValue: "", required: true })
                        public Value: string;

                    }

                    const doc = XmlObject.Parse(`<test><value>123</value></test>`);

                    let test = new XmlTest();
                    test.LoadXml(doc.documentElement);

                    assert.equal(test.Value, "123");

                });

                it("converter", () => {

                    @XmlElement({ localName: "test" })
                    class XmlTest extends XmlObject {

                        @XmlChildElement({ localName: "value", defaultValue: null, converter: XmlBase64Converter })
                        public Value: Uint8Array | null;

                    }

                    const doc = XmlObject.Parse(`<test><value>AQAB</value></test>`);

                    let test = new XmlTest();
                    test.LoadXml(doc.documentElement);

                    assert.equal(test.Value instanceof Uint8Array, true);
                    assert.equal(test.Value!.length, 3);

                });

                it("namespace", () => {

                    @XmlElement({ localName: "test" })
                    class XmlTest extends XmlObject {

                        @XmlChildElement({ localName: "value", defaultValue: "", namespaceURI: "http://some.com" })
                        public Value: string;

                    }

                    const doc = XmlObject.Parse(`<test xmlns:p="http://some.com"><p:value>Text</p:value></test>`);

                    let test = new XmlTest();
                    test.LoadXml(doc.documentElement);

                    assert.equal(test.Value, "Text");
                });

            });

            context("child", () => {

                it("simple", () => {
                    @XmlElement({ localName: "value" })
                    class XmlChild extends XmlObject {

                        @XmlAttribute({ localName: "id", defaultValue: "" })
                        public Id: string;

                    }

                    @XmlElement({ localName: "test" })
                    class XmlTest extends XmlObject {

                        @XmlChildElement({ required: true, parser: XmlChild })
                        public Value: XmlChild;

                    }

                    const doc = XmlObject.Parse(`<test><value id="123"/></test>`);

                    let test = new XmlTest();
                    test.LoadXml(doc.documentElement);

                    assert.equal(test.Value.Id, "123");
                });

                it("required", () => {
                    @XmlElement({ localName: "value" })
                    class XmlChild extends XmlObject {

                        @XmlAttribute({ localName: "id", defaultValue: "" })
                        public Id: string;

                    }

                    @XmlElement({ localName: "test" })
                    class XmlTest extends XmlObject {

                        @XmlChildElement({ required: true, parser: XmlChild })
                        public Value: XmlChild;

                    }

                    const doc = XmlObject.Parse(`<test></test>`);

                    let test = new XmlTest();
                    assert.throws(() => {
                        test.LoadXml(doc.documentElement);
                    });

                });

                it("namespace", () => {
                    @XmlElement({ localName: "value", namespaceURI: "http://some.com" })
                    class XmlChild extends XmlObject {

                        @XmlAttribute({ localName: "id", defaultValue: "" })
                        public Id: string;

                    }

                    @XmlElement({ localName: "test" })
                    class XmlTest extends XmlObject {

                        @XmlChildElement({ required: true, parser: XmlChild })
                        public Value: XmlChild;

                    }

                    const doc = XmlObject.Parse(`<test xmlns:p="http://some.com"><p:value id="123"/></test>`);

                    let test = new XmlTest();
                    test.LoadXml(doc.documentElement);

                    assert.equal(test.Value.Id, "123");
                    assert.equal(test.Value.Prefix, "p");
                    assert.equal(test.Value.NamespaceURI, "http://some.com");

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

                assert.equal(test.toString(), "");

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

        context("LoadXml", () => {

            it("simple", () => {

                @XmlElement({ localName: "test" })
                class XmlTest extends XmlObject {

                    @XmlAttribute({ localName: "id", defaultValue: "" })
                    public Id: string;

                }

                const doc = XmlObject.Parse(`<test id="123"/>`);

                let test = new XmlTest();
                test.LoadXml(doc.documentElement);

                assert.equal(test.Id, "123");

            });

            it("required with error", () => {

                @XmlElement({ localName: "test" })
                class XmlTest extends XmlObject {

                    @XmlAttribute({ localName: "id", required: true })
                    public Id: string;

                }

                const doc = XmlObject.Parse(`<test/>`);

                let test = new XmlTest();

                assert.throws(() => {
                    test.LoadXml(doc.documentElement);
                });

            });

            it("required", () => {

                @XmlElement({ localName: "test" })
                class XmlTest extends XmlObject {

                    @XmlAttribute({ localName: "id", required: true })
                    public Id: string;

                }

                const doc = XmlObject.Parse(`<test id="123"/>`);

                let test = new XmlTest();
                test.LoadXml(doc.documentElement);

                assert.equal(test.Id, "123");
            });

            it("namespace", () => {

                @XmlElement({ localName: "test" })
                class XmlTest extends XmlObject {

                    @XmlAttribute({ localName: "id", defaultValue: "", required: true, namespaceURI: "http://some.com" })
                    public Id: string;

                }

                {
                    // correct
                    const doc = XmlObject.Parse(`<test xmlns:s="http://some.com" s:id="123"/>`);

                    let test = new XmlTest();
                    test.LoadXml(doc.documentElement);

                    assert.equal(test.Id, "123");
                }

                {
                    // error
                    const doc = XmlObject.Parse(`<test xmlns:s="http://other.com" s:id="123"/>`);

                    let test = new XmlTest();
                    assert.throws(() => {
                        test.LoadXml(doc.documentElement);
                    });
                }
            });

            it("converter", () => {

                @XmlElement({ localName: "test" })
                class XmlTest extends XmlObject {

                    @XmlAttribute({ localName: "value", defaultValue: null, converter: XmlBase64Converter })
                    public Value: Uint8Array | null;

                }

                const doc = XmlObject.Parse(`<test value="AQAB"/>`);

                let test = new XmlTest();
                test.LoadXml(doc.documentElement);

                assert.equal(test.Value instanceof Uint8Array, true);
                assert.equal(test.Value!.length, 3);
            });

        });

    });

    context("Collection", () => {

        context("GetXml", () => {

            it("simple", () => {

                @XmlElement({ localName: "transform" })
                class XmlTransform extends XmlObject {
                    @XmlChildElement({ defaultValue: "" })
                    public Value: string;
                }

                @XmlElement({ localName: "transforms", parser: XmlTransform })
                class XmlTransforms extends XmlCollection<XmlTransform> {

                }

                @XmlElement({ localName: "test" })
                class XmlTest extends XmlObject {
                    @XmlChildElement({ minOccurs: 1, parser: XmlTransforms })
                    Transforms: XmlTransforms;
                }

                let test = new XmlTest();

                test.Transforms = new XmlTransforms();
                let t = new XmlTransform();
                t.Value = "Hello";
                test.Transforms.Add(t);

                assert.equal(test.toString(), `<test><transforms><transform><Value>Hello</Value></transform></transforms></test>`);

            });

            it("no root", () => {

                @XmlElement({ localName: "transform" })
                class XmlTransform extends XmlObject {
                    @XmlChildElement({ defaultValue: "" })
                    public Value: string;
                }

                @XmlElement({ localName: "transforms", parser: XmlTransform })
                class XmlTransforms extends XmlCollection<XmlTransform> {

                }

                @XmlElement({ localName: "test" })
                class XmlTest extends XmlObject {
                    @XmlChildElement({ minOccurs: 1, parser: XmlTransforms, noRoot: true })
                    Transforms: XmlTransforms;
                }

                let test = new XmlTest();

                test.Transforms = new XmlTransforms();
                let t = new XmlTransform();
                t.Value = "Hello";
                test.Transforms.Add(t);

                assert.equal(test.toString(), `<test><transform><Value>Hello</Value></transform></test>`);

            });

            it("no root occurs", () => {

                @XmlElement({ localName: "transform" })
                class XmlTransform extends XmlObject {
                    @XmlChildElement({ defaultValue: "" })
                    public Value: string;
                    constructor(value?: string) {
                        super();
                        if (value)
                            this.Value = value;
                    }
                }

                @XmlElement({ localName: "transforms", parser: XmlTransform })
                class XmlTransforms extends XmlCollection<XmlTransform> {
                }

                @XmlElement({ localName: "test" })
                class XmlTest extends XmlObject {
                    @XmlChildElement({ minOccurs: 1, maxOccurs: 4, parser: XmlTransforms, noRoot: true })
                    Transforms: XmlTransforms;
                }

                let test = new XmlTest();

                test.Transforms = new XmlTransforms();

                assert.throws(() => {
                    test.toString();
                });

                test.Transforms.Add(new XmlTransform("1"));
                test.Transforms.Add(new XmlTransform("2"));
                test.Transforms.Add(new XmlTransform("3"));
                test.Transforms.Add(new XmlTransform("4"));
                assert.equal(test.toString(), `<test><transform><Value>1</Value></transform><transform><Value>2</Value></transform><transform><Value>3</Value></transform><transform><Value>4</Value></transform></test>`);

                test.Transforms.Add(new XmlTransform("4"));
                assert.throws(() => {
                    test.toString();
                });
            });

            it("occurs", () => {

                @XmlElement({ localName: "transform" })
                class XmlTransform extends XmlObject {
                    @XmlChildElement({ defaultValue: "" })
                    public Value: string;
                    constructor(value?: string) {
                        super();
                        if (value)
                            this.Value = value;
                    }
                }

                @XmlElement({ localName: "transforms", parser: XmlTransform })
                class XmlTransforms extends XmlCollection<XmlTransform> {
                }

                @XmlElement({ localName: "test" })
                class XmlTest extends XmlObject {
                    @XmlChildElement({ minOccurs: 1, maxOccurs: 4, parser: XmlTransforms })
                    Transforms: XmlTransforms;
                }

                let test = new XmlTest();

                test.Transforms = new XmlTransforms();

                assert.throws(() => {
                    test.toString();
                });

                test.Transforms.Add(new XmlTransform("1"));
                test.Transforms.Add(new XmlTransform("2"));
                test.Transforms.Add(new XmlTransform("3"));
                test.Transforms.Add(new XmlTransform("4"));
                assert.equal(test.toString(), `<test><transforms><transform><Value>1</Value></transform><transform><Value>2</Value></transform><transform><Value>3</Value></transform><transform><Value>4</Value></transform></transforms></test>`);

                test.Transforms.Add(new XmlTransform("4"));
                assert.throws(() => {
                    test.toString();
                });
            });

        });

        context("LoadXml", () => {

            it("simple", () => {

                @XmlElement({ localName: "transform" })
                class XmlTransform extends XmlObject {
                    @XmlChildElement({ defaultValue: "" })
                    public Value: string;
                }

                @XmlElement({ localName: "transforms", parser: XmlTransform })
                class XmlTransforms extends XmlCollection<XmlTransform> {

                }

                @XmlElement({ localName: "test" })
                class XmlTest extends XmlObject {
                    @XmlChildElement({ minOccurs: 1, parser: XmlTransforms })
                    Transforms: XmlTransforms;
                }

                let doc = XmlObject.Parse("<test><transforms><transform><Value>Hello</Value></transform></transforms></test>");
                let test = new XmlTest();
                test.LoadXml(doc.documentElement);

                assert.equal(test.Transforms.Count, 1);
                assert.equal(test.Transforms.Item(0) !.Value, "Hello");

            });

            it("no root", () => {

                @XmlElement({ localName: "transform" })
                class XmlTransform extends XmlObject {
                    @XmlChildElement({ defaultValue: "" })
                    public Value: string;
                }

                @XmlElement({ localName: "transforms", parser: XmlTransform })
                class XmlTransforms extends XmlCollection<XmlTransform> {

                }

                @XmlElement({ localName: "test" })
                class XmlTest extends XmlObject {
                    @XmlChildElement({ minOccurs: 1, parser: XmlTransforms, noRoot: true })
                    Transforms: XmlTransforms;
                }

                let doc = XmlObject.Parse("<test><transform><Value>Hello</Value></transform></test>");
                let test = new XmlTest();
                test.LoadXml(doc.documentElement);

                assert.equal(test.Transforms.Count, 1);
                assert.equal(test.Transforms.Item(0) !.Value, "Hello");

            });

            it("wrong min occurs", () => {

                @XmlElement({ localName: "transform" })
                class XmlTransform extends XmlObject {
                    @XmlChildElement({ defaultValue: "" })
                    public Value: string;
                }

                @XmlElement({ localName: "transforms", parser: XmlTransform })
                class XmlTransforms extends XmlCollection<XmlTransform> {

                }

                @XmlElement({ localName: "test" })
                class XmlTest extends XmlObject {
                    @XmlChildElement({ minOccurs: 2, parser: XmlTransforms, noRoot: true })
                    Transforms: XmlTransforms;
                }

                let doc = XmlObject.Parse("<test><transform><Value>Hello</Value></transform></test>");
                let test = new XmlTest();

                assert.throws(() => {
                    test.LoadXml(doc.documentElement);
                });

            });
            it("wrong max occurs", () => {

                @XmlElement({ localName: "transform" })
                class XmlTransform extends XmlObject {
                    @XmlChildElement({ defaultValue: "" })
                    public Value: string;
                }

                @XmlElement({ localName: "transforms", parser: XmlTransform })
                class XmlTransforms extends XmlCollection<XmlTransform> {

                }

                @XmlElement({ localName: "test" })
                class XmlTest extends XmlObject {
                    @XmlChildElement({ maxOccurs: 1, parser: XmlTransforms, noRoot: true })
                    Transforms: XmlTransforms;
                }

                let doc = XmlObject.Parse("<test><transform><Value>Hello</Value></transform><transform><Value>Hello</Value></transform></test>");
                let test = new XmlTest();

                assert.throws(() => {
                    test.LoadXml(doc.documentElement);
                });

            });

        });

    });

    it("extends", () => {

        @XmlElement({
            localName: "first",
            namespaceURI: "http://some.com",
            prefix: "p",
        })
        class XmlFirst extends XmlObject {

            @XmlAttribute()
            public Id: string;

        }

        @XmlElement({
            localName: "second",
        })
        class XmlSecond extends XmlFirst {
        }

        let first = new XmlFirst();
        first.Id = "1";
        assert.equal(first.toString(), `<p:first Id="1" xmlns:p="http://some.com"/>`);

        let second = new XmlSecond();
        second.Id = "2";
        assert.equal(second.toString(), `<p:second Id="2" xmlns:p="http://some.com"/>`);
        assert.equal((XmlFirst as any).prefix, (XmlSecond as any).prefix);
        assert.equal((XmlFirst as any).namespaceURI, (XmlSecond as any).namespaceURI);

    });

});