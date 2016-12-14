import * as assert from "assert";
import { XmlElement, XmlAttribute, XmlChildElement } from "../lib";
import { XmlObject, XmlCollection } from "../lib";

describe("Stringify", () => {

    context("GetXml/HasChanged", () => {

        it("Simple", () => {
            @XmlElement({
                localName: "test",
                namespaceURI: "http://some.com",
            })
            class Test extends XmlObject {

                @XmlAttribute({ localName: "id", defaultValue: "1" })
                public Id: string;
                @XmlAttribute({ localName: "class", defaultValue: "2", required: true })
                public Class: string;

                @XmlChildElement({ localName: "algorithm", defaultValue: "3" })
                public Algorithm: string;
                @XmlChildElement({ localName: "method", defaultValue: "4", required: true })
                public Method: string;
            }

            let t = new Test();

            assert.equal(t.toString(), "", "initialized class should be empty");

            t.Id = "123";

            assert.equal(t.toString(), `<test id="123" class="2" xmlns="http://some.com"><method>4</method></test>`);
        });

        it("With child element", () => {

            @XmlElement({
                localName: "child",
                namespaceURI: "http://some.com",
            })
            class Child extends XmlObject {
                @XmlAttribute({ localName: "id", defaultValue: "" })
                public Id: string;
            }

            @XmlElement({
                localName: "test",
                namespaceURI: "http://some.com",
            })
            class Test extends XmlObject {

                @XmlChildElement({ parser: Child })
                public Child: Child;
            }

            let t = new Test();

            assert.equal(t.toString(), "", "initialized class should be empty");
            assert.equal(t.HasChanged(), false);

            t.Child.Id = "1";

            assert.equal(t.HasChanged(), true);
            assert.equal(t.toString(), `<test xmlns="http://some.com"><child id="1"/></test>`);
            assert.equal(t.HasChanged(), false);
        });

        it("With child XmlCollection", () => {

            @XmlElement({
                localName: "child",
                namespaceURI: "http://some.com",
            })
            class Child extends XmlObject {
                @XmlAttribute({ localName: "id", defaultValue: "" })
                public Id: string;
            }

            @XmlElement({
                localName: "childs",
                namespaceURI: "http://some.com",
                parser: Child,
            })
            class Childs extends XmlCollection<Child> {
            }

            @XmlElement({
                localName: "test",
                namespaceURI: "http://some.com",
            })
            class Test extends XmlObject {

                @XmlChildElement({ parser: Childs })
                public Childs: Childs;
            }

            let t = new Test();

            assert.equal(t.toString(), "", "initialized class should be empty");

            t.Childs.Add(new Child());

            assert.equal(t.toString(), `<test xmlns="http://some.com"><childs/></test>`);
        });

        it("With child requierd XmlCollection", () => {

            @XmlElement({
                localName: "child",
                namespaceURI: "http://some.com",
            })
            class Child extends XmlObject {
                @XmlAttribute({ localName: "id", defaultValue: "" })
                public Id: string;
            }

            @XmlElement({
                localName: "childs",
                namespaceURI: "http://some.com",
                parser: Child,
            })
            class Childs extends XmlCollection<Child> {
            }

            @XmlElement({
                localName: "test",
                namespaceURI: "http://some.com",
            })
            class Test extends XmlObject {

                @XmlChildElement({ parser: Childs })
                public Childs: Childs;
                @XmlChildElement({ localName: "required", parser: Childs, minOccurs: 1 })
                public Childs2: Childs;
            }

            let t = new Test();

            assert.equal(t.toString(), "");
            // assert.throws(() => t.toString());

            t.Childs.Add(new Child());

            assert.throws(() => t.toString());
            t.Childs2.Add(new Child());
            assert.throws(() => t.toString());
            t.Childs2.Item(0)!.Id = "test";
            assert.equal(t.toString(), `<test xmlns="http://some.com"><childs/><required><child id="test"/></required></test>`);
        });

    });

});