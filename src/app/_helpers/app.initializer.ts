import { GameService } from '../game.service';
import { StorageService } from '../storage.service';

export function appInitializer(storageService: StorageService, gameService: GameService) {
    return () => new Promise(async (resolve: any) => {
        console.log("appInitializer starting");        
        storageService.init().then(async res => {
            console.log("StorageService init finished inside appInitializer");
            gameService.init().then(async res => {
                console.log("gameService init finished inside appInitializer");                
                resolve();
            });
        });
    });
}