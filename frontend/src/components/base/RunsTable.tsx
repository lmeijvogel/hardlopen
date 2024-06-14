import { format } from "date-fns";
import { Run } from "../../model/types";
import styled from "styled-components";
import { Fragment } from "react";

type Props = {
    runs: Run[];
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

export function RunsTable({ runs, onDeleteClick, onRunClick }: Props) {
    const runsPerYear: { group: number, elements: Run[] }[] = groupBy(runs, run => run.date.getFullYear());

    const sortedRunsPerYear = [...runsPerYear].sort((a, b) => b.group - a.group);

    return <Table>
        <tbody>
            {sortedRunsPerYear.map(({ group, elements }) => {
                const sortedRuns = [...elements.sort((a, b) => b.date.getTime() - a.date.getTime())];

                return <Fragment key={group}>
                    <tr><Header colSpan={5}>{group}</Header></tr>
                    {sortedRuns.map(run => {
                        const onDateClick = () => onRunClick(run);
                        const onXClick = () => onDeleteClick(run);

                        const commentColumn = [run.comment, run.excuses].filter(el => el !== "").join(". ");
                        const distance = createDistanceString(run);

                        return <Row key={run.id}>
                            <Col><span onClick={onDateClick}>{weekdays[run.date.getDay()]} {format(run.date, "dd-MM")}</span></Col>
                            <Col alignText={"numeric"}>{distance}</Col>
                            <Col>{run.route?.name}</Col>
                            <Col>{commentColumn}</Col>
                            <Col><button onClick={onXClick}>x</button></Col>
                        </Row>;
                    })}
                </Fragment>
            })}
        </tbody>
    </Table>;
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

function groupBy<T, U>(elements: T[], grouper: (element: T) => U): { group: U, elements: T[] }[] {
    const result: { group: U, elements: T[] }[] = [];

    for (const element of elements) {
        const groupValue = grouper(element);

        let group = result.find(r => r.group === groupValue);

        if (!group) {
            group = { group: groupValue, elements: [] };
            result.push(group);
        }

        group.elements.push(element);
    }

    return result;
}
