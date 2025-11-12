// PWA Utility functions
export class PWAUtils {
  // Check if PWA is installed
  static isPWAInstalled(): boolean {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    );
  }

  // Check if online
  static isOnline(): boolean {
    return navigator.onLine;
  }

  // Register background sync
  static async registerBackgroundSync(): Promise<void> {
    if ("serviceWorker" in navigator && "SyncManager" in window) {
      const registration = await navigator.serviceWorker.ready;
      try {
        await registration.sync.register("offline-actions");
        console.log("✅ Background sync registered");
      } catch (error) {
        console.log("❌ Background sync failed:", error);
      }
    }
  }

  // Request notification permission
  static async requestNotificationPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      console.log("Browser tidak mendukung notifikasi");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  // Show local notification
  static showLocalNotification(
    title: string,
    options?: NotificationOptions
  ): void {
    if (!("Notification" in window) || Notification.permission !== "granted") {
      return;
    }

    const notification = new Notification(title, {
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-72x72.png",
      ...options,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }

  // Cache API data manually
  static async cacheApiData(url: string, data: any): Promise<void> {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready;
      registration.active?.postMessage({
        type: "CACHE_API",
        url,
        data,
      });
    }
  }

  // Get service worker version
  static async getSWVersion(): Promise<string | null> {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready;
      return new Promise((resolve) => {
        const channel = new MessageChannel();
        channel.port1.onmessage = (event) => {
          resolve(event.data.version);
        };
        registration.active?.postMessage({ type: "GET_VERSION" }, [
          channel.port2,
        ]);
      });
    }
    return null;
  }

  // Check for updates
  static async checkForUpdates(): Promise<boolean> {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();
      return true;
    }
    return false;
  }
}

// Offline storage for pending actions
export class OfflineStorage {
  private static dbName = "RentalMotorDB";
  private static version = 1;

  static async init(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains("pendingActions")) {
          const store = db.createObjectStore("pendingActions", {
            keyPath: "id",
          });
          store.createIndex("timestamp", "timestamp", { unique: false });
        }

        if (!db.objectStoreNames.contains("offlineData")) {
          const store = db.createObjectStore("offlineData", { keyPath: "key" });
        }
      };
    });
  }

  static async savePendingAction(action: any): Promise<void> {
    const db = await this.init();
    const transaction = db.transaction(["pendingActions"], "readwrite");
    const store = transaction.objectStore("pendingActions");

    await store.add({
      ...action,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    });
  }

  static async getOfflineData(key: string): Promise<any> {
    const db = await this.init();
    const transaction = db.transaction(["offlineData"], "readonly");
    const store = transaction.objectStore("offlineData");

    return new Promise((resolve) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result?.value);
      request.onerror = () => resolve(null);
    });
  }

  static async saveOfflineData(key: string, data: any): Promise<void> {
    const db = await this.init();
    const transaction = db.transaction(["offlineData"], "readwrite");
    const store = transaction.objectStore("offlineData");

    await store.put({ key, value: data, timestamp: new Date().toISOString() });
  }
}
