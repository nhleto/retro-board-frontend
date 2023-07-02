import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SocketService } from '../../services/websocket/socket.service';
import { filter, map, scan, startWith, switchMap, tap, toArray } from 'rxjs/operators';
import { Message, MessageRequest, MessageSchema, MessageEnum, MessagePayload } from 'src/app/models';
import { DataProviderService } from 'src/app/services/data-provider/data-provider.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { from, merge } from 'rxjs';
import { ChangeDetectionStrategy } from '@angular/compiler';

@Component({
  selector: 'app-home-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  public textForm = this.fb.group({
    text: this.fb.control(null, Validators.required),
  });

  private groupId = this.activatedRoute.snapshot.paramMap.get('id');
  
  public messages$ = merge(this.dataService.getGroup(this.groupId ?? '').pipe(map(data => data?.messages), filter(m => !!m)), this.socketService.socketStream$.pipe(filter(message => !!message))).pipe(
    scan((messages: MessagePayload[], message: MessagePayload[] | MessageRequest) => {
      if (this.isMessageRequest(message)) {
        return [...messages, message];
      }

      return [...messages, ...message];
    } , [])
  )

  public liked$ = this.messages$.pipe(
    switchMap((messages) => from(messages).pipe(filter(message => message.type === 'liked'), toArray()))
  );

  public lacked$ = this.messages$.pipe(
    switchMap((messages) => from(messages).pipe(filter(message => message.type === 'lacked'), toArray()))
  );
  
  public learned$ = this.messages$.pipe(
    switchMap((messages) => from(messages).pipe(filter(message => message.type === 'learned'), toArray()))
  );

  public text$ = this.messages$.pipe(
    switchMap((messages) => from(messages).pipe(filter(message => message.type === 'text'), toArray()))
  );

  constructor(private fb: FormBuilder, private socketService: SocketService, private activatedRoute: ActivatedRoute, private dataService: DataProviderService) {}

  public submit(type: MessageEnum) {
    const value = this.textForm.value;

    if (!MessageSchema.safeParse(value).success || this.textForm.invalid) {
      console.error('Invalid type');
      return;
    }

    const messageValue: Message = MessageSchema.parse(value);
    if (this.groupId == null) {
      return;
    }

    const payload: MessageRequest = { type: type, message: messageValue?.text ?? '', groupId: this.groupId };
    this.socketService.websocket = payload;
    this.textForm.reset();
  }

  private isMessageRequest(value: MessagePayload[] | MessageRequest): value is MessageRequest {
    return (value as MessageRequest)?.groupId !== undefined;
  }
}
