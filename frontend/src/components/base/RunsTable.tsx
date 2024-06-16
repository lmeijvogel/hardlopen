import { format } from "date-fns";
import { Run } from "../../model/types";
import styled from "styled-components";
import { Fragment, useCallback } from "react";
import { observer } from "mobx-react-lite";
import { RunsStore } from "../../model/stores/RunsStore";

type Props = {
    runsStore: RunsStore;
    onDeleteClick: (run: Run) => void;
    onRunClick: (run: Run) => void;
};

const weekdays = [
    "Zondag",
    "Maandag",
    "Dinsdag",
    "Woensdag",
    "Donderdag",
    "Vrijdag",
    "Zaterdag"
];

export const RunsTable = observer(({ runsStore, onDeleteClick, onRunClick }: Props) => {
    return <Table>
        <tbody>
            {runsStore.sortedRunsPerYear.map(({ group, runs }) => {
                return <Fragment key={group}>
                    <tr><Header colSpan={5}>{group}</Header></tr>
                    {runs.map(run => <RunRow key={run.id} run={run} onEdit={onRunClick} onDelete={onDeleteClick} />)}
                </Fragment>
            })}
        </tbody>
    </Table>;
});

type RunRowProps = {
    run: Run;
    onEdit: (run: Run) => void;
    onDelete: (run: Run) => void;
};

const RunRow = observer(({ run, onEdit, onDelete }: RunRowProps) => {
    const onDateClick = useCallback(() => onEdit(run), [run, onEdit]);
    const onXClick = useCallback(() => onDelete(run), [run, onDelete]);

    const commentColumn = [run.comment, run.excuses].filter(el => el !== "").join(". ");
    const distance = createDistanceString(run);

    return <Row key={run.id}>
        <Col><ErrorIcon error={run.error} /><span onClick={onDateClick}>{weekdays[run.date.getDay()]} {format(run.date, "dd-MM")}</span></Col>
        <Col alignText={"numeric"}>{distance}</Col>
        <Col>{run.route?.name}</Col>
        <Col>{commentColumn}</Col>
        <Col><button onClick={onXClick}>x</button></Col>
    </Row>;
});

const ErrorIcon = ({ error }: { error: string | undefined }) => {
    if (!error) return null;

    return <span title={error}>!!</span>;
}

function createDistanceString(run: Run): string {
    if (!run.route) return "";

    const distanceInMeters = run.route.distance;
    const distance = distanceInMeters / 1000;

    return `${distance} km`

}

const Table = styled.table`
    border-collapse: collapse;
    margin-top: 10px;
`;

const Header = styled.th`
    background-color: #aaf;
`;

const Row = styled.tr`
                    text-align: left;

                    background-color: white;

                    &:nth-child(2n) {
                        background-color: #eee;
                    }
                    `;

const Col = styled.td<{ alignText?: "numeric" }>`
                    text-align: ${props => props.alignText === "numeric" ? "." : "left"};
                    padding: 2px 5px;
                    `;
