import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SocketService } from '../../services/websocket/socket.service';
import { map, scan, startWith, switchMap, tap } from 'rxjs/operators';
import { Message, MessageRequest, MessageSchema, MessageEnum, MessagePayload } from 'src/app/models';
import { DataProviderService } from 'src/app/services/data-provider/data-provider.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { merge } from 'rxjs';
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
  
  // public messages$ = merge(this.dataService.getGroup(this.groupId ?? '').pipe(map(data => data.messages)), this.socketStream$).pipe(
  //   scan((messages: MessagePayload[], message: MessagePayload[] | MessageRequest) => {
  //     if (this.isMessageRequest(message)) {
  //       return [...messages, message];
  //     }

  //     return [...messages, ...message];
  //   } , [])
  // )

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

  // This is making requests every time the view gets rendered x3, FIX by adding to the class property in socket stream and here
  public socketStream$(type: MessageEnum) {
    return merge(this.dataService.getGroup(this.groupId ?? '').pipe(map(data => data.messages)), this.socketService.socketStream$(type)).pipe(
      scan((messages: MessagePayload[], message: MessagePayload[] | MessageRequest) => {
        if (this.isMessageRequest(message)) {
          return [...messages, message];
        }

        return [...messages, ...message];
      } , [])
    )
  }

  private isMessageRequest(value: MessagePayload[] | MessageRequest): value is MessageRequest {
    return (value as MessageRequest)?.groupId !== undefined;
  }
}
