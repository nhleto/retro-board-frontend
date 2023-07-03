import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { from } from 'rxjs';
import { filter, switchMap, toArray } from 'rxjs/operators';
import { Group, Message, MessageEnum, MessageRequest, MessageSchema } from 'src/app/models';
import { DataProviderService } from 'src/app/services/data-provider/data-provider.service';

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
  
  private messages$ = this.dataService.listenToGroup(this.groupId).pipe(filter(data => !!data));

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

  constructor(private fb: FormBuilder, private activatedRoute: ActivatedRoute, private dataService: DataProviderService) {}

  public async submit(type: MessageEnum) {
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
    this.textForm.reset();
    await this.dataService.patchGroup(this.mapToGroup(payload))
  }

  private mapToGroup(message: MessageRequest): Group {
    return {
      id: message?.groupId,
      messages: [{type: message.type, message: message.message}]
    }
  }
}
