exports.handler = async (event, context) => {
  // URLの ?d= のあとのデータを取得
  const encodedData = event.queryStringParameters.d;

  if (!encodedData) {
    return {
      statusCode: 400,
      body: "データが足りないよ！"
    };
  }

  try {
    // 【解説】Node.jsでは atob の代わりに Buffer を使うのが一般的です
    // Base64をデコードして、元のJSONオブジェクトに戻す処理
    const rawData = Buffer.from(encodedData, 'base64').toString();
    const data = JSON.parse(decodeURIComponent(escape(rawData)));

    // Discord用のメタタグを詰め込んだHTMLを作成
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${data.t || "Embed"}</title>
  
  <!-- ここがDiscordクローラーが見る部分 -->
  <meta property="og:site_name" content="${data.a || ""}" />
  <meta property="og:title" content="${data.t || ""}" />
  <meta property="og:description" content="${data.d || ""}" />
  <meta property="og:image" content="${data.im || ""}" />
  <meta name="theme-color" content="#${data.c || "8ab4f8"}" />
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="${data.th || data.im || ""}">

  <style>
    body { background: #202124; color: white; font-family: sans-serif; text-align: center; padding-top: 50px; }
    .btn { padding: 10px 20px; background: #8ab4f8; color: #202124; text-decoration: none; border-radius: 20px; }
  </style>
</head>
<body>
  <h1>${data.t || "Embed Page"}</h1>
  <p>${data.d || ""}</p>
  ${data.u ? `<a href="${data.u}" class="btn">リンク先へ移動</a>` : ""}
  
  <!-- 人間がアクセスした時だけリダイレクトさせるJS -->
  <script>
    if("${data.u}") {
      setTimeout(() => { location.href = "${data.u}"; }, 1);
    }
  </script>
</body>
</html>`;

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/html; charset=UTF-8" },
      body: html
    };
  } catch (e) {
    return { statusCode: 500, body: "デコード失敗w: " + e.message };
  }
};
