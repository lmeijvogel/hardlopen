package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	_ "github.com/mattn/go-sqlite3"
)

var dbFile string

func main() {
	err := godotenv.Load("../.env")

	if err != nil {
		log.Fatal(err)
		return
	}

	dbFile = os.Getenv("DATABASE_FILE")

	router := gin.Default()
	router.ForwardedByClientIP = true
	router.SetTrustedProxies([]string{"127.0.0.1"})

	// Runs

	router.GET("/api/runs", func(c *gin.Context) {
		runs, err := getRuns()

		if err != nil {
			log.Fatal(err)
			c.AbortWithError(500, err)
			return
		}

		c.IndentedJSON(http.StatusOK, runs)
	})

	router.POST("/api/runs/add", HandleAddOrUpdateRequest)
	router.POST("/api/runs/update", HandleAddOrUpdateRequest)

	router.POST("/api/runs/delete", func(c *gin.Context) {
		var idContainer IdContainer

		err := c.BindJSON(&idContainer)

		if err != nil {
			log.Fatal(err)
			c.AbortWithError(400, err)
			return
		}

		err = DeleteRun(idContainer.ID)

		if err != nil {
			log.Fatal(err)
			c.AbortWithError(400, err)
			return
		}

		c.String(200, "Deleted")
	})

	// Routes
	router.GET("/api/routes", func(c *gin.Context) {
		runs, err := getRoutes()

		if err != nil {
			log.Fatal(err)
			c.AbortWithError(500, err)
			return
		}

		c.IndentedJSON(http.StatusOK, runs)
	})

	router.POST("/api/routes/add", func(c *gin.Context) {
		var route Route

		err := c.BindJSON(&route)

		if err != nil {
			log.Print(err)
			c.AbortWithError(400, err)
			return
		}

		err = StoreRoute(route)

		if err != nil {
			log.Print(err)
			c.AbortWithError(400, err)
			return
		}

		c.IndentedJSON(http.StatusOK, route)
	})

	router.Run(":3123")
}

func HandleAddOrUpdateRequest(c *gin.Context) {
	var run Run

	err := c.BindJSON(&run)
	if err != nil {
		c.AbortWithError(400, err)
		return
	}

	err = StoreRun(run)

	if err != nil {
		log.Fatal(err)
		c.AbortWithError(400, err)
		return
	}

	c.IndentedJSON(http.StatusOK, run)
}

func StoreRun(run Run) error {
	db, err := sql.Open("sqlite3", dbFile)

	if err != nil {
		log.Print(err)
		return err
	}

	var stmt *sql.Stmt

	tx, err := db.Begin()

	if err != nil {
		return err
	}

	if run.ID == 0 {
		stmt, err = tx.Prepare("insert into runs(route_id, date, comment, excuses) values(?, ?, ?, ?)")

		if err != nil {
			return err
		}

		defer stmt.Close()

		_, err = stmt.Exec(run.RouteID, run.Date, run.Comment, run.Excuses)
	} else {
		stmt, err = tx.Prepare("update runs set route_id=?, date=?, comment=?, excuses=? where rowid=?")

		if err != nil {
			return err
		}

		defer stmt.Close()

		_, err = stmt.Exec(run.RouteID, run.Date, run.Comment, run.Excuses, run.ID)
	}

	if err != nil {
		return err
	}

	err = tx.Commit()

	return err
}

func StoreRoute(route Route) error {
	db, err := sql.Open("sqlite3", dbFile)

	if err != nil {
		log.Fatal(err)
		return err
	}

	var stmt *sql.Stmt

	tx, err := db.Begin()

	if err != nil {
		return err
	}

	if route.ID == 0 {
		stmt, err = tx.Prepare("insert into routes(name, distance) values(?, ?)")

		if err != nil {
			return err
		}

		defer stmt.Close()

		_, err = stmt.Exec(route.Name, route.Distance)
	} else {
		stmt, err = tx.Prepare("update routes set name=?, distance=? where rowid=?")

		if err != nil {
			return err
		}

		defer stmt.Close()

		_, err = stmt.Exec(route.Name, route.Distance, route.ID)
	}

	if err != nil {
		return err
	}

	err = tx.Commit()

	return err

}

func DeleteRun(id int) error {
	db, err := sql.Open("sqlite3", dbFile)

	if err != nil {
		log.Fatal(err)
		return err
	}

	var stmt *sql.Stmt

	tx, err := db.Begin()

	if err != nil {
		return err
	}

	stmt, err = tx.Prepare("delete from runs where rowid = ?")

	if err != nil {
		return err
	}

	defer stmt.Close()

	_, err = stmt.Exec(id)

	if err != nil {
		return err
	}

	err = tx.Commit()

	return err
}

func getRuns() ([]Run, error) {
	db, err := sql.Open("sqlite3", dbFile)

	if err != nil {
		log.Fatal(err)
		return nil, err
	}

	defer db.Close()

	rows, err := db.Query("select rowid, date, comment, excuses, route_id from runs")

	if err != nil {
		log.Fatal(err)
		return nil, err
	}
	defer rows.Close()

	var result []Run

	for rows.Next() {
		var id int
		var date string
		var comment string
		var excuses string
		var routeId int

		err = rows.Scan(&id, &date, &comment, &excuses, &routeId)

		if err != nil {
			log.Fatal(err)
			continue
		}

		result = append(result, Run{id, date, routeId, comment, excuses})
	}

	return result, nil
}

func getRoutes() ([]Route, error) {
	db, err := sql.Open("sqlite3", dbFile)

	if err != nil {
		log.Fatal(err)
		return nil, err
	}

	defer db.Close()

	rows, err := db.Query("select rowid, name, distance from routes")

	if err != nil {
		log.Fatal(err)
		return nil, err
	}
	defer rows.Close()

	var result []Route

	for rows.Next() {
		var id int
		var name string
		var distance int

		err = rows.Scan(&id, &name, &distance)

		if err != nil {
			log.Fatal(err)
			continue
		}

		result = append(result, Route{id, name, distance})
	}

	return result, nil
}
