package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	hub := newHub()

	http.HandleFunc("/register/", func(w http.ResponseWriter, r *http.Request) {
		Sockets(hub, w, r)
	})
	fmt.Println("server started")
	log.Fatal(http.ListenAndServe(":5000", nil))
}
