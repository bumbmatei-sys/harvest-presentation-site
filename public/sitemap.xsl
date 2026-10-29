<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9" exclude-result-prefixes="s">
  <xsl:output method="html" encoding="UTF-8" />
  <xsl:template match="/">
    <html lang="en">
      <head>
        <title>The Harvest — Sitemap</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          body { margin: 3rem auto; padding: 0 1.5rem; max-width: 64rem; font: 16px/1.6 system-ui, sans-serif; background: #faf8f5; color: #2d2519; }
          h1 { font-size: 2rem; } a { color: #735518; overflow-wrap: anywhere; }
          table { width: 100%; border-collapse: collapse; background: white; }
          th, td { padding: .8rem 1rem; border-bottom: 1px solid #e8e2d9; text-align: left; vertical-align: top; }
          th { background: #f3eee7; } td:last-child { white-space: nowrap; }
        </style>
      </head>
      <body>
        <h1>The Harvest — Sitemap</h1>
        <xsl:choose>
          <xsl:when test="s:sitemapindex">
            <p>This index links to the site's generated sitemaps.</p>
            <table><thead><tr><th scope="col">Sitemap</th></tr></thead><tbody>
              <xsl:for-each select="s:sitemapindex/s:sitemap">
                <tr><td><a href="{s:loc}"><xsl:value-of select="s:loc" /></a></td></tr>
              </xsl:for-each>
            </tbody></table>
          </xsl:when>
          <xsl:otherwise>
            <p><xsl:value-of select="count(s:urlset/s:url)" /> canonical pages, generated from the published site.</p>
            <table><thead><tr><th scope="col">Page</th><th scope="col">Last updated</th></tr></thead><tbody>
              <xsl:for-each select="s:urlset/s:url">
                <tr><td><a href="{s:loc}"><xsl:value-of select="s:loc" /></a></td><td><xsl:value-of select="s:lastmod" /></td></tr>
              </xsl:for-each>
            </tbody></table>
          </xsl:otherwise>
        </xsl:choose>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
