import xml2js from "xml2js";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const key = "e7871aa1b1ec4721b5051a1dc2f81be9"

async function getAllLocFromSitemap(sitemapUrl) {
  const text = await fetch(sitemapUrl).then((response) => response.text());
  const parser = new xml2js.Parser();
  const result = await parser.parseStringPromise(text);
  return result.urlset.url;
}

async function generate_bing_index_now_http(site) {
  const { sitemapURL, ...rest } = site;
  const xml = await getAllLocFromSitemap(sitemapURL);
  const urls = xml.map((url) => url.loc[0]);

  const body = JSON.stringify(
    {
      ...rest,
      urlList: urls,
    },
    null,
    2
  );
  const raw = `POST https://api.indexnow.org/IndexNow
Content-Type: application/json; charset=utf-8

${body}
`;

  return raw;
}

const sites = [
  {
    host: "latsprince.com",
    key,
    keyLocation: `https://latsprince.com/${key}.txt`,
    sitemapURL: "https://latsprince.com/sitemap-0.xml",
  },
];

let content = "# https://github.com/Huachao/vscode-restclient\n";
for (const site of sites) {
  content += "###\n"; // separate each request
  content += await generate_bing_index_now_http(site);
}

await writeFile(
  path.join(import.meta.dirname, "../bing_index_now.http"),
  content
);
