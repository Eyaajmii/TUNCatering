import { Component } from '@angular/core';
import { ChatbotService } from '../../../services/chatbot.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chatbot',
  imports: [FormsModule,CommonModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.css'
})
export class ChatbotComponent {
  userInput = '';
  messages: { sender: string, text: string }[] = [];

  constructor(private chatbotService: ChatbotService) {}

  send(): void {
    const input = this.userInput.trim();
    if (!input) return;

    this.messages.push({ sender: 'Vous', text: input });
    this.userInput = '';

    this.chatbotService.EnvoyerMessage(input).subscribe(response => {
      this.messages.push({ sender: 'Bot', text: response.reply });
    });
  }
}
