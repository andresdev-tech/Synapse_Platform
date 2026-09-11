import { ExtractRepository } from "./extract.repository";

export class ExtractService {
  static async extractImageFromUrl(url: string): Promise<string | null> {
    const response = await ExtractRepository.fetchResource(url);
    const contentType = response.headers.get("content-type") || "";

    if (contentType.startsWith("image/")) {
      return url;
    }

    if (contentType.startsWith("text/html")) {
      const html = await response.text();
      const match =
        html.match(/og:image.*?content=["']([^"']+)["']/i) ||
        html.match(/featuredImage['":\s]+([^'"]+)/i);

      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }
}
