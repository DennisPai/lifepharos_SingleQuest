##API_KEY = 179dcdb74c6a4f1540303be93f5d259c

##請求方法
API v1 呼叫可以使用 POST 或 GET 請求方法，但由於 GET 請求受限於 URL 的最大允許長度，建議優先使用 POST 方法。

##圖片上傳
https://api.imgbb.com/1/upload

##參數

#key (必填)
API 金鑰。

#image (必填)
二進位檔案、base64 資料或圖片 URL（最大 32 MB）。

#name (可選)
文件名稱；如果你使用 POST 和 multipart/form-data 上傳文件，將會自動偵測。

#expiration (可選)
如果您希望上傳內容在一段時間後自動刪除（以秒為單位，60-15552000），請啟用此項目。

##範例調用
curl --location --request POST "https://api.imgbb.com/1/upload?expiration=600&key=YOUR_CLIENT_API_KEY" --form "image=R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBIBRAA7"
※注意：上傳本機檔案時請務必使用 POST。使用 GET 時，由於編碼字元或 URL 長度限制，URL 編碼可能會變更 base64 來源。

##API 回應
API v1 的回應會以 JSON 格式顯示所有已上傳圖片的資訊。
在 JSON 回應中，回應頭會包含狀態碼，方便你輕鬆判斷請求是否成功。也會包含 status 屬性。

##範例回應（JSON）
{
	"data": {
		"id": "2ndCYJK",
		"title": "c1f64245afb2",
		"url_viewer": "https://ibb.co/2ndCYJK",
		"url": "https://i.ibb.co/w04Prt6/c1f64245afb2.gif",
		"display_url": "https://i.ibb.co/98W13PY/c1f64245afb2.gif",
		"width":"1",
		"height":"1",
		"size": "42",
		"time": "1552042565",
		"expiration":"0",
		"image": {
			"filename": "c1f64245afb2.gif",
			"name": "c1f64245afb2",
			"mime": "image/gif",
			"extension": "gif",
			"url": "https://i.ibb.co/w04Prt6/c1f64245afb2.gif",
		},
		"thumb": {
			"filename": "c1f64245afb2.gif",
			"name": "c1f64245afb2",
			"mime": "image/gif",
			"extension": "gif",
			"url": "https://i.ibb.co/2ndCYJK/c1f64245afb2.gif",
		},
		"medium": {
			"filename": "c1f64245afb2.gif",
			"name": "c1f64245afb2",
			"mime": "image/gif",
			"extension": "gif",
			"url": "https://i.ibb.co/98W13PY/c1f64245afb2.gif",
		},
		"delete_url": "https://ibb.co/2ndCYJK/670a7e48ddcb85ac340c717a41047e5c"
	},
	"success": true,
	"status": 200
}