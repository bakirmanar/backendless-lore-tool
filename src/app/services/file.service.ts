import { Injectable } from '@angular/core';
import { FileExtensionMap, FileType } from '@app/models';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  async readLocalFile<T = string>(type: FileType): Promise<T | undefined> {
    return new Promise<T | undefined>((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = type;

      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return resolve(undefined);

        const fileContents = (await file.text()) as T | undefined;

        resolve(fileContents);
      };
      input.click();
    });

  }

  downloadFile(contents: unknown, fileName: string, fileType: FileType) {
    const blob = new Blob([JSON.stringify(contents, null, 2)], {type: fileType});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.${FileExtensionMap[fileType]}`;
    a.click();
    // Clear browser memory
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
