import sharp from "sharp";
import type { Idiom } from "./_graphql/types";

const maximumCachedImages = 100;
const imageCache = new Map<string, Buffer>();

export async function renderIdiomSocialImage(idiom: Idiom) {
  const cacheKey = JSON.stringify({
    slug: idiom.slug,
    title: idiom.title,
    description: idiom.description,
    literalTranslation: idiom.literalTranslation,
    language: idiom.language.languageName,
    relatedCount: idiom.equivalents.length,
  });
  const cachedImage = imageCache.get(cacheKey);
  if (cachedImage) {
    imageCache.delete(cacheKey);
    imageCache.set(cacheKey, cachedImage);
    return cachedImage;
  }

  const titleLines = wrapText(idiom.title, 29, 2);
  const descriptionLines = wrapText(
    plainText(idiom.description || idiom.literalTranslation || ""),
    72,
    2,
  );
  const relatedCount = idiom.equivalents.length;
  const relatedText =
    relatedCount === 1
      ? "1 related idiom in another language"
      : `${relatedCount} related idioms in other languages`;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
      <defs>
        <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#263b55"/>
          <stop offset="1" stop-color="#54728f"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#background)"/>
      <circle cx="1080" cy="70" r="250" fill="#79a8c9" opacity=".14"/>
      <circle cx="1110" cy="610" r="310" fill="#192a40" opacity=".25"/>

      <g transform="translate(70 58)">
        <rect width="82" height="82" rx="16" fill="#57405c"/>
        <text x="41" y="67" fill="#fff" font-family="Georgia, serif" font-size="62" font-weight="700" text-anchor="middle">I</text>
        <text x="108" y="54" fill="#fff" font-family="Arial, sans-serif" font-size="38" font-weight="700">Idiomatically</text>
      </g>

      <text x="70" y="245" fill="#fff" font-family="Georgia, serif" font-size="64" font-weight="700">
        ${renderLines(titleLines, 76)}
      </text>

      <rect x="70" y="365" width="${Math.min(relatedText.length * 17 + 40, 620)}" height="54" rx="27" fill="#79a8c9" opacity=".28"/>
      <text x="92" y="401" fill="#eaf4fa" font-family="Arial, sans-serif" font-size="26" font-weight="700">
        ${escapeXml(idiom.language.languageName)} · ${escapeXml(relatedText)}
      </text>

      <text x="70" y="485" fill="#eaf4fa" font-family="Arial, sans-serif" font-size="29">
        ${renderLines(descriptionLines.length ? descriptionLines : ["Explore its meaning, translation, and equivalents."], 43)}
      </text>

      <text x="70" y="580" fill="#b9d0df" font-family="Arial, sans-serif" font-size="23">idiomatically.net</text>
    </svg>
  `;

  const image = await sharp(Buffer.from(svg))
    .png({ compressionLevel: 9 })
    .toBuffer();
  imageCache.set(cacheKey, image);
  if (imageCache.size > maximumCachedImages) {
    const oldestKey = imageCache.keys().next().value;
    if (oldestKey) {
      imageCache.delete(oldestKey);
    }
  }
  return image;
}

function renderLines(lines: string[], lineHeight: number) {
  return lines
    .map(
      (line, index) =>
        `<tspan x="70" dy="${index === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`,
    )
    .join("");
}

function wrapText(value: string, maximumCharacters: number, maximumLines: number) {
  const words = value.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (candidate.length <= maximumCharacters) {
      currentLine = candidate;
      continue;
    }

    if (currentLine) {
      lines.push(currentLine);
    }
    currentLine = word;
    if (lines.length === maximumLines - 1) {
      break;
    }
  }

  if (currentLine && lines.length < maximumLines) {
    lines.push(currentLine);
  }

  const consumedText = lines.join(" ");
  if (consumedText.length < value.trim().length && lines.length) {
    lines[lines.length - 1] = `${lines[lines.length - 1].replace(/[.,;:!?]?$/, "")}…`;
  }
  return lines;
}

function plainText(value: string) {
  return value
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`#>~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeXml(value: string) {
  return value.replace(/[<>&"']/g, (character) => {
    const entities: Record<string, string> = {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      '"': "&quot;",
      "'": "&apos;",
    };
    return entities[character];
  });
}
