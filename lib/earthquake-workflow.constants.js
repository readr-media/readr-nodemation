module.exports = {
  EARTHQUAKE_DATA_SOURCE: "中央氣象署",
  EARTHQUAKE_TRIGGER_CONDITION: "最低規模 4.0 以上地震",
  EARTHQUAKE_UPDATE_METHOD: "每3分鐘自動監測",
  EARTHQUAKE_USER_PROMPT: `依照以下規則生成文章，所有內容僅可依據中央氣象署資料產生，不得推測災情、傷亡、交通影響或其他未確認資訊。
・ 分類｜固定為「生活」。
・ 標題｜使用 {ReportContent}，去掉開頭 MM/DD 與結尾句點。
・ 內文第一段｜固定格式：{ReportType}{EarthquakeNo}{OriginTime}。OriginTime 顯示台灣時間，格式為 yyyy-mm-dd hh:mm:ss。
・ 內文第二段｜根據 OriginTime、Epicenter.Location、MagnitudeValue、FocalDepth 生成地震概況
・ 內文第三段｜根據 ShakingArea[ ].CountyName、AreaIntensity、EqStation[ ].StationName 生成震度分布資訊
・ 內文第四段｜生成一般性防災提醒。
・ 內文第五段｜固定輸出：資料提供：交通部中央氣象署［地震測報中心］`,
};
