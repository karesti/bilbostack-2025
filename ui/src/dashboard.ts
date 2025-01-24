import { Drash } from "https://deno.land/x/drash@v1.4.4/mod.ts";

const leaderboardUrl = Deno.env.get("LEADERBOARD_SERVER");
const statsUrl = Deno.env.get("STATS_SERVER");


export class DashboardResource extends Drash.Http.Resource {
    static paths = ["/","/dashboard"];
    public GET() {
        this.response.body = this.response.render(
            "/dashboard.html", {
                leaderboardUrl: leaderboardUrl,
                statsUrl: statsUrl
            }
        )

        return this.response;
    }
}