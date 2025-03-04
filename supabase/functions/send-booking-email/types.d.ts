declare module 'nodemailer' {
  interface TransportOptions {
    service: string;
    auth: {
      user: string;
      pass: string;
    };
  }

  interface MailOptions {
    from: string;
    to: string;
    subject: string;
    html: string;
  }

  interface SendMailResult {
    messageId: string;
  }

  interface Transporter {
    sendMail(options: MailOptions): Promise<SendMailResult>;
  }

  function createTransport(options: TransportOptions): Transporter;

  export default {
    createTransport
  };
}

declare module 'cors' {
  import { RequestHandler } from 'express';
  function cors(options?: any): RequestHandler;
  export default cors;
} 