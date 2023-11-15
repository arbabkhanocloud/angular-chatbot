import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OpenAiApiService {
  constructor(private http: HttpClient) {}

  public sendMessage(message: string) {
    return this.http.post<any>(`http://localhost:3000/chat`, { message });
  }

  public getStreamedData(message: string): Observable<string> {
    const url = 'http://localhost:3000/stream';

    return new Observable<string>((observer) => {
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      })
        .then((response) => {
          if (!response.body) {
            throw new Error('Response body is null');
          }

          const reader = response.body.getReader();
          const textDecoder = new TextDecoder();

          const read = async () => {
            const { done, value } = await reader.read();

            if (done) {
              console.log('Streaming completed');
              observer.complete();
              return;
            }

            const chunk = textDecoder.decode(value);
            console.log('Received chunk:', chunk);
            observer.next(chunk);

            read(); // Continue reading the stream
          };

          read(); // Start reading the stream
        })
        .catch((error) => {
          console.error('Error in streaming:', error);
          observer.error(error);
        });
    });
  }
}
