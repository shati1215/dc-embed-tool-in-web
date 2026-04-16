exports.handler = async (event, context) => {
  let encodedData = event.queryStringParameters.d;

  if (!encodedData) return { statusCode: 400, body: "No data" };

  try {
    // 【最重要修正】URLで化けてしまった文字をすべてBase64の標準記号に戻す
    // 1. 空白を "+" に戻す
    // 2. "-" を "+" に戻す
    // 3. "_" を "/" に戻す
    let base64 = encodedData.replace(/ /g, '+').replace(/-/g, '+').replace(/_/g, '/');

    // Node.jsのBufferを使ってBase64をデコード（UTF-8指定で日本語もOK）
    const buffer = Buffer.from(base64, 'base64');
    const jsonText = buffer.toString('utf-8');
    
    // JSONとして読み込み
    const data = JSON.parse(jsonText);

    // Discord用のHTMLを生成
    const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <title>${data.t || "Embed"}</title>
  
  <!-- 基本のOGP -->
  <meta property="og:site_name" content="${data.a || ""}" />
  <meta property="og:title" content="${data.t || ""}" />
  <meta property="og:description" content="${data.d || ""}" />
  <meta property="og:type" content="website" />
  
  <!-- 画像系：ここを強化 -->
  <meta property="og:image" content="${data.im || data.th || ""}" />
  <meta property="og:image:secure_url" content="${data.im || data.th || ""}" />
  
  <!-- Twitterカード：これがないと大きく表示されない場合がある -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${data.t || ""}">
  <meta name="twitter:description" content="${data.d || ""}">
  <meta name="twitter:image" content="${data.im || data.th || ""}">

  <meta name="theme-color" content="#${data.c || "8ab4f8"}" />
</head>
<body style="background:#202124; color:#e8eaed; font-family:sans-serif; display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh; margin:0; text-align:center;">
  <p>読み込み中...</p>
  <script>
    const target = "${data.u}" || "/";
    setTimeout(() => { location.href = target; }, 1);
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
    return { 
      statusCode: 500, 
      body: "Error: データの解読に失敗しました。URLが壊れているか、文字数が多すぎる可能性があります。" 
    };
  }
};
