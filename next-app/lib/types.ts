export interface FileRecord {
  id: number
  name: string
  size: string
  user: string
  date: string
}

export interface FilesResponse {
  files: FileRecord[]
}
