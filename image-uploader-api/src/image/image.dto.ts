export interface CreateImageDTO {
  link: string;
  note: string;
}

export type UpdateImageDTO = Partial<CreateImageDTO>;