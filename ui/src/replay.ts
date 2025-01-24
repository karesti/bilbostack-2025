import { Drash } from "https://deno.land/x/drash@v1.4.4/mod.ts";

class Coord {
    x: number
    y: number
    constructor(coords:string) {
       [this.x,this.y] = coords.split(',').map(i=>parseInt(i)); 
    }
}

type Turn = {
    attacker: string;
    hit?: boolean;
    origin: number[];
}

type TurnRes = {
    attacker: string;
    hit?: boolean;
    origin: string;
}

type Player = {
    userId: string;
    username: string;
    gameId: string;
    human: boolean;
    score: number;
    bonus: number;
    matchId: string;
}

type Match = {
    gameId: string;
    matchId: string;
    playerA: Player;
    playerB: Player;
    turns: TurnRes[];
    winner: string;
    startTs: number;
    endTs: number;
}

const replayUrl = Deno.env.get("REPLAY_SERVER");

export class ReplayResource extends Drash.Http.Resource {
    static paths = ["/replay/:gameId"];
    public async GET() {
        const gameId = this.request.getPathParam("gameId");
        let replayData: Turn[][] = [];
        if (!gameId) { throw new Drash.Exceptions.HttpException(400, "replay requires a gameID")}
        else {
            replayData = await fetch(`https://${replayUrl}/game/${gameId}/replays?gimme=12`).then(res=>res.json()).then((matches:Match[]) => {
                return matches.map((match:Match) : Turn[] => {
                    return match.turns.map((turn:TurnRes) : Turn => {
                        let origin = new Coord(turn.origin);
                        return { 
                            attacker:turn.attacker, 
                            hit: turn.hit, 
                            origin: [origin.x,origin.y]
                        };
                    })
                })
            }).catch(e=>[]);

            this.response.headers.set("Content-Type","application/json");
            this.response.body = replayData;
            return this.response;
            
        }
    }
}
