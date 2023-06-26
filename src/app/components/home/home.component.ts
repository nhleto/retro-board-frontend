import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SocketService } from '../../services/socket.service';
import { scan } from 'rxjs/operators';
import { Message, MessageRequest, MessageSchema } from 'src/app/models';

@Component({
  selector: 'app-home-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  public textForm = this.fb.group({
    text: this.fb.control('', Validators.required),
  });

  public messages$ = this.socketService
    .socketStream$('text')
    .pipe(scan((messages: string[], message: MessageRequest) => [...messages, message.message], []));

  constructor(private fb: FormBuilder, private socketService: SocketService) {}

  public submit() {
    const value = this.textForm.value;

    if (!MessageSchema.safeParse(value).success || this.textForm.invalid) {
      console.error('Invalid type');
      return;
    }

    const messageValue: Message = MessageSchema.parse(value);
    const payload: MessageRequest = { type: 'text', message: messageValue?.text ?? '' };
    this.socketService.websocket = payload;
    this.textForm.reset();
  }
}
