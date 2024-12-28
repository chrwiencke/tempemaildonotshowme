const PostalMime = require('postal-mime');

// Add UUID validation function
const isValidUUID = (uuid) => {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return regex.test(uuid);
};

export default {
	async email(message, env) {
		try {
			// Extract sender, recipient, and subject
			const sender = message.from;
			const recipient = message.to;
			const subject = message.headers.get('subject') || 'No Subject';

			// Get email content
			let rawEmail = new Response(message.raw);
			let arrayBuffer = await rawEmail.arrayBuffer();
			const parser = new PostalMime.default();
			const email = await parser.parse(arrayBuffer);
			const rawBody = email.html || email.text;

			// Extract the recipient key from the email address
			const match = recipient.match(/^([^@]+)@/);
			const recipientKeyPart = match ? match[1] : 'unknown';
			const key = `${recipientKeyPart}`;

			 // Validate UUID
            if (!isValidUUID(key)) {
                console.error('Invalid UUID format:', key);
                return new Response('Invalid recipient key format. Expected UUID.', { status: 400 });
            }

			// Construct the email data to store
			const emailData = {
				sender,
				recipient,
				subject,
				body: rawBody,
				timestamp: new Date().toISOString(),
			};

			// Save the email data to KV store
			await env.EMAIL_STORE.put(key, JSON.stringify(emailData), { expirationTtl: 3600 });

			// Return a success response
			return new Response(`Email from ${sender} to ${recipient} saved with key "${key}".`, { status: 200 });
		} catch (error) {
			console.error('Error processing email:', error);
			return new Response('Failed to process email.', { status: 500 });
		}
	},
};
