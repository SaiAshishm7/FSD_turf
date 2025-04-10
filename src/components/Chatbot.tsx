import React, { useState, useEffect, useRef } from 'react';
import { createChatBotMessage, createClientMessage } from 'react-chatbot-kit';
import Chatbot from 'react-chatbot-kit';
import 'react-chatbot-kit/build/main.css';
import './Chatbot.css';
import chatbotLogo from '../assets/chatbot-logo.svg';

interface IWidget {
  widgetName: string;
  widgetFunc: (props: any) => JSX.Element;
  props: any;
  mapStateToProps: any[];
}

interface IConfig {
  botName: string;
  initialMessages: any[];
  widgets: IWidget[];
  customStyles: {
    botMessageBox: {
      backgroundColor: string;
    };
    chatButton: {
      backgroundColor: string;
    };
  };
  customComponents: {
    header: () => JSX.Element;
  };
}

interface ChatMessage {
  message: string;
  type: 'bot' | 'user';
  id: string;
}

interface ActionProviderProps {
  createChatBotMessage: any;
  setState: any;
  children: any;
}

interface MessageParserProps {
  children: any;
  actions: any;
}

const botName = "KickNClick Assistant";

const config: IConfig = {
  botName: botName,
  initialMessages: [
    createChatBotMessage(`Welcome to KickNClick! I'm ${botName}, how can I assist you today?`, {
      widget: "options",
      delay: 500,
    }),
  ],
  widgets: [
    {
      widgetName: "options",
      widgetFunc: (props: any) => {
        return (
          <div className="options-container">
            <button
              className="option-button"
              onClick={() => props.actionProvider.handleBookTurf()}
            >
              🏟️ Book a Turf
            </button>
            <button
              className="option-button"
              onClick={() => props.actionProvider.handleCheckBooking()}
            >
              📅 Check My Bookings
            </button>
            <button
              className="option-button"
              onClick={() => props.actionProvider.handleCancelBooking()}
            >
              ❌ Cancel Booking
            </button>
            <button
              className="option-button"
              onClick={() => props.actionProvider.handleRefundQuery()}
            >
              💰 Refund Status
            </button>
            <button
              className="option-button"
              onClick={() => props.actionProvider.handleTurfLocations()}
            >
              📍 Turf Locations
            </button>
            <button
              className="option-button"
              onClick={() => props.actionProvider.handleSupport()}
            >
              🎮 Technical Support
            </button>
          </div>
        );
      },
      props: {},
      mapStateToProps: []
    },
  ],
  customStyles: {
    botMessageBox: {
      backgroundColor: "#4CAF50",
    },
    chatButton: {
      backgroundColor: "#4CAF50",
    },
  },
  customComponents: {
    header: () => (
      <div className="react-chatbot-kit-chat-header">
        <h3>{botName}</h3>
        <p>Online</p>
      </div>
    ),
  },
};

class ActionProvider {
  createChatBotMessage: any;
  setState: any;
  
  constructor(createChatBotMessage: any, setState: any) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setState;
  }

  addMessage = (message: string) => {
    const botMessage = this.createChatBotMessage(message);
    const optionsMessage = this.createChatBotMessage("What else would you like to know?", { widget: "options" });
    
    this.setState((prev: any) => ({
      ...prev,
      messages: [...prev.messages, botMessage, optionsMessage],
    }));
  };

  handleGreeting = () => {
    this.addMessage("Hello! I'm here to help you with your turf booking needs. How can I assist you today?");
  };

  handleBookTurf = () => {
    this.addMessage(
      "Let's help you book a turf! Please select your preferences:\n\n" +
      "1. Choose your preferred location\n" +
      "2. Select date and time slot\n" +
      "3. Number of hours\n" +
      "4. Indoor/Outdoor preference\n\n" +
      "Would you like me to show you available slots?"
    );
  };

  handleCheckBooking = () => {
    this.addMessage(
      "I can help you check your booking status. Please provide any of these:\n\n" +
      "• Booking ID\n" +
      "• Phone number used for booking\n" +
      "• Email used for booking\n\n" +
      "This will help me fetch your booking details quickly."
    );
  };

  handleCancelBooking = () => {
    this.addMessage(
      "I understand you want to cancel a booking. Here's what you need to know:\n\n" +
      "• Free cancellation up to 24 hours before the slot\n" +
      "• 50% refund for cancellations within 24 hours\n" +
      "• No refund for cancellations within 4 hours\n\n" +
      "Please provide your booking ID to proceed with cancellation."
    );
  };

  handleRefundQuery = () => {
    this.addMessage(
      "I'll help you check your refund status. Please note:\n\n" +
      "• Refunds are processed within 5-7 business days\n" +
      "• Amount will be credited to original payment method\n" +
      "• You'll receive email notifications about the status\n\n" +
      "Please share your booking ID or transaction ID to check the status."
    );
  };

  handleTurfLocations = () => {
    this.addMessage(
      "We have turfs at these prime locations:\n\n" +
      "🏟️ KickNClick Arena - Central City\n" +
      "• Indoor & Outdoor turfs\n" +
      "• Parking available\n" +
      "• Changing rooms\n\n" +
      "🏟️ KickNClick Stadium - West End\n" +
      "• Premium grass turf\n" +
      "• Flood lights\n" +
      "• Cafeteria\n\n" +
      "🏟️ KickNClick Ground - East Side\n" +
      "• Multiple 5-a-side turfs\n" +
      "• Training facilities\n" +
      "• Pro shop\n\n" +
      "Which location would you like to know more about?"
    );
  };

  handleSupport = () => {
    this.addMessage(
      "I'm here to help with technical issues. Common queries:\n\n" +
      "🔹 Payment failed?\n" +
      "🔹 App/Website issues?\n" +
      "🔹 Booking not confirmed?\n" +
      "🔹 Unable to modify booking?\n\n" +
      "Please describe your issue, and I'll guide you through the solution."
    );
  };

  handleDefault = () => {
    const message = this.createChatBotMessage(
      "I can help you with:\n\n" +
      "• Booking a turf\n" +
      "• Checking booking status\n" +
      "• Cancellations & Refunds\n" +
      "• Finding turf locations\n" +
      "• Technical support\n\n" +
      "Please select an option below:",
      { widget: "options" }
    );
    
    this.setState((prev: any) => ({
      ...prev,
      messages: [...prev.messages, message],
    }));
  };
}

class MessageParser {
  actionProvider: any;
  
  constructor(actionProvider: any) {
    this.actionProvider = actionProvider;
  }

  parse = (message: string) => {
    const lowerCase = message.toLowerCase().trim();

    // Greetings
    if (this.matchesAny(lowerCase, ['hi', 'hello', 'hey', 'hola', 'greetings'])) {
      this.actionProvider.handleGreeting();
      return;
    }

    // Booking related queries
    if (this.matchesAny(lowerCase, ['book', 'reserve', 'slot', 'schedule', 'booking', 'available'])) {
      this.actionProvider.handleBookTurf();
      return;
    }

    // Check booking status
    if (this.matchesAny(lowerCase, ['check booking', 'my booking', 'booking status', 'my slot'])) {
      this.actionProvider.handleCheckBooking();
      return;
    }

    // Cancel booking
    if (this.matchesAny(lowerCase, ['cancel', 'cancellation', 'cancel booking'])) {
      this.actionProvider.handleCancelBooking();
      return;
    }

    // Refund related
    if (this.matchesAny(lowerCase, ['refund', 'money back', 'payment', 'return'])) {
      this.actionProvider.handleRefundQuery();
      return;
    }

    // Location queries
    if (this.matchesAny(lowerCase, ['where', 'location', 'address', 'place', 'turf'])) {
      this.actionProvider.handleTurfLocations();
      return;
    }

    // Support queries
    if (this.matchesAny(lowerCase, ['help', 'support', 'issue', 'problem', 'technical'])) {
      this.actionProvider.handleSupport();
      return;
    }

    // Default response
    this.actionProvider.handleDefault();
  };

  private matchesAny(message: string, keywords: string[]): boolean {
    return keywords.some(keyword => message.includes(keyword));
  }
}

const ChatbotComponent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const scrollToBottom = () => {
      if (chatContainerRef.current) {
        const element = chatContainerRef.current.querySelector('.react-chatbot-kit-chat-message-container');
        if (element) {
          element.scrollTop = element.scrollHeight;
        }
      }
    };

    if (isOpen) {
      scrollToBottom();
      const observer = new MutationObserver(scrollToBottom);
      if (chatContainerRef.current) {
        observer.observe(chatContainerRef.current, {
          childList: true,
          subtree: true
        });
      }
      return () => observer.disconnect();
    }
  }, [isOpen]);

  return (
    <div className="chatbot-container" ref={chatContainerRef}>
      <button className="chatbot-button" onClick={toggleChat} aria-label="Toggle chat">
        <img src={chatbotLogo} alt="KickNClick Chat Assistant" className="chatbot-logo" />
      </button>
      <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>
        <Chatbot
          config={config}
          messageParser={MessageParser}
          actionProvider={ActionProvider}
          messageHistory={[]}
        />
      </div>
    </div>
  );
};

export default ChatbotComponent; 