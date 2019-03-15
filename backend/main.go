package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	hub := newHub()

	go hub.run()

	http.HandleFunc("/sockets/", func(w http.ResponseWriter, r *http.Request) {
		Sockets(hub, w, r)
	})
	fmt.Println("server started")
	log.Fatal(http.ListenAndServe(":5000", nil))
}
