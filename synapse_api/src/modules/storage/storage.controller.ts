import { Request, Response } from "express";
import { StorageService } from "./storage.service";

export class StorageController {
  private storageService: StorageService;

  constructor() {
    this.storageService = new StorageService();
  }

  getPhotos = async (_req: Request, res: Response): Promise<void> => {
    try {
      const photos = await this.storageService.getPhotosUrls();
      res.status(200).json(photos);
      console.log("Photos:", photos);
    } catch (error) {
      console.error("Error al generar las URLs:", error);
      res.status(500).json({ error: "No se pudieron obtener las imágenes." });
    }
  };
}