/**
Copyright 2023 Scott Lewis, All rights reserved.
**/
import { HttpClient } from "@angular/common/http";
import { Injectable, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { GoogleGameServices } from "capacitor-google-game-services";
import { NGXLogger } from "ngx-logger";
import { GameLicensePlateModel, GameModel, LicensePlateModel, StateModel } from "src/api";
import { StorageService } from "./storage.service";

@Injectable({
  providedIn: 'root',
})
export class GameService {

  private allGames: GameModel[] = [];
  private hasLoaded: boolean = false;
  private isAuthenticated: boolean = false;

  constructor(private storageService: StorageService) {

  }
  async init() {
    this.isAuthenticated = (await GoogleGameServices.isAuthenticated()).isAuthenticated;
    console.log("GameService isAuthenticated: ", this.isAuthenticated);
  }

  getIsAuthenticated() {
    return this.isAuthenticated;
  }

  async getGames() {
    if (!this.hasLoaded) {
      await this.loadGameData();
    }
    return this.allGames.filter(x => x.deletedDateTime == undefined);
  }

  getNewGameId() {
    let largestGameId = 0;
    this.allGames?.forEach(g => {
      if (g && g.gameId && g.gameId > largestGameId) {
        largestGameId = g.gameId;
      }
    });
    return largestGameId + 1;
  }

  getCurrentGame() {
    let foundGame = this.allGames.find(x => x.finishedDateTime == undefined && x.startedDateTime != undefined && x.deletedDateTime == undefined);
    return foundGame;
  }

  async addGame(orgGame: GameModel) {
    let game = new GameModel(orgGame);
    if (!game || (game.gameId ?? 0) <= 0) {
      console.error("Invalid game or invalid gameId");
      return;
    }
    let foundGameIndex = this.allGames.findIndex(x => x.gameId == game.gameId);
    if (foundGameIndex >= 0) {
      console.error("GameId already exists");
      return;
    }
    //let gameData = game?.clone();
    game?.licensePlates?.forEach(x => {
      if (x.licensePlate?.image) {
        x.licensePlate.image = "";
      }
    });

    if (!game.title) {
      if (game.gameNumber && game.gameNumber > 0) {
        game.title = `Game #` + game.gameNumber;
      } else {
        game.title = `Game #` + (this.allGames.length + 1);
      }
    }

    this.allGames?.forEach(g => {
      if (!g.deletedDateTime && !g.finishedDateTime) {
        g.finishedDateTime = new Date();
      }
    });

    game.startedDateTime = new Date();

    console.log("Adding game: ", game, game.toJSON());
    this.allGames.push(game);

    this.fixGamesJson();
    this.fixDates();

    let gamesJson: any[] = [];
    this.allGames.forEach(x => gamesJson.push(x.toJSON()));
    let dataObj = { title: "games", data: JSON.stringify(gamesJson) };
    if (this.isAuthenticated) {
      GoogleGameServices.saveGame(dataObj);
    } else {
      this.storageService.set("games", dataObj);
    }
    this.hasLoaded = false;
  }

  async saveGame(orgGame: GameModel) {
    let game = new GameModel(orgGame);
    let foundGameIndex = this.allGames.findIndex(x => x.gameId == game.gameId);
    if (foundGameIndex < 0) {
      console.error("Could not find game");
      return;
    }
    this.allGames[foundGameIndex] = game;
    this.fixGamesJson();
    this.fixDates();
    let gamesJson: any[] = [];
    this.allGames.forEach(x => gamesJson.push(x.toJSON()));
    let dataStr = JSON.stringify(this.allGames);
    let dataObj = { title: "games", data: dataStr };
    console.log("Saving DataObj: ", dataObj);
    if (this.isAuthenticated) {
      GoogleGameServices.saveGame({ title: "games", data: dataStr });
    } else {
      this.storageService.set("games", dataObj);
    }
    this.hasLoaded = false;
  }

  async loadGameData(): Promise<void> {
    return new Promise(async (resolve: any) => {
      if (this.hasLoaded) {
        resolve();
        return;
      }
      this.allGames = [];
      if (this.isAuthenticated) {
        let gameData = await GoogleGameServices.loadGame();
        console.log("GameData: ", JSON.stringify(gameData));
        if (gameData) {
          let parseObj = JSON.parse(gameData.data);
          console.log("parseObj: ", JSON.stringify(parseObj));
          if (parseObj?.games) {
            try {
              let parseObjArr = JSON.parse(parseObj?.games?.games);
              console.log("parseObjArr: ", JSON.stringify(parseObjArr));
              parseObjArr.forEach((g: any) => {
                console.log("g: ", JSON.stringify(g));
                let newGame = new GameModel(g);
                this.allGames.push(newGame);
              });
            } catch (err) {
              console.error("Failed to load games: ", err);
            }
          }
        }
      } else {
        let gameData = await this.storageService.get("games");
        if (gameData) {
          let gamesArr: any[] = JSON.parse(gameData?.data);
          gamesArr.forEach(g => {
            let newGame = new GameModel(g);
            this.allGames.push(newGame);
          });
        }
      }
      this.hasLoaded = true;
      this.fixGamesJson();
      this.fixDates();
      console.log("GameData loaded allGames: ", this.allGames);
      resolve();
    });
  }

  fixGamesJson() {
    this.allGames.forEach(game => {
      let lpArr: GameLicensePlateModel[] = new Array() as GameLicensePlateModel[];
      game.licensePlates?.forEach(glp => {
        let newGlp = new GameLicensePlateModel(glp);
        if (glp.licensePlate) {
          newGlp.licensePlate = new LicensePlateModel(glp.licensePlate);
          newGlp.licensePlate.image = "";
          if (glp.licensePlate.state) {
            newGlp.licensePlate.state = new StateModel(glp.licensePlate.state);
          }
        }
        lpArr.push(newGlp);
      });
      game.licensePlates = lpArr;
    });
  }

  fixDates() {
    this.allGames?.forEach(g => {
      if (g.startedDateTime) {
        g.startedDateTime = new Date(g.startedDateTime);
      }
      if (g.finishedDateTime) {
        g.finishedDateTime = new Date(g.finishedDateTime);
      }
      if (g.createdDateTime) {
        g.createdDateTime = new Date(g.createdDateTime);
      }
      if (g.modifiedDateTime) {
        g.modifiedDateTime = new Date(g.modifiedDateTime);
      }
      if (g.deletedDateTime) {
        g.deletedDateTime = new Date(g.deletedDateTime);
      }
      g.licensePlates?.forEach(glp => {
        if (glp.createdDateTime) {
          glp.createdDateTime = new Date(glp.createdDateTime);
        }
        if (glp.modifiedDateTime) {
          glp.modifiedDateTime = new Date(glp.modifiedDateTime);
        }
        if (glp.deletedDateTime) {
          glp.deletedDateTime = new Date(glp.deletedDateTime);
        }
        if (glp.licensePlate?.createdDateTime) {
          glp.licensePlate.createdDateTime = new Date(glp.licensePlate.createdDateTime);
        }
        if (glp.licensePlate?.modifiedDateTime) {
          glp.licensePlate.modifiedDateTime = new Date(glp.licensePlate.modifiedDateTime);
        }
        if (glp.licensePlate?.deletedDateTime) {
          glp.licensePlate.deletedDateTime = new Date(glp.licensePlate.deletedDateTime);
        }
        if (glp.licensePlate?.state?.createdDateTime) {
          glp.licensePlate.state.createdDateTime = new Date(glp.licensePlate.state.createdDateTime);
        }
        if (glp.licensePlate?.state?.modifiedDateTime) {
          glp.licensePlate.state.modifiedDateTime = new Date(glp.licensePlate.state.modifiedDateTime);
        }
        if (glp.licensePlate?.state?.deletedDateTime) {
          glp.licensePlate.state.deletedDateTime = new Date(glp.licensePlate.state.deletedDateTime);
        }
      });
    });
  }
}
