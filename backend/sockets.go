package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/google/uuid"

	"github.com/gorilla/websocket"
)

type Client struct {
	hub  *Hub
	send chan []byte
	conn *websocket.Conn
	id   uuid.UUID
	name string
}

var upgrader = websocket.Upgrader{
	ReadBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

const (
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer.
	maxMessageSize = 512
)

var (
	newline = []byte{'\n'}
	space   = []byte{' '}
	wg      sync.WaitGroup
	wg3     sync.WaitGroup
	wg2     sync.WaitGroup
)

type Payload struct {
	ID      string  `json:"id"`
	Message Address `json:"message"`
	Name    *string `json:"name,omitempty"`
	Type    string  `json:"type"`
}
type Address struct {
	ID      string  `json:"id"`
	Name    string  `json:"name"`
	Message *string `json:"message,omitempty"`
	Type    *string `json:"type,omitempty"`
}

type SendID struct {
	ID   string `json:"id"`
	Type string `json:"type"`
}
type Private struct {
	ID      string  `json:"id"`
	Name    string  `json:"name"`
	Message Address `json:"message"`
	Type    string  `json:"type"`
}
type SendUser struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Type string `json:"type"`
}

func (c *Client) readPump() {
	defer func() {
		offline := SendID{ID: c.id.String(), Type: "offline"}
		off, _ := json.Marshal(offline)
		c.hub.broadcast <- off
		c.hub.unregister <- c
		c.conn.Close()
	}()
	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error { c.conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })
	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}
		var payload Payload
		json.Unmarshal(message, &payload)
		switch payload.Type {
		case "name":
			c.name = *payload.Name
			tp := "address"
			addr := Address{Name: c.name, ID: c.id.String(), Type: &tp}
			rz, _ := json.Marshal(addr)
			c.send <- rz
			c.sendNewUser()
			c.sendCount()
		case "home":
			rz, _ := json.Marshal(payload.Message)
			message = bytes.TrimSpace(bytes.Replace(rz, newline, space, -1))
			c.hub.broadcast <- message
			break
		case "private":
			from := Private{ID: payload.ID, Message: payload.Message, Type: "private"}
			data, _ := json.Marshal(from)
			c.send <- data
			to := Private{ID: c.id.String(), Message: payload.Message, Type: "private"}
			data, _ = json.Marshal(to)
			id, _ := uuid.Parse(payload.ID)
			if v, ok := c.hub.clients[id]; ok {
				v.send <- data
			}
		}
	}
}
func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()
	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// The hub closed the channel.
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

type ClientPayload struct {
	ID         string    `json:"id"`
	Name       string    `json:"name"`
	Messages   []Address `json:"messages"`
	IsOnline   bool      `json:"isOnline"`
	NewMessage bool      `json:"newMessage"`
	Type       string    `json:"type"`
}

func (c *Client) sendCount() {
	if c.hub.clients == nil {
		return
	}
	keys := make(map[string]ClientPayload)

	for v, i := range c.hub.clients {
		if len(i.name) == 0 || v == c.id {
			continue
		}
		dum := []Address{}
		data := ClientPayload{ID: v.String(), Messages: dum, Name: i.name, NewMessage: false, IsOnline: true, Type: "private"}
		keys[data.ID] = data
	}
	rz, _ := json.Marshal(keys)
	c.send <- rz

}
func (c *Client) sendNewUser() {
	if len(c.name) == 0 {
		fmt.Println("whoops")
	}
	user := SendUser{ID: c.id.String(), Name: c.name, Type: "addUser"}
	usr, _ := json.Marshal(user)
	c.hub.broadcast <- usr
}
func Sockets(hub *Hub, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println(err)
	}
	id := uuid.New()
	client := &Client{hub: hub, conn: conn, send: make(chan []byte, 256), id: id}
	client.hub.register <- client

	go func() {
		data := SendID{ID: id.String(), Type: "id"}
		newID, _ := json.Marshal(data)
		client.send <- newID
	}()
	go client.readPump()
	go client.writePump()
}
