package dtos

type Prefs struct {
	Theme           string `json:"theme"`
  Language        string `json:"language"`
	HomeDashboardId int64  `json:"homeDashboardId"`
	Timezone        string `json:"timezone"`
}

type UpdatePrefsCmd struct {
	Theme           string `json:"theme"`
  Language        string `json:"language"`
  HomeDashboardId int64  `json:"homeDashboardId"`
	Timezone        string `json:"timezone"`
}
