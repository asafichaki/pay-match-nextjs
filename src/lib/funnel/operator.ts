/**
 * Who runs the site. One place, so the footer, the legal pages, the
 * Organization schema and every outgoing email agree with each other and
 * with the name on the affiliate-network applications.
 *
 * Decided 2026-11-10: the operating entity is JoyoAI, LLC (Delaware). The
 * published address is the operating address, never the EIN.
 */
export const OPERATOR_NAME = "JoyoAI, LLC";
export const OPERATOR_STREET = "1100 S Robertson Blvd";
export const OPERATOR_CITY = "Los Angeles";
export const OPERATOR_REGION = "CA";
export const OPERATOR_POSTAL = "90035";
export const OPERATOR_ADDRESS_LINE = `${OPERATOR_STREET}, ${OPERATOR_CITY}, ${OPERATOR_REGION} ${OPERATOR_POSTAL}`;
export const OPERATOR_LINE = `myPayAdvisor is operated by ${OPERATOR_NAME}, ${OPERATOR_ADDRESS_LINE}.`;
