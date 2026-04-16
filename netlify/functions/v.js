exports.handler = async (event, context) => {
  const encodedData = event.queryStringParameters.d;

  if (!encodedData) {
    return { statusCode: 400, body: "No data" };
  }

  try {
    // Base64を復元 (Node.jsの書き方)
    const rawData = Buffer.from(encodedData, 'base64').toString();
    const data = JSON.parse(decodeURIComponent(escape(rawData)));

    // Discord用のメタタグを詰め込んだHTMLを生成
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${data.t || "Embed"}</title>
  <meta property="og:site_name" content="${data.a || ""}" />
  <meta property="og:title" content="${data.t || ""}" />
  <meta property="og:description" content="${data.d || ""}" />
  <meta property="og:image" content="${data.im || ""}" />
  <meta name="theme-color" content="#${data.c || "8ab4f8"}" />
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="${data.th || data.im || ""}">
</head>
<body style="background:#202124; color:white; font-family:sans-serif; text-align:center; padding-top:50px;">
  <h1>${data.t || ""}</h1>
  <p>${data.d || ""}</p>
  <script>
    // 人間がアクセスした場合は、指定されたURLに飛ばす
    if("${data.u}") { location.href = "${data.u}"; }
  </script>
</body>
</html>`;

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/html; charset=UTF-8" },
      body: html
    };
  } catch (e) {
    return { statusCode: 500, body: "Error" };
  }
};
