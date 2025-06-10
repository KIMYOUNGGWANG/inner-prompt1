import emailjs from '@emailjs/browser';

// Initialize EmailJS
emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY);

export const sendEmail = async (email, prompts, emotion) => {
  try {
    const templateParams = {
      to_email: email,
      emotion: emotion,
      prompts: prompts.join('\n'),
    };

    const response = await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
      templateParams
    );

    if (response.status !== 200) {
      throw new Error('Failed to send email');
    }

    return response;
  } catch (error) {
    console.error('EmailJS Error:', error);
    throw new Error('Failed to send email');
  }
}; 