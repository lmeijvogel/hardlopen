import { useState } from "react";
import { Route, Run } from "../../model/types";
import { Button, Link } from "./buttons";

type Props = {
    mode: "add" | "edit";
    run?: Run;
    routes: Route[];
    onSubmit: (existingRun: Run | undefined, newRun: Run) => void;
    onCancel: () => void;
};

export function EditRunDialog({ mode, run, routes, onSubmit, onCancel }: Props) {
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

    const onSubmitClicked: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();

        if (!route) return;

        onSubmit(run, {
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
        <h1>{mode === "add" ? "Nieuw rondje" : "Wijzig"}</h1>
        <form>
            <table>
                <tbody>
                    <tr>
                        <td>Datum</td>
                        <td><input type="date" defaultValue={dateString} onChange={onDateChange} /></td>
                    </tr>
                    <tr>
                        <td>Route</td>
                        <td><RouteSelector routes={routes} value={run?.route} onChange={setRoute} /></td>
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

type RouteSelectorProps = {
    value?: Route;
    routes: Route[];
    onChange: (route: Route) => void;
};

function RouteSelector({ routes, value, onChange }: RouteSelectorProps) {
    const onRouteChanged: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
        const route = routes.find(r => r.id === parseInt(event.target.value));

        if (!route) return;

        onChange(route);
    };

    const routeOptions = [<option key={"no_route"} value={undefined}>---</option>, ...routes.map(route => <option key={route.id} value={route.id}>{route.name}</option>)];

    return <select defaultValue={value?.id} onChange={onRouteChanged}>{routeOptions}</select>;
}
