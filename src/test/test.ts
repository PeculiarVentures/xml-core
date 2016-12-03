import { XmlAttribute, XmlObject } from "../lib/index";
import * as assert from "assert";


class Test extends XmlObject {
    protected name = "test";

    @XmlAttribute()
    public Id?: string;

    @XmlAttribute({ defaultValue: "none" })
    public Attr1?: string;

    @XmlAttribute({ required: true, name: "required" })
    public Required: string;
}

let test = new Test();

assert.equal(test.toString(), `<test/>`);
assert.equal(test.Attr1, "none");
