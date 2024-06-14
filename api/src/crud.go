package main

type Run struct {
	ID      int    `json:"id"`
	Date    string `json:"date"`
	RouteID int    `json:"route_id"`
	Comment string `json:"comment"`
	Excuses string `json:"excuses"`
}

type Route struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	Distance int    `json:"distance"`
}

type IdContainer struct {
	ID int `json:"id"`
}
