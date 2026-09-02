import { Request, Response } from "express";

export const extractImage = async (req: Request, res: Response): Promise<void> => {
  const url = req.query.url as string;
  if (!url) {
    res.status(400).json({ error: "Falta la URL" });
    return;
  }

  try {
    const response = await fetch(url);
    const contentType = response.headers.get("content-type") || "";

    if (contentType.startsWith("image/")) {
      res.json({ imageUrl: url });
      return;
    }

    if (contentType.startsWith("text/html")) {
      const html = await response.text();
      const match = html.match(/og:image.*?content=["']([^"']+)["']/i) || 
                    html.match(/featuredImage['":\s]+([^'"]+)/i);
      if (match && match[1]) {
        res.json({ imageUrl: match[1] });
        return;
      }
    }

    res.status(404).json({ imageUrl: null });
  } catch (error) {
    res.status(500).json({ error: "Error al extraer" });
  }
};
