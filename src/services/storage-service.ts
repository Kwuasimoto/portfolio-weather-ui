// Local storage ONLY.

// Utility for assisting serialization and deserialization of json objects from local storage.
class StorageService {
  private static instance: StorageService;

  private constructor() {}

  public static getInstance() {
    if (!StorageService.instance)
      StorageService.instance = new StorageService();
    return StorageService.instance;
  }

  public write(key: string, obj: any) {
    localStorage.setItem(key, JSON.stringify(obj));
  }

  /**
   * Performs an unsafe deserialization on local storage JSON.
   */
  public read<T>(key: string): T | undefined {
    const item = localStorage.getItem(key);
    if (!item) {
      return undefined;
    }
    return <T>JSON.parse(item);
  }
}

export const storageService = StorageService.getInstance();
