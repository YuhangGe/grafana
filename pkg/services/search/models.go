package search
import (
  "time"
)
type HitType string

const (
	DashHitDB       HitType = "dash-db"
	DashHitHome     HitType = "dash-home"
	DashHitJson     HitType = "dash-json"
	DashHitScripted HitType = "dash-scripted"
)

type Hit struct {
	Id        int64    `json:"id"`
  Icon      string   `json:"icon"`
	Title     string   `json:"title"`
	Uri       string   `json:"uri"`
	Type      HitType  `json:"type"`
	Tags      []string `json:"tags"`
	IsStarred bool     `json:"isStarred"`
  Created   time.Time `json:"created"`
}

type HitList []*Hit

func (s HitList) Len() int           { return len(s) }
func (s HitList) Swap(i, j int)      { s[i], s[j] = s[j], s[i] }
func (s HitList) Less(i, j int) bool { return s[i].Created.Before(s[j].Created) }

type Query struct {
	Title        string
	Tags         []string
	OrgId        int64
	UserId       int64
	Limit        int
	IsStarred    bool
	DashboardIds []int

	Result HitList
}

type FindPersistedDashboardsQuery struct {
	Title        string
	OrgId        int64
	UserId       int64
	IsStarred    bool
	DashboardIds []int

	Result HitList
}
