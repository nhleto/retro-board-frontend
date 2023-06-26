import { Injectable } from '@angular/core';
import { BehaviorSubject, concatMap, filter, map, tap, Observable, switchMap, mergeMap, forkJoin, of } from 'rxjs';
import { MessageRequest, MessageRequestSchema, MessageEnum, Group } from '../../models';
import { Socket } from 'ngx-socket-io';
import { DataProviderService } from '../data-provider/data-provider.service';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private websocketSubject = new BehaviorSubject<MessageRequest>({} as MessageRequest);

  public set websocket(value: MessageRequest) {
    this.socketIo.emit('message', value);
  }

  public get websocketValue() {
    return this.websocketSubject.value?.message ?? '';
  }

  constructor(private socketIo: Socket, private dataService: DataProviderService) {
    this.socketIo.fromEvent('message').pipe(
      map(data => data as MessageRequest),
      mergeMap(data => forkJoin([this.dataService.patchGroup(this.mapToGroup(data)), of(data)])),
      map(([_, message]) => message)
    ).subscribe(this.websocketSubject)
  }

  public socketStream$(type: MessageEnum): Observable<MessageRequest> {
    return this.filterWebSocket$(type);
  }

  private filterWebSocket$(type: MessageEnum) {
    return this.websocketSubject.pipe(filter((message) => message.type === type));
  }

  private mapToGroup(message: MessageRequest): Group {
    return {
      id: message?.groupId,
      messages: [message.message]
    }
  }
}
