import { Injectable } from '@angular/core';
import { BehaviorSubject, concatMap, filter, map, tap, Observable } from 'rxjs';
import { webSocket } from 'rxjs/webSocket';
import { MessageRequest, MessageRequestSchema, MessageEnum } from '../models';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket = webSocket({
    url: 'ws://localhost:8080',
    deserializer: ({ data }) => data,
  });

  private websocketSubject = new BehaviorSubject<MessageRequest>({} as MessageRequest);

  public set websocket(value: MessageRequest) {
    this.socket.next(value);
  }

  public get websocketValue() {
    return this.websocketSubject.value?.message ?? '';
  }

  constructor() {
    this.socket
      .pipe(
        concatMap((data) => data.text()),
        map((data) => MessageRequestSchema.parse(JSON.parse(data as string)))
      )
      .subscribe((data) => this.websocketSubject.next(data));
  }

  public socketStream$(type: MessageEnum): Observable<MessageRequest> {
    return this.filterWebSocket$(type);
  }

  private filterWebSocket$(type: MessageEnum) {
    return this.websocketSubject.pipe(filter((message) => message.type === type));
  }
}
