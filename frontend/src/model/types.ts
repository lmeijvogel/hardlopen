import { action, observable } from "mobx";

type RunBase = {
    id: number;
    comment: string;
    excuses: string
};

export type RunJson = RunBase & {
    route_id: number;
    date: string;
};

export type RunData = RunBase & {
    route: Route;
    date: Date;
    error?: string;
};

export type Route = {
    id: number;
    name: string,
    distance: number
};

export class Run {
    readonly id: number;

    @observable accessor route: Route;
    @observable accessor date: Date;
    @observable accessor error: string | undefined;
    @observable accessor comment: string;
    @observable accessor excuses: string;

    static fromJson(json: RunJson, routes: Route[]): Run {
        const route = routes.find((route) => route.id === json.route_id);

        if (!route) throw new Error(`No route configured for Run ${json.id}`);

        return new Run(json.id, route, new Date(Date.parse(json.date)), json.comment, json.excuses);
    }

    constructor(id: number, route: Route, date: Date, comment: string, excuses: string) {
        this.id = id;
        this.route = route;
        this.date = date;

        this.comment = comment;
        this.excuses = excuses;
    }

    @action
    update(newData: RunData) {
        this.route = newData.route;
        this.date = newData.date;
        this.comment = newData.comment;
        this.excuses = newData.excuses;
    }

}
