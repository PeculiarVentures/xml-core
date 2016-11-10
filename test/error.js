"use strict";
const XmlError = require("../lib/index").XmlError;
const XE = require("../lib/index").XE;
const assert = require("assert");

describe("Error", () => {

    it("Throw error", () => {
        assert.throws(() => {
            throw new XmlError(XE.NONE)
        })
    });

    it("Error params", () => {
        let error = new XmlError(XE.NULL_REFERENCE);
        assert.equal(error.code, 1);
        assert.equal(error.name, "XmlError");
        assert.equal(error.message, "XMLJS0001: Null reference");
    });

    it("Error template", () => {
        let error = new XmlError(XE.NULL_PARAM, "Object", "name");
        assert.equal(error.code, 2);
        assert.equal(error.name, "XmlError");
        assert.equal(error.message, "XMLJS0002: 'Object' has empty 'name' object");
    });

});