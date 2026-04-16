exports.handler = async (event, context) => {
  const encodedData = event.queryStringParameters.d;

  if (!encodedData) {
    return { statusCode: 404, body: "No data found" };
  }

  try {
    // データをデコード
    const rawData = Buffer.from(encodedData, 'base64').toString();
    const data = JSON.parse(decodeURIComponent(escape(rawData)));

    // Discordに返すHTMLを組み立てる
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
        </head>
        <body style="background:#202124; color:white;">
          <h1>${data.t}</h1>
          <p>Redirecting...</p>
          <script>location.href = "${data.u || '/'}";</script>
        </body>
      </html>
    `;

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/html; charset=UTF-8" },
      body: html
    };
  } catch (e) {
    return { statusCode: 500, body: "Error: " + e.message };
  }
};
