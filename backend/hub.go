package main

import (
	"github.com/google/uuid"
)

type Hub struct {
	// Registered clients.
	clients map[uuid.UUID]*Client

	// Inbound messages from the clients.
	broadcast chan []byte

	// Register requests from the clients.
	register chan *Client

	// Unregister requests from clients.
	unregister chan *Client
}

func newHub() *Hub {
	return &Hub{
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[uuid.UUID]*Client),
	}
}

func (h *Hub) run() {
	for {
		select {
		case client := <-h.register:
			h.clients[client.id] = client
			wg.Done()
		case client := <-h.unregister:
			if _, ok := h.clients[client.id]; ok {
				delete(h.clients, client.id)
				close(client.send)
				wg2.Done()
			}
		case message := <-h.broadcast:
			for client := range h.clients {
				select {
				case h.clients[client].send <- message:
				default:
					close(h.clients[client].send)
					delete(h.clients, client)
				}
			}
		}
	}
}
