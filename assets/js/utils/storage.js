// storage.js - Gerenciamento seguro de Local Storage

const Storage = {
    // Set item with optional encryption
    set(key, value, encrypt = false) {
        try {
            const data = encrypt ? CryptoUtils.encrypt(JSON.stringify(value)) : JSON.stringify(value);
            localStorage.setItem(key, data);
            return true;
        } catch (error) {
            console.error('Storage.set error:', error);
            return false;
        }
    },
    
    // Get item with optional decryption
    get(key, decrypt = false) {
        try {
            const data = localStorage.getItem(key);
            if (!data) return null;
            
            if (decrypt) {
                const decrypted = CryptoUtils.decrypt(data);
                return decrypted ? JSON.parse(decrypted) : null;
            }
            
            return JSON.parse(data);
        } catch (error) {
            console.error('Storage.get error:', error);
            return null;
        }
    },
    
    // Set secure item (always encrypted)
    setSecure(key, value) {
        return this.set(key, value, true);
    },
    
    // Get secure item (always decrypted)
    getSecure(key) {
        return this.get(key, true);
    },
    
    // Remove item
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage.remove error:', error);
            return false;
        }
    },
    
    // Clear all storage
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Storage.clear error:', error);
            return false;
        }
    },
    
    // Check if key exists
    has(key) {
        return localStorage.getItem(key) !== null;
    },
    
    // Get all keys
    keys() {
        return Object.keys(localStorage);
    },
    
    // Get storage size (approximate)
    getSize() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        return (total / 1024).toFixed(2); // KB
    },
    
    // Set with expiration
    setWithExpiry(key, value, ttl) {
        const item = {
            value: value,
            expiry: Date.now() + ttl
        };
        return this.set(key, item);
    },
    
    // Get with expiration check
    getWithExpiry(key) {
        const item = this.get(key);
        if (!item) return null;
        
        if (Date.now() > item.expiry) {
            this.remove(key);
            return null;
        }
        
        return item.value;
    },
    
    // Session Storage wrapper
    session: {
        set(key, value) {
            try {
                sessionStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.error('SessionStorage.set error:', error);
                return false;
            }
        },
        
        get(key) {
            try {
                const data = sessionStorage.getItem(key);
                return data ? JSON.parse(data) : null;
            } catch (error) {
                console.error('SessionStorage.get error:', error);
                return null;
            }
        },
        
        remove(key) {
            try {
                sessionStorage.removeItem(key);
                return true;
            } catch (error) {
                console.error('SessionStorage.remove error:', error);
                return false;
            }
        },
        
        clear() {
            try {
                sessionStorage.clear();
                return true;
            } catch (error) {
                console.error('SessionStorage.clear error:', error);
                return false;
            }
        }
    }
};

// Storage Event Listener (cross-tab communication)
window.addEventListener('storage', (e) => {
    if (e.key === APP_CONFIG.STORAGE_KEYS.TOKEN && !e.newValue) {
        // Token removed in another tab - force logout
        EventBus.emit('auth:logout');
    }
});