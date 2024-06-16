type RunBase = {
    id: number;
    comment: string;
    excuses: string
};

export type RunJson = RunBase & {
    route_id: number;
    date: string;
};

export type Run = RunBase & {
    route?: Route;
    date: Date;
    error?: string;
};

export type Route = {
    id: number;
    name: string,
    distance: number
};


