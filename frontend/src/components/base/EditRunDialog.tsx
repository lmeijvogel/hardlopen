import { useState } from "react";
import { Route, Run } from "../../model/types";
import { Button, Link } from "./buttons";

type Props = {
    run?: Run;
    routes: Route[];
    onSubmit: (run: Run) => void;
    onCancel: () => void;
};

export function EditRunDialog({ run, routes, onSubmit, onCancel }: Props) {
    const [date, setDate] = useState<Date>(run?.date ?? new Date());
    const [comment, setComment] = useState(run?.comment ?? "");
    const [excuses, setExcuses] = useState(run?.excuses ?? "");
    const [route, setRoute] = useState<Route | undefined>(run?.route);

    const onDateChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        setDate(new Date(Date.parse(event.target.value)));
    };

    const onCommentChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        setComment(event.target.value);
    };

    const onExcusesChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        setExcuses(event.target.value);
    };

    const onRouteChanged: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
        setRoute(routes.find(r => r.id === parseInt(event.target.value)));
    };

    const onSubmitClicked: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();

        if (!route) return;

        onSubmit({
            id: run?.id ?? 0,
            date,
            route,
            comment,
            excuses
        });
    };

    const onCancelClicked: React.MouseEventHandler<HTMLAnchorElement> = (event) => {
        event.preventDefault();

        onCancel();
    }

    const dateString = date.toISOString().substring(0, 10);

    return <div>
        <h1>Nieuw rondje</h1>
        <form>
            <table>
                <tbody>
                    <tr>
                        <td>Datum</td>
                        <td><input type="date" defaultValue={dateString} onChange={onDateChange} /></td>
                    </tr>
                    <tr>
                        <td>Route</td>
                        <td><select onChange={onRouteChanged}>{routes.map(route => <option key={route.id} value={route.id}>{route.name}</option>)}</select></td>
                    </tr>
                    <tr>
                        <td>Commentaar</td>
                        <td><input type="text" defaultValue={comment} onChange={onCommentChange} /></td>
                    </tr>
                    <tr>
                        <td>Smoesjes</td>
                        <td><input type="text" defaultValue={excuses} onChange={onExcusesChange} /></td>
                    </tr>

                </tbody>
            </table>
            <Button onClick={onSubmitClicked}>Versturen</Button>
            <Link onClick={onCancelClicked}>Terug</Link>
        </form >
    </div >;
}


