exports.handler = async (event, context) => {
  // URLの ?d= 以降を取得
  let encodedData = event.queryStringParameters.d;

  if (!encodedData) {
    return { statusCode: 400, body: "データがありません。" };
  }

  try {
    // 1. URLセーフな文字を元に戻す (- -> +, _ -> /)
    let base64 = encodedData.replace(/-/g, '+').replace(/_/g, '/');
    
    // 2. Node.jsのBufferを使って一気にデコード
    // Buffer.from は Base64 をバイナリ（データそのもの）に戻し、
    // .toString('utf-8') で日本語として正しく読み取ります。
    const buffer = Buffer.from(base64, 'base64');
    const jsonText = buffer.toString('utf-8');
    
    // 3. JSONに変換
    const data = JSON.parse(jsonText);

    // 4. Discord用のHTMLを生成
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
</head>
<body style="background:#202124; color:#e8eaed; font-family:sans-serif; display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh; margin:0; text-align:center; padding: 20px;">
  <p>読み込み中...</p>
  <script>
    // 指定URLがあればリダイレクト、なければトップへ
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
    console.error("Decode Error:", e);
    // 失敗した場合、どんなデータが届いていたかを画面に出してデバッグしやすくする
    return { 
      statusCode: 500, 
      body: "Error: データの解読に失敗しました。データの一部: " + encodedData.substring(0, 20) + "..."
    };
  }
};
