import { createECDH } from "node:crypto";

const ecdh = createECDH("prime256v1");
ecdh.generateKeys();

const base64url = (value) => value.toString("base64url");

console.log(`KIWIKERP_WEB_PUSH_PUBLIC_KEY=${base64url(ecdh.getPublicKey())}`);
console.log(`KIWIKERP_WEB_PUSH_PRIVATE_KEY=${base64url(ecdh.getPrivateKey())}`);
