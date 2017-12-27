import * as assert from "assert";
import { assign, Parse, SelectSingleNode, SelectNamespaces } from "../";

context("utils", () => {

    it("assign", () => {
        const obj = assign({}, { prop1: 1 }, { prop2: 2 }, { prop3: 3 }, { prop3: 4 });

        assert.equal(obj.prop1, 1);
        assert.equal(obj.prop2, 2);
        assert.equal(obj.prop3, 4);
    });

    context("SelectSingleNode", () => {
        it("Empty", () => {
            const xml = Parse("<root><child/><child/><child/></root>");
            const node = SelectSingleNode(xml, ".//second");
            assert.equal(node === null, true);
        });
        it("First element", () => {
            const xml = Parse(`<root><child attr="1"/><child attr="2"/><child attr="3"/></root>`);
            const node = SelectSingleNode(xml, ".//child");
            assert.equal(!!node, true);
            assert.equal(node!.attributes.length, 1);
            assert.equal(node!.attributes[0].value, "1");
        });
    });

    it("SelectNamespaces", () => {
        const xml = Parse(`<root xmlns="html://namespace1"><n1:child xmlns:n1="html://namespace2"/><n2:child xmlns:n2="html://namespace3"/></root>`);
        const namespaces = SelectNamespaces(xml.documentElement);
        assert.equal(Object.keys(namespaces).length, 3);
        assert.equal(namespaces[""], "html://namespace1");
        assert.equal(namespaces.n1, "html://namespace2");
        assert.equal(namespaces.n2, "html://namespace3");
    });

});
