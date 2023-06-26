import { Injectable } from '@angular/core';
import { BehaviorSubject, concatMap, filter, map, tap, Observable } from 'rxjs';
import { MessageRequest, MessageRequestSchema, MessageEnum } from '../../models';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  // TODO: Cant user this with socket.io
  private websocketSubject = new BehaviorSubject<MessageRequest>({} as MessageRequest);

  public set websocket(value: MessageRequest) {
    this.socketIo.emit('message', value);
  }

  public get websocketValue() {
    return this.websocketSubject.value?.message ?? '';
  }

  constructor(private socketIo: Socket) {
    this.socketIo.fromEvent('message').pipe(
      map(data => data as MessageRequest),
      tap(console.log)
    ).subscribe(this.websocketSubject)
  }

  public socketStream$(type: MessageEnum): Observable<MessageRequest> {
    return this.filterWebSocket$(type);
  }

  private filterWebSocket$(type: MessageEnum) {
    return this.websocketSubject.pipe(filter((message) => message.type === type));
  }
}
