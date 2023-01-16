import { StorageService } from '../storage.service';

export function appInitializer(storageService: StorageService) {
    return () => new Promise(async (resolve: any) => {
        console.log("appInitializer starting");        
        storageService.init().then(async res => {
            console.log("StorageService init finished inside appInitializer");
            resolve();
        });

    });
}