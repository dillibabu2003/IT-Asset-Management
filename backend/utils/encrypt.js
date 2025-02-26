const crypto = require("crypto");

const algorithm = process.env.ENCRYPTION_ALGORITHM;
const key = process.env.ENCRYPTION_KEY;
const iv = process.env.ENCRYPTION_IV;


if (!algorithm || !key || !iv) {
    console.error("Encryption algorithm or key or iv not defined.");
    process.exit(1);
}
if(key.length != 32) {
    console.error("Encryption key should be 32 length");
    process.exit(1);
}
if(iv.length != 16) {
    console.error("Encryption iv should be 16 length");
    process.exit(1);
}

const encryptData = (plainText) => {
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(key,'utf-8'), Buffer.from(iv,'utf-8'));
    let encrypted = cipher.update(plainText);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString("hex")
}
const decryptData = (encryptedText) => {
    let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key,'utf-8'), Buffer.from(iv,'utf-8'));
    let decrypted = decipher.update(Buffer.from(encryptedText, 'hex'));
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
};

// const text="abcd";
// const encrypted=encryptData(text);
// console.log(encrypted);
// console.log(decryptData(encrypted));

module.exports={
    encryptData,decryptData
}