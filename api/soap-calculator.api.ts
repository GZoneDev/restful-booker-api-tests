// api/SoapCalculatorApi.ts

import { APIRequestContext, APIResponse } from "@playwright/test";

const SOAP_URL = "http://www.dneonline.com/calculator.asmx";
const SOAP_ACTION_BASE = "http://tempuri.org/";

export class SoapCalculatorApi {
  constructor(private request: APIRequestContext) {}

  async execute(
    operation: string,
    intA: number,
    intB: number,
  ): Promise<APIResponse> {
    return this.request.post(SOAP_URL, {
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: `${SOAP_ACTION_BASE}${operation}`,
      },
      data: this.buildEnvelope(operation, intA, intB),
    });
  }

  async executeRaw(
    operation: string,
    xml: string,
  ): Promise<APIResponse> {
    return this.request.post(SOAP_URL, {
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: `${SOAP_ACTION_BASE}${operation}`,
      },
      data: xml,
    });
  }

  extractResult(xml: string, operation: string): number {
    const tag = `${operation}Result`;

    const match = xml.match(
      new RegExp(`<${tag}>(.*?)</${tag}>`)
    );

    if (!match) {
      throw new Error(`Tag ${tag} not found`);
    }

    return Number(match[1]);
  }

  private buildEnvelope(
    operation: string,
    intA: number,
    intB: number,
  ): string {
    return `<?xml version="1.0" encoding="utf-8"?>
            <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xmlns:xsd="http://www.w3.org/2001/XMLSchema"
            xmlns:tns="http://tempuri.org/">
            <soap:Body>
            <tns:${operation}>
            <tns:intA>${intA}</tns:intA>
            <tns:intB>${intB}</tns:intB>
            </tns:${operation}>
            </soap:Body>
            </soap:Envelope>`;
  }
}