import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { EncryptedBundle } from '@app/models';

@Injectable({
  providedIn: 'root',
})
export class BundleApi {
  private readonly httpClient = inject(HttpClient);

  async getBundle(): Promise<EncryptedBundle> {
    return firstValueFrom(this.httpClient.get<EncryptedBundle>('/bundle.json'))
  }
}
