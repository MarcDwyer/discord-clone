package main

import (
	"github.com/google/uuid"
)

type Hub struct {
	clients    map[uuid.UUID]*Client
	broadcast  chan []byte
	sendID     chan []byte
	register   chan *Client
	unregister chan *Client
	setName    chan Message
}

func newHub() *Hub {
	return &Hub{
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		setName:    make(chan Message),
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
		case payload := <-h.setName:
			id, _ := uuid.Parse(payload.ID)
			h.clients[id].name = payload.Name
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
