import * as assert from "assert";
import { XmlElement, XmlAttribute } from "../";
import { XmlObject } from "../";

context("XmlObject", () => {


    it("IsEmpty", () => {

        @XmlElement({ localName: "test", namespaceURI: "http://some.com" })
        class Test extends XmlObject {
            @XmlAttribute()
            Id: string;
        }

        let test = new Test();

        assert.equal(test.IsEmpty(), true);
        test.Id = "1";
        assert.equal(test.IsEmpty(), false);

        let xml = test.toString();
        let test2 = Test.LoadXml(xml);
        assert.equal(test2.IsEmpty(), false);

    });

});