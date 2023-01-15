import { AccountService } from '../account.service';
import { StorageService } from '../storage.service';

export function appInitializer(accountService: AccountService, storageService: StorageService) {
    return () => new Promise(async (resolve: any) => {
        console.log("appInitializer starting");
        storageService.init().then(async res => {
            console.log("StorageService init finished inside appInitializer");
            //await accountService.init();
           // console.log("appInitializer calling refresh token");
            //attempt to refresh token on app start up to auto authenticate
            // accountService.refreshToken()
            //     .subscribe({
            //         next: (res) => {
            //             console.log("appInitializer refreshToken done");
            //         }, error: (err) => {
            //             console.error("appInitializer refreshToken error", err);
            //             accountService.logout();
            //         }
            //     })
            //     .add(resolve);
            resolve();
        });

    });
}