import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SocketService } from '../../services/websocket/socket.service';
import { scan, tap } from 'rxjs/operators';
import { Message, MessageRequest, MessageSchema } from 'src/app/models';
import { DataProviderService } from 'src/app/services/data-provider/data-provider.service';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-home-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  public textForm = this.fb.group({
    text: this.fb.control('', Validators.required),
  });

  public messages$ = this.socketService
    .socketStream$('text')
    .pipe(
      scan((messages: string[], message: MessageRequest) => [...messages, message.message], [])
    );

  constructor(private fb: FormBuilder, private socketService: SocketService, private dataService: DataProviderService, private activatedRoute: ActivatedRoute) {}

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
