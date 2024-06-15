import { format } from "date-fns/format";
import { useCallback, useEffect, useState } from "react";
import { Link } from "./base/buttons";
import { Route, Run, RunJson } from "../model/types";
import { RunsTable } from "./base/RunsTable";
import { EditRunDialog } from "./base/EditRunDialog";

type Dialog =
    | { type: "addRun" }
    | { type: "addRoute" }
    | { type: "editRun", run: Run };

export function RunsList() {
    const [runs, setRuns] = useState<Run[] | "not_loaded">("not_loaded");
    const [routes, setRoutes] = useState<Route[] | "not_loaded">("not_loaded");
    const [currentDialog, setCurrentDialog] = useState<Dialog | undefined>();

    useEffect(() => {
        async function fetchAndSetData() {
            const routesResponse = await fetch("/api/routes");
            const loadedRoutes: Route[] = await routesResponse.json()
            setRoutes(loadedRoutes);

            const response = await fetch("/api/runs");
            const json = await response.json();

            const convertedRuns = json.map((json: RunJson) => jsonToRun(json, loadedRoutes));

            setRuns(convertedRuns);
        }
        fetchAndSetData();
    }, []);

    const showAddRunPage = useCallback(() => {
        setCurrentDialog({ type: "addRun" });
    }, [setCurrentDialog]);

    const showEditRunPage = useCallback((run: Run) => {
        setCurrentDialog({ type: "editRun", run })
    }, [setCurrentDialog]);

    const hideDialog = useCallback(() => {
        setCurrentDialog(undefined);
    }, [setCurrentDialog]);

    const deleteRun = useCallback((run: Run) => {
        const sendDeleteRun = (run: Run) => {
            return new Promise<void>((res, rej) => {
                fetch("/api/runs/delete", {
                    method: "POST",
                    body: JSON.stringify({ id: run.id })
                }).then(response => response.ok ? res() : rej());
            });
        };

        if (runs === "not_loaded") return;

        sendDeleteRun(run).then(() => {
            const runIndex = runs.findIndex(storedRun => storedRun.id === run.id);
            const splicedRuns = [...runs];

            splicedRuns.splice(runIndex, 1);

            setRuns(splicedRuns);
        });
    }, [runs]);

    const submitNewRun = (run: Run) => {
        fetch("/api/runs/add", {
            method: "POST",
            body: JSON.stringify(runToJson(run))
        }).then(() => {
            setRuns(oldRuns => oldRuns === "not_loaded" ? [run] : [run, ...oldRuns]);
            hideDialog();
        });
    };

    const submitExistingRun = (run: Run) => {
        fetch("/api/runs/update", {
            method: "POST",
            body: JSON.stringify(runToJson(run))
        }).then(() => {
            if (runs === "not_loaded") return;

            const runIndex = runs.findIndex(r => r.id === run.id);
            const newRuns = [...runs];

            newRuns[runIndex] = run;

            setRuns(newRuns);

            hideDialog();
        });
    };

    if (runs === "not_loaded" || routes === "not_loaded") return <h2>Loading</h2>;

    if (!currentDialog) {
        return <>
            <AddRunButton onClick={showAddRunPage} />
            <RunsTable runs={runs} onRunClick={showEditRunPage} onDeleteClick={deleteRun} />
        </>;
    }

    switch (currentDialog.type) {
        case "addRun":
            return <EditRunDialog mode="add" routes={routes} onSubmit={submitNewRun} onCancel={hideDialog} />
        case "editRun":
            return <EditRunDialog mode="edit" run={currentDialog.run} routes={routes} onSubmit={submitExistingRun} onCancel={hideDialog} />
        default:
            return null;
    }
}

type AddRunButtonProps = {
    onClick: () => void;
}

function AddRunButton({ onClick }: AddRunButtonProps) {
    return <Link onClick={onClick}>Toevoegen</Link>;
}

function jsonToRun(json: RunJson, routes: Route[]): Run {
    return {
        ...json,
        date: new Date(Date.parse(json.date)),
        route: routes.find(route => route.id === json.route_id),
        comment: json.comment ?? "",
        excuses: json.excuses ?? ""
    };
}

function runToJson(run: Run): RunJson {
    return {
        id: run.id,
        date: format(run.date, "yyyy-MM-dd"),
        route_id: run.route?.id ?? 0,
        comment: run.comment ?? "",
        excuses: run.excuses ?? ""
    };
}
