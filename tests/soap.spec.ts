import { test, expect } from '../lib/base-test';


test.describe("SOAP Calculator API", () => {
  test("S-01 | Add → 10 + 5 = 15", async ({ soapApi }) => {
    const res = await soapApi.execute("Add", 10, 5);

    expect(res.status()).toBe(200);

    const xml = await res.text();

    expect(xml).toContain("AddResponse");
    expect(xml).toContain("AddResult");

    expect(
      soapApi.extractResult(xml, "Add")
    ).toBe(15);
  });

  test("S-02 | Subtract → 20 - 8 = 12", async ({ soapApi }) => {
    const res = await soapApi.execute(
      "Subtract",
      20,
      8
    );

    expect(res.status()).toBe(200);

    const xml = await res.text();

    expect(xml).toContain("SubtractResult");

    expect(
      soapApi.extractResult(xml, "Subtract")
    ).toBe(12);
  });

  test("S-03 | Multiply → 7 × 6 = 42", async ({ soapApi }) => {
    const res = await soapApi.execute(
      "Multiply",
      7,
      6
    );

    expect(res.status()).toBe(200);

    const xml = await res.text();

    expect(xml).toContain("MultiplyResult");

    expect(
      soapApi.extractResult(xml, "Multiply")
    ).toBe(42);
  });

  test("S-04 | Divide → 100 ÷ 4 = 25", async ({ soapApi }) => {
    const res = await soapApi.execute(
      "Divide",
      100,
      4
    );

    expect(res.status()).toBe(200);

    const xml = await res.text();

    expect(xml).toContain("DivideResult");

    expect(
      soapApi.extractResult(xml, "Divide")
    ).toBe(25);
  });

  test("S-05 | Invalid SOAP request", async ({ soapApi }) => {
    const malformed = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <tns:Add>
      <tns:intA>NOT_A_NUMBER</tns:intA>
      <tns:intB>5</tns:intB>
    </tns:Add>
  </soap:Body>
</soap:Envelope>`;

    const res = await soapApi.executeRaw(
      "Add",
      malformed
    );

    const xml = await res.text();

    const isSoapFault =
      xml.includes("soap:Fault") ||
      xml.includes("Fault");

    const isErrorStatus =
      res.status() === 400 ||
      res.status() === 500;

    expect(
      isSoapFault || isErrorStatus
    ).toBeTruthy();
  });
});