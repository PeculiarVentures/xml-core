import { XmlAttribute, XmlElement, XmlObject } from "../lib/index";
import { XmlNumberConverter, XmlBase64Converter, XmlBooleanConverter } from "../lib/index";
import * as assert from "assert";

// const xmldom = require("xmldom-alpha");
// const DOMParser = xmldom.DOMParser;

describe("Decorators", () => {

    it("Number", () => {

        @XmlElement({ localName: "test" })
        class XmlTest extends XmlObject {

            @XmlAttribute({ converter: XmlNumberConverter })
            Value: number;

        }

        let test = new XmlTest();
        test.Value = 15;
        let xmlTest = test.toString();
        let xml = `<test Value="15"/>`;
        assert.equal(xmlTest, xml);

        let test2 = XmlTest.LoadXml(xml);
        assert.equal(test2.Value, 15);
    });

    it("Base64", () => {

        @XmlElement({ localName: "test" })
        class XmlTest extends XmlObject {

            @XmlAttribute({ converter: XmlBase64Converter })
            Value: Uint8Array;

        }

        let test = new XmlTest();
        test.Value = new Uint8Array([1, 0, 1]);
        let xmlTest = test.toString();
        let xml = `<test Value="AQAB"/>`;
        assert.equal(xmlTest, xml);

        let test2 = XmlTest.LoadXml(xml);
        assert.equal(test2.Value.length, 3);
        assert.equal(test2.Value[0], 1);
        assert.equal(test2.Value[1], 0);
        assert.equal(test2.Value[2], 1);
    });

    it("Boolean", () => {

        @XmlElement({ localName: "test" })
        class XmlTest extends XmlObject {

            @XmlAttribute({ converter: XmlBooleanConverter })
            ValueTrue: boolean;

            @XmlAttribute({ converter: XmlBooleanConverter })
            ValueFalse: boolean;

        }

        let test = new XmlTest();
        test.ValueTrue = true;
        test.ValueFalse = false;
        let xmlTest = test.toString();
        let xml = `<test ValueTrue="true" ValueFalse="false"/>`;
        assert.equal(xmlTest, xml);

        let test2 = XmlTest.LoadXml(xml);
        assert.equal(test2.ValueTrue, true);
        assert.equal(test2.ValueFalse, false);
    });
});