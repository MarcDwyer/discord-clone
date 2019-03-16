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

type Message struct {
	ID      string `json:"id"`
	Message string `json:"message"`
	Type    string `json:"type"`
	Name    string `json:"name"`
}
type Address struct {
	ID   string  `json:"id"`
	Name string  `json:"name"`
	Type *string `json:"type,omitempty"`
}

type SendID struct {
	ID   string `json:"id"`
	Type string `json:"type"`
}
type SubMessage struct {
	Message string `json:"message"`
	Name    string `json:"name"`
	Type    string `json:"type"`
}

func (c *Client) readPump() {
	defer func() {
		wg2.Add(1)
		c.hub.unregister <- c
		wg2.Wait()
		c.sendCount()
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
		var msg Message
		json.Unmarshal(message, &msg)
		switch msg.Type {
		case "name":
			c.name = msg.Name
			tp := "address"
			addr := Address{Name: c.name, ID: c.id.String(), Type: &tp}
			rz, _ := json.Marshal(addr)
			c.send <- rz
			c.sendCount()
		case "message":
			snd := SubMessage{Message: msg.Message, Name: msg.Name, Type: "message"}
			rz, _ := json.Marshal(snd)
			message = bytes.TrimSpace(bytes.Replace(rz, newline, space, -1))

			c.hub.broadcast <- message
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

func (c *Client) sendCount() {
	if c.hub.clients == nil {
		return
	}
	fmt.Println("send ran")
	keys := []Address{}
	for v := range c.hub.clients {
		id := v.String()
		addr := Address{
			ID:   id,
			Name: c.hub.clients[v].name,
		}
		keys = append(keys, addr)
	}
	rz, _ := json.Marshal(keys)
	c.hub.broadcast <- rz

}

func Sockets(hub *Hub, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println(err)
	}
	id := uuid.New()
	client := &Client{hub: hub, conn: conn, send: make(chan []byte, 256), id: id}
	client.hub.register <- client
	data := SendID{ID: id.String(), Type: "id"}
	newID, _ := json.Marshal(data)
	client.send <- newID
	go client.readPump()
	go client.writePump()
}
