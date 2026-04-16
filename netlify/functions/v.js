exports.handler = async (event, context) => {
  // URLからデータ (?d=...) を取得
  let encodedData = event.queryStringParameters.d;

  if (!encodedData) {
    return {
      statusCode: 400,
      body: "データが見つかりません。"
    };
  }

  try {
    // 1. URLセーフな記号をもとに戻す (- -> +, _ -> /)
    let base64 = encodedData.replace(/-/g, '+').replace(/_/g, '/');
    
    // 2. Base64をデコードしてJSONに戻す (Node.jsのBufferを使用)
    const buffer = Buffer.from(base64, 'base64');
    const jsonText = decodeURIComponent(escape(buffer.toString()));
    const data = JSON.parse(jsonText);

    // 3. Discordに読ませるHTMLを生成
    // ※ プレビューを豪華にするため og:image と twitter:image 両方を設定
    const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <title>${data.t || "Embed"}</title>
  <meta property="og:site_name" content="${data.a || ""}" />
  <meta property="og:title" content="${data.t || ""}" />
  <meta property="og:description" content="${data.d || ""}" />
  <meta property="og:image" content="${data.im || data.th || ""}" />
  <meta name="theme-color" content="#${data.c || "8ab4f8"}" />
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="${data.im || data.th || ""}">
  <style>
    body { background: #202124; color: #e8eaed; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; flex-direction: column; }
    .loader { border: 4px solid #3c4043; border-top: 4px solid #8ab4f8; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; margin-bottom: 20px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="loader"></div>
  <p>リダイレクト中...</p>
  <script>
    // URLがあればそこに飛ばす。なければトップに戻す。
    const target = "${data.u}" || "/";
    setTimeout(() => { location.href = target; }, 500);
  </script>
</body>
</html>`;

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/html; charset=UTF-8" },
      body: html
    };
  } catch (e) {
    // エラー時はログを出して原因を特定しやすくする
    console.error("Decode Error:", e);
    return { 
      statusCode: 500, 
      body: "Error: データの復元に失敗しました。URLが長すぎるか、壊れている可能性があります。" 
    };
  }
};
