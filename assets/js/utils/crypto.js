// crypto.js - Funções de criptografia para dados sensíveis

const CryptoUtils = {
    // Chave base (em produção, deve vir de variável de ambiente)
    secretKey: 'elearning-secret-key-change-in-production',
    
    // Encode para Base64
    encodeBase64(str) {
        try {
            return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
                return String.fromCharCode('0x' + p1);
            }));
        } catch (error) {
            console.error('Base64 encode error:', error);
            return null;
        }
    },
    
    // Decode de Base64
    decodeBase64(str) {
        try {
            return decodeURIComponent(atob(str).split('').map((c) => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
        } catch (error) {
            console.error('Base64 decode error:', error);
            return null;
        }
    },
    
    // Simple XOR encryption (para dados não críticos)
    encrypt(text) {
        try {
            if (!text) return null;
            
            let result = '';
            for (let i = 0; i < text.length; i++) {
                const charCode = text.charCodeAt(i) ^ this.secretKey.charCodeAt(i % this.secretKey.length);
                result += String.fromCharCode(charCode);
            }
            
            return this.encodeBase64(result);
        } catch (error) {
            console.error('Encryption error:', error);
            return null;
        }
    },
    
    // Simple XOR decryption
    decrypt(encryptedText) {
        try {
            if (!encryptedText) return null;
            
            const decoded = this.decodeBase64(encryptedText);
            if (!decoded) return null;
            
            let result = '';
            for (let i = 0; i < decoded.length; i++) {
                const charCode = decoded.charCodeAt(i) ^ this.secretKey.charCodeAt(i % this.secretKey.length);
                result += String.fromCharCode(charCode);
            }
            
            return result;
        } catch (error) {
            console.error('Decryption error:', error);
            return null;
        }
    },
    
    // Generate random string
    generateRandomString(length = 32) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },
    
    // Generate UUID v4
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },
    
    // Hash string (simple hash para fingerprinting)
    hash(str) {
        let hash = 0;
        if (str.length === 0) return hash.toString();
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        
        return Math.abs(hash).toString(36);
    },
    
    // Generate device fingerprint
    generateFingerprint() {
        const components = [
            navigator.userAgent,
            navigator.language,
            screen.width + 'x' + screen.height,
            screen.colorDepth,
            new Date().getTimezoneOffset(),
            !!window.sessionStorage,
            !!window.localStorage
        ];
        
        return this.hash(components.join('|||'));
    }
};

Object.freeze(CryptoUtils);