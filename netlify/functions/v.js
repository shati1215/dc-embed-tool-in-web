exports.handler = async (event, context) => {
  let encodedData = event.queryStringParameters.d;
  if (!encodedData) return { statusCode: 400, body: "No data" };

  try {
    // 1. URLセーフな文字を戻す
    let base64 = encodedData.replace(/ /g, '+').replace(/-/g, '+').replace(/_/g, '/');
    
    // 2. デコード処理（重要：現代的なやり方に統一）
    const buffer = Buffer.from(base64, 'base64');
    // encodeURIComponentされたものを戻すために decodeURIComponent を使う
    const jsonText = decodeURIComponent(buffer.toString('utf-8'));
    const data = JSON.parse(jsonText);

    // 画像URLが空でないか、変な空白が入っていないか確認
    const imageUrl = data.im || data.th || "";

    const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <title>${data.t || "Embed"}</title>
  
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="${data.a || ""}" />
  <meta property="og:title" content="${data.t || ""}" />
  <meta property="og:description" content="${data.d || ""}" />
  
  <!-- 画像URLのみを指定し、サイズ指定を削除 -->
  <meta property="og:image" content="${imageUrl}" />
  
  <!-- 大きな画像を表示させるための設定 -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="${imageUrl}">
  
  <meta name="theme-color" content="#${data.c || "8ab4f8"}" />
</head>
<body style="background:#202124; color:white; font-family:sans-serif; display:flex; justify-content:center; align-items:center; height:100vh; margin:0;">
  <div style="text-align:center;">
    <h2>${data.t}</h2>
    <p>Redirecting...</p>
    <!-- デバッグ用：もし画像がでないなら、ここを見てURLが正しいか確認できる -->
    <img src="${imageUrl}" style="max-width:200px; display:none;">
  </div>
  <script>
    setTimeout(() => { location.href = "${data.u || '/'}"; }, 500);
  </script>
</body>
</html>`;

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/html; charset=UTF-8" },
      body: html
    };
  } catch (e) {
    return { statusCode: 500, body: "Error: " + e.message };
  }
};
