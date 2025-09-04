import CryptoJS from 'crypto-js';

let masterKey: string | null = null;

export const setMasterKey = (key: string) => {
  masterKey = key;
};

export const getMasterKey = (): string | null => {
  return masterKey;
};

export const clearMasterKey = () => {
  masterKey = null;
};

export const encryptData = (data: string, key: string): string => {
  return CryptoJS.AES.encrypt(data, key).toString();
};

export const decryptData = (encryptedData: string, key: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export const hashMasterKey = (key: string): string => {
  return CryptoJS.SHA256(key).toString();
};