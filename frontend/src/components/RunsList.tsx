import { useCallback, useState } from "react";
import { observer } from "mobx-react-lite";

import { Link } from "./base/buttons";
import { Run } from "../model/types";
import { RunsTable } from "./base/RunsTable";
import { EditRunDialog } from "./base/EditRunDialog";
import { RunsStore } from "../model/stores/RunsStore";
import { runInAction } from "mobx";

type Dialog = { type: "addRun" } | { type: "addRoute" } | { type: "editRun"; run: Run };

type Props = {
    runsStore: RunsStore;
};

export const RunsList = observer(({ runsStore }: Props) => {
    const [currentDialog, setCurrentDialog] = useState<Dialog | undefined>();

    const showAddRunPage = useCallback(() => {
        setCurrentDialog({ type: "addRun" });
    }, [setCurrentDialog]);

    const showEditRunPage = useCallback(
        (run: Run) => {
            setCurrentDialog({ type: "editRun", run });
        },
        [setCurrentDialog]
    );

    const hideDialog = useCallback(() => {
        setCurrentDialog(undefined);
    }, [setCurrentDialog]);

    const deleteRun = useCallback(
        (run: Run) => {
            runsStore.deleteRun(run, (error) => (run.error = error));
        },
        [runsStore]
    );

    const submitNewRun = async (run: Run, newData: Run) => {
        await runsStore.addRun(newData, (error) => (run.error = error));

        if (!run.error) hideDialog();
    };

    const submitExistingRun = async (run: Run, newData: Run) => {
        await runsStore.updateRun(newData, (error) => runInAction(() => {
            run.error = error;
            console.log("ERROR: ", error);
        }));

        hideDialog();
    };

    if (runsStore.state.value === "loading") return <h2>Loading</h2>;
    if (runsStore.state.value === "error") return <h2>Error: {runsStore.state.reason}</h2>;

    if (currentDialog) {
        switch (currentDialog.type) {
            case "addRun":
                return <EditRunDialog mode="add" routes={runsStore.routes} onSubmit={submitNewRun} onCancel={hideDialog} />;
            case "editRun":
                return (
                    <EditRunDialog
                        mode="edit"
                        run={currentDialog.run}
                        routes={runsStore.routes}
                        onSubmit={submitExistingRun}
                        onCancel={hideDialog}
                    />
                );
            default:
                return null;
        }
    }

    return (
        <>
            <AddRunButton onClick={showAddRunPage} />
            <RunsTable runsStore={runsStore} onRunClick={showEditRunPage} onDeleteClick={deleteRun} />
        </>
    );
});

type AddRunButtonProps = {
    onClick: () => void;
};

function AddRunButton({ onClick }: AddRunButtonProps) {
    return <Link onClick={onClick}>Toevoegen</Link>;
}
