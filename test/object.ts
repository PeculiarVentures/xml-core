import * as assert from "assert";
import { XmlAttribute, XmlElement } from "../src";
import { XmlObject } from "../src";

context("XmlObject", () => {

    it("IsEmpty", () => {

        @XmlElement({ localName: "test", namespaceURI: "http://some.com" })
        class Test extends XmlObject {
            @XmlAttribute()
            public Id: string;
        }

        const test = new Test();

        assert.equal(test.IsEmpty(), true);
        test.Id = "1";
        assert.equal(test.IsEmpty(), false);

        const xml = test.toString();
        const test2 = Test.LoadXml(xml);
        assert.equal(test2.IsEmpty(), false);

    });

    context("Get xml Element", () => {
        const xml = `<root id="0"><first id="1"/><second Id="2"/><third ID="3"/><child/><n:child xmlns:n="html://n"/></root>`;
        let obj: Test;

        @XmlElement({
            localName: "root",
        })
        class Test extends XmlObject {
        }
        before(() => {
            obj = Test.LoadXml(xml);
        });

        context("GetElement", () => {
            it("required", () => {
                assert.throws(() => {
                    obj.GetElement("NotExit", true);
                });
            });
            it("success", () => {
                const node = obj.GetElement("third");
                assert.equal(!!node, true);
                assert.equal(node!.nodeName, "third");
            });
            it("element not exist", () => {
                const obj2 = new Test();
                assert.throws(() => {
                    obj2.GetElement("third");
                });
            });
        });
        context("GetChild", () => {
            it("required", () => {
                assert.throws(() => {
                    obj.GetChild("NotExit", true);
                });
            });
            it("success", () => {
                const node = obj.GetChild("third");
                assert.equal(!!node, true);
                assert.equal(node!.nodeName, "third");
            });
            it("element not exist", () => {
                const obj2 = new Test();
                assert.throws(() => {
                    obj2.GetChild("third");
                });
            });
        });
        context("GetChildren", () => {
            it("by name", () => {
                const list = obj.GetChildren("child");
                assert.equal(list.length, 2);
            });
            it("by name and namespace", () => {
                const list = obj.GetChildren("child", "html://n");
                assert.equal(list.length, 1);
            });
            it("element not exist", () => {
                const obj2 = new Test();
                assert.throws(() => {
                    obj2.GetChildren("child");
                });
            });
        });
        context("GetFirstChild", () => {
            it("by name", () => {
                const node = obj.GetFirstChild("child");
                assert.equal(!!node, true);
                assert.equal(node!.localName, "child");
            });
            it("by name and namespace", () => {
                const node = obj.GetFirstChild("child", "html://n");
                assert.equal(!!node, true);
                assert.equal(node!.localName, "child");
                assert.equal(node!.namespaceURI, "html://n");
            });
            it("element not exist", () => {
                const obj2 = new Test();
                assert.throws(() => {
                    obj2.GetFirstChild("child");
                });
            });
        });
        context("GetAttribute", () => {
            it("by name", () => {
                const attr = obj.GetAttribute("id", "2");
                assert.equal(attr, "0");
            });
            it("by default", () => {
                const attr = obj.GetAttribute("test", "3", false);
                assert.equal(attr, "3");
            });
            it("required", () => {
                assert.throws(() => {
                    obj.GetAttribute("test", null, true);
                });
            });
            it("element not exist", () => {
                const obj2 = new Test();
                assert.throws(() => {
                    obj2.GetAttribute("id", "4");
                });
            });
        });
        context("GetElementById", () => {
            it("id", () => {
                const el = obj.GetXml()!;
                const f = XmlObject.GetElementById(el, "1")!;
                assert.equal(f.localName, "first");
            });
            it("Id", () => {
                const el = obj.GetXml()!;
                const f = XmlObject.GetElementById(el, "2")!;
                assert.equal(f.localName, "second");
            });
            it("ID", () => {
                const el = obj.GetXml()!;
                const f = XmlObject.GetElementById(el, "3")!;
                assert.equal(f.localName, "third");
            });
        });
    });

});
