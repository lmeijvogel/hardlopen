import { computed, observable, runInAction } from "mobx";
import { Route, Run, RunData, RunJson } from "../types";
import { format } from "date-fns";
import { groupBy } from "../../helpers/groupBy";

type State =
    | {
        value: "loading" | "ready";
    }
    | { value: "error"; reason: string };

export class RunsStore {
    @observable accessor state: State = { value: "loading" };

    @observable accessor runs: Run[] = [];
    @observable accessor routes: Route[] = [];

    @computed get sortedRunsPerYear(): { group: number, runs: Run[] }[] {
        console.log("Getter triggered!");
        const runsPerYear: { group: number, elements: Run[] }[] = groupBy(this.runs, run => run.date.getFullYear());

        const RunsPerSortedYear = [...runsPerYear].sort((a, b) => b.group - a.group);

        return RunsPerSortedYear.map(({ group, elements }) => ({
            group,
            runs: [...elements].sort((a, b) => b.date.getTime() - a.date.getTime())
        }));
    }

    async fetchRuns() {
        const routesResponse = await fetch("/api/routes");

        if (!routesResponse.ok) {
            runInAction(async () => (this.state = { value: "error", reason: await buildErrorMessage(routesResponse) }));

            return;
        }

        const routes: Route[] = await routesResponse.json();

        const response = await fetch("/api/runs");

        if (!response.ok) {
            this.state = { value: "error", reason: await buildErrorMessage(response) };

            return;
        }

        const json = await response.json();

        runInAction(() => {
            this.routes = routes;
            this.runs = json.map((json: RunJson) => Run.fromJson(json, routes));
            this.state = { value: "ready" };
        });
    }

    async addRun(runData: RunData, onError: (message: string) => void) {
        const response = await fetch("/api/runs/add", {
            method: "POST",
            body: JSON.stringify(runToJson(runData))
        });

        if (!response.ok) {
            onError(await buildErrorMessage(response));
            return;
        }

        const run = Run.fromJson(await response.json(), this.routes);

        this.runs.push(run);
    }

    async updateRun(run: Run, runData: RunData, onError: (message: string) => void) {
        const response = await fetch("/api/runs/update", {
            method: "POST",
            body: JSON.stringify(runToJson(runData))
        });

        if (!response.ok) {
            onError(await buildErrorMessage(response));
            return;
        }

        run.update(runData);
    }

    async deleteRun(run: Run, onError: (message: string) => void) {
        const response = await fetch("/api/runs/delete", {
            method: "POST",
            body: JSON.stringify({ id: run.id })
        });

        if (!response.ok) {
            onError(await buildErrorMessage(response));
            return;
        }

        const index = this.runs.indexOf(run);

        runInAction(() => this.runs.splice(index, 1));
    }
}

function runToJson(run: Run | RunData): RunJson {
    return {
        id: run.id,
        date: format(run.date, "yyyy-MM-dd"),
        route_id: run.route?.id ?? 0,
        comment: run.comment ?? "",
        excuses: run.excuses ?? ""
    };
}

async function buildErrorMessage(response: Response): Promise<string> {
    return `Error: ${response.status} - ${await response.text()}`;
}
