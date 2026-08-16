import { ProgramasRepository } from "./programs.repository";
import {
  CreateProgramaDto,
  UpdateProgramaDto,
} from "./programs.types";

import { generateUUID } from "../../common/utils/uuidcreate";

export class ProgramasService {
  static async getAll() {
    return ProgramasRepository.findAll();
  }

  static async getById(id: string) {
    const programa =
      await ProgramasRepository.findById(id);

    if (!programa) {
      throw new Error("Programa no encontrado");
    }

    return programa;
  }

  static async create(
    data: CreateProgramaDto
  ) {
    return ProgramasRepository.create(data);
  }

  static async update(
    id: string,
    data: UpdateProgramaDto
  ) {
    await this.getById(id);

    return ProgramasRepository.update(
      id,
      data
    );
  }

  static async delete(id: string) {
    await this.getById(id);

    return ProgramasRepository.delete(id);
  }
}